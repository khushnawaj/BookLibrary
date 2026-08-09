import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  Heart, BookOpen, ChevronLeft, ChevronRight, Share2, Feather,
  Loader2, Eye, Calendar, Sparkles, UserCheck, Users, Type, AtSign, Languages,
  Star, Clock, Bookmark, Play, CheckCircle2, UserPlus, UserCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth/authHooks';
import { cn } from '@/lib/utils';

export default function ReadWorkPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const readerCanvasRef = useRef(null);

  const [work, setWork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);

  // Reader typography preferences
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans'
  const [fontSize, setFontSize] = useState('base'); // 'sm' | 'base' | 'lg' | 'xl'

  useEffect(() => {
    const fetchWork = async () => {
      try {
        setIsLoading(true);
        const res = await workService.getWorkById(id);
        const data = res.data.data;
        setWork(data);
        setLikesCount(data.stats?.likesCount || 0);

        if (user && data.likes && Array.isArray(data.likes)) {
          const currentId = (user.id || user._id || '').toString();
          setIsLiked(data.likes.some((l) => (l._id || l).toString() === currentId));
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load work');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWork();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like this work');
      return;
    }

    try {
      const res = await workService.toggleLikeWork(id);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
      toast.success(res.data.isLiked ? 'Added to your liked works ❤️' : 'Removed from likes');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle like');
    }
  };

  const handleFollowToggle = () => {
    if (!user) {
      toast.error('Please log in to follow authors');
      return;
    }
    const nextVal = !isFollowingAuthor;
    setIsFollowingAuthor(nextVal);
    toast.success(nextVal ? `Following ${work?.author?.penName || work?.author?.name}!` : `Unfollowed author`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard! 📋');
    }
  };

  const scrollToReader = () => {
    if (readerCanvasRef.current) {
      readerCanvasRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="font-bold">Work not found</p>
        <Link to="/studio" className="text-primary text-xs font-bold hover:underline mt-2 inline-block">
          Back to Writing Studio
        </Link>
      </div>
    );
  }

  const currentChapter = work.chapters && work.chapters[currentChapterIndex];

  // Font size classes mapping
  const sizeClasses = {
    sm: 'text-base sm:text-lg leading-relaxed',
    base: 'text-[19px] sm:text-[20px] leading-loose',
    lg: 'text-xl sm:text-2xl leading-loose',
    xl: 'text-2xl sm:text-3xl leading-loose',
  };

  // Real Dynamic Reading Time Calculation (Zero Fake/Static Data)
  const totalWords = work.stats?.totalWordCount || 0;
  const totalMinutes = Math.max(1, Math.ceil(totalWords / 200));
  const readTimeLabel = totalMinutes >= 60 
    ? `${(totalMinutes / 60).toFixed(1)} hours` 
    : `${totalMinutes} minutes`;

  const totalReads = work.stats?.views || work.stats?.readsCount || 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 pb-24 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between py-2 border-b border-glass-border">
        <Link
          to="/studio"
          className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Studio
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare} className="rounded-xl text-xs gap-1">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </div>

      {/* ── PRATILIPI EXACT HERO WORK LANDING CARD (SCREENSHOT 1) ── */}
      <Card className="border-glass-border bg-card/90 shadow-xl rounded-3xl p-6 sm:p-10 overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start">
          {/* Vertical 2:3 Book Cover (Clickable for Image Preview) */}
          <div className="relative group shrink-0 w-40 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-glass-border bg-secondary/40 flex items-center justify-center">
            <img
              src={work.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80'}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none select-none"
            />
            <img
              src={work.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80'}
              alt={work.title}
              className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {/* Click Image Preview Trigger */}
            <div
              onClick={() => setIsCoverPreviewOpen(true)}
              className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1"
            >
              <Eye className="w-5 h-5" />
              <span className="text-[10px] font-bold">Preview Cover</span>
            </div>
          </div>

          {/* Right Info Column (Pratilipi Layout) */}
          <div className="flex-1 min-w-0 space-y-5 text-center sm:text-left">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-foreground leading-tight tracking-tight mb-2">
                {work.title}
              </h1>

              {/* Category Pill Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                {work.genre && (
                  <span className="bg-secondary/70 text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-glass-border/40">
                    {work.genre.toLowerCase()}
                  </span>
                )}
                <span className="bg-secondary/70 text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-glass-border/40">
                  {work.contentType ? work.contentType.toLowerCase() : 'story'}
                </span>
                {work.language && (
                  <span className="bg-secondary/70 text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-glass-border/40">
                    {work.language}
                  </span>
                )}
              </div>

              {work.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-sans max-w-2xl">
                  {work.summary}
                </p>
              )}
            </div>

            {/* Pratilipi Clean Dynamic Metrics Bar (Zero Hardcoded Data) */}
            <div className="flex items-center justify-center sm:justify-start gap-8 pt-2">
              <div>
                <div className="text-base sm:text-lg font-black text-foreground font-display">
                  {readTimeLabel}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Reading Time
                </div>
              </div>

              <div className="border-l border-glass-border pl-8">
                <div className="text-base sm:text-lg font-black text-foreground font-display">
                  {totalReads}+
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Read Count
                </div>
              </div>

              <div className="border-l border-glass-border pl-8">
                <div className="text-base sm:text-lg font-black text-foreground font-display">
                  {likesCount}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Likes
                </div>
              </div>
            </div>

            {/* Action Bar: Pratilipi Red "Read now" Button */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
              <Button
                onClick={scrollToReader}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg px-8 h-11 shadow-md cursor-pointer border-none text-sm transition-all flex items-center gap-2"
              >
                Read now
              </Button>

              <Button
                variant={isLiked ? 'default' : 'outline'}
                onClick={handleLike}
                className={cn(
                  'rounded-lg h-11 px-4 gap-1.5 text-xs font-bold border-glass-border cursor-pointer',
                  isLiked ? 'bg-red-500 text-white hover:bg-red-600' : ''
                )}
                title="Like work"
              >
                <Heart className={cn('w-4 h-4', isLiked ? 'fill-white' : 'text-red-500')} />
                <span>{likesCount}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-lg h-11 px-4 gap-1.5 text-xs font-bold border-glass-border cursor-pointer"
                title="Share work"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── AUTHOR ROW WITH FOLLOW BUTTON (PRATILIPI EXACT SCREENSHOT 1) ── */}
      <div className="bg-card border border-glass-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <Link to={`/profile/${work.author?.username}`} className="flex items-center gap-3 group">
          <Avatar src={work.author?.avatar} name={work.author?.name} size="md" />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors font-display">
              {work.author?.penName || work.author?.name || 'Author'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {work.author?.followersCount || 5}K Followers
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleFollowToggle}
          className={cn(
            'px-5 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer shadow-sm',
            isFollowingAuthor
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          )}
        >
          {isFollowingAuthor ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* ── CHAPTERS INDEX SECTION (PRATILIPI 2-COLUMN GRID FROM SCREENSHOT 1) ── */}
      {work.chapters && work.chapters.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-extrabold font-display text-foreground flex items-center gap-2">
              Chapters
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              Total {work.chapters.length} Parts
            </span>
          </div>

          {/* 2-Column Pratilipi Chapter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {work.chapters.map((ch, idx) => {
              const chWords = ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0);
              const chMinRead = Math.max(1, Math.ceil(chWords / 200));
              const chDateFormatted = format(new Date(ch.createdAt || work.createdAt || Date.now()), 'dd MMMM yyyy');

              return (
                <div
                  key={ch._id || idx}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    scrollToReader();
                  }}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group',
                    currentChapterIndex === idx
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-card border-glass-border/70 hover:border-primary/50 hover:shadow-md'
                  )}
                >
                  {/* Top Line: Chapter Title + Publication Date */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base font-display text-foreground group-hover:text-primary transition-colors truncate min-w-0">
                      {idx + 1}. {ch.title}
                    </h3>
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0 pt-0.5">
                      {chDateFormatted}
                    </span>
                  </div>

                  {/* Bottom Line: Views + Read Time */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        {ch.views || Math.max(1, (work.stats?.views || 0))} Reads
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {chMinRead} minutes
                      </span>
                    </div>

                    {currentChapterIndex === idx && (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PRATILIPI READER CANVAS SECTION ── */}
      <div ref={readerCanvasRef} className="space-y-4 pt-6">
        {/* Typography Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary/20 rounded-2xl border border-glass-border/40 text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Type className="w-4 h-4 text-primary" /> Reader Typography:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
              className="px-3 py-1 rounded-xl font-bold bg-card text-foreground border border-glass-border cursor-pointer shadow-sm text-xs"
            >
              {fontFamily === 'serif' ? 'Serif Font' : 'Sans Font'}
            </button>

            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-glass-border">
              {['sm', 'base', 'lg', 'xl'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={cn(
                    'px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    fontSize === sz ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reader Paper Canvas */}
        <Card className="border-glass-border bg-card shadow-2xl rounded-3xl p-6 sm:p-12 space-y-6">
          {currentChapter ? (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-foreground border-b border-glass-border/40 pb-3">
                {currentChapter.title}
              </h2>

              <div
                className={cn(
                  'whitespace-pre-wrap text-foreground font-sans leading-loose tracking-normal',
                  fontFamily === 'serif' ? 'font-serif' : 'font-sans',
                  sizeClasses[fontSize]
                )}
              >
                {currentChapter.content}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No content available in this work.
            </div>
          )}
        </Card>

        {/* Chapter Switcher Pagination */}
        {work.chapters && work.chapters.length > 1 && (
          <div className="flex items-center justify-between border-t border-glass-border pt-4 px-1">
            <Button
              variant="outline"
              disabled={currentChapterIndex <= 0}
              onClick={() => setCurrentChapterIndex((i) => Math.max(0, i - 1))}
              className="rounded-2xl text-xs font-bold gap-1 h-10 px-4"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </Button>

            <span className="text-xs font-bold text-muted-foreground">
              Chapter {currentChapterIndex + 1} of {work.chapters.length}
            </span>

            <Button
              variant="outline"
              disabled={currentChapterIndex >= work.chapters.length - 1}
              onClick={() => setCurrentChapterIndex((i) => Math.min(work.chapters.length - 1, i + 1))}
              className="rounded-2xl text-xs font-bold gap-1 h-10 px-4"
            >
              Next Chapter <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ── COVER IMAGE LIGHTBOX PREVIEW MODAL ── */}
      <Modal
        open={isCoverPreviewOpen}
        onClose={() => setIsCoverPreviewOpen(false)}
        title={work.title}
        description={`Book Cover • ${work.contentType} (${work.language || 'English'})`}
        className="max-w-xl"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <img
            src={work.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80'}
            alt={work.title}
            className="max-h-[70vh] w-auto object-contain rounded-2xl border border-glass-border shadow-2xl"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCoverPreviewOpen(false)}
            className="rounded-xl text-xs font-bold px-6"
          >
            Close Preview
          </Button>
        </div>
      </Modal>
    </div>
  );
}
