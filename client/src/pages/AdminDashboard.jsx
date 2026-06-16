import { useState, useEffect } from 'react';
import { adminService } from '@/services';
import { 
  Users, BookOpen, MessageSquare, Activity, Shield, Trash2, 
  Loader2, RefreshCw, Calendar, Mail, Check, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'activities'
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Define metric details
  const metrics = [
    {
      title: 'Total Readers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      desc: 'Registered users on the platform'
    },
    {
      title: 'Books Added',
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      desc: 'Books logged in user collections'
    },
    {
      title: 'Platform Posts',
      value: stats?.totalPosts || 0,
      icon: MessageSquare,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      desc: 'Shared thoughts, poems & reviews'
    },
    {
      title: 'Activity Logs',
      value: stats?.totalActivities || 0,
      icon: Activity,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10 border-violet-500/20',
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
          className="border-glass-border rounded-xl text-muted-foreground hover:bg-secondary/40 gap-1.5"
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
          { id: 'activities', label: 'Global Activity Logs', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap`}
            style={{
              borderColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
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
          >
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
                    {users.map((u) => (
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
                            className="h-8 rounded-lg text-xs gap-1 text-primary hover:bg-primary/10"
                            onClick={() => setUserToModify(u)}
                          >
                            <Shield className="w-3.5 h-3.5" /> Toggle Role
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 rounded-lg text-xs gap-1 text-red-500 hover:bg-red-50"
                            onClick={() => setUserToDelete(u)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          >
            <Card className="bg-card/75 glass-card border border-glass-border rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold font-display">System-Wide Activity Log</CardTitle>
                <CardDescription className="text-xs">Chronological timeline of all reader actions and reading milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((act) => (
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
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
                className="border-glass-border text-foreground hover:bg-secondary/40 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleRoleChange(userToModify._id, userToModify.role)} 
                disabled={isModifyingRole}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
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
                className="border-glass-border text-foreground hover:bg-secondary/40 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteConfirm} 
                disabled={isDeletingUser}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
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
