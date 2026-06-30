import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, User, Calendar, Hash, Globe,
  Layers, Building, FileText, ExternalLink, Plus, Check,
  Loader2, Library, ChevronDown, Bookmark
} from 'lucide-react';
import { bookService, libraryService } from '@/services';
import { useAuth } from '@/features/auth/authHooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const SHELF_OPTIONS = [
  { value: 'WISHLIST', label: 'Want to Read',      icon: Bookmark },
  { value: 'READING',  label: 'Currently Reading', icon: BookOpen },
  { value: 'READ',     label: 'Already Read',      icon: Check },
];

const SHELF_STYLES = {
  WISHLIST: 'bg-mint/15 text-mint border-mint/30',
  READING:  'bg-primary/15 text-primary border-primary/30',
  READ:     'bg-success/15 text-success border-success/30',
};

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-glass-border/40 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  );
}

export default function PublicBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pickerRef = useRef(null);

  const [book, setBook]             = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [imgError, setImgError]     = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [libStatus, setLibStatus]   = useState(null); // null | 'adding' | shelf | 'EXISTS'
  const [libraryEntryId, setLibraryEntryId] = useState(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    bookService.getPublicById(id)
      .then(res => {
        // Server returns { data: { book: {...} } }
        const payload = res.data?.data;
        setBook(payload?.book ?? payload ?? null);
      })
      .catch(() => toast.error('Book not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (user && id) {
      libraryService.getAll({ limit: 1000 })
        .then(res => {
          const entries = res.data?.data?.entries || [];
          const found = entries.find(e => e.book?._id === id);
          if (found) {
            setLibStatus(found.shelfType);
            setLibraryEntryId(found._id);
          }
        })
        .catch(err => console.error('Failed to fetch library entries', err));
    }
  }, [id, user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToLibrary = async (shelfType) => {
    if (!user) { toast.error('Please log in to add books to your library'); return; }
    setShowPicker(false);
    setLibStatus('adding');
    try {
      if (libraryEntryId) {
        // Update existing entry shelf!
        await libraryService.update(libraryEntryId, { shelfType });
        setLibStatus(shelfType);
        const opt = SHELF_OPTIONS.find(o => o.value === shelfType);
        toast.success(`Moved to "${opt?.label}"!`, { icon: opt ? <opt.icon className="w-5 h-5 text-primary" /> : undefined });
      } else {
        // Add new entry!
        const res = await libraryService.add({ bookId: id, shelfType });
        const newEntry = res.data?.data?.entry;
        if (newEntry) {
          setLibraryEntryId(newEntry._id);
        }
        setLibStatus(shelfType);
        const opt = SHELF_OPTIONS.find(o => o.value === shelfType);
        toast.success(`Added to library as "${opt?.label}"!`, { icon: opt ? <opt.icon className="w-5 h-5 text-primary" /> : undefined });
      }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already') || err.response?.status === 409) {
        setLibStatus('EXISTS');
        toast('This book is already in your library!', { icon: <BookOpen className="w-5 h-5 text-primary" /> });
      } else {
        setLibStatus(null);
        toast.error('Failed to update library');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Book not found</h2>
        <p className="text-muted-foreground">This book may have been removed.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const pubYear = book.publicationDate ? new Date(book.publicationDate).getFullYear() : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Left — Cover + Add to Library */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Cover */}
          <div className="aspect-[2/3] max-w-[200px] mx-auto lg:max-w-none overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 shadow-xl ring-1 ring-glass-border">
            {book.coverImage && !imgError ? (
              <img
                src={book.coverImage}
                alt={book.title}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-24 w-24 text-primary/25" />
              </div>
            )}
          </div>

          {/* Add to Library card */}
          {user && (
            <div className="glass-card rounded-2xl p-4 space-y-3 !overflow-visible">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5" /> Add to Library
              </h3>

              {/* Library Button / Shelf Selector */}
              {libStatus === 'adding' ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding to library…
                </div>
              ) : libStatus && libStatus !== 'EXISTS' ? (
                /* Interactive Shelf Selector (Already Added State) */
                <div className="relative" ref={pickerRef}>
                  <Button
                    onClick={() => setShowPicker(v => !v)}
                    className={cn(
                      'w-full gap-2 rounded-xl border text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-between',
                      SHELF_STYLES[libStatus]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{SHELF_OPTIONS.find(o => o.value === libStatus)?.label}</span>
                    </div>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showPicker && 'rotate-180')} />
                  </Button>

                  {showPicker && (
                    <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-glass-border bg-card/95 backdrop-blur-md shadow-xl z-40 overflow-hidden user-menu-dropdown">
                      {SHELF_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleAddToLibrary(opt.value)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left cursor-pointer",
                            opt.value === libStatus ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary/50"
                          )}
                        >
                          <opt.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                          <span>{opt.label}</span>
                          {opt.value === libStatus && <Check className="w-4 h-4 ml-auto text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Add to Library State */
                <div className="relative" ref={pickerRef}>
                  <Button
                    onClick={() => setShowPicker(v => !v)}
                    className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Library
                    <ChevronDown className={cn('w-4 h-4 ml-auto transition-transform', showPicker && 'rotate-180')} />
                  </Button>

                  {showPicker && (
                    <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-glass-border bg-card/95 backdrop-blur-md shadow-xl z-40 overflow-hidden user-menu-dropdown">
                      {SHELF_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleAddToLibrary(opt.value)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors text-left cursor-pointer"
                        >
                          <opt.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Go to library link if added */}
              {libStatus && libStatus !== 'adding' && libStatus !== 'EXISTS' && (
                <Link
                  to="/library"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  <Library className="w-3 h-3" /> View in your library
                </Link>
              )}
            </div>
          )}

          {!user && (
            <div className="glass-card rounded-2xl p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Log in to add this book to your library</p>
              <Button asChild size="sm" className="w-full rounded-xl">
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Right — Book details */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Title + Author */}
          <div>
            {book.genre && <Badge className="mb-2">{book.genre}</Badge>}
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {book.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-lg text-muted-foreground">
              <User className="h-4 w-4" /> {book.author}
            </p>
          </div>

          {/* Book metadata */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
            <MetaRow icon={Building} label="Publisher"  value={book.publisher} />
            <MetaRow icon={Calendar} label="Published"  value={pubYear} />
            <MetaRow icon={Hash}     label="ISBN"       value={book.isbn} />
            <MetaRow icon={Globe}    label="Language"   value={book.language} />
            <MetaRow icon={Layers}   label="Pages"      value={book.pages} />
          </div>

          {/* Description */}
          {book.description && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-4 w-4" /> Description
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Purchase links */}
          {book.purchaseLinks?.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Where to Buy</h3>
              <div className="flex flex-wrap gap-2">
                {book.purchaseLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-glass-border bg-secondary/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/60"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
