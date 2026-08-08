import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  BookOpen, TrendingUp, Star, Flame, Target, Plus, Trash2,
  Loader2, Trophy, X, BookMarked, Zap, FileText,
  Settings, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, Edit2, Sparkles, Quote, BarChart3,
  Award, Crown, Medal, Calendar, Send, Feather
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchAnalytics, fetchGoals, fetchAchievements,
  createGoal, deleteGoal, updateGoal, selectAnalytics,
} from '@/features/analytics/analyticsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkeletonBox } from '@/components/common/Skeletons';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const COLORS = ['#8B4513', '#C0622F', '#D27D2D', '#B58463', '#9C6644', '#7F5539'];

const PALETTES = {
  clay: ['#8B4513', '#C0622F', '#D27D2D', '#B58463', '#9C6644', '#7F5539'],
  forest: ['#5C7A3E', '#76A04B', '#92C463', '#ADD882', '#3D5526', '#263815'],
  ocean: ['#0E7490', '#0891B2', '#06B6D4', '#22D3EE', '#0A5C70', '#034E61'],
  sunset: ['#C0622F', '#E28743', '#EAB308', '#F97316', '#EF4444', '#D97706']
};

const CHART_FILL_COLORS = {
  clay: 'var(--color-primary)',
  forest: '#5C7A3E',
  ocean: '#0891B2',
  sunset: '#C0622F'
};



const INSPIRATIONAL_QUOTES = [
  "“A room without books is like a body without a soul.” — Marcus Tullius Cicero",
  "“Reading is to the mind what exercise is to the body.” — Joseph Addison",
  "“I have always imagined that Paradise will be a kind of library.” — Jorge Luis Borges",
  "“There is no friend as loyal as a book.” — Ernest Hemingway",
  "“Books are a uniquely portable magic.” — Stephen King"
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

const DYNAMIC_ICONS = {
  BookOpen,
  Trophy,
  Crown,
  FileText,
  Flame,
  Zap,
  Award,
  Star,
  Medal,
  BookMarked
};

const emojiToIconMap = {
  '📚': 'BookOpen',
  '🥉': 'Trophy',
  '🥈': 'Trophy',
  '🥇': 'Trophy',
  '👑': 'Crown',
  '📄': 'FileText',
  '🔥': 'Flame',
  '⭐': 'Zap',
  '🏆': 'Trophy'
};

const getAchievementIcon = (ach) => {
  const iconKey = emojiToIconMap[ach.icon] || ach.icon || 'Trophy';
  return DYNAMIC_ICONS[iconKey] || Trophy;
};

const getAchievementColor = (ach) => {
  const badgeColors = {
    first_book: 'text-primary bg-primary/10 border-primary/20',
    '10_books': 'text-[#CD7F32] bg-[#CD7F32]/10 border-[#CD7F32]/20', // Bronze
    '25_books': 'text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/20', // Silver
    '50_books': 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20', // Gold
    '100_books': 'text-[#E5E4E2] bg-[#E5E4E2]/10 border-[#E5E4E2]/20', // Platinum
    '1000_pages': 'text-mint bg-mint/10 border-mint/20',
    streak_7: 'text-destructive bg-destructive/10 border-destructive/20',
    streak_30: 'text-warning bg-warning/10 border-warning/20',
  };
  return badgeColors[ach.badgeId] || 'text-warning bg-warning/10 border-warning/20';
};

/* ── Create Goal Modal ─────────────────────────────────────────── */
function CreateGoalModal({ open, onClose, onSave, isLoading, goal }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    targetType: 'BOOKS',
    targetValue: '',
    startDate: today,
    endDate: '',
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title || '',
        targetType: goal.targetType || 'BOOKS',
        targetValue: goal.targetValue || '',
        startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : today,
        endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setForm({
        title: '',
        targetType: 'BOOKS',
        targetValue: '',
        startDate: today,
        endDate: '',
      });
    }
  }, [goal, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.targetValue || !form.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave({ ...form, targetValue: Number(form.targetValue) });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-md glass-card p-6 space-y-5 my-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Goal Title *</Label>
            <Input
              id="goal-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Read 12 books this year"
              maxLength={100}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Goal Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'BOOKS', label: 'Books', icon: BookOpen, desc: 'Total books' },
                { value: 'PAGES', label: 'Pages', icon: FileText, desc: 'Total pages' },
                { value: 'WORDS', label: 'Words', icon: Feather, desc: 'Words written' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('targetType', t.value)}
                  className={cn(
                    'rounded-xl border p-3.5 text-left transition-all flex items-start gap-2.5 w-full',
                    form.targetType === t.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <t.icon className={cn("h-4 w-4 shrink-0 mt-0.5", form.targetType === t.value ? "text-primary" : "text-muted-foreground")} />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm leading-none">{t.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-none">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div className="space-y-1.5">
            <Label>Target {form.targetType === 'BOOKS' ? 'Books' : 'Pages'} *</Label>
            <Input
              id="goal-target"
              type="number"
              min={1}
              value={form.targetValue}
              onChange={(e) => set('targetValue', e.target.value)}
              placeholder={form.targetType === 'BOOKS' ? 'e.g. 12' : 'e.g. 5000'}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input
                type="date"
                id="goal-start"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Input
                type="date"
                id="goal-end"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading} id="goal-submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {goal ? 'Updating…' : 'Creating…'}
                </>
              ) : (
                goal ? 'Update Goal' : 'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Goal Card ─────────────────────────────────────────────────── */
function GoalCard({ goal, onDelete, onEdit }) {
  const pct = goal.progressPercentage ?? 0;
  const isCompleted = goal.status === 'COMPLETED';
  const isFailed = goal.status === 'FAILED';

  const barColor = isCompleted
    ? 'bg-success'
    : isFailed
    ? 'bg-destructive'
    : 'bg-primary';

  // Days left indicator
  const getDaysLeftInfo = () => {
    const diffTime = new Date(goal.endDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)}d ago`, color: 'text-destructive bg-destructive/10 border-destructive/20' };
    }
    if (diffDays === 0) {
      return { text: 'Ends today', color: 'text-warning bg-warning/10 border-warning/20 font-semibold' };
    }
    if (diffDays === 1) {
      return { text: '1 day left', color: 'text-warning bg-warning/10 border-warning/20' };
    }
    return { text: `${diffDays} days left`, color: 'text-muted-foreground bg-secondary/80 border-border/40' };
  };

  const daysInfo = getDaysLeftInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="glass-card p-5 space-y-4 relative"
    >
      {/* Edit & Delete buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/60 backdrop-blur-sm p-1 rounded-lg border border-border/40 shadow-sm">
        <button
          onClick={() => onEdit(goal)}
          className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-secondary/80 transition-colors"
          title="Edit Goal"
          id={`edit-goal-${goal._id}`}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(goal._id)}
          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-secondary/80 transition-colors"
          title="Delete Goal"
          id={`delete-goal-${goal._id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="pr-16">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
            {goal.targetType === 'BOOKS'
              ? <BookOpen className="h-4.5 w-4.5 text-primary" />
              : <BookMarked className="h-4.5 w-4.5 text-primary" />}
          </div>
          <div>
            <h3 className="font-semibold leading-tight text-base">{goal.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{new Date(goal.startDate || goal.createdAt).toLocaleDateString()}</span>
              <span>→</span>
              <span>{new Date(goal.endDate).toLocaleDateString()}</span>
              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 px-1 font-medium", daysInfo.color)}>
                {daysInfo.text}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold tabular-nums">
            {goal.currentValue} <span className="text-muted-foreground font-normal">/ {goal.targetValue} {goal.targetType?.toLowerCase()}</span>
          </span>
        </div>
        <div className="h-2.5 bg-primary/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full', barColor)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Badge
            className={cn(
              'text-xs font-semibold px-2 py-0.5',
              isCompleted && 'bg-success/20 text-success border-success/30',
              isFailed && 'bg-destructive/20 text-destructive border-destructive/30',
              !isCompleted && !isFailed && 'bg-primary/20 text-primary border-primary/30'
            )}
            variant="outline"
          >
            {goal.status === 'ACTIVE' ? 'Active' : goal.status === 'COMPLETED' ? 'Completed' : 'Failed'}
          </Badge>
          <span className="text-xs font-bold text-primary">{pct}%</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Custom Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-card/95 backdrop-blur p-3 shadow-xl text-sm user-menu-dropdown">
      <p className="font-medium mb-1 text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="tabular-nums font-semibold">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}


/* ── Main Page ──────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const {
    overview,
    genreDistribution,
    booksPerMonth,
    goals,
    achievements,
    currentlyReadingList,
    recentlyCompletedList,
    booksPerYear,
    topRatedBooks,
    isLoading,
    isGoalLoading
  } = useAppSelector(selectAnalytics);

  const [activeTab, setActiveTab] = useState('overview');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [goalFilter, setGoalFilter] = useState('ALL');

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedBookToShare, setSelectedBookToShare] = useState(null);

  const handleShareBook = (book) => {
    setSelectedBookToShare(book);
    setShareModalOpen(true);
  };

  // Random daily quote selected on mount
  const [quoteText] = useState(() => {
    return INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
  });

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchGoals());
    dispatch(fetchAchievements());
  }, [dispatch]);

  const handleSaveGoal = async (data) => {
    if (editingGoal) {
      const result = await dispatch(updateGoal({ id: editingGoal._id, data }));
      if (updateGoal.fulfilled.match(result)) {
        toast.success('Goal updated!');
        setEditingGoal(null);
        setShowGoalModal(false);
        dispatch(fetchAnalytics());
      } else {
        toast.error(result.payload || 'Failed to update goal');
      }
    } else {
      const result = await dispatch(createGoal(data));
      if (createGoal.fulfilled.match(result)) {
        toast.success('Goal created!');
        setShowGoalModal(false);
        dispatch(fetchAnalytics());
      } else {
        toast.error(result.payload || 'Failed to create goal');
      }
    }
  };

  const handleDeleteGoal = async (id) => {
    setDeletingId(id);
    const result = await dispatch(deleteGoal(id));
    setDeletingId(null);
    if (deleteGoal.fulfilled.match(result)) {
      toast.success('Goal removed');
    } else {
      toast.error(result.payload || 'Failed to delete goal');
    }
  };

  const statCards = [
    { id: 'books_read', label: 'Books Read', value: overview.totalBooksRead ?? 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'pages_read', label: 'Pages Read', value: (overview.totalPagesRead ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-mint', bg: 'bg-mint/10' },
    { id: 'avg_rating', label: 'Avg Rating', value: overview.averageRating ? Number(overview.averageRating).toFixed(1) : '—', icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
    { id: 'current_streak', label: 'Current Streak', value: `${overview.currentStreak ?? 0}d`, icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10' },
    { id: 'longest_streak', label: 'Longest Streak', value: `${overview.longestStreak ?? 0}d`, icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
    { id: 'avg_days', label: 'Avg Days / Book', value: overview.avgDaysPerBook ? `${overview.avgDaysPerBook}d` : '—', icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const renderStatCard = (id, delay) => {
    const data = statCards.find(sc => sc.id === id);
    if (!data) return null;

    return (
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -3 }}
        className="w-full"
      >
        <Card className="glass-card h-full">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{data.label}</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{data.value}</p>
              </div>
              <div className={cn('p-2.5 rounded-xl', data.bg)}>
                <data.icon className={cn('h-5 w-5', data.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderMonthlyChart = (chartConfig) => {
    const fill = CHART_FILL_COLORS[chartConfig.color] || 'var(--color-primary)';
    const gradId = `colorGrad-${chartConfig.color}`;

    if (booksPerMonth.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
          <BookOpen className="h-10 w-10 opacity-30" />
          <p className="text-sm">No reading data yet</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={280} minWidth={0}>
        {chartConfig.type === 'line' ? (
          <LineChart data={booksPerMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="books" 
              name="Books" 
              stroke={fill} 
              strokeWidth={3} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        ) : chartConfig.type === 'area' ? (
          <AreaChart data={booksPerMonth}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fill} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={fill} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="books" 
              name="Books" 
              stroke={fill} 
              strokeWidth={2}
              fill={`url(#${gradId})`} 
            />
          </AreaChart>
        ) : (
          <BarChart data={booksPerMonth} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="books" name="Books" fill={fill} radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const renderGenreChart = (chartConfig) => {
    const colors = PALETTES[chartConfig.color] || PALETTES.clay;

    if (genreDistribution.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Star className="h-10 w-10 opacity-30" />
          <p className="text-sm">No genre data yet</p>
        </div>
      );
    }

    if (chartConfig.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <BarChart layout="vertical" data={genreDistribution} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={80} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Books" radius={[0, 6, 6, 0]}>
              {genreDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    const isDonut = chartConfig.type === 'donut';
    return (
      <ResponsiveContainer width="100%" height={280} minWidth={0}>
        <PieChart>
          <Pie
            data={genreDistribution}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={95}
            innerRadius={isDonut ? 50 : 0}
            paddingAngle={isDonut ? 3 : 0}
          >
            {genreDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBox className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-28" />)}
        </div>
        <SkeletonBox className="h-[350px]" />
      </div>
    );
  }


  return (
    <>
      <AnimatePresence>
        {showGoalModal && (
          <CreateGoalModal
            open={showGoalModal}
            onClose={() => {
              setShowGoalModal(false);
              setEditingGoal(null);
            }}
            onSave={handleSaveGoal}
            isLoading={isGoalLoading}
            goal={editingGoal}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <Badge variant="secondary" className="mb-2">Analytics</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">Your Reading Journey</h1>
          <p className="mt-1 text-muted-foreground">Insights and goals to keep you motivated.</p>
        </div>

        {/* Tabs */}
        <div className="flex w-full gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 px-1.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all relative',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0 hidden xs:inline-block" />
              <span>
                {tab.id === 'achievements' ? (
                  <>
                    <span className="hidden xs:inline">Achievements</span>
                    <span className="xs:hidden">Badges</span>
                  </>
                ) : (
                  tab.label
                )}
              </span>
              {tab.id === 'goals' && goals.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                  {goals.length}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="section-heading">Overview</span>
              </div>

              {/* Custom Inspiration Quote Widget */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full"
              >
                <Card className="glass-card border-dashed border-primary/45 relative overflow-hidden bg-primary/5">
                  <CardContent className="py-5 px-6 flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                      <Quote className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">Daily Reading Inspiration</h4>
                      <p className="text-sm italic font-medium text-foreground tracking-wide mt-1">
                        {quoteText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stat Cards */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 col-span-full">
                {['books_read', 'pages_read', 'avg_rating', 'current_streak', 'longest_streak', 'avg_days'].map((id, idx) => 
                  renderStatCard(id, idx * 0.05)
                )}
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <BarChart3 className="h-4.5 w-4.5 text-primary" />
                      Books Read Per Month
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 font-semibold px-2 py-0.5">
                      BAR
                    </Badge>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    {renderMonthlyChart({ color: 'clay', type: 'bar' })}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Sparkles className="h-4.5 w-4.5 text-mint" />
                      Genre Distribution
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 font-semibold px-2 py-0.5">
                      PIE
                    </Badge>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    {renderGenreChart({ color: 'clay', type: 'pie' })}
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Insights: Top Rated & Yearly Journey */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Rated Books */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Star className="h-4.5 w-4.5 text-warning fill-warning" />
                      Top Rated Books
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {!topRatedBooks || topRatedBooks.length === 0 ? (
                      <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Star className="h-8 w-8 opacity-30 text-warning" />
                        <p className="text-sm">No highly rated books yet</p>
                      </div>
                    ) : (
                      topRatedBooks.map((book) => (
                        <div key={book._id} className="flex items-center justify-between p-3 rounded-xl bg-card/40 border border-border/40 hover:border-warning/25 hover:bg-card/60 transition-all group relative">
                          <Link to={`/library/${book._id}`} className="flex gap-4 min-w-0 flex-1">
                            <img
                              src={book.coverImage || '/placeholder-cover.jpg'}
                              alt={book.title}
                              className="w-12 h-16 rounded object-cover bg-muted shrink-0 shadow-sm"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&auto=format&fit=crop&q=60'; }}
                            />
                            <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                              <div>
                                <h4 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors pr-10">{book.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">by {book.author || 'Unknown'}</p>
                              </div>
                              <div className="flex items-center justify-between text-[11px] mt-1">
                                <span className="text-muted-foreground text-[10px] bg-secondary px-2 py-0.5 rounded font-semibold">{book.genre || 'No Genre'}</span>
                                <div className="flex gap-0.5 text-warning">
                                  {Array.from({ length: book.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleShareBook(book);
                            }}
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 ml-2 cursor-pointer"
                            title="Share to Feed"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Yearly Reading Journey */}
                <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Calendar className="h-4.5 w-4.5 text-primary" />
                      Yearly Reading Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    {!booksPerYear || booksPerYear.length === 0 ? (
                      <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2 w-full">
                        <Calendar className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No yearly breakdown available</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 grid-cols-2 w-full">
                        {booksPerYear.map((y) => (
                          <div key={y.year} className="p-4 rounded-xl bg-card/40 border border-border/30 text-center flex flex-col items-center justify-center gap-1">
                            <span className="text-xs text-muted-foreground font-semibold">{y.year}</span>
                            <span className="text-2xl font-bold text-foreground tabular-nums">{y.count}</span>
                            <span className="text-[10px] text-primary uppercase font-bold tracking-wider">books read</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ── GOALS ── */}
          {activeTab === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Reading Goals</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Track your progress towards reading milestones.</p>
                </div>
                <Button onClick={() => setShowGoalModal(true)} id="create-goal-btn" size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Goal
                </Button>
              </div>

              {/* Goal Filter Pills */}
              {goals.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {['ALL', 'ACTIVE', 'COMPLETED', 'FAILED'].map((filter) => {
                    const count = filter === 'ALL' ? goals.length : goals.filter(g => g.status === filter).length;
                    return (
                      <button
                        key={filter}
                        onClick={() => setGoalFilter(filter)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5",
                          goalFilter === filter
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>
                          {filter === 'ALL' && 'All Goals'}
                          {filter === 'ACTIVE' && 'Active'}
                          {filter === 'COMPLETED' && 'Completed'}
                          {filter === 'FAILED' && 'Failed'}
                        </span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                          goalFilter === filter ? "bg-primary/20" : "bg-muted"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {goals.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="p-4 rounded-full bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">No goals yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Set your first reading goal to stay motivated!</p>
                  </div>
                  <Button onClick={() => setShowGoalModal(true)} id="create-first-goal">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create First Goal
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {goals
                      .filter((goal) => goalFilter === 'ALL' ? true : goal.status === goalFilter)
                      .map((goal) => (
                        <GoalCard
                          key={goal._id}
                          goal={goal}
                          onDelete={handleDeleteGoal}
                          onEdit={(g) => {
                            setEditingGoal(g);
                            setShowGoalModal(true);
                          }}
                        />
                      ))}
                  </div>
                  {goals.filter((goal) => goalFilter === 'ALL' ? true : goal.status === goalFilter).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground"
                    >
                      <Target className="h-8 w-8 opacity-40" />
                      <p className="text-sm">No goals matching "{goalFilter.toLowerCase()}" status.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ── ACHIEVEMENTS ── */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Your Trophies</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Milestones you've unlocked on your reading journey.</p>
              </div>

              {achievements.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="p-4 rounded-full bg-warning/10">
                    <Trophy className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">No achievements yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Keep reading to unlock achievements!</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {achievements.map((ach, i) => (
                    <motion.div
                      key={ach._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.04, y: -4 }}
                      className="glass-card flex flex-col items-center justify-center p-6 text-center space-y-3 cursor-default"
                    >
                      {(() => {
                        const IconComponent = getAchievementIcon(ach);
                        const colorClass = getAchievementColor(ach);
                        return (
                          <div className={cn("p-4 rounded-full border shadow-inner flex items-center justify-center transition-transform group-hover:scale-110 duration-200", colorClass)}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                        );
                      })()}
                      <div>
                        <h3 className="font-semibold">{ach.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                        {new Date(ach.earnedAt).toLocaleDateString()}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CreatePostModal 
        isOpen={shareModalOpen} 
        onClose={() => {
          setShareModalOpen(false);
          setSelectedBookToShare(null);
        }} 
        initialBook={selectedBookToShare} 
      />
    </>
  );
}
