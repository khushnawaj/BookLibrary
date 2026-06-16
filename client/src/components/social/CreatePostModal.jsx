import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Image as ImageIcon, Sparkles, Brain, BookOpen, Feather, Heart, Trophy } from 'lucide-react';
import { createPost } from '@/features/feed/feedSlice';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/common/ImageUpload';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ── Post type definitions ──────────────────────────────────────────────────────
const POST_TYPES = [
  {
    id: 'thought',
    label: 'Thought',
    emoji: '💭',
    Icon: Brain,
    placeholder: "What's on your mind right now? Share your ideas, opinions, or anything you're thinking about...",
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    activeBg: 'bg-violet-500/15',
  },
  {
    id: 'poem',
    label: 'Poem',
    emoji: '✍️',
    Icon: Feather,
    placeholder: "Pour your words onto the page...\n\nEvery line a brushstroke,\nevery stanza a world.",
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    activeBg: 'bg-pink-500/15',
  },
  {
    id: 'emotion',
    label: 'Feeling',
    emoji: '🌊',
    Icon: Heart,
    placeholder: "How are you feeling today? Don't hold back — this is your safe space to express yourself...",
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-500/15',
  },
  {
    id: 'book',
    label: 'Book',
    emoji: '📖',
    Icon: BookOpen,
    placeholder: "Share a book recommendation, a review, a favourite quote, or what you're reading right now...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    emoji: '🏆',
    Icon: Trophy,
    placeholder: "Celebrate a reading milestone! Finished a tough book? Hit a reading goal? Share the win...",
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-500/15',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [postType, setPostType] = useState('thought');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeType = POST_TYPES.find((t) => t.id === postType);

  const handleClose = () => {
    setContent('');
    setImages([]);
    setVisibility('PUBLIC');
    setPostType('thought');
    setShowImageUpload(false);
    onClose();
  };

  const handleSubmit = async () => {
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

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card/95 glass-card w-full max-w-[560px] rounded-t-2xl sm:rounded-2xl border border-glass-border shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-glass-border">
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
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-0 overflow-x-auto scrollbar-none">
          {POST_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setPostType(type.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border shrink-0',
                postType === type.id
                  ? `${type.color} ${type.activeBg} ${type.border}`
                  : 'text-muted-foreground border-transparent hover:bg-secondary/40 hover:text-foreground'
              )}
            >
              <span>{type.emoji}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex-1 overflow-y-auto min-h-0">
          {/* Active type hint bar */}
          <div className={cn(
            'flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs font-medium border',
            activeType.bg, activeType.border, activeType.color
          )}>
            <activeType.Icon className="w-3.5 h-3.5 shrink-0" />
            <span>
              {postType === 'thought' && 'Sharing a thought'}
              {postType === 'poem' && 'Writing a poem'}
              {postType === 'emotion' && 'Expressing a feeling'}
              {postType === 'book' && 'Talking about a book'}
              {postType === 'milestone' && 'Celebrating a milestone'}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={activeType.placeholder}
            className={cn(
              'w-full min-h-[160px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-sm sm:text-base p-1 bg-transparent text-foreground',
              'placeholder:text-muted-foreground/50 leading-relaxed',
              postType === 'poem' && 'font-mono text-sm italic'
            )}
          />

          {showImageUpload && (
            <div className="mt-4 p-2 border border-glass-border rounded-xl bg-secondary/10 relative">
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
              />
            </div>
          )}

          {/* Char count */}
          <div className="mt-2 flex justify-end">
            <span className={cn(
              'text-[10px] font-medium',
              content.length > 1800 ? 'text-destructive' : 'text-muted-foreground/40'
            )}>
              {content.length} / 2000
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

            {/* Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="text-xs font-semibold rounded-xl bg-background border border-glass-border px-2.5 py-1.5 text-foreground focus:outline-none cursor-pointer hover:bg-secondary/40 transition-colors"
            >
              <option value="PUBLIC">🌍 Public</option>
              <option value="FOLLOWERS">👥 Followers</option>
              <option value="PRIVATE">🔒 Only me</option>
            </select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && images.length === 0)}
            className={cn(
              'rounded-full px-6 font-semibold transition-all duration-150',
              activeType.id !== 'thought' && !isSubmitting ? `shadow-sm` : ''
            )}
          >
            {isSubmitting ? 'Posting...' : `Publish ${activeType.emoji}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
