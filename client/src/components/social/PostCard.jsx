// ShelfForge Post Card Component - Updated for Sharing
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle, Bookmark, Share2,
  BookOpen, Globe, Lock, Users, Trash2,
  ArrowUp, ArrowDown, Edit2, Loader2,
  MoreVertical, Plus, Check, ChevronDown, Library,
  Sparkles, Feather, MessageSquare,
  Download, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleLike, removePostFromFeed, updatePostInFeed } from '@/features/feed/feedSlice';
import { setShowGuestWarning } from '@/features/auth/authSlice';
import { postService, libraryService } from '@/services';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { CommentSection } from './CommentSection';
import { Modal } from '@/components/ui/modal';

const VISIBILITY_ICON = {
  PUBLIC:    Globe,
  FOLLOWERS: Users,
  PRIVATE:   Lock,
};

// Dynamically determine a Reddit-style community name and theme for the post
const getCommunityInfo = (post) => {
  if (post.bookRef) {
    return {
      name: 's/books',
      icon: BookOpen,
      color: 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/15',
    };
  }
  if (post.hashtags && post.hashtags.length > 0) {
    const mainTag = post.hashtags[0].toLowerCase();
    return {
      name: `s/${mainTag}`,
      icon: Sparkles,
      color: 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/15',
    };
  }
  const linesCount = post.content.split('\n').length;
  if (linesCount > 4) {
    return {
      name: 's/poetry',
      icon: Feather,
      color: 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/15',
    };
  }
  return {
    name: 's/lounge',
    icon: MessageSquare,
    color: 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/15',
  };
};

// Parse title out of content if the first line is short and followed by text
const parsePostContent = (content) => {
  const lines = content.split('\n');
  if (lines.length > 1 && lines[0].trim().length > 0 && lines[0].trim().length < 80) {
    return {
      title: lines[0].trim(),
      body: lines.slice(1).join('\n').trim(),
    };
  }
  return {
    title: null,
    body: content,
  };
};

export function PostCard({ post, onDelete, onUpdate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isSaved, setIsSaved]           = useState(post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [imgError, setImgError]         = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const quoteCardRef = useRef(null);

  // Inline editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Book-to-library states
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState(null); // null | 'adding' | 'WISHLIST' | 'READING' | 'READ'
  const shelfPickerRef = useRef(null);

  // Close shelf picker on outside click
  useEffect(() => {
    if (!showShelfPicker) return;
    const handler = (e) => {
      if (shelfPickerRef.current && !shelfPickerRef.current.contains(e.target)) {
        setShowShelfPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShelfPicker]);

  const SHELF_OPTIONS = [
    { value: 'WISHLIST',  label: 'Want to Read',   icon: Bookmark },
    { value: 'READING',   label: 'Currently Reading', icon: BookOpen },
    { value: 'READ',      label: 'Already Read',   icon: Check },
  ];

  const handleAddToLibrary = async (shelfType) => {
    if (!user || isGuest) {
      dispatch(setShowGuestWarning(true));
      return;
    }
    setShowShelfPicker(false);
    setLibraryStatus('adding');
    try {
      await libraryService.add({ bookId: post.bookRef._id, shelfType });
      setLibraryStatus(shelfType);
      const option = SHELF_OPTIONS.find(o => o.value === shelfType);
      toast.success(`Added to your library as "${option?.label}"!`, {
        icon: option ? <option.icon className="w-5 h-5 text-primary" /> : undefined,
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already') || err.response?.status === 409) {
        setLibraryStatus('EXISTS');
        toast('This book is already in your library!', {
          icon: <BookOpen className="w-5 h-5 text-primary" />,
          style: {
            borderRadius: '12px',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-glass-border)',
          },
        });
      } else {
        setLibraryStatus(null);
        toast.error('Failed to add book to library');
      }
    }
  };

  const currentUserId = user?.id || user?._id;
  const postAuthorId = post.author?.id || post.author?._id || post.author;
  const isAuthor = currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId);
  const isAdmin = user && user.role === 'ADMIN';
  const isGuest = user?.role === 'GUEST';
  const canDelete = isAuthor || isAdmin;

  const handleLike = () => {
    if (isGuest) { dispatch(setShowGuestWarning(true)); return; }
    dispatch(toggleLike(post._id));
  };

  const handleDownvote = () => {
    if (isGuest) { dispatch(setShowGuestWarning(true)); return; }
    if (post.isLiked) {
      dispatch(toggleLike(post._id));
    } else {
      toast("ShelfForge is all about positive vibes! Downvoting is disabled.", {
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
          fontSize: '13px',
        }
      });
    }
  };

  const handleSave = async () => {
    if (isGuest) { dispatch(setShowGuestWarning(true)); return; }
    try {
      const res = await postService.toggleSave(post._id);
      const { saved } = res.data.data;
      setIsSaved(saved);
      toast.success(saved ? 'Post saved to bookmarks' : 'Post removed from bookmarks', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
        }
      });
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success('Link copied to clipboard!', {
      style: {
        borderRadius: '12px',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        border: '1px solid var(--color-glass-border)',
      }
    });
  };

  const handleDownloadImage = async () => {
    if (!quoteCardRef.current) return;
    const toastId = toast.loading('Generating image...');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(quoteCardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ShelfForge-Poetry-${post._id}.png`;
      link.href = url;
      link.click();
      toast.success('Image downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image', { id: toastId });
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Read this beautiful poem by ${post.author?.penName || `@${post.author?.username}`} on ShelfForge! 📚🖋️\n\n"${post.content.substring(0, 100)}..."\n\nRead full: ${window.location.origin}/post/${post._id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Read this poem by ${post.author?.penName || `@${post.author?.username}`} on ShelfForge! 📚🖋️`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}`, '_blank');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    try {
      await postService.deletePost(post._id);
      dispatch(removePostFromFeed(post._id));
      if (onDelete) onDelete(post._id);
      toast.success('Post deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editContent.trim()) return;
    try {
      setIsUpdating(true);
      const res = await postService.updatePost(post._id, { content: editContent.trim() });
      
      // Update redux state
      dispatch(updatePostInFeed(res.data.data));
      
      // Propagate update to parent (e.g., Profile Page local state)
      if (onUpdate) onUpdate(res.data.data);
      
      setIsEditing(false);
      toast.success('Post updated successfully', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsUpdating(false);
    }
  };

  const VisibilityIcon = VISIBILITY_ICON[post.visibility] ?? Globe;
  const community = getCommunityInfo(post);
  const { title, body } = parsePostContent(post.content);

  return (
    <article
      className="group bg-card/70 glass-card border border-glass-border rounded-2xl
                 shadow-sm hover:shadow-lg hover:shadow-red-500/[0.04] hover:border-red-500/20
                 transition-all duration-300 ease-out !overflow-visible flex"
    >
      {/* ── Left Vote Panel (desktop only) ── */}
      <div className="hidden md:flex flex-col items-center w-12 shrink-0 pt-4 bg-secondary/15 border-r border-glass-border/30 select-none rounded-l-2xl">
        <button
          onClick={handleLike}
          className={cn(
            'p-1.5 rounded-lg transition-all duration-150',
            post.isLiked
              ? 'text-primary bg-primary/10 hover:bg-primary/20'
              : 'text-muted-foreground/70 hover:text-primary hover:bg-secondary/40'
          )}
          title="Upvote"
        >
          <ArrowUp className={cn('w-5 h-5', post.isLiked && 'fill-current')} />
        </button>
        
        <span className={cn(
          'text-[13px] font-extrabold my-1 text-center min-w-[20px] transition-colors duration-150',
          post.isLiked ? 'text-primary' : 'text-foreground/80'
        )}>
          {post.likesCount}
        </span>

        <button
          onClick={handleDownvote}
          className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-accent hover:bg-secondary/40 transition-all duration-150"
          title="Downvote"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* ── Main Post Area ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Card Header ── */}
        <div className="flex items-start justify-between px-4 sm:px-5 pt-4 pb-1">
          <div className="flex items-center gap-3 min-w-0">
            {/* User Avatar */}
            <Link to={`/profile/${post.author?.username}`} className="shrink-0 hover:opacity-90 transition-opacity">
              <Avatar
                src={post.author?.avatar}
                name={post.author?.name}
                size="md"
                className="ring-2 ring-secondary/50 border border-glass-border"
              />
            </Link>

            {/* Sub-community & Author Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-x-2 gap-y-1.5 flex-wrap leading-tight text-[11px]">
                {/* Community Pill Badge */}
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer shrink-0",
                  community.color
                )}>
                  <community.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{community.name}</span>
                </span>

                {/* Bullet Separator */}
                <span className="text-muted-foreground/40 select-none">•</span>

                {/* Author Info */}
                <span className="text-muted-foreground/70 whitespace-nowrap">
                  Posted by{' '}
                  <Link
                    to={`/profile/${post.author?.username}`}
                    className="font-bold text-foreground/85 hover:text-primary hover:underline transition-colors"
                  >
                    u/{post.author?.username}
                  </Link>
                </span>

                {/* Bullet Separator */}
                <span className="text-muted-foreground/40 select-none">•</span>

                {/* Time */}
                <span className="text-muted-foreground/60 whitespace-nowrap">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Kebab Menu for Actions */}
          {canDelete && (
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1.5 rounded-full text-muted-foreground/75 hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                title="Post options"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-36 rounded-xl border border-border bg-card shadow-xl p-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150 user-menu-dropdown">
                    {isAuthor && !isEditing && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-foreground hover:bg-secondary/60 transition-colors text-left cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Post
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Post Content ── */}
        <div className="px-4 sm:px-5 py-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ color: 'var(--color-foreground)' }}
                className="w-full min-h-[120px] rounded-xl border border-glass-border bg-secondary/15 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all text-foreground font-medium"
                placeholder="What is on your mind?"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  disabled={isUpdating}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-secondary/30 text-foreground hover:bg-secondary/45 border border-glass-border/40 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating || !editContent.trim() || (editContent.trim() ? editContent.trim().split(/\s+/).length : 0) > 10000}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              {post.poetryBg ? (
                (() => {
                  let px = 15;
                  let py = 15;
                  let pSize = 14;
                  let pColor = 'white';
                  let pFontFamily = 'serif';
                  let pAlign = 'center';
                  let pOverlay = 25;
                  let pCaption = '';
                  
                  if (post.poetryPosition) {
                    try {
                      const parsed = JSON.parse(post.poetryPosition);
                      px = parsed.x ?? 15;
                      py = parsed.y ?? 15;
                      pSize = parsed.fontSize ?? 14;
                      pColor = parsed.color ?? 'white';
                      pFontFamily = parsed.fontFamily ?? 'serif';
                      pAlign = parsed.align ?? 'center';
                      pOverlay = parsed.overlay ?? 25;
                      pCaption = parsed.caption ?? '';
                    } catch (e) {
                      // fallback
                    }
                  }
                  
                  return (
                    <>
                      <div
                        ref={quoteCardRef}
                        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-glass-border shadow-md bg-secondary/15 select-none my-1"
                        style={{
                          backgroundImage: `url(${post.poetryBg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          containerType: 'inline-size',
                        }}
                      >
                        <div 
                          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                            opacity: pOverlay / 100
                          }}
                        />

                        <div
                          className={cn(
                            "absolute p-3.5 max-w-[85%] pointer-events-none select-none",
                            pAlign === 'left' ? 'text-left' : pAlign === 'right' ? 'text-right' : 'text-center'
                          )}
                          style={{
                            left: `${px}%`,
                            top: `${py}%`,
                            fontSize: `${(pSize * 0.22).toFixed(2)}cqw`,
                            color: pColor === 'black' ? '#000000' : '#ffffff',
                            textShadow: pColor === 'black' 
                              ? '1px 1px 2px rgba(255,255,255,0.7)' 
                              : '1px 1px 3px rgba(0,0,0,0.85), 0 0 5px rgba(0,0,0,0.5)',
                            fontFamily: 
                              pFontFamily === 'serif' ? "'Playfair Display', Georgia, serif" :
                              pFontFamily === 'sans' ? "'Poppins', sans-serif" :
                              pFontFamily === 'display' ? "'Cinzel', serif" :
                              pFontFamily === 'yatra' ? "'Yatra One', cursive" :
                              pFontFamily === 'cursive' ? "'Great Vibes', cursive" :
                              pFontFamily === 'handwritten' ? "'Caveat', cursive" :
                              pFontFamily === 'mono' ? "Courier New, monospace" :
                              "'Playfair Display', Georgia, serif",
                            fontWeight: 
                              pFontFamily === 'serif' ? '600' :
                              pFontFamily === 'sans' ? '500' :
                              pFontFamily === 'display' ? '700' :
                              pFontFamily === 'yatra' ? '400' :
                              pFontFamily === 'cursive' ? '400' :
                              pFontFamily === 'handwritten' ? '600' :
                              'normal'
                          }}
                        >
                          {title && (
                            <h2 
                              className="font-black mb-1.5 leading-snug tracking-wide"
                              style={{ fontSize: `${(Math.max(12, pSize + 1.5) * 0.22).toFixed(2)}cqw` }}
                            >
                              {title}
                            </h2>
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {body}
                          </p>
                          {(post.author?.penName || post.author?.username) && (
                            <p 
                              className="text-right mt-2.5 font-sans font-semibold tracking-wider opacity-80"
                              style={{ fontSize: `${(Math.max(10, pSize - 2.5) * 0.22).toFixed(2)}cqw` }}
                            >
                              — {post.author.penName ? post.author.penName : `@${post.author.username}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {pCaption && (
                        <p className="mt-3 text-sm sm:text-[14px] leading-relaxed text-foreground/80 whitespace-pre-wrap italic pl-2 border-l-2 border-primary/40">
                          {pCaption}
                        </p>
                      )}
                    </>
                  );
                })()
              ) : (
                <>
                  {/* Post Title (parsed from first line) */}
                  {title && (
                    <h2 className="text-base sm:text-[17px] font-bold text-foreground mb-1.5 leading-snug tracking-tight">
                      {title}
                    </h2>
                  )}

                  {/* Post Text Body */}
                  <p className="text-sm sm:text-[14.5px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {body}
                  </p>
                </>
              )}
            </>
          )}

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-primary font-bold hover:underline cursor-pointer
                             bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-full transition-all hover:bg-primary/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Images Grid */}
          {!post.poetryBg && post.images?.length > 0 && (
            <div
              className={cn(
                'mt-3.5 grid gap-1.5 rounded-2xl overflow-hidden border border-glass-border/40 bg-secondary/5 p-1 shadow-sm',
                post.images.length === 1 && 'grid-cols-1',
                post.images.length === 2 && 'grid-cols-2',
                post.images.length >= 3 && 'grid-cols-2',
              )}
            >
              {post.images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    'relative overflow-hidden bg-secondary/25 group/img rounded-xl border border-glass-border/10',
                    post.images.length === 1 ? 'max-h-[440px] md:max-h-[480px] aspect-[16/10] sm:aspect-[16/9]' : 'aspect-video',
                    post.images.length >= 3 && i === 0 ? 'row-span-2 h-full' : '',
                  )}
                >
                  {!imgError[i] ? (
                    <img
                      src={img}
                      alt={`Post image ${i + 1}`}
                      onError={() => setImgError((p) => ({ ...p, [i]: true }))}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img:scale-[1.03] cursor-zoom-in"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground bg-secondary/10">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  )}
                  {post.images.length > 4 && i === 3 && (
                    <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center backdrop-blur-[1.5px] select-none">
                      <span className="text-white font-black text-xl tracking-wide">+{post.images.length - 4}</span>
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Photos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Book Reference Embed Card */}
          {post.bookRef && (
            <div className="mt-3.5 rounded-xl border border-glass-border/60 bg-secondary/15 hover:bg-secondary/25 transition-all duration-200">
              {/* Clickable area → book detail */}
              <Link
                to={`/books/${post.bookRef._id}`}
                className={cn(
                  "flex items-center gap-3 p-3 group/book",
                  user && !isAuthor ? "rounded-t-xl" : "rounded-xl"
                )}
              >
                {/* Cover */}
                {post.bookRef.coverImage ? (
                  <img
                    src={post.bookRef.coverImage}
                    className="w-11 h-16 object-cover rounded-lg border border-glass-border shadow-sm shrink-0 group-hover/book:shadow-md transition-shadow"
                    alt="Book cover"
                  />
                ) : (
                  <div className="w-11 h-16 bg-secondary/30 rounded-lg flex items-center justify-center border border-glass-border shrink-0">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Book Reference
                    <span className="ml-auto text-[9px] text-muted-foreground font-normal normal-case tracking-normal">Tap to view →</span>
                  </p>
                  <p className="font-bold text-[13px] text-foreground truncate group-hover/book:text-primary transition-colors">{post.bookRef.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{post.bookRef.author}</p>
                </div>
              </Link>

              {/* Add to Library strip — shown to all except author; guests see a sign-in prompt */}
              {user && !isAuthor && (
                <div className="border-t border-glass-border/40 px-3 py-2 flex items-center justify-between bg-secondary/10 rounded-b-xl">
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <Library className="w-3 h-3" /> Add to your library
                  </span>

                  {/* Status when added */}
                  {libraryStatus && libraryStatus !== 'adding' ? (
                    <span className={cn(
                      'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full',
                      libraryStatus === 'EXISTS'
                        ? 'bg-secondary/40 text-muted-foreground'
                        : 'bg-success/15 text-success'
                    )}>
                      <Check className="w-3 h-3" />
                      {libraryStatus === 'EXISTS' ? 'In Library' : SHELF_OPTIONS.find(o => o.value === libraryStatus)?.label}
                    </span>
                  ) : libraryStatus === 'adding' ? (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground px-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Adding...
                    </span>
                  ) : (
                    /* Shelf picker dropdown */
                    <div className="relative" ref={shelfPickerRef}>
                      <button
                        onClick={() => isGuest ? dispatch(setShowGuestWarning(true)) : setShowShelfPicker(v => !v)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                        {!isGuest && <ChevronDown className={cn('w-3 h-3 transition-transform', showShelfPicker && 'rotate-180')} />}
                      </button>

                      {showShelfPicker && (
                        <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl border border-glass-border bg-card/95 backdrop-blur-md shadow-xl z-40 overflow-hidden user-menu-dropdown">
                          {SHELF_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => handleAddToLibrary(opt.value)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/50 transition-colors text-left cursor-pointer"
                            >
                              <opt.icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Action bar (Pill style, responsive votes) ── */}
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-2.5 border-t border-glass-border/30 bg-secondary/5 mt-auto">
          {/* Mobile Upvote/Downvote Pill */}
          <div className="flex md:hidden items-center bg-secondary/40 border border-glass-border/50 rounded-full h-8 px-1.5 gap-0.5 shrink-0">
            <button
              onClick={handleLike}
              className={cn(
                'p-1 rounded-full transition-colors duration-150',
                post.isLiked ? 'text-primary bg-primary/10' : 'text-muted-foreground/70'
              )}
              title="Upvote"
            >
              <ArrowUp className={cn('w-4 h-4', post.isLiked && 'fill-current')} />
            </button>
            <span className={cn(
              'text-xs font-extrabold px-1.5 min-w-[20px] text-center transition-colors',
              post.isLiked ? 'text-primary' : 'text-foreground/80'
            )}>
              {post.likesCount}
            </span>
            <button
              onClick={handleDownvote}
              className="p-1 rounded-full text-muted-foreground/70"
              title="Downvote"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Comments Pill */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold shrink-0 transition-all duration-150 border',
              showComments
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-secondary/25 hover:bg-secondary/40 text-muted-foreground hover:text-foreground border-glass-border/40'
            )}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>
              {post.commentsCount > 0 
                ? `${post.commentsCount} ${post.commentsCount === 1 ? 'Comment' : 'Comments'}` 
                : 'Comment'}
            </span>
          </button>

          {/* Share Pill */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold shrink-0
                       bg-secondary/25 hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-glass-border/40
                       transition-all duration-150"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share</span>
          </button>

          {/* Save Pill */}
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold shrink-0 transition-all duration-150 border',
              isSaved
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-secondary/25 hover:bg-secondary/40 text-muted-foreground hover:text-foreground border-glass-border/40'
            )}
          >
            <Bookmark className={cn('w-4 h-4 shrink-0', isSaved && 'fill-current')} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
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
              className="overflow-hidden border-t border-glass-border/30"
            >
              <div className="px-4 sm:px-5 py-3">
                <CommentSection postId={post._id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Share Modal ── */}
      <Modal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Post"
      >
        <div className="space-y-6 py-2">
          {post.poetryBg && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-semibold">
                This quote can be downloaded as a high-resolution image to post directly on Instagram, Snapchat, or save to your device.
              </p>
              
              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg hover:shadow-primary/20 cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-4 h-4 animate-bounce" />
                Download Quote Image
              </button>

              <div className="p-3 bg-[#1e293b]/30 rounded-xl border border-glass-border/30 text-[11px] text-[#94a3b8] leading-relaxed flex gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Instagram & Snapchat:</strong> Download the image and choose it from your gallery when creating a new Story or Post!
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 mb-2">Share Link to Platforms</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.976C16.606 1.892 14.123.867 11.5.867c-5.438 0-9.863 4.421-9.867 9.863 0 1.764.484 3.487 1.402 5.011l-.924 3.376 3.456-.906zm12.32-6.11c-.322-.16-1.897-.937-2.19-.1.042-.294-.12-.423-.33-.637-.21-.213-1.077-.427-1.29-.427-.21 0-.323.107-.482.32-.158.213-.636.8-.78 1-.143.199-.286.213-.608.053-.322-.16-1.36-.5-2.59-1.6-.96-.86-1.61-1.92-1.8-2.247-.19-.32-.018-.492.143-.65.144-.144.32-.374.482-.56.162-.188.216-.32.323-.533.107-.213.054-.4-.027-.56-.08-.16-.78-1.88-1.07-2.593-.284-.68-.573-.586-.78-.597-.2-.01-.427-.01-.639-.01-.214 0-.56.08-.853.4-.294.32-1.12 1.1-1.12 2.678 0 1.579 1.15 3.102 1.31 3.31.162.213 2.26 3.46 5.48 4.85 3.22 1.39 3.22.93 3.8.85.58-.08 1.897-.77 2.164-1.493.272-.73.272-1.35.19-1.49-.082-.14-.293-.21-.613-.37z"/>
                </svg>
                <span className="text-[11px] font-bold">WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleShareTwitter}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-glass-border text-foreground transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[11px] font-bold">Twitter (X)</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 text-blue-400 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
                <span className="text-[11px] font-bold">Facebook</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/35 hover:bg-secondary/70 border border-glass-border text-foreground transition-colors cursor-pointer"
              >
                <Copy className="w-5 h-5 shrink-0 text-muted-foreground" />
                <span className="text-[11px] font-bold">Copy Link</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setShowShareModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary/25 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </article>
  );
}
