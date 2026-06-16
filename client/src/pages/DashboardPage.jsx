import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Flame,
  Heart,
  Library,
  Plus,
  Star,
  Target,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectRecentBooks,
  selectDashboardLoading,
} from '@/features/dashboard/dashboardSlice';
import { fetchAnalytics, fetchGoals, selectAnalytics } from '@/features/analytics/analyticsSlice';
import { useAuth } from '@/features/auth/authHooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay },
});

const SHELF_COLORS = {
  READ: 'bg-success/15 text-success border-success/20',
  READING: 'bg-primary/15 text-primary border-primary/20',
  WISHLIST: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  DROPPED: 'bg-destructive/15 text-destructive border-destructive/20',
};

const SHELF_LABELS = {
  READ: 'Read',
  READING: 'Reading',
  WISHLIST: 'Wishlist',
  DROPPED: 'Dropped',
};

const metricPalette = {
  total: { iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  reading: { iconBg: 'bg-primary/15', iconColor: 'text-primary' },
  finished: { iconBg: 'bg-success/15', iconColor: 'text-success' },
  wishlist: { iconBg: 'bg-amber-500/15', iconColor: 'text-amber-500' },
};

const formatNumber = (value) => new Intl.NumberFormat().format(value ?? 0);

const clampPercent = (value) => Math.min(100, Math.max(0, Math.round(value || 0)));

function SectionCard({ children, className }) {
  return (
    <section className={cn('glass-card border border-glass-border', className)}>
      {children}
    </section>
  );
}

function SectionHeader({ title, icon: Icon, action }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border/40 px-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      {action}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone = 'total' }) {
  const colors = metricPalette[tone] || metricPalette.total;

  return (
    <motion.div {...fade(0.04)} className="glass-card border border-glass-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-foreground">{formatNumber(value)}</p>
          <p className="mt-2.5 truncate text-xs text-muted-foreground/80">{detail}</p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', colors.iconBg)}>
          <Icon className={cn('h-5 w-5', colors.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

function ProgressTrack({ label, value, max, color }) {
  const percent = max > 0 ? clampPercent((value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {formatNumber(value)} / {formatNumber(max)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, color }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function BookCover({ book, className }) {
  const coverImage = book.coverImage || book?.book?.coverImage;
  const title = book.title || book?.book?.title || 'Book cover';

  return (
    <div className={cn('shrink-0 overflow-hidden rounded-lg bg-secondary shadow-sm', className)}>
      {coverImage ? (
        <img src={coverImage} alt={title} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function RecentBookRow({ book }) {
  const shelfType = book.shelfType || book.status;
  const title = book.title || book?.book?.title || 'Untitled book';
  const author = book.author || book?.book?.author || 'Unknown author';

  return (
    <Link
      to={`/library/${book._id}`}
      className="flex min-h-16 items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/40"
    >
      <BookCover book={book} className="h-12 w-8" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{author}</p>
      </div>
      {shelfType && (
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', SHELF_COLORS[shelfType])}>
          {SHELF_LABELS[shelfType] || shelfType}
        </span>
      )}
    </Link>
  );
}

function GoalRow({ goal }) {
  const percent = clampPercent(goal.progressPercentage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-foreground">{goal.title}</span>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {goal.currentValue}/{goal.targetValue}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            goal.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatLine({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
      </span>
      <span className="max-w-[55%] truncate font-semibold text-foreground">{value}</span>
    </div>
  );
}

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
  const totalBooks = stats.totalBooks || 0;
  const progressTotal = Math.max(
    totalBooks,
    stats.readBooks || 0,
    stats.readingBooks || 0,
    stats.wishlistCount || 0,
    1
  );
  const currentBook =
    recentBooks?.find((book) => (book.shelfType || book.status) === 'READING') || recentBooks?.[0];

  return (
    <div className="space-y-6 pb-8">
      <motion.div {...fade(0)} className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Good to see you, {firstName}</p>
          <h1 className="mt-1.5 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            Your reading dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild variant="outline">
            <Link to={ROUTES.LIBRARY_IMPORT}>
              <Upload className="h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.LIBRARY_ADD}>
              <Plus className="h-4 w-4" />
              New Book
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Library" value={stats.totalBooks} detail="Books in collection" icon={Library} tone="total" />
        <MetricCard label="Reading" value={stats.readingBooks} detail="Currently active" icon={BookOpen} tone="reading" />
        <MetricCard label="Finished" value={stats.readBooks} detail={`${formatNumber(overview?.totalPagesRead)} pages read`} icon={BookMarked} tone="finished" />
        <MetricCard label="Wishlist" value={stats.wishlistCount} detail="Saved for later" icon={Heart} tone="wishlist" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div {...fade(0.08)} className="xl:col-span-2">
          <SectionCard>
            <SectionHeader title="Reading Progress" icon={TrendingUp} />
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <ProgressTrack label="Finished" value={stats.readBooks || 0} max={progressTotal} color="var(--color-success)" />
                <ProgressTrack label="Currently Reading" value={stats.readingBooks || 0} max={progressTotal} color="var(--color-primary)" />
                <ProgressTrack label="Wishlist" value={stats.wishlistCount || 0} max={progressTotal} color="var(--color-primary)" />
              </div>
              <div className="space-y-3 border-t border-border/40 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <StatLine label="Day streak" value={`${overview?.currentStreak ?? 0} days`} icon={Flame} />
                <StatLine label="Average rating" value={overview?.averageRating ? overview.averageRating.toFixed(1) : 'Not rated'} icon={Star} />
                <StatLine label="Favorite genre" value={overview?.favoriteGenre || 'No genre yet'} icon={BarChart3} />
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <SectionCard>
            <SectionHeader title="Next Up" icon={BookOpen} />
            <div className="p-5">
              {currentBook ? (
                <Link to={`/library/${currentBook._id}`} className="flex gap-4 rounded-xl transition-colors hover:bg-secondary/40">
                  <BookCover book={currentBook} className="h-28 w-20" />
                  <div className="min-w-0 py-1">
                    <p className="line-clamp-2 text-base font-bold text-foreground">
                      {currentBook.title || currentBook?.book?.title || 'Untitled book'}
                    </p>
                    <p className="mt-1.5 truncate text-sm text-muted-foreground">
                      {currentBook.author || currentBook?.book?.author || 'Unknown author'}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                      Open book <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="py-4 text-center">
                  <BookOpen className="mx-auto mb-2.5 h-9 w-9 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">No books yet</p>
                  <Link to={ROUTES.LIBRARY_ADD} className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">
                    Add your first book
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div {...fade(0.12)} className="lg:col-span-2">
          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Recent Books"
              icon={BookMarked}
              action={
                <Button asChild variant="link" size="sm" className="gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  <Link to={ROUTES.LIBRARY}>
                    See all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-12 w-8 animate-pulse rounded-md bg-secondary/60" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-secondary/60" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-secondary/60" />
                    </div>
                  </div>
                ))
              ) : recentBooks?.length > 0 ? (
                recentBooks.slice(0, 6).map((book) => <RecentBookRow key={book._id} book={book} />)
              ) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No books yet.</p>
                  <Link to={ROUTES.LIBRARY_ADD} className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">
                    Add your first book
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>

        <motion.div {...fade(0.14)} className="space-y-6">
          <SectionCard>
            <SectionHeader title="Quick Actions" icon={TrendingUp} />
            <div className="grid gap-1.5 p-3">
              <QuickAction to={ROUTES.LIBRARY_ADD} icon={Plus} label="Add Book" color="var(--color-primary)" />
              <QuickAction to={ROUTES.FEED} icon={Users} label="Open Feed" color="var(--color-success)" />
              <QuickAction to={ROUTES.LIBRARY_IMPORT} icon={Upload} label="Import Books" color="var(--color-primary)" />
              <QuickAction to={ROUTES.LIBRARY} icon={Library} label="View Library" color="var(--color-primary)" />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              title="Reading Goals"
              icon={Target}
              action={
                <Button asChild variant="link" size="sm" className="gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  <Link to={ROUTES.ANALYTICS}>
                    Manage <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="space-y-4 p-5">
              {goals?.length > 0 ? (
                goals.slice(0, 3).map((goal) => <GoalRow key={goal._id} goal={goal} />)
              ) : (
                <div className="py-4 text-center">
                  <Target className="mx-auto mb-2.5 h-9 w-9 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No active goals</p>
                  <Link to={ROUTES.ANALYTICS} className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">
                    Set a goal
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>
      </div>
    </div>
  );
}
