import { useState, useEffect } from 'react';
import { adminService, feedbackService } from '@/services';
import { 
  Users, BookOpen, MessageSquare, Activity, Shield, Trash2, 
  Loader2, RefreshCw, Calendar, Mail, Check, AlertTriangle, ArrowUpDown,
  HelpCircle, Lightbulb, LifeBuoy, Inbox, Clock, User, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';

const FEEDBACK_TYPES = {
  SUGGESTION: { label: 'Suggestion', icon: Lightbulb, badgeColor: 'text-[#D4931A] bg-[#D4931A]/10 border-[#D4931A]/20' },
  FEEDBACK: { label: 'Feedback', icon: MessageSquare, badgeColor: 'text-[#8B4513] bg-[#8B4513]/10 border-[#8B4513]/20' },
  HELP: { label: 'Help Request', icon: HelpCircle, badgeColor: 'text-[#5C7A3E] bg-[#5C7A3E]/10 border-[#5C7A3E]/20' },
  SUPPORT: { label: 'Tech Support', icon: LifeBuoy, badgeColor: 'text-[#C0392B] bg-[#C0392B]/10 border-[#C0392B]/20' }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User deletion state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // User role modal state
  const [userToModify, setUserToModify] = useState(null);
  const [isModifyingRole, setIsModifyingRole] = useState(false);

  // Feedback states
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState('ALL');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('ALL');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');
  const [feedbackCurrentPage, setFeedbackCurrentPage] = useState(1);
  const feedbacksPerPage = 5;

  // Feedback Resolution Modal
  const [feedbackToResolve, setFeedbackToResolve] = useState(null);
  const [resolutionReply, setResolutionReply] = useState('');
  const [isResolvingFeedback, setIsResolvingFeedback] = useState(false);

  // User tab filtering & pagination states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Activities tab filtering & pagination states
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('ALL');
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const activitiesPerPage = 8;

  const fetchDashboardData = async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      else setIsLoading(true);

      const [statsRes, usersRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers()
      ]);

      setStats(statsRes.data.data.stats);
      setRecentActivities(statsRes.data.data.recentActivities);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const response = await feedbackService.getAllFeedback();
      if (response.data?.success) {
        setFeedbacks(response.data.data.feedbacks);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user feedbacks');
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    try {
      setIsModifyingRole(true);
      await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Updated role to ${newRole}`);
      setUserToModify(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setIsModifyingRole(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setIsDeletingUser(true);
      await adminService.deleteUser(userToDelete._id);
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      setRecentActivities(prev => prev.filter(act => act.user?._id !== userToDelete._id));
      toast.success('User and all associated data deleted successfully');
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleToggleFeedbackStatus = async (id, currentStatus) => {
    if (currentStatus === 'PENDING') {
      const fb = feedbacks.find(f => f._id === id);
      setFeedbackToResolve(fb);
      setResolutionReply('');
      return;
    }

    // Revert status to pending
    const toastId = toast.loading('Reverting status to pending...');
    try {
      const response = await feedbackService.updateFeedbackStatus(id, 'PENDING', { adminResponse: '' });
      if (response.data?.success) {
        toast.success('Feedback status set back to pending', { id: toastId });
        setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: 'PENDING', adminResponse: '' } : f));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const submitFeedbackResolution = async () => {
    if (!feedbackToResolve) return;
    setIsResolvingFeedback(true);
    const toastId = toast.loading('Submitting resolution & notifying user...');
    try {
      const response = await feedbackService.updateFeedbackStatus(feedbackToResolve._id, 'RESOLVED', {
        adminResponse: resolutionReply
      });
      if (response.data?.success) {
        toast.success('Feedback resolved successfully. User notified!', { id: toastId });
        setFeedbacks(prev => prev.map(f => f._id === feedbackToResolve._id ? { ...f, status: 'RESOLVED', adminResponse: resolutionReply } : f));
        setFeedbackToResolve(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit resolution reply', { id: toastId });
    } finally {
      setIsResolvingFeedback(false);
    }
  };

  // ── FILTERING & PAGINATION LOGIC ──

  // 1. Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * usersPerPage,
    userCurrentPage * usersPerPage
  );

  // 2. Activities
  const filteredActivities = recentActivities.filter((act) => {
    const userName = act.user?.name || '';
    const userUsername = act.user?.username || '';
    const bookTitle = act.metadata?.bookTitle || '';
    const matchesSearch = 
      userName.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      userUsername.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      bookTitle.toLowerCase().includes(activitySearchQuery.toLowerCase());
    const matchesType = activityTypeFilter === 'ALL' || act.type === activityTypeFilter;
    return matchesSearch && matchesType;
  });
  const totalActivityPages = Math.ceil(filteredActivities.length / activitiesPerPage) || 1;
  const paginatedActivities = filteredActivities.slice(
    (activityCurrentPage - 1) * activitiesPerPage,
    activityCurrentPage * activitiesPerPage
  );

  // 3. Feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesStatus = feedbackFilter === 'ALL' || fb.status === feedbackFilter;
    const matchesType = feedbackTypeFilter === 'ALL' || fb.type === feedbackTypeFilter;
    const userName = fb.user?.name || '';
    const userEmail = fb.user?.email || '';
    const subject = fb.subject || '';
    const message = fb.message || '';
    const matchesSearch =
      userName.toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
      subject.toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
      message.toLowerCase().includes(feedbackSearchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });
  const totalFeedbackPages = Math.ceil(filteredFeedbacks.length / feedbacksPerPage) || 1;
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (feedbackCurrentPage - 1) * feedbacksPerPage,
    feedbackCurrentPage * feedbacksPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Readers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      desc: 'Registered users on the platform'
    },
    {
      title: 'Books Added',
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      desc: 'Books logged in user collections'
    },
    {
      title: 'Platform Posts',
      value: stats?.totalPosts || 0,
      icon: MessageSquare,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      desc: 'Shared thoughts, poems & reviews'
    },
    {
      title: 'Activity Logs',
      value: stats?.totalActivities || 0,
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      desc: 'Global user actions recorded'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-none font-medium">
            System Control Panel
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Admin Dashboard
          </h1>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="border-glass-border rounded-xl text-muted-foreground hover:bg-secondary/40 gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-glass-border gap-6">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'activities', label: 'Global Activity Logs', icon: Activity },
          { id: 'feedback', label: 'User Feedbacks', icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer`}
            style={{
              borderColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Contents ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m, idx) => (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-card/75 glass-card border border-glass-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {m.title}
                      </span>
                      <div className={`p-1.5 rounded-xl border ${m.bg}`}>
                        <m.icon className={`w-4 h-4 ${m.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground font-display">{m.value}</div>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 leading-normal">{m.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick charts/Lists */}
            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
              {/* Recent Activities teaser */}
              <Card className="bg-card/70 glass-card border border-glass-border rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold font-display">Recent Activity Stream</CardTitle>
                  <CardDescription className="text-xs">Real-time actions happening across ShelfForge</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {recentActivities.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-8">No activities recorded yet.</p>
                  ) : (
                    recentActivities.slice(0, 8).map((act) => (
                      <div key={act._id} className="flex items-start gap-3 text-xs leading-normal py-2.5 border-b border-glass-border last:border-b-0">
                        <Avatar src={act.user?.avatar} name={act.user?.name} size="sm" className="shrink-0 border border-glass-border" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground">
                            <span className="font-semibold">{act.user?.name || 'Deleted User'}</span>
                            <span className="text-muted-foreground"> (@{act.user?.username || 'deleted'}) </span>
                            {act.type === 'BOOK_ADDED' && 'added a book to library'}
                            {act.type === 'BOOK_COMPLETED' && 'marked a book as Completed'}
                            {act.type === 'BOOK_RATED' && 'rated a book'}
                            {act.type === 'BOOK_REVIEWED' && 'reviewed a book'}
                            {act.type === 'BADGE_UNLOCKED' && 'unlocked a new Badge'}
                          </p>
                          {act.metadata?.bookTitle && (
                            <p className="text-primary font-medium mt-0.5">
                              📖 {act.metadata.bookTitle} by {act.metadata.bookAuthor}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground/50 mt-1">
                            {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Activity breakdown */}
              <Card className="bg-card/70 glass-card border border-glass-border rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold font-display">Activity Breakdown</CardTitle>
                  <CardDescription className="text-xs">Distribution of logged action types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats?.activityCounts || {}).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{type.replace('_', ' ')}</span>
                        <span className="font-semibold text-foreground">{count}</span>
                      </div>
                      <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden border border-glass-border">
                        <div 
                          className="bg-primary h-full" 
                          style={{ 
                            width: `${(count / (stats.totalActivities || 1)) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats?.activityCounts || {}).length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">No stats to report.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/40 p-4 border border-glass-border rounded-2xl">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search name, username, email..."
                  value={userSearchQuery}
                  onChange={(e) => { setUserSearchQuery(e.target.value); setUserCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-glass-border bg-card/60 rounded-xl focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 shadow-inner"
                />
                <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filter Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs bg-card/85 border border-glass-border rounded-xl focus:outline-none text-foreground cursor-pointer font-semibold shadow-sm"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                </select>
                <div className="text-[10px] text-muted-foreground font-semibold bg-secondary/35 border border-glass-border px-2.5 py-1 rounded-lg">
                  Total: {filteredUsers.length}
                </div>
              </div>
            </div>

            <Card className="bg-card/75 glass-card border border-glass-border rounded-2xl shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base font-bold font-display">User Management Directory</CardTitle>
                <CardDescription className="text-xs">Manage system access roles, user signups, and access controls</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-glass-border bg-secondary/15 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border text-xs">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No users matching search filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <Avatar src={u.avatar} name={u.name} size="sm" className="border border-glass-border" />
                            <div>
                              <p className="font-semibold text-foreground">{u.name}</p>
                              <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground font-medium">
                            {u.email}
                          </td>
                          <td className="p-4">
                            <Badge className={`font-semibold text-[10px] border-none px-2 py-0.5 ${
                              u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-secondary text-foreground'
                            }`}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 rounded-lg text-xs gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                              onClick={() => setUserToModify(u)}
                            >
                              <Shield className="w-3.5 h-3.5" /> Toggle Role
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 rounded-lg text-xs gap-1 text-red-500 hover:bg-red-50 cursor-pointer"
                              onClick={() => setUserToDelete(u)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* User Table Pagination */}
              {totalUserPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-glass-border bg-secondary/5">
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    Page {userCurrentPage} of {totalUserPages}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={userCurrentPage === 1}
                      className="h-7 text-[10px] rounded-lg border border-glass-border px-2 hover:bg-secondary/40 text-foreground cursor-pointer"
                    >
                      Prev
                    </Button>
                    {Array.from({ length: totalUserPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setUserCurrentPage(i + 1)}
                        className={`w-7 h-7 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                          userCurrentPage === i + 1
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-glass-border hover:bg-secondary/40 text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalUserPages))}
                      disabled={userCurrentPage === totalUserPages}
                      className="h-7 text-[10px] rounded-lg border border-glass-border px-2 hover:bg-secondary/40 text-foreground cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/40 p-4 border border-glass-border rounded-2xl">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search user, book title..."
                  value={activitySearchQuery}
                  onChange={(e) => { setActivitySearchQuery(e.target.value); setActivityCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-glass-border bg-card/60 rounded-xl focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 shadow-inner"
                />
                <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Action Type:</span>
                <select
                  value={activityTypeFilter}
                  onChange={(e) => { setActivityTypeFilter(e.target.value); setActivityCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs bg-card/85 border border-glass-border rounded-xl focus:outline-none text-foreground cursor-pointer font-semibold shadow-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="BOOK_ADDED">Book Added</option>
                  <option value="BOOK_COMPLETED">Book Completed</option>
                  <option value="BOOK_RATED">Book Rated</option>
                  <option value="BOOK_REVIEWED">Book Reviewed</option>
                  <option value="BADGE_UNLOCKED">Badge Unlocked</option>
                </select>
                <div className="text-[10px] text-muted-foreground font-semibold bg-secondary/35 border border-glass-border px-2.5 py-1 rounded-lg">
                  Total: {filteredActivities.length}
                </div>
              </div>
            </div>

            <Card className="bg-card/75 glass-card border border-glass-border rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold font-display">System-Wide Activity Log</CardTitle>
                <CardDescription className="text-xs">Chronological timeline of all reader actions and reading milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paginatedActivities.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-12">No activity records match these filter terms.</p>
                ) : (
                  paginatedActivities.map((act) => (
                    <div key={act._id} className="flex items-start gap-4 p-3.5 rounded-xl border border-glass-border bg-secondary/5 hover:bg-secondary/10 transition-colors text-xs">
                      <Avatar src={act.user?.avatar} name={act.user?.name} size="md" className="shrink-0 border border-glass-border" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-foreground">
                            {act.user?.name || 'Deleted User'} 
                            <span className="font-normal text-muted-foreground"> (@{act.user?.username || 'deleted'})</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {act.type === 'BOOK_ADDED' && 'added a new book to their library collection.'}
                          {act.type === 'BOOK_COMPLETED' && 'successfully completed reading a book! 🎉'}
                          {act.type === 'BOOK_RATED' && `rated a book ${act.metadata?.rating || ''} stars.`}
                          {act.type === 'BOOK_REVIEWED' && 'wrote a new review for a book.'}
                          {act.type === 'BADGE_UNLOCKED' && 'unlocked a reader badge achievement! 🏆'}
                        </p>
                        {act.metadata?.bookTitle && (
                          <div className="p-2 rounded-lg bg-secondary/20 border border-glass-border mt-1.5 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground text-[11px] truncate">
                              {act.metadata.bookTitle} <span className="text-muted-foreground font-normal">by {act.metadata.bookAuthor}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>

              {/* Activity Pagination */}
              {totalActivityPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3.5 border-t border-glass-border bg-secondary/5">
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    Page {activityCurrentPage} of {totalActivityPages}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivityCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activityCurrentPage === 1}
                      className="h-7 text-[10px] rounded-lg border border-glass-border px-2 hover:bg-secondary/40 text-foreground cursor-pointer"
                    >
                      Prev
                    </Button>
                    {Array.from({ length: totalActivityPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivityCurrentPage(i + 1)}
                        className={`w-7 h-7 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                          activityCurrentPage === i + 1
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-glass-border hover:bg-secondary/40 text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivityCurrentPage(prev => Math.min(prev + 1, totalActivityPages))}
                      disabled={activityCurrentPage === totalActivityPages}
                      className="h-7 text-[10px] rounded-lg border border-glass-border px-2 hover:bg-secondary/40 text-foreground cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/40 p-4 border border-glass-border rounded-2xl">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search subject, message, username..."
                  value={feedbackSearchQuery}
                  onChange={(e) => { setFeedbackSearchQuery(e.target.value); setFeedbackCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-glass-border bg-card/60 rounded-xl focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 shadow-inner"
                />
                <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center justify-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type:</span>
                <select
                  value={feedbackTypeFilter}
                  onChange={(e) => { setFeedbackTypeFilter(e.target.value); setFeedbackCurrentPage(1); }}
                  className="px-2.5 py-1.5 text-xs bg-card/85 border border-glass-border rounded-xl focus:outline-none text-foreground cursor-pointer font-semibold shadow-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="SUGGESTION">Suggestion</option>
                  <option value="FEEDBACK">Feedback</option>
                  <option value="HELP">Help Request</option>
                  <option value="SUPPORT">Tech Support</option>
                </select>
                <div className="text-[10px] text-muted-foreground font-semibold bg-secondary/35 border border-glass-border px-2.5 py-1 rounded-lg">
                  Filtered: {filteredFeedbacks.length}
                </div>
              </div>
            </div>

            {/* Status Tabs Filter */}
            <div className="flex gap-2 items-center border-b border-glass-border pb-4">
              {['ALL', 'PENDING', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setFeedbackFilter(filter); setFeedbackCurrentPage(1); }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border border-transparent ${
                    feedbackFilter === filter
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-glass-border"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* List */}
            {isLoadingFeedbacks ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : paginatedFeedbacks.length === 0 ? (
              <div className="glass-card p-16 text-center text-muted-foreground space-y-4">
                <Inbox className="w-12 h-12 mx-auto opacity-30 text-primary" />
                <div>
                  <p className="text-sm font-bold">No feedback entries found</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">There are no records matching these criteria.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedFeedbacks.map((fb) => {
                  const typeObj = FEEDBACK_TYPES[fb.type] || FEEDBACK_TYPES.SUGGESTION;
                  const TypeIcon = typeObj.icon;
                  return (
                    <div
                      key={fb._id}
                      className="glass-card p-6 space-y-4 flex flex-col md:flex-row md:items-start justify-between gap-6 border-l-4 border-l-primary hover:border-l-accent transition-all duration-200"
                    >
                      <div className="space-y-4 max-w-4xl flex-1">
                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 border shadow-sm ${typeObj.badgeColor}`}>
                            <TypeIcon className="w-3.5 h-3.5 shrink-0" />
                            {typeObj.label}
                          </span>
                          
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 bg-secondary/35 px-2.5 py-1 rounded-lg border border-glass-border">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            {fb.user?.name} (@{fb.user?.username})
                          </span>

                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 bg-secondary/35 px-2.5 py-1 rounded-lg border border-glass-border">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {fb.user?.email}
                          </span>

                          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 ml-auto">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {new Date(fb.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Text Message */}
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-base text-foreground leading-snug">{fb.subject}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-secondary/25 p-4 rounded-2xl border border-glass-border/40 shadow-inner">
                            {fb.message}
                          </p>
                          {fb.adminResponse && (
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5" /> Resolution response from admin:
                              </span>
                              <p className="text-xs italic text-foreground leading-relaxed">
                                "{fb.adminResponse}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Resolve controls */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 md:border-l border-glass-border/40 md:pl-6">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right md:block hidden">Status</span>
                          <Badge
                            className={`text-[10px] font-extrabold tracking-wider px-2.5 py-1 border shadow-inner ${
                              fb.status === 'RESOLVED'
                                ? "bg-success/15 text-success border-success/25"
                                : "bg-warning/15 text-warning border-warning/25"
                            }`}
                            variant="outline"
                          >
                            {fb.status}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleFeedbackStatus(fb._id, fb.status)}
                          className={`rounded-xl border text-[11px] font-bold px-3 py-2 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm ${
                            fb.status === 'PENDING'
                              ? "bg-success text-success-foreground hover:opacity-90 border-success/30"
                              : "bg-secondary text-foreground hover:bg-secondary/70 border-glass-border"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {fb.status === 'PENDING' ? 'Resolve Query' : 'Revert to Pending'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Feedback Pagination */}
            {totalFeedbackPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/5 rounded-2xl border border-glass-border">
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Page {feedbackCurrentPage} of {totalFeedbackPages}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeedbackCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={feedbackCurrentPage === 1}
                    className="h-7 text-[10px] rounded-lg border border-glass-border px-2 hover:bg-secondary/40 text-foreground cursor-pointer"
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalFeedbackPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setFeedbackCurrentPage(i + 1)}
                      className={`w-7 h-7 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                        feedbackCurrentPage === i + 1
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-glass-border hover:bg-secondary/40 text-muted-foreground'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeedbackCurrentPage(prev => Math.min(prev + 1, totalFeedbackPages))}
                    disabled={feedbackCurrentPage === totalFeedbackPages}
                    className="h-7 text-[10px] rounded-lg border border-glass-border px-2 hover:bg-secondary/40 text-foreground cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feedback Resolution Response Dialog ── */}
      <Modal
        open={!!feedbackToResolve}
        onClose={() => setFeedbackToResolve(null)}
        title="Resolve Feedback Query"
        description="Write a response message to reply to the user and mark the ticket as resolved."
        className="max-w-md"
      >
        {feedbackToResolve && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl border border-glass-border bg-secondary/15 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span>Submitted by:</span>
                <span className="text-foreground">{feedbackToResolve.user?.name} (@{feedbackToResolve.user?.username})</span>
              </div>
              <p className="text-xs font-semibold text-foreground leading-snug">Subject: {feedbackToResolve.subject}</p>
              <p className="text-[11px] text-muted-foreground/90 italic line-clamp-2 mt-1">"{feedbackToResolve.message}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Resolution Reply</label>
              <textarea
                value={resolutionReply}
                onChange={(e) => setResolutionReply(e.target.value)}
                placeholder="Write your explanation or instructions here. The user will receive this response as a notification..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-glass-border bg-secondary/20 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-glass-border">
              <Button 
                variant="outline" 
                onClick={() => setFeedbackToResolve(null)} 
                disabled={isResolvingFeedback}
                className="border-glass-border text-foreground hover:bg-secondary/40 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitFeedbackResolution} 
                disabled={isResolvingFeedback}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer"
              >
                {isResolvingFeedback ? 'Submitting...' : 'Submit & Resolve'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── User Role Modification Dialog ── */}
      <Modal
        open={!!userToModify}
        onClose={() => setUserToModify(null)}
        title="Modify Access Role"
        description="Are you sure you want to change this user's platform access role?"
        className="max-w-md"
      >
        {userToModify && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-glass-border bg-secondary/15">
              <Avatar src={userToModify.avatar} name={userToModify.name} size="md" />
              <div>
                <p className="font-semibold text-sm text-foreground">{userToModify.name}</p>
                <p className="text-xs text-muted-foreground">@{userToModify.username}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-normal">
              Changing this role will toggle the user between <strong>MEMBER</strong> (standard reader permissions) and <strong>ADMIN</strong> (access to system dashboard, role updating, and user deletion).
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-glass-border">
              <Button 
                variant="outline" 
                onClick={() => setUserToModify(null)} 
                disabled={isModifyingRole}
                className="border-glass-border text-foreground hover:bg-secondary/40 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleRoleChange(userToModify._id, userToModify.role)} 
                disabled={isModifyingRole}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer"
              >
                {isModifyingRole ? 'Updating...' : `Switch to ${userToModify.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── User Delete Confirmation Dialog ── */}
      <Modal
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete User Account"
        description="This action is permanent and cannot be undone."
        className="max-w-md"
      >
        {userToDelete && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50/50">
              <Avatar src={userToDelete.avatar} name={userToDelete.name} size="md" />
              <div>
                <p className="font-semibold text-sm text-red-700">{userToDelete.name}</p>
                <p className="text-xs text-red-600">@{userToDelete.username}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-normal flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                Deletes this user and permanently cleans up all associated posts, comments, library log entries, likes, and follows from the database.
              </span>
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-glass-border">
              <Button 
                variant="outline" 
                onClick={() => setUserToDelete(null)} 
                disabled={isDeletingUser}
                className="border-glass-border text-foreground hover:bg-secondary/40 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteConfirm} 
                disabled={isDeletingUser}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
              >
                {isDeletingUser ? 'Deleting...' : 'Permanently Delete User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
