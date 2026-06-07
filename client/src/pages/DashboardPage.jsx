import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BookMarked,
  Heart,
  Library,
  TrendingUp,
  Plus,
  ArrowRight,
  Flame,
  Star,
  Target,
  Users,
  Upload,
  BarChart3,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectRecentBooks,
  selectRecentActivity,
  selectDashboardLoading,
} from '@/features/dashboard/dashboardSlice';
import { fetchAnalytics, fetchGoals, selectAnalytics } from '@/features/analytics/analyticsSlice';
import { useAuth } from '@/features/auth/authHooks';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCardSkeleton } from '@/components/common/Skeletons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

const SHELF_COLORS = {
  READ:     'bg-[#5C7A3E]/10 text-[#5C7A3E]',
  READING:  'bg-[#8B4513]/10 text-[#8B4513]',
  WISHLIST: 'bg-[#D4931A]/10 text-[#D4931A]',
  DROPPED:  'bg-[#C0392B]/10 text-[#C0392B]',
};
const SHELF_LABELS = { READ: 'Read', READING: 'Reading', WISHLIST: 'Wishlist', DROPPED: 'Dropped' };

/* ─── sub-components ────────────────────────────────────────────────────────── */
function SectionCard({ children, className }) {
  return (
    <div className={cn('rounded-xl border border-[#DDD4C4] bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#3D3530] uppercase tracking-wide">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#8B4513]" />}
        {title}
      </h3>
      {action}
    </div>
  );
}

function StatPill({ label, value, max = 100, color = '#8B4513' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-[#8A7F74]">{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#EDE6D8] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function BigStat({ value, label }) {
  return (
    <div className="text-center px-4">
      <p className="text-3xl font-bold text-[#1C1A17]">{value ?? 0}</p>
      <p className="text-[11px] text-[#8A7F74] mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, color = '#8B4513' }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F5F0E8] transition-colors group"
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="text-[11px] font-medium text-[#3D3530]">{label}</span>
    </Link>
  );
}

function RecentBookRow({ book }) {
  const shelfType = book.shelfType || book.status;
  return (
    <Link
      to={`/library/${book._id}`}
      className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F5F0E8] transition-colors group"
    >
      <div className="h-10 w-7 shrink-0 overflow-hidden rounded shadow-sm bg-[#EDE6D8]">
        {book.coverImage || book?.book?.coverImage ? (
          <img
            src={book.coverImage || book?.book?.coverImage}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-3 w-3 text-[#8A7F74]" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#1C1A17]">
          {book.title ?? book?.book?.title}
        </p>
        <p className="truncate text-[11px] text-[#8A7F74]">
          {book.author ?? book?.book?.author}
        </p>
      </div>
      {shelfType && (
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', SHELF_COLORS[shelfType])}>
          {SHELF_LABELS[shelfType] || shelfType}
        </span>
      )}
    </Link>
  );
}

/* ─── main page ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const stats = useAppSelector(selectDashboardStats);
  const recentBooks = useAppSelector(selectRecentBooks);
  const isLoading = useAppSelector(selectDashboardLoading);
  const { overview, goals } = useAppSelector(selectAnalytics);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAnalytics());
    dispatch(fetchGoals());
  }, [dispatch]);

  const firstName = user?.name?.split(' ')[0] || 'Reader';
  const total = stats.totalBooks || 1; // avoid divide-by-zero

  return (
    <div className="space-y-5 pb-4">

      {/* ── Welcome ── */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#8A7F74]">Good to see you,</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1A17] leading-tight">
            Welcome in, <span className="text-[#8B4513]">{firstName}</span>
          </h1>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link to={ROUTES.LIBRARY_ADD}>
            <Plus className="h-4 w-4 shrink-0" />
            New Book
          </Link>
        </Button>
      </motion.div>

      {/* ── Top Progress Bars + Big Stats ── */}
      <motion.div {...fade(0.05)}>
        <SectionCard className="px-5 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <StatPill label="Read" value={stats.readBooks} max={total} color="#5C7A3E" />
            <StatPill label="Reading" value={stats.readingBooks} max={total} color="#8B4513" />
            <StatPill label="Wishlist" value={stats.wishlistCount} max={total} color="#D4931A" />
            <div className="hidden sm:flex items-center gap-0 ml-auto border-l border-[#EDE6D8] pl-6">
              <BigStat value={stats.totalBooks} label="Total Books" />
              <BigStat value={stats.readBooks} label="Finished" />
              <BigStat value={overview?.currentStreak ?? 0} label="Day Streak" />
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* ── Left: Profile card ── */}
        <motion.div {...fade(0.08)} className="lg:col-span-1">
          <SectionCard className="overflow-hidden">
            <div className="bg-gradient-to-br from-[#8B4513] to-[#5C3010] px-5 py-6 text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold shadow-inner">
                  {firstName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-base leading-tight">{user?.name}</p>
                  <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
                    {user?.role || 'Book Lover'}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#8A7F74]">Reputation</span>
                <span className="font-semibold text-[#1C1A17]">{overview?.totalBooksRead ?? 0} books read</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#8A7F74]">Avg Rating</span>
                <span className="flex items-center gap-1 font-semibold text-[#1C1A17]">
                  <Star className="h-3.5 w-3.5 text-[#D4931A] fill-[#D4931A]" />
                  {overview?.averageRating?.toFixed(1) ?? '—'}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#8A7F74]">Streak</span>
                <span className="flex items-center gap-1 font-semibold text-[#1C1A17]">
                  <Flame className="h-3.5 w-3.5 text-[#D4931A]" />
                  {overview?.currentStreak ?? 0} days
                </span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full mt-2">
                <Link to={ROUTES.PROFILE}>
                  View Profile
                </Link>
              </Button>
            </div>
          </SectionCard>
        </motion.div>

        {/* ── Center: Recent Books ── */}
        <motion.div {...fade(0.11)} className="lg:col-span-2">
          <SectionCard className="overflow-hidden">
            <CardHeader
              title="Recent Books"
              icon={BookMarked}
              action={
                <Button asChild variant="link" size="sm" className="text-xs gap-1 font-semibold text-[#8B4513]">
                  <Link to={ROUTES.LIBRARY}>
                    See all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="divide-y divide-[#F0EBE3]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="h-10 w-7 rounded bg-[#EDE6D8]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-[#EDE6D8]" />
                      <div className="h-2.5 w-1/2 rounded bg-[#EDE6D8]" />
                    </div>
                  </div>
                ))
              ) : recentBooks?.length > 0 ? (
                recentBooks.slice(0, 6).map((book) => (
                  <RecentBookRow key={book._id} book={book} />
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-[#8A7F74]">No books yet.</p>
                  <Link to={ROUTES.LIBRARY_ADD} className="mt-2 inline-block text-sm font-medium text-[#8B4513] hover:underline">
                    Add your first book →
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {/* Quick Actions */}
        <motion.div {...fade(0.14)}>
          <SectionCard>
            <CardHeader title="Quick Actions" icon={TrendingUp} />
            <div className="grid grid-cols-4 gap-1 px-3 pb-4">
              <QuickAction to={ROUTES.LIBRARY_ADD}    icon={Plus}     label="Add Book"   color="#8B4513" />
              <QuickAction to={ROUTES.FEED}           icon={Users}    label="Feed"       color="#5C7A3E" />
              <QuickAction to={ROUTES.LIBRARY_IMPORT} icon={Upload}   label="Import"     color="#D4931A" />
              <QuickAction to={ROUTES.LIBRARY}        icon={Library}  label="Library"    color="#C0622F" />
            </div>
          </SectionCard>
        </motion.div>

        {/* Reading Goals */}
        <motion.div {...fade(0.17)}>
          <SectionCard>
            <CardHeader
              title="Reading Goals"
              icon={Target}
              action={
                <Button asChild variant="link" size="sm" className="text-xs gap-1 font-semibold text-[#8B4513]">
                  <Link to={ROUTES.ANALYTICS}>
                    Manage <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="px-5 pb-5 space-y-4">
              {goals?.length > 0 ? (
                goals.slice(0, 2).map((goal) => (
                  <div key={goal._id} className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium text-[#1C1A17] truncate max-w-[160px]">{goal.title}</span>
                      <span className="text-[#8A7F74] shrink-0 ml-2">{goal.currentValue}/{goal.targetValue}</span>
                    </div>
                    <div className="h-2 bg-[#EDE6D8] rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700',
                          goal.status === 'COMPLETED' ? 'bg-[#5C7A3E]' : 'bg-[#8B4513]'
                        )}
                        style={{ width: `${goal.progressPercentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <Target className="h-8 w-8 text-[#DDD4C4] mx-auto mb-2" />
                  <p className="text-xs text-[#8A7F74]">No active goals</p>
                  <Link to={ROUTES.ANALYTICS} className="mt-2 inline-block text-xs font-medium text-[#8B4513] hover:underline">
                    Set a goal →
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>

        {/* Analytics Snapshot */}
        <motion.div {...fade(0.20)}>
          <SectionCard>
            <CardHeader
              title="Analytics"
              icon={BarChart3}
              action={
                <Button asChild variant="link" size="sm" className="text-xs gap-1 font-semibold text-[#8B4513]">
                  <Link to={ROUTES.ANALYTICS}>
                    Full view <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="px-5 pb-5 grid grid-cols-2 gap-3">
              {[
                { label: 'This Year',  value: overview?.booksThisYear ?? 0,  unit: 'books' },
                { label: 'This Month', value: overview?.booksThisMonth ?? 0, unit: 'books' },
                { label: 'Pages Read', value: overview?.totalPagesRead ?? 0, unit: 'pages' },
                { label: 'Fav Genre',  value: overview?.favoriteGenre ?? '—', unit: '' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="rounded-xl bg-[#F5F0E8] p-3">
                  <p className="text-[10px] font-medium text-[#8A7F74] uppercase tracking-wide">{label}</p>
                  <p className="text-lg font-bold text-[#1C1A17] mt-0.5 truncate">{value}</p>
                  {unit && <p className="text-[10px] text-[#8A7F74]">{unit}</p>}
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </div>
    </div>
  );
}
