import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { BookOpen, TrendingUp, Star, Award, Target, Flame } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchAnalytics, fetchGoals, fetchAchievements, selectAnalytics } from '@/features/analytics/analyticsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkeletonBox } from '@/components/common/Skeletons';

const COLORS = ['#14b8a6', '#0f766e', '#2dd4bf', '#5eead4', '#115e59'];

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { overview, genreDistribution, booksPerMonth, goals, achievements, isLoading } = useAppSelector(selectAnalytics);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchGoals());
    dispatch(fetchAchievements());
  }, [dispatch]);

  const statCards = [
    { label: 'Books Read', value: overview.totalBooksRead, icon: BookOpen, color: 'text-primary' },
    { label: 'Pages Read', value: overview.totalPagesRead, icon: TrendingUp, color: 'text-mint' },
    { label: 'Avg Rating', value: overview.averageRating, icon: Star, color: 'text-warning' },
    { label: 'Current Streak', value: `${overview.currentStreak} Days`, icon: Flame, color: 'text-destructive' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBox className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-28" />)}
        </div>
        <SkeletonBox className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary" className="mb-2">Analytics</Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">Your Reading Journey</h1>
        <p className="mt-1 text-muted-foreground">Insights and gamification to keep you motivated.</p>
      </div>

      <div className="flex gap-4 border-b border-border pb-2">
        <button onClick={() => setActiveTab('overview')} className={`pb-2 font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Overview</button>
        <button onClick={() => setActiveTab('goals')} className={`pb-2 font-medium transition-colors ${activeTab === 'goals' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Goals</button>
        <button onClick={() => setActiveTab('achievements')} className={`pb-2 font-medium transition-colors ${activeTab === 'achievements' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Achievements</button>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <Card key={i} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card">
              <CardHeader><CardTitle>Books Read Per Month</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={booksPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#062c30', borderColor: '#14b8a6' }} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader><CardTitle>Genre Distribution</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genreDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {genreDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#062c30', borderColor: '#14b8a6' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'goals' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Reading Goals</h2>
            {/* Add Goal Button would go here */}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map(goal => (
              <Card key={goal._id} className="glass-card relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{goal.title}</span>
                    <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'secondary'}>{goal.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.currentValue} / {goal.targetValue} {goal.targetType}</span>
                    </div>
                    <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${goal.progressPercentage}%` }} 
                        className={`h-full ${goal.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Ends on {new Date(goal.endDate).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'achievements' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h2 className="text-xl font-semibold">Your Trophies</h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {achievements.map(ach => (
              <motion.div whileHover={{ scale: 1.05 }} key={ach._id} className="glass-card flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="text-5xl">{ach.icon}</div>
                <h3 className="font-semibold">{ach.title}</h3>
                <p className="text-xs text-muted-foreground">{ach.description}</p>
                <p className="text-[10px] text-primary/70">Earned: {new Date(ach.earnedAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
