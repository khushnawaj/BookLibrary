import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  BookOpen, TrendingUp, Star, Flame, Target, Plus, Trash2,
  Loader2, Trophy, X, BookMarked, Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchAnalytics, fetchGoals, fetchAchievements,
  createGoal, deleteGoal, selectAnalytics,
} from '@/features/analytics/analyticsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkeletonBox } from '@/components/common/Skeletons';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const COLORS = ['#14b8a6', '#0f766e', '#2dd4bf', '#5eead4', '#99f6e4', '#115e59'];

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

/* ── Create Goal Modal ─────────────────────────────────────────── */
function CreateGoalModal({ open, onClose, onSave, isLoading }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    targetType: 'BOOKS',
    targetValue: '',
    startDate: today,
    endDate: '',
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-md glass-card p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Create New Goal</h2>
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
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'BOOKS', label: '📚 Books', desc: 'Number of books' },
                { value: 'PAGES', label: '📄 Pages', desc: 'Number of pages' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('targetType', t.value)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    form.targetType === t.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
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
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Goal'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Goal Card ─────────────────────────────────────────────────── */
function GoalCard({ goal, onDelete }) {
  const pct = goal.progressPercentage ?? 0;
  const isCompleted = goal.status === 'COMPLETED';
  const isFailed = goal.status === 'FAILED';

  const barColor = isCompleted
    ? 'bg-emerald-500'
    : isFailed
    ? 'bg-destructive'
    : 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="glass-card p-5 space-y-4 relative group"
    >
      {/* Delete button */}
      <button
        onClick={() => onDelete(goal._id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        id={`delete-goal-${goal._id}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="pr-6">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10">
            {goal.targetType === 'BOOKS'
              ? <BookOpen className="h-4 w-4 text-primary" />
              : <BookMarked className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{goal.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(goal.startDate || goal.createdAt).toLocaleDateString()} → {new Date(goal.endDate).toLocaleDateString()}
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
              'text-xs',
              isCompleted && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              isFailed && 'bg-destructive/20 text-destructive border-destructive/30',
              !isCompleted && !isFailed && 'bg-primary/20 text-primary border-primary/30'
            )}
            variant="outline"
          >
            {goal.status}
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
    <div className="rounded-xl border border-primary/20 bg-card/95 backdrop-blur p-3 shadow-xl text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="tabular-nums">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { overview, genreDistribution, booksPerMonth, goals, achievements, isLoading, isGoalLoading } =
    useAppSelector(selectAnalytics);

  const [activeTab, setActiveTab] = useState('overview');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchGoals());
    dispatch(fetchAchievements());
  }, [dispatch]);

  const handleCreateGoal = async (data) => {
    const result = await dispatch(createGoal(data));
    if (createGoal.fulfilled.match(result)) {
      toast.success('Goal created!');
      setShowGoalModal(false);
    } else {
      toast.error(result.payload || 'Failed to create goal');
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
    { label: 'Books Read', value: overview.totalBooksRead ?? 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pages Read', value: (overview.totalPagesRead ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-mint', bg: 'bg-mint/10' },
    { label: 'Avg Rating', value: overview.averageRating ? Number(overview.averageRating).toFixed(1) : '—', icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Current Streak', value: `${overview.currentStreak ?? 0}d`, icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

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
            onClose={() => setShowGoalModal(false)}
            onSave={handleCreateGoal}
            isLoading={isGoalLoading}
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
        <div className="flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
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
              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="glass-card h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</p>
                          </div>
                          <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                            <stat.icon className={cn('h-5 w-5', stat.color)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Bar Chart */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-primary" />
                      Books Read Per Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    {booksPerMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <BarChart data={booksPerMonth} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" name="Books" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <BookOpen className="h-10 w-10 opacity-30" />
                        <p className="text-sm">No reading data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-mint" />
                      Genre Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    {genreDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <PieChart>
                          <Pie
                            data={genreDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            outerRadius={95}
                            innerRadius={45}
                            paddingAngle={3}
                          >
                            {genreDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Star className="h-10 w-10 opacity-30" />
                        <p className="text-sm">No genre data yet</p>
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
                <AnimatePresence>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {goals.map((goal) => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        onDelete={handleDeleteGoal}
                        isDeleting={deletingId === goal._id}
                      />
                    ))}
                  </div>
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
                      <div className="text-5xl drop-shadow">{ach.icon}</div>
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
    </>
  );
}
