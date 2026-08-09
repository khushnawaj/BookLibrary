import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  Heart, BookOpen, ChevronLeft, ChevronRight, Share2, Feather,
  Loader2, Eye, Calendar, Sparkles, UserCheck, Users, Type, AtSign, Languages,
  Star, Clock, Bookmark, Play, CheckCircle2, UserPlus, UserCheck2, ArrowLeft, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth/authHooks';
import { cn } from '@/lib/utils';
import { WorkCommentSection } from '@/components/writing/WorkCommentSection';

export default function ReadWorkPage() {
  const { id, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const readerCanvasRef = useRef(null);

  const [work, setWork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);

  // Chapter-level likes state
  const [isChapterLiked, setIsChapterLiked] = useState(false);
  const [chapterLikesCount, setChapterLikesCount] = useState(0);

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
        toast.error(err.response?.data?.message || 'Failed to load work');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWork();
  }, [id, user]);

  // Sync chapter-level likes when chapterId changes
  useEffect(() => {
    if (work && chapterId && work.chapters) {
      const ch = work.chapters.find((c) => c._id.toString() === chapterId.toString());
      if (ch) {
        setChapterLikesCount(ch.likesCount || (ch.likes ? ch.likes.length : 0));
        if (user && ch.likes && Array.isArray(ch.likes)) {
          const currentId = (user.id || user._id || '').toString();
          setIsChapterLiked(ch.likes.some((l) => (l._id || l).toString() === currentId));
        } else {
          setIsChapterLiked(false);
        }
      }
    }
  }, [work, chapterId, user]);

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

  const handleLikeChapter = async () => {
    if (!user) {
      toast.error('Please log in to like chapters');
      return;
    }
    if (!chapterId) return;

    try {
      const res = await workService.toggleLikeChapter(id, chapterId);
      const { isLiked: nextLiked, likesCount: nextCount } = res.data.data;
      setIsChapterLiked(nextLiked);
      setChapterLikesCount(nextCount);

      // Update chapter in local work state
      setWork((prev) => {
        if (!prev || !prev.chapters) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((c) =>
            c._id.toString() === chapterId.toString()
              ? { ...c, likesCount: nextCount }
              : c
          ),
        };
      });

      toast.success(nextLiked ? 'Liked chapter ❤️' : 'Removed chapter like');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle chapter like');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground">Work not found</h2>
        <p className="text-muted-foreground mt-2">This work may be private or deleted.</p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground">
          <Link to="/studio">Back to Studio</Link>
        </Button>
      </div>
    );
  }

  const chapters = work.chapters || [];
  const currentChapterIndex = chapterId
    ? chapters.findIndex((c) => c._id.toString() === chapterId.toString())
    : -1;

  const currentChapter = currentChapterIndex !== -1 ? chapters[currentChapterIndex] : null;

  // Calculate dynamic Pratilipi metrics
  const totalWords = chapters.reduce(
    (acc, ch) => acc + (ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0)),
    0
  );

  const readMinutes = Math.max(1, Math.ceil(totalWords / 200));
  const readTimeLabel = readMinutes > 60 ? `${Math.floor(readMinutes / 60)} hr ${readMinutes % 60} mins` : `${readMinutes} mins`;
  const totalReads = Math.max(1, work.stats?.views || 0);

  const sizeClasses = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  };

  // ── MODE A: SEPARATE SINGLE CHAPTER READER PAGE ──
  if (chapterId && currentChapter) {
    const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
    const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
        {/* Navigation Bar Back to Book Details */}
        <div className="flex items-center justify-between border-b border-glass-border/60 pb-3">
          <Link
            to={`/read/${id}`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to {work.title}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="rounded-xl text-xs gap-1"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </div>

        {/* Chapter Header Card */}
        <div className="bg-card border border-glass-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {Math.max(1, Math.ceil((currentChapter.wordCount || 500) / 200))} min read
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground leading-tight">
            {currentChapter.title}
          </h1>

          <div className="flex items-center justify-between pt-1 border-t border-glass-border/30 text-xs text-muted-foreground">
            <span className="font-medium">
              Published by <strong className="text-foreground">{work.author?.penName || work.author?.name}</strong>
            </span>
            <span>{format(new Date(currentChapter.createdAt || work.createdAt || Date.now()), 'MMMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Reader Typography Controls */}
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

        {/* Dedicated Chapter Paper Canvas */}
        <Card className="border-glass-border bg-card shadow-2xl rounded-3xl p-6 sm:p-12 space-y-6">
          <div
            className={cn(
              'whitespace-pre-wrap text-foreground leading-loose tracking-normal',
              fontFamily === 'serif' ? 'font-serif' : 'font-sans',
              sizeClasses[fontSize]
            )}
          >
            {currentChapter.content}
          </div>
        </Card>

        {/* Chapter Bottom Action Bar (Like Chapter & Prev/Next Navigation) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-glass-border rounded-2xl p-4 shadow-sm">
          <Button
            variant={isChapterLiked ? 'default' : 'outline'}
            onClick={handleLikeChapter}
            className={cn(
              "rounded-xl h-10 px-4 gap-1.5 text-xs font-bold border-glass-border cursor-pointer transition-all",
              isChapterLiked ? "bg-red-500 text-white hover:bg-red-600 border-none" : ""
            )}
          >
            <Heart className={cn("w-4 h-4", isChapterLiked ? "fill-white" : "text-red-500")} />
            <span>{isChapterLiked ? 'Liked Chapter' : 'Like Chapter'} ({chapterLikesCount})</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {prevChapter ? (
              <Button
                asChild
                variant="outline"
                className="rounded-xl text-xs font-bold gap-1 h-10 px-4 border-glass-border"
              >
                <Link to={`/read/${id}/chapter/${prevChapter._id}`}>
                  <ChevronLeft className="w-4 h-4" /> Previous Chapter
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled className="rounded-xl text-xs font-bold gap-1 h-10 px-4 opacity-40">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
            )}

            {nextChapter ? (
              <Button
                asChild
                className="rounded-xl text-xs font-bold gap-1 h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <Link to={`/read/${id}/chapter/${nextChapter._id}`}>
                  Next Chapter <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-xl text-xs font-bold gap-1 h-10 px-4 border-glass-border">
                <Link to={`/read/${id}`}>
                  Finish Reading ✓
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Chapter-Specific Discussion & Comments */}
        <WorkCommentSection workId={id} chapterId={chapterId} workOwnerId={work.author?._id} />
      </div>
    );
  }

  // ── MODE B: BOOK LANDING & OVERVIEW PAGE (WHEN NO SPECIFIC CHAPTER IS SELECTED) ──
  const firstChapter = chapters[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-glass-border/60 pb-3">
        <Link to="/studio" className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Back to Studio
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare} className="rounded-xl text-xs gap-1">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </div>

      {/* Pratilipi Hero Work Landing Card */}
      <Card className="border-glass-border bg-card/90 shadow-xl rounded-3xl p-6 sm:p-10 overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start">
          {/* Vertical 2:3 Book Cover */}
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
            <div
              onClick={() => setIsCoverPreviewOpen(true)}
              className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1"
            >
              <Eye className="w-5 h-5" />
              <span className="text-[10px] font-bold">Preview Cover</span>
            </div>
          </div>

          {/* Right Info Column */}
          <div className="flex-1 min-w-0 space-y-5 text-center sm:text-left">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-foreground leading-tight tracking-tight mb-2">
                {work.title}
              </h1>

              {/* Category Badges */}
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

            {/* Metrics Bar */}
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

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
              {firstChapter ? (
                <Button
                  asChild
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg px-8 h-11 shadow-md cursor-pointer border-none text-sm transition-all flex items-center gap-2"
                >
                  <Link to={`/read/${id}/chapter/${firstChapter._id}`}>
                    Start Reading →
                  </Link>
                </Button>
              ) : (
                <Button disabled className="bg-red-600 text-white opacity-50 font-extrabold rounded-lg px-8 h-11">
                  No Chapters Published
                </Button>
              )}

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

      {/* Author Row */}
      <div className="bg-card border border-glass-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <Link to={`/profile/${work.author?.username}`} className="flex items-center gap-3 group">
          <Avatar src={work.author?.avatar} name={work.author?.name} size="md" />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors font-display">
              {work.author?.penName || work.author?.name || 'Author'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              @{work.author?.username}
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

      {/* Table of Contents: Clickable Chapters List */}
      {chapters.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-extrabold font-display text-foreground flex items-center gap-2">
              Chapters Index ({chapters.length})
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              Click any chapter to read
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {chapters.map((ch, idx) => {
              const chWords = ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0);
              const chMinRead = Math.max(1, Math.ceil(chWords / 200));
              const chDateFormatted = format(new Date(ch.createdAt || work.createdAt || Date.now()), 'dd MMMM yyyy');

              return (
                <Link
                  key={ch._id || idx}
                  to={`/read/${id}/chapter/${ch._id}`}
                  className="p-4 rounded-2xl border border-glass-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base font-display text-foreground group-hover:text-primary transition-colors truncate min-w-0">
                      {idx + 1}. {ch.title}
                    </h3>
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0 pt-0.5">
                      {chDateFormatted}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {chMinRead} min read
                      </span>
                      {ch.likesCount > 0 && (
                        <span className="flex items-center gap-1 text-red-500 font-bold">
                          <Heart className="w-3 h-3 fill-red-500" /> {ch.likesCount}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-primary group-hover:underline">
                      Read Chapter →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Book-Level Discussion & Reviews */}
      <WorkCommentSection workId={id} chapterId={null} workOwnerId={work.author?._id} />

      {/* Lightbox Cover Preview Modal */}
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
