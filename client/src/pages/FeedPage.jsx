import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Plus, RefreshCw, Sparkles, Users } from 'lucide-react';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFeed({ limit: 10, type: 'global' }));
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingMore && status === 'succeeded') {
      dispatch(fetchFeed({ cursor: nextCursor, limit: 10, type: 'global' }));
    }
  }, [inView, hasNextPage, isFetchingMore, nextCursor, status, dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(resetFeed());
    await dispatch(fetchFeed({ limit: 10, type: 'global' }));
    setIsRefreshing(false);
  }, [dispatch]);

  const isInitialLoad = status === 'loading' && posts.length === 0;

  return (
    /* Two-column layout on large screens: main feed + sidebar */
    <div className="mx-auto w-full max-w-5xl px-2 sm:px-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── Left column: feed ── */}
        <div className="min-w-0 space-y-4">

          {/* Sticky page header */}
          <div className="sticky top-0 z-20 -mx-2 sm:-mx-4 px-2 sm:px-4 py-3.5
                          bg-[#F5F0E8]/90 backdrop-blur-xl
                          border-b border-[#DDD4C4]/50">
            <div className="flex items-center justify-between">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#C0622F] to-[#8B4513]
                                flex items-center justify-center shadow-sm">
                  <Users className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C1A17] flex items-center gap-1.5">
                    Community Feed
                    <Sparkles className="h-3.5 w-3.5 text-[#C0622F]" />
                  </h1>
                  <p className="text-[11px] text-[#8A7F74] hidden sm:block leading-none mt-0.5">
                    Discover posts from all readers
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
                  className="h-9 w-9 rounded-xl text-[#8A7F74] hover:text-[#1C1A17] hover:bg-[#EDE6D8]"
                  title="Refresh feed"
                >
                  <RefreshCw className={cn('w-4 h-4 shrink-0', isRefreshing && 'animate-spin')} />
                </Button>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 px-3.5 gap-1.5 rounded-xl shadow-sm text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline">New Post</span>
                  <span className="inline xs:hidden">Post</span>
                </Button>
              </div>
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
              className="group bg-white border border-[#DDD4C4] rounded-2xl p-3.5 sm:p-4
                         flex items-center gap-3 cursor-pointer
                         hover:border-[#8B4513]/25 hover:shadow-md
                         transition-all duration-200 select-none"
            >
              <Avatar
                src={user.avatar}
                name={user.name}
                size="md"
                className="shrink-0 ring-2 ring-[#F5F0E8]"
              />
              <div className="flex-1 min-w-0
                              bg-[#F5F0E8] group-hover:bg-[#EDE6D8]/70
                              text-[#B5A898] text-xs sm:text-sm
                              rounded-xl px-3.5 sm:px-4 py-2.5
                              transition-colors duration-150 truncate">
                Share a recommendation, review, or reading milestone...
              </div>

              {/* Hidden quick-action pills, visible on hover on md+ */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {['📖 Book', '⭐ Review'].map((label) => (
                  <span
                    key={label}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full
                               bg-[#F5F0E8] text-[#8B4513] border border-[#DDD4C4]
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {label}
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
                           border border-dashed border-[#DDD4C4]
                           bg-[#EDE6D8]/20"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EDE6D8] to-[#F5F0E8]
                                flex items-center justify-center text-3xl mb-4 shadow-sm">
                  📚
                </div>
                <p className="font-bold text-[#1C1A17] text-base mb-1.5">No posts yet</p>
                <p className="text-xs text-[#8A7F74] mb-6 max-w-[260px] leading-relaxed">
                  Be the first to share a review, recommendation, or reading milestone!
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-xl gap-2"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  Create your first post
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
                      <div className="flex items-center gap-2 text-[#8A7F74] text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more posts…
                      </div>
                    )}
                  </div>
                )}

                {!hasNextPage && posts.length > 0 && (
                  <div className="py-10 text-center flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-10 bg-[#DDD4C4]" />
                      <span className="text-[11px] font-semibold text-[#B5A898] tracking-wider uppercase">
                        All caught up
                      </span>
                      <div className="h-px w-10 bg-[#DDD4C4]" />
                    </div>
                    <p className="text-[11px] text-[#B5A898]">You've read {posts.length} posts</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column: sidebar (desktop only) ── */}
        <aside className="hidden lg:block space-y-4 self-start sticky top-[73px]">

          {/* Who to follow teaser */}
          <div className="rounded-2xl border border-[#DDD4C4] bg-white p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F74]">Discover</p>
            <div className="flex flex-col gap-2.5">
              {['Join readers', 'Share reviews', 'Set goals'].map((tip, i) => (
                <div key={tip} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#EDE6D8] to-[#F5F0E8]
                                  flex items-center justify-center text-sm shrink-0">
                    {['👥', '⭐', '🎯'][i]}
                  </div>
                  <span className="text-xs text-[#3D3530] font-medium">{tip}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-1 rounded-xl gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              Create a post
            </Button>
          </div>

          {/* Tips card */}
          <div className="rounded-2xl border border-[#DDD4C4] bg-gradient-to-br from-[#8B4513] to-[#C0622F] p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Tip</p>
            <p className="text-sm font-semibold leading-snug mb-1">
              Share what you're reading right now
            </p>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Posts with book references get 3× more engagement!
            </p>
          </div>
        </aside>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
