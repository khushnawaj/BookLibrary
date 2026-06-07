import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Globe,
  Hash,
  Layers,
  Pencil,
  Star,
  Trash2,
  User,
  FileText,
  StickyNote,
  MessageSquare,
  Tag,
  Building,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchLibraryEntryById,
  removeFromLibrary,
  selectSelectedEntry,
  selectLibraryLoading,
  clearSelectedEntry,
} from '@/features/library/librarySlice';
import { BookCardSkeleton } from '@/components/common/Skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';

const SHELF_STYLES = {
  READ: 'bg-success/15 text-success border-success/30',
  READING: 'bg-primary/15 text-primary border-primary/30',
  WISHLIST: 'bg-mint/15 text-mint border-mint/30',
  DROPPED: 'bg-destructive/15 text-destructive border-destructive/30',
};
const SHELF_LABELS = { READ: 'Read', READING: 'Currently Reading', WISHLIST: 'Wishlist', DROPPED: 'Dropped' };

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-border/50 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  );
}

function StarDisplay({ rating }) {
  if (!rating) return <span className="text-sm text-muted-foreground">Not rated</span>;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'
          )}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
    </div>
  );
}

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const entry = useAppSelector(selectSelectedEntry);
  const isLoading = useAppSelector(selectLibraryLoading);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    dispatch(fetchLibraryEntryById(id));
    return () => { dispatch(clearSelectedEntry()); };
  }, [id, dispatch]);

  const book = entry?.book;

  const handleDelete = async () => {
    const toastId = toast.loading('Removing from library…');
    const result = await dispatch(removeFromLibrary(id));
    if (removeFromLibrary.fulfilled.match(result)) {
      toast.success('Removed from library', { id: toastId });
      navigate(ROUTES.LIBRARY);
    } else {
      toast.error(result.payload || 'Failed to remove', { id: toastId });
    }
    setShowDeleteDialog(false);
  };

  if (isLoading && !entry) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <BookCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!entry && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Book not found</h2>
        <p className="text-muted-foreground">This entry may have been removed.</p>
        <Button asChild>
          <Link to={ROUTES.LIBRARY}>Back to Library</Link>
        </Button>
      </div>
    );
  }

  const pubDate = book?.publicationDate
    ? new Date(book.publicationDate).getFullYear()
    : null;

  return (
    <div className="space-y-8">
      {/* Back + actions bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} id="book-detail-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            id="book-detail-edit"
          >
            <Link to={`/library/${id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            id="book-detail-delete"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remove
          </Button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left — Cover + library info */}
        <div className="space-y-4">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="aspect-[2/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 shadow-xl ring-1 ring-border"
          >
            {book?.coverImage && !imgError ? (
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
          </motion.div>

          {/* Library info card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Library Info
            </h3>

            {/* Shelf */}
            {entry?.shelfType && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Shelf</p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium',
                    SHELF_STYLES[entry.shelfType]
                  )}
                >
                  {SHELF_LABELS[entry.shelfType]}
                </span>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rating</p>
              <StarDisplay rating={entry?.rating} />
            </div>

            {/* Dates */}
            {entry?.startedAt && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-sm font-medium">
                  {new Date(entry.startedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {entry?.finishedAt && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Finished</p>
                <p className="text-sm font-medium">
                  {new Date(entry.finishedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {entry?.readingDurationDays && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Read in</p>
                <p className="text-sm font-medium">{entry.readingDurationDays} days</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right — Book details */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Title & Author */}
          <div>
            <Badge className="mb-2">
              {book?.genre || 'Book'}
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
              {book?.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-lg text-muted-foreground">
              <User className="h-4 w-4" />
              {book?.author}
            </p>
          </div>

          {/* Book meta */}
          <div className="glass-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <MetaRow icon={Building} label="Publisher" value={book?.publisher} />
            <MetaRow icon={Calendar} label="Published" value={pubDate} />
            <MetaRow icon={Hash} label="ISBN" value={book?.isbn} />
            <MetaRow icon={Globe} label="Language" value={book?.language} />
            <MetaRow icon={Layers} label="Pages" value={book?.pages} />
          </div>

          {/* Description */}
          {book?.description && (
            <div className="glass-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Purchase Links */}
          {book?.purchaseLinks?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Where to Buy
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.purchaseLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`purchase-link-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-accent/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {entry?.notes && (
            <div className="glass-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <StickyNote className="h-4 w-4" />
                My Notes
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">{entry.notes}</p>
            </div>
          )}

          {/* Review */}
          {entry?.review && (
            <div className="glass-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                My Review
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">{entry.review}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Library?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{book?.title}</strong> from your library.
              The book record will not be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="detail-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="detail-delete-confirm"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
