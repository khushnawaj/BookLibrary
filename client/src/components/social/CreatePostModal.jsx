import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setShowGuestWarning } from '@/features/auth/authSlice';
import {
  X, Image as ImageIcon, Sparkles, Brain, BookOpen, Feather, Heart,
  Trophy, Calendar, Book, Globe, Users, Lock, ChevronDown,
  Smile, Frown, Zap, Compass, Moon
} from 'lucide-react';
import { createPost } from '@/features/feed/feedSlice';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/common/ImageUpload';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ── Post type definitions ──────────────────────────────────────────────────────
const POST_TYPES = [
  {
    id: 'journal',
    label: 'Journal',
    Icon: Book,
    placeholder: "Dear Diary, write down your day here...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'thought',
    label: 'Thought',
    Icon: Brain,
    placeholder: "What's on your mind right now? Share your ideas, opinions, or anything you're thinking about...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'poem',
    label: 'Poem',
    Icon: Feather,
    placeholder: "Pour your words onto the page...\n\nEvery line a brushstroke,\nevery stanza a world.",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'emotion',
    label: 'Feeling',
    Icon: Heart,
    placeholder: "How are you feeling today? Don't hold back — this is your safe space to express yourself...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'book',
    label: 'Book',
    Icon: BookOpen,
    placeholder: "Share a book recommendation, a review, a favourite quote, or what you're reading right now...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    Icon: Trophy,
    placeholder: "Celebrate a reading milestone! Finished a tough book? Hit a reading goal? Share the win...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isGuest = user?.role === 'GUEST';
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [postType, setPostType] = useState('journal');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const visibilityDropdownRef = useRef(null);

  const VISIBILITY_OPTIONS = [
    { value: 'PUBLIC', label: 'Public', icon: Globe },
    { value: 'FOLLOWERS', label: 'Followers', icon: Users },
    { value: 'PRIVATE', label: 'Only me', icon: Lock },
  ];

  const activeVisibility = VISIBILITY_OPTIONS.find((v) => v.value === visibility) || VISIBILITY_OPTIONS[0];

  const activeType = POST_TYPES.find((t) => t.id === postType);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Click outside visibility dropdown handler
  useEffect(() => {
    if (!showVisibilityDropdown) return;
    const handler = (e) => {
      if (visibilityDropdownRef.current && !visibilityDropdownRef.current.contains(e.target)) {
        setShowVisibilityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVisibilityDropdown]);

  // Load draft on mount/open
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem('sf_post_draft');
      if (savedDraft && !content) {
        setContent(savedDraft);
        toast.success('Recovered your unsaved draft! 📝', {
          style: {
            borderRadius: '12px',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-glass-border)',
            fontSize: '12px',
          }
        });
      }
    }
  }, [isOpen]);

  // Auto-save draft
  useEffect(() => {
    if (content.trim()) {
      localStorage.setItem('sf_post_draft', content);
      setIsDraftSaved(true);
    } else {
      localStorage.removeItem('sf_post_draft');
      setIsDraftSaved(false);
    }
  }, [content]);

  // Pre-fill journal template on open if empty
  useEffect(() => {
    if (isOpen && postType === 'journal') {
      const savedDraft = localStorage.getItem('sf_post_draft');
      if (!savedDraft && !content.trim()) {
        const now = new Date();
        const dateString = now.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setContent(`[${dateString}]\n\n`);
      }
    }
  }, [isOpen, postType]);

  const handleClose = () => {
    setContent('');
    setImages([]);
    setVisibility('PUBLIC');
    setPostType('journal');
    setShowImageUpload(false);
    localStorage.removeItem('sf_post_draft');
    onClose();
  };

  const handlePostTypeChange = (typeId) => {
    setPostType(typeId);
    
    if (typeId === 'journal') {
      if (!content.trim() || (content.startsWith('[') && content.split('\n').length <= 3)) {
        const now = new Date();
        const dateString = now.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setContent(`[${dateString}]\n\n`);
      }
    } else {
      if (content.startsWith('[') && content.split('\n').length <= 3) {
        setContent('');
      }
    }
  };


  const insertEmoji = (emoji) => {
    const textarea = document.getElementById('post-composer-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      setContent(text.substring(0, start) + emoji + text.substring(end));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  const insertTimestamp = () => {
    const now = new Date();
    const dateString = now.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const timestamp = `[${dateString}]`;

    const textarea = document.getElementById('post-composer-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      setContent(text.substring(0, start) + timestamp + text.substring(end));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + timestamp.length, start + timestamp.length);
      }, 0);
    } else {
      setContent((prev) => prev + timestamp);
    }

    toast.success('Timestamp inserted!', {
      style: {
        borderRadius: '12px',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        border: '1px solid var(--color-glass-border)',
        fontSize: '11px',
      }
    });
  };

  const handleSubmit = async () => {
    // Guest guard — close modal and open sign-in prompt
    if (isGuest) {
      onClose();
      dispatch(setShowGuestWarning(true));
      return;
    }

    if (!content.trim() && images.length === 0) {
      toast.error('Post cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const hashtags = content.match(/#[a-zA-Z0-9_]+/g)?.map((tag) => tag.slice(1)) || [];

      await dispatch(
        createPost({
          content,
          images,
          hashtags,
          visibility,
        })
      ).unwrap();

      toast.success('Post published!');
      handleClose();
    } catch (error) {
      toast.error(error || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card/95 glass-card w-full h-[100dvh] sm:h-auto max-w-[560px] rounded-t-3xl sm:rounded-2xl border-0 sm:border border-glass-border shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[92vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
        
        {/* Mobile drag handle */}
        <div className="mx-auto my-2 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden shrink-0" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-2 sm:pt-4 pb-3 border-b border-glass-border">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-primary" />
            Create Post
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full h-8 w-8 text-muted-foreground hover:bg-secondary/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Post type selector ── */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 overflow-x-auto scrollbar-none shrink-0">
          {POST_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handlePostTypeChange(type.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border shrink-0',
                postType === type.id
                  ? `${type.color} ${type.activeBg} ${type.border}`
                  : 'text-muted-foreground border-transparent hover:bg-secondary/40 hover:text-foreground'
              )}
            >
              <type.Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex-1 overflow-y-auto min-h-0 flex flex-col gap-3">
          {/* Active type hint bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border',
              activeType.bg, activeType.border, activeType.color
            )}>
              <activeType.Icon className="w-3.5 h-3.5 shrink-0" />
              <span>
                {postType === 'journal' && 'Writing in your daily journal'}
                {postType === 'thought' && 'Sharing a thought'}
                {postType === 'poem' && 'Writing a poem'}
                {postType === 'emotion' && 'Expressing a feeling'}
                {postType === 'book' && 'Talking about a book'}
                {postType === 'milestone' && 'Celebrating a milestone'}
              </span>
            </div>
          </div>

          <div className="flex flex-col mt-1 flex-1 min-h-0">
            {/* Mood Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border border-glass-border bg-secondary/15 rounded-t-xl select-none shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Mood:</span>
              <div className="flex items-center gap-1">
                {[
                  { Icon: Smile, label: 'Happy', emoji: '😊' },
                  { Icon: Compass, label: 'Calm', emoji: '🧘' },
                  { Icon: Frown, label: 'Sad', emoji: '😔' },
                  { Icon: Zap, label: 'Excited', emoji: '⚡' },
                  { Icon: Moon, label: 'Reflective', emoji: '🍂' },
                ].map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertEmoji(m.emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                    title={m.label}
                  >
                    <m.Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea container */}
            <div className={cn(
              "rounded-b-xl border border-t-0 border-glass-border bg-secondary/10 px-4 py-3.5 transition-all duration-200 flex-1 flex flex-col min-h-[140px]",
              postType === 'journal' && 'focus-within:border-teal-500/40 focus-within:ring-4 focus-within:ring-teal-500/10',
              postType === 'thought' && 'focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/10',
              postType === 'poem' && 'focus-within:border-pink-500/40 focus-within:ring-4 focus-within:ring-pink-500/10',
              postType === 'emotion' && 'focus-within:border-rose-500/40 focus-within:ring-4 focus-within:ring-rose-500/10',
              postType === 'book' && 'focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10',
              postType === 'milestone' && 'focus-within:border-amber-500/40 focus-within:ring-4 focus-within:ring-amber-500/10'
            )}>
              <textarea
                id="post-composer-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={activeType.placeholder}
                style={{
                  color: 'var(--color-foreground)',
                  ...(postType === 'journal' ? {
                    backgroundImage: 'linear-gradient(rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
                    backgroundSize: '100% 28px',
                    lineHeight: '28px',
                    paddingTop: '6px',
                  } : {
                    lineHeight: '24px',
                  })
                }}
                className={cn(
                  'w-full flex-1 resize-none border-none outline-none focus:outline-none focus:ring-0 p-0',
                  'bg-transparent text-[15.5px] font-serif tracking-wide text-foreground/90',
                  'placeholder:text-muted-foreground/50',
                  postType === 'poem' ? 'italic leading-loose text-center' : 'text-left'
                )}
              />
            </div>
          </div>

          {showImageUpload && (
            <div className="mt-2 p-2 border border-glass-border rounded-xl bg-secondary/10 relative shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="absolute -top-3 -right-3 rounded-full w-7 h-7 shadow-sm bg-background border-border z-10 hover:text-destructive"
                onClick={() => {
                  setShowImageUpload(false);
                  setImages([]);
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
              <ImageUpload
                value={images[0]}
                onChange={(url) => setImages(url ? [url] : [])}
                compact
              />
            </div>
          )}

          {/* Stats Bar */}
          <div className="mt-2.5 flex items-center justify-between px-1">
            <div className="flex gap-3 text-[10.5px] font-bold text-muted-foreground/50 select-none">
              <span className={cn(wordCount > 10000 ? 'text-destructive font-extrabold' : '')}>
                {wordCount} / 10,000 words
              </span>
              <span>•</span>
              <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
              {isDraftSaved && (
                <>
                  <span>•</span>
                  <span className="text-emerald-500/80 animate-pulse font-extrabold">✓ Auto-saved</span>
                </>
              )}
            </div>
            <span className="text-[10.5px] font-bold text-muted-foreground/45">
              {content.length} characters
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 border-t border-glass-border flex items-center justify-between bg-secondary/5 rounded-b-2xl gap-3">
          <div className="flex items-center gap-1">
            {/* Image toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:text-primary hover:bg-primary/10 h-9 w-9 text-muted-foreground"
              onClick={() => setShowImageUpload((v) => !v)}
              title="Add image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>

            {/* Timestamp button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:text-primary hover:bg-primary/10 h-9 w-9 text-muted-foreground"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertTimestamp}
              title="Insert Date & Time"
            >
              <Calendar className="w-4 h-4" />
            </Button>

            {/* Visibility Selector */}
            <div className="relative" ref={visibilityDropdownRef}>
              <button
                type="button"
                onClick={() => setShowVisibilityDropdown((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-border bg-card text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <activeVisibility.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{activeVisibility.label}</span>
                <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform shrink-0", showVisibilityDropdown && "rotate-180")} />
              </button>

              {showVisibilityDropdown && (
                <div className="absolute left-0 bottom-full mb-1 w-32 rounded-xl border border-glass-border bg-card/95 backdrop-blur-md shadow-xl z-50 overflow-hidden py-1 animate-in fade-in duration-100">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setVisibility(opt.value);
                        setShowVisibilityDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer",
                        opt.value === visibility ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <opt.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && images.length === 0) || wordCount > 10000}
            className={cn(
              'rounded-full px-6 font-semibold transition-all duration-150',
              activeType.id !== 'thought' && !isSubmitting ? `shadow-sm` : ''
            )}
          >
            {isSubmitting ? 'Posting...' : 'Publish Post'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
