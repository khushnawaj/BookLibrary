import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Plus, RefreshCw, Sparkles, Users, Globe, Brain, Feather, BookOpen, Star, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchFeed,
  selectAllPosts,
  selectFeedStatus,
  resetFeed,
} from '@/features/feed/feedSlice';
import { PostCard } from '@/components/social/PostCard';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { FeedSkeleton } from '@/components/social/FeedSkeleton';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/features/auth/authHooks';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

export default function FeedPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const posts = useSelector(selectAllPosts);
  const status = useSelector(selectFeedStatus);
  const { hasNextPage, nextCursor, isFetchingMore } = useSelector((state) => state.feed);

  const [feedType, setFeedType] = useState('global');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFeed({ limit: 10, type: feedType }));
    }
  }, [status, feedType, dispatch]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingMore && status === 'succeeded') {
      dispatch(fetchFeed({ cursor: nextCursor, limit: 10, type: feedType }));
    }
  }, [inView, hasNextPage, isFetchingMore, nextCursor, status, feedType, dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(resetFeed());
    await dispatch(fetchFeed({ limit: 10, type: feedType }));
    setIsRefreshing(false);
  }, [dispatch, feedType]);

  const handleFeedTypeChange = (newType) => {
    if (newType === feedType) return;
    setFeedType(newType);
    dispatch(resetFeed());
  };

  const isInitialLoad = status === 'loading' && posts.length === 0;

  return (
    /* Two-column layout on large screens: main feed + sidebar */
    <div className="mx-auto w-full max-w-5xl px-2 sm:px-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── Left column: feed ── */}
        <div className="min-w-0 space-y-4">

          {/* Sticky page header with Reddit-like Tabs */}
          <div className="sticky top-0 z-20 -mx-2 sm:-mx-4 px-2 sm:px-4 py-3.5
                          bg-background/80 glass border-b border-glass-border space-y-3">
            <div className="flex items-center justify-between">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <Users className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5 font-display">
                    Community Feed
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </h1>
                  <p className="text-[11px] text-muted-foreground hidden sm:block leading-none mt-0.5">
                    {feedType === 'global' ? 'Discover posts from all readers' : 'Showing posts from users you follow'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  title="Refresh feed"
                >
                  <RefreshCw className={cn('w-4 h-4 shrink-0', isRefreshing && 'animate-spin')} />
                </Button>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 px-3.5 gap-1.5 rounded-xl shadow-sm text-xs sm:text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline">New Post</span>
                  <span className="inline xs:hidden">Post</span>
                </Button>
              </div>
            </div>

            {/* Reddit-style tabs filter bar */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-glass-border/30">
              <button
                onClick={() => handleFeedTypeChange('global')}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 border flex items-center gap-1.5 cursor-pointer',
                  feedType === 'global'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-secondary/20 hover:bg-secondary/40 text-muted-foreground border-glass-border/50'
                )}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" /> Global Feed
              </button>
              {user && (
                <button
                  onClick={() => handleFeedTypeChange('following')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 border flex items-center gap-1.5 cursor-pointer',
                    feedType === 'following'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-secondary/20 hover:bg-secondary/40 text-muted-foreground border-glass-border/50'
                  )}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" /> Following
                </button>
              )}
            </div>
          </div>

          {/* Compose box */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={() => setIsModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)}
              className="group bg-card/70 glass-card border border-glass-border rounded-2xl p-3.5 sm:p-4
                         flex items-center gap-3 cursor-pointer
                         hover:border-primary/30 hover:shadow-md
                         transition-all duration-200 select-none"
            >
              <Avatar
                src={user.avatar}
                name={user.name}
                size="md"
                className="shrink-0 ring-2 ring-secondary/50"
              />
              <div className="flex-1 min-w-0
                              bg-secondary/45 group-hover:bg-secondary/60
                              text-muted-foreground/60 text-xs sm:text-sm
                              rounded-xl px-3.5 sm:px-4 py-2.5
                              transition-colors duration-150 truncate">
                Share a thought, poem, feeling, or book...
              </div>

              {/* Quick-action pills visible on hover */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {[
                  { label: 'Thought', icon: Brain },
                  { label: 'Poem', icon: Feather },
                  { label: 'Book', icon: BookOpen }
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full
                               bg-secondary/50 text-primary border border-glass-border
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <item.icon className="w-3 h-3 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feed list */}
          <AnimatePresence mode="wait">
            {isInitialLoad ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FeedSkeleton />
              </motion.div>

            ) : posts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center
                           py-16 px-6 rounded-2xl
                           border border-dashed border-glass-border
                           bg-secondary/10"
              >
                <div className="h-16 w-16 rounded-2xl bg-secondary/30
                                flex items-center justify-center mb-4 shadow-sm border border-glass-border">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <p className="font-bold text-foreground text-base mb-1.5">No posts yet</p>
                <p className="text-xs text-muted-foreground mb-6 max-w-[260px] leading-relaxed">
                  {feedType === 'global' 
                    ? 'Be the first to share a review, recommendation, or reading milestone!'
                    : 'No posts from users you follow. Explore the Global feed to discover readers!'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => feedType === 'global' ? setIsModalOpen(true) : setFeedType('global')}
                  className="rounded-xl gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  {feedType === 'global' ? 'Create your first post' : 'Go to Global Feed'}
                </Button>
              </motion.div>

            ) : (
              <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
                {posts.map((post, idx) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.25), ease: 'easeOut' }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={ref} className="py-8 flex justify-center">
                    {isFetchingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more posts…
                      </div>
                    )}
                  </div>
                )}

                {!hasNextPage && posts.length > 0 && (
                  <div className="py-10 text-center flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-10 bg-glass-border" />
                      <span className="text-[11px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
                        All caught up
                      </span>
                      <div className="h-px w-10 bg-glass-border" />
                    </div>
                    <p className="text-[11px] text-muted-foreground/50">You've read {posts.length} posts</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column: sidebar (desktop only) ── */}
        <aside className="hidden lg:block space-y-4 self-start sticky top-[73px]">

          {/* Discover options */}
          <div className="rounded-2xl border border-glass-border bg-card/70 glass-card p-4 space-y-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-display">Discover</p>
            <div className="flex flex-col gap-2.5">
              {[
                { tip: 'Join readers', icon: Users },
                { tip: 'Share reviews', icon: Star },
                { tip: 'Set goals', icon: Target }
              ].map((item) => (
                <div key={item.tip} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-secondary/40 to-secondary/20
                                  flex items-center justify-center shrink-0 border border-glass-border text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-foreground font-medium">{item.tip}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-1 rounded-xl gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              Create a post
            </Button>
          </div>

          {/* Tips card */}
          <div className="rounded-2xl border border-glass-border bg-primary p-4 text-primary-foreground shadow-md">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60 mb-2">Tip</p>
            <p className="text-sm font-semibold leading-snug mb-1 font-display">
              Share what you're reading right now
            </p>
            <p className="text-[11px] text-primary-foreground/75 leading-relaxed">
              Posts with book references get 3× more engagement!
            </p>
          </div>
        </aside>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
