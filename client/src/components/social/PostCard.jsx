import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart, MessageCircle, Bookmark, Share2,
  MoreHorizontal, BookOpen, Globe, Lock, Users, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleLike, removePostFromFeed } from '@/features/feed/feedSlice';
import { postService } from '@/services';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { CommentSection } from './CommentSection';

const VISIBILITY_ICON = {
  PUBLIC:    Globe,
  FOLLOWERS: Users,
  PRIVATE:   Lock,
};

export function PostCard({ post }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSaved, setIsSaved]           = useState(post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [imgError, setImgError]         = useState({});

  const isAuthor = user && post.author && (user._id === post.author._id || user._id === post.author);
  const isAdmin = user && user.role === 'ADMIN';
  const canDelete = isAuthor || isAdmin;

  const handleLike  = () => dispatch(toggleLike(post._id));

  const handleSave = async () => {
    try {
      const res = await postService.toggleSave(post._id);
      const { saved } = res.data.data;
      setIsSaved(saved);
      toast.success(saved ? 'Post saved' : 'Post unsaved');
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    try {
      await postService.deletePost(post._id);
      dispatch(removePostFromFeed(post._id));
      toast.success('Post deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const VisibilityIcon = VISIBILITY_ICON[post.visibility] ?? Globe;

  return (
    <article
      className="group bg-card/70 glass-card border border-glass-border rounded-2xl
                 shadow-sm hover:shadow-md hover:border-primary/20
                 transition-all duration-200 overflow-hidden"
    >
      {/* ── Card Header ── */}
      <div className="flex items-start justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <Link to={`/profile/${post.author?.username}`} className="relative shrink-0 hover:opacity-90 transition-opacity">
            <Avatar
              src={post.author?.avatar}
              name={post.author?.name}
              size="md"
              className="ring-2 ring-secondary/50 border border-glass-border"
            />
          </Link>

          {/* Author info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap leading-none">
              <Link
                to={`/profile/${post.author?.username}`}
                className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {post.author?.name}
              </Link>
              <Link
                to={`/profile/${post.author?.username}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
              >
                @{post.author?.username}
              </Link>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <VisibilityIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              <span className="text-[10px] text-muted-foreground/60">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Delete option for Author or Admin */}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 rounded-xl text-red-500/70 hover:text-red-600 hover:bg-red-50/50 shrink-0 -mr-1.5 -mt-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-5 py-3.5">
        {/* Text body */}
        <p className="text-sm sm:text-[14.5px] leading-relaxed text-foreground whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[12px] text-primary font-semibold hover:underline cursor-pointer
                           bg-primary/10 px-1.5 py-0.5 rounded-md transition-colors hover:bg-primary/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Images grid */}
        {post.images?.length > 0 && (
          <div
            className={cn(
              'mt-3.5 grid gap-1.5 rounded-xl overflow-hidden',
              post.images.length === 1 && 'grid-cols-1',
              post.images.length === 2 && 'grid-cols-2',
              post.images.length >= 3 && 'grid-cols-2',
            )}
          >
            {post.images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={cn(
                  'relative overflow-hidden bg-secondary/20',
                  post.images.length === 1 ? 'rounded-xl' : '',
                  post.images.length >= 3 && i === 0 ? 'row-span-2' : '',
                )}
              >
                {!imgError[i] ? (
                  <img
                    src={img}
                    alt={`Post image ${i + 1}`}
                    onError={() => setImgError((p) => ({ ...p, [i]: true }))}
                    className="w-full h-full object-cover aspect-video"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <BookOpen className="h-6 w-6" />
                  </div>
                )}
                {/* Extra count badge */}
                {post.images.length > 4 && i === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{post.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Book Reference card */}
        {post.bookRef && (
          <div className="mt-3.5 flex items-center gap-3 p-3 rounded-xl
                          border border-glass-border bg-secondary/30
                          cursor-pointer hover:bg-secondary/55 hover:border-primary/25
                          transition-all duration-150">
            {post.bookRef.coverImage ? (
              <img
                src={post.bookRef.coverImage}
                className="w-10 h-[56px] object-cover rounded-lg border border-glass-border shadow-sm shrink-0"
                alt="Book cover"
              />
            ) : (
              <div className="w-10 h-[56px] bg-secondary/30 rounded-lg flex items-center justify-center border border-glass-border shrink-0">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-0.5">
                📖 Book Reference
              </p>
              <p className="font-semibold text-[13px] text-foreground truncate">{post.bookRef.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{post.bookRef.author}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center justify-between px-2.5 sm:px-3.5 py-2
                      border-t border-glass-border">
        {/* Left actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium',
              'transition-all duration-150',
              post.isLiked
                ? 'text-red-500 bg-red-50/50 hover:bg-red-100/50'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50/30'
            )}
          >
            <Heart className={cn('w-4 h-4 shrink-0', post.isLiked && 'fill-current')} />
            <span>{post.likesCount > 0 ? post.likesCount : 'Like'}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium',
              'transition-all duration-150',
              showComments
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            )}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>{post.commentsCount > 0 ? post.commentsCount : 'Comment'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium
                       text-muted-foreground hover:text-success hover:bg-success/5
                       transition-all duration-150"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center justify-center h-8 w-8 rounded-xl',
            'transition-all duration-150',
            isSaved
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
          )}
        >
          <Bookmark className={cn('w-4 h-4 shrink-0', isSaved && 'fill-current')} />
        </button>
      </div>

      {/* ── Comments ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-glass-border"
          >
            <div className="px-4 sm:px-5 py-3">
              <CommentSection postId={post._id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
