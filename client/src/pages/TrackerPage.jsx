import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchTrackers,
  fetchUnlinkedWorks,
  fetchTrackerStats,
  createTracker,
  updateTracker,
  deleteTracker,
  addWritingLog,
  setViewMode,
  setFilters,
  setMaxActiveLimit,
  selectTrackers,
  selectUnlinkedWorks,
  selectTrackerStats,
  selectTrackerViewMode,
  selectTrackerFilters,
  selectMaxActiveLimit,
  selectTrackerFetching,
  selectTrackerLoading,
} from '@/features/tracker/trackerSlice';
import {
  TRACKER_STATUS_OPTIONS,
  TRACKER_CONTENT_TYPES,
  createTrackerSchema,
  writingLogSchema,
} from '@/schemas/trackerSchema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Kanban,
  LayoutGrid,
  Plus,
  Flame,
  Clock,
  AlertTriangle,
  BookOpen,
  Feather,
  PenTool,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Settings,
  ChevronRight,
  TrendingUp,
  FileText,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/common/ConfirmDialog';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function TrackerPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const trackers = useAppSelector(selectTrackers);
  const unlinkedWorks = useAppSelector(selectUnlinkedWorks);
  const stats = useAppSelector(selectTrackerStats);
  const viewMode = useAppSelector(selectTrackerViewMode);
  const filters = useAppSelector(selectTrackerFilters);
  const maxActiveLimit = useAppSelector(selectMaxActiveLimit);
  const isFetching = useAppSelector(selectTrackerFetching);
  const isLoading = useAppSelector(selectTrackerLoading);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailDrawerProject, setDetailDrawerProject] = useState(null);

  // Forms local state
  const [createForm, setCreateForm] = useState({
    title: '',
    contentType: 'NOVEL',
    genre: 'General',
    language: 'English',
    trackerStatus: 'DRAFTING',
    plannedChapters: '',
    drafted: 0,
    edited: 0,
    published: 0,
    whereILeftOff: '',
    nextAction: '',
  });

  const [editForm, setEditForm] = useState(null);

  const [logForm, setLogForm] = useState({
    wordsWritten: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [tempLimit, setTempLimit] = useState(maxActiveLimit);

  // Load initial tracker data
  useEffect(() => {
    dispatch(fetchTrackers(filters));
    dispatch(fetchTrackerStats());
    dispatch(fetchUnlinkedWorks());
  }, [dispatch]);

  // Re-fetch trackers when filters change
  const handleFilterChange = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    dispatch(setFilters(newFilters));
    dispatch(fetchTrackers(updated));
  };

  // Create external tracker handler
  const handleCreateExternalSubmit = async (e) => {
    e.preventDefault();
    try {
      createTrackerSchema.parse({
        title: createForm.title,
        contentType: createForm.contentType,
        genre: createForm.genre,
        language: createForm.language,
        trackerStatus: createForm.trackerStatus,
        plannedChapters: createForm.plannedChapters || null,
        drafted: createForm.drafted,
        edited: createForm.edited,
        published: createForm.published,
        whereILeftOff: createForm.whereILeftOff,
        nextAction: createForm.nextAction,
      });

      const payload = {
        title: createForm.title,
        contentType: createForm.contentType,
        genre: createForm.genre,
        language: createForm.language,
        trackerStatus: createForm.trackerStatus,
        plannedChapters: createForm.plannedChapters ? parseInt(createForm.plannedChapters) : null,
        externalCounts: {
          drafted: parseInt(createForm.drafted) || 0,
          edited: parseInt(createForm.edited) || 0,
          published: parseInt(createForm.published) || 0,
        },
        whereILeftOff: createForm.whereILeftOff,
        nextAction: createForm.nextAction,
      };

      await dispatch(createTracker(payload)).unwrap();
      toast.success('New writing tracker created!');
      setIsCreateModalOpen(false);
      setCreateForm({
        title: '',
        contentType: 'NOVEL',
        genre: 'General',
        language: 'English',
        trackerStatus: 'DRAFTING',
        plannedChapters: '',
        drafted: 0,
        edited: 0,
        published: 0,
        whereILeftOff: '',
        nextAction: '',
      });
      dispatch(fetchTrackerStats());
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        toast.error(err.errors[0]?.message || 'Validation error');
      } else {
        toast.error(err.message || typeof err === 'string' ? err : 'Failed to create tracker');
      }
    }
  };

  // Import in-app work handler
  const handleImportWork = async (workId) => {
    try {
      await dispatch(createTracker({ workId })).unwrap();
      toast.success('In-app manuscript linked to tracker!');
      dispatch(fetchUnlinkedWorks());
      dispatch(fetchTrackerStats());
      dispatch(fetchTrackers(filters));
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to link work');
    }
  };

  // Update status directly from card or board column
  const handleStatusChange = async (trackerId, newStatus) => {
    try {
      await dispatch(updateTracker({ id: trackerId, data: { trackerStatus: newStatus } })).unwrap();
      toast.success(`Status updated to ${newStatus}`);
      dispatch(fetchTrackerStats());
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Delete tracker handler
  const handleDeleteTracker = async (id, title) => {
    const isConfirmed = await confirm({
      title: 'Delete Tracker',
      message: `Are you sure you want to delete tracking for "${title}"? This will also remove its writing logs.`,
      confirmText: 'Delete Tracker',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    try {
      await dispatch(deleteTracker(id)).unwrap();
      toast.success('Tracker deleted');
      if (detailDrawerProject?._id === id) setDetailDrawerProject(null);
      dispatch(fetchTrackerStats());
      dispatch(fetchUnlinkedWorks());
    } catch (err) {
      toast.error('Failed to delete tracker');
    }
  };

  // Add writing log handler
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      writingLogSchema.parse({
        wordsWritten: logForm.wordsWritten,
        note: logForm.note,
        date: logForm.date,
      });

      await dispatch(
        addWritingLog({
          id: selectedProject._id,
          data: {
            wordsWritten: parseInt(logForm.wordsWritten),
            note: logForm.note,
            date: logForm.date,
          },
        })
      ).unwrap();

      toast.success(`Logged ${logForm.wordsWritten} words for "${selectedProject.title}"! 🔥`);
      setIsLogModalOpen(false);
      setLogForm({ wordsWritten: '', note: '', date: new Date().toISOString().split('T')[0] });
      dispatch(fetchTrackerStats());
      dispatch(fetchTrackers(filters));
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        toast.error(err.errors[0]?.message || 'Validation error');
      } else {
        toast.error(typeof err === 'string' ? err : 'Failed to log words');
      }
    }
  };

  // Save quick note edit (whereILeftOff & nextAction)
  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!editForm) return;
    try {
      await dispatch(
        updateTracker({
          id: editForm._id,
          data: {
            whereILeftOff: editForm.whereILeftOff,
            nextAction: editForm.nextAction,
            plannedChapters: editForm.plannedChapters ? parseInt(editForm.plannedChapters) : null,
          },
        })
      ).unwrap();
      toast.success('Notes & next action saved!');
      if (detailDrawerProject?._id === editForm._id) {
        setDetailDrawerProject((prev) => ({
          ...prev,
          whereILeftOff: editForm.whereILeftOff,
          nextAction: editForm.nextAction,
          plannedChapters: editForm.plannedChapters,
        }));
      }
      setEditForm(null);
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  // Save max active projects limit
  const handleSaveMaxLimit = () => {
    dispatch(setMaxActiveLimit(tempLimit));
    toast.success(`Max active limit set to ${tempLimit}`);
    setIsLimitModalOpen(false);
  };

  // Active projects count check
  const activeCount = stats?.activeCount || 0;
  const isLimitExceeded = activeCount > maxActiveLimit;

  return (
    <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 pb-24 space-y-6">
      {/* ── HEADER & STATS STRIP ───────────────────────────────────── */}
      <div className="rounded-2xl bg-card/85 backdrop-blur-xl border border-glass-border/70 p-5 sm:p-7 shadow-md relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Kanban className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                Writing Project Tracker
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              At-a-glance status overview of every novel, story, poem, or draft in your pipeline.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="rounded-xl text-xs font-semibold gap-1.5 border-glass-border/60 hover:bg-secondary/40"
              title="Link an existing in-app manuscript"
            >
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              <span>Import Studio Work</span>
              {unlinkedWorks.length > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 rounded-full">
                  {unlinkedWorks.length}
                </Badge>
              )}
            </Button>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all"
              title="Track an external or unlisted writing project"
            >
              <Plus className="w-4 h-4" />
              <span>Add External Project</span>
            </Button>
          </div>
        </div>

        {/* Stats Metrics Cards & 30-Day Bar Chart */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 pt-2">
          {/* Active Projects & Limit */}
          <Card className="p-3.5 rounded-xl border-glass-border bg-secondary/20 glass-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Active Manuscripts
              </span>
              <button
                onClick={() => setIsLimitModalOpen(true)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                title="Configure max active projects limit"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-display text-foreground">{activeCount}</span>
              <span className="text-xs text-muted-foreground font-medium">
                Limit: <strong className={isLimitExceeded ? 'text-rose-500' : 'text-emerald-500'}>{maxActiveLimit}</strong>
              </span>
            </div>
            {isLimitExceeded && (
              <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 shrink-0" /> Target limit exceeded
              </p>
            )}
          </Card>

          {/* Daily Streak */}
          <Card className="p-3.5 rounded-xl border-glass-border bg-secondary/20 glass-card flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Writing Streak
            </span>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Flame className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-foreground leading-none">
                  {stats?.streak || 0}
                </span>
                <span className="text-[10px] text-muted-foreground block font-medium">Days In A Row</span>
              </div>
            </div>
          </Card>

          {/* Words Written */}
          <Card className="p-3.5 rounded-xl border-glass-border bg-secondary/20 glass-card flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Total Words
            </span>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xl font-bold font-display text-foreground leading-none">
                  {(stats?.totalWordsWritten || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block font-medium">Words Logged</span>
              </div>
            </div>
          </Card>

          {/* Neglected Alert */}
          <Card
            onClick={() => handleFilterChange({ neglected: !filters.neglected })}
            className={cn(
              'p-3.5 rounded-xl border-glass-border glass-card flex flex-col justify-between cursor-pointer transition-all',
              filters.neglected
                ? 'bg-rose-500/15 border-rose-500/40'
                : stats?.neglectedCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                : 'bg-secondary/20'
            )}
            title="Click to filter neglected projects"
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
              Untouched (14d+)
              <Clock className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={cn('text-2xl font-bold font-display', stats?.neglectedCount > 0 ? 'text-amber-500' : 'text-foreground')}>
                {stats?.neglectedCount || 0}
              </span>
              <span className="text-[10px] font-semibold text-primary hover:underline">
                {filters.neglected ? 'Showing Only' : 'Filter View →'}
              </span>
            </div>
          </Card>
        </div>

        {/* 30-Day Words Bar Chart */}
        {stats?.dailyStats && stats.dailyStats.some((d) => d.words > 0) && (
          <div className="pt-2 border-t border-glass-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Daily Words Written (Last 30 Days)
              </span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyStats} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#888' }} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: '#888' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-glass-border p-2 rounded-lg text-xs shadow-md">
                            <p className="font-bold text-foreground">{payload[0].payload.date}</p>
                            <p className="text-emerald-500 font-semibold">{payload[0].value} words</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="words" fill="var(--color-primary, #6366f1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── MAX ACTIVE LIMIT WARNING BANNER ─────────────────────────── */}
      {isLimitExceeded && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-center justify-between gap-3 text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-2 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              You have <strong>{activeCount} active projects</strong>, exceeding your target limit of <strong>{maxActiveLimit}</strong>. Consider completing, holding, or archiving a project to prevent burnout!
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLimitModalOpen(true)}
            className="text-xs font-semibold border-amber-500/30 hover:bg-amber-500/20 shrink-0"
          >
            Adjust Limit
          </Button>
        </div>
      )}

      {/* ── CONTROLS & FILTER BAR ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border border-glass-border/60">
        {/* View Switcher: Cards vs Board */}
        <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-glass-border/30 w-fit">
          <button
            onClick={() => dispatch(setViewMode('CARDS'))}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              viewMode === 'CARDS'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Card Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards View</span>
          </button>
          <button
            onClick={() => dispatch(setViewMode('BOARD'))}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              viewMode === 'BOARD'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Kanban Board View"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Board View</span>
          </button>
        </div>

        {/* Status Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="bg-secondary/40 border border-glass-border/40 rounded-xl px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {TRACKER_STATUS_OPTIONS.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Content Type Select */}
          <select
            value={filters.contentType}
            onChange={(e) => handleFilterChange({ contentType: e.target.value })}
            className="bg-secondary/40 border border-glass-border/40 rounded-xl px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Types</option>
            {TRACKER_CONTENT_TYPES.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.label}
              </option>
            ))}
          </select>

          {/* Neglected Filter Toggle */}
          <button
            onClick={() => handleFilterChange({ neglected: !filters.neglected })}
            className={cn(
              'px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1',
              filters.neglected
                ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 font-bold'
                : 'border-glass-border/40 text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Neglected</span>
          </button>
        </div>
      </div>

      {/* ── TRACKER CONTENT VIEW ────────────────────────────────────── */}
      {isFetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : trackers.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-8 text-muted-foreground space-y-3">
          <Kanban className="w-10 h-10 mx-auto opacity-40 text-primary" />
          <p className="font-semibold text-base text-foreground">No writing project trackers found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filters.status !== 'ALL' || filters.neglected
              ? 'No projects match your current filters. Try resetting filters.'
              : 'Add an external writing project or import manuscripts from your Writing Studio.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Import Studio Work
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add External Project
            </Button>
          </div>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* ── VIEW A: CARDS GRID VIEW ───────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trackers.map((project) => {
            const statusMeta =
              TRACKER_STATUS_OPTIONS.find((s) => s.id === project.trackerStatus) ||
              TRACKER_STATUS_OPTIONS[0];

            return (
              <Card
                key={project._id}
                className="p-4 rounded-xl border-glass-border bg-card/85 glass-card flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all shadow-sm group"
              >
                {/* Header: Title & Badges */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/50 px-2 py-0.5 rounded border border-glass-border/30">
                          {project.contentType}
                        </span>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', statusMeta.color)}>
                          {statusMeta.label}
                        </span>
                        {project.isLinked ? (
                          <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <LinkIcon className="w-2.5 h-2.5" /> In-App Work
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded">
                            External
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Neglected Warning Badge */}
                    {project.isNeglected && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 animate-pulse">
                        <Clock className="w-3 h-3" /> {project.daysNeglected}d idle
                      </span>
                    )}
                  </div>

                  {/* Chapter Counts Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span>
                        {project.counts?.published} pub • {project.counts?.drafted} draft
                        {project.counts?.edited > 0 && ` • ${project.counts?.edited} edit`}
                      </span>
                      {project.counts?.plannedChapters && (
                        <span>Target: {project.counts.plannedChapters} ch</span>
                      )}
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-secondary/50 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((project.counts?.published || 0) / (project.counts?.plannedChapters || 20)) * 100
                          )}%`,
                        }}
                        title={`${project.counts?.published} published`}
                      />
                      <div
                        className="bg-amber-500 h-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((project.counts?.drafted || 0) / (project.counts?.plannedChapters || 20)) * 100
                          )}%`,
                        }}
                        title={`${project.counts?.drafted} drafted`}
                      />
                    </div>
                  </div>
                </div>

                {/* Where I left off & Next action */}
                <div className="space-y-2 bg-secondary/20 p-2.5 rounded-lg border border-glass-border/30 text-xs">
                  {project.whereILeftOff && (
                    <p className="text-muted-foreground line-clamp-2">
                      <strong className="text-foreground">Left off:</strong> {project.whereILeftOff}
                    </p>
                  )}
                  {project.nextAction ? (
                    <p className="text-emerald-500 font-medium line-clamp-2 flex items-start gap-1">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Next action:</strong> {project.nextAction}</span>
                    </p>
                  ) : (
                    <p className="text-muted-foreground/60 italic text-[11px]">No next action set.</p>
                  )}
                </div>

                {/* Footer Controls & Quick Log Words */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-glass-border/30">
                  {/* Status Dropdown */}
                  <select
                    value={project.trackerStatus}
                    onChange={(e) => handleStatusChange(project._id, e.target.value)}
                    className="bg-secondary/40 text-[11px] font-semibold text-foreground rounded-lg px-2 py-1 border border-glass-border/40 cursor-pointer focus:outline-none"
                  >
                    {TRACKER_STATUS_OPTIONS.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsLogModalOpen(true);
                      }}
                      className="text-[11px] font-bold h-7 px-2.5 rounded-lg border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 gap-1"
                      title="Quick log words written today"
                    >
                      <Flame className="w-3 h-3" /> Log Words
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailDrawerProject(project)}
                      className="text-[11px] h-7 px-2 rounded-lg text-muted-foreground hover:text-foreground"
                      title="View full project details & chapter breakdown"
                    >
                      Detail
                    </Button>

                    <button
                      onClick={() => handleDeleteTracker(project._id, project.title)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title="Delete tracker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ── VIEW B: KANBAN BOARD VIEW ─────────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none">
          {TRACKER_STATUS_OPTIONS.map((colStatus) => {
            const colProjects = trackers.filter((t) => t.trackerStatus === colStatus.id);

            return (
              <div
                key={colStatus.id}
                className="w-72 shrink-0 bg-card/60 border border-glass-border/60 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-glass-border/40">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', colStatus.color.split(' ')[0])} />
                    <h3 className="font-bold text-xs text-foreground">{colStatus.label}</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {colProjects.length}
                  </Badge>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3">
                  {colProjects.length === 0 ? (
                    <div className="h-32 border border-dashed border-glass-border/40 rounded-lg flex items-center justify-center text-[11px] text-muted-foreground/60 italic">
                      No projects
                    </div>
                  ) : (
                    colProjects.map((project) => (
                      <Card
                        key={project._id}
                        className="p-3 rounded-lg border-glass-border bg-card glass-card hover:border-primary/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                            {project.title}
                          </h4>
                          {project.isNeglected && (
                            <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Neglected project" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                          <span>{project.contentType}</span>
                          <span>{project.counts?.published} pub / {project.counts?.drafted} draft</span>
                        </div>

                        {project.nextAction && (
                          <p className="text-[11px] text-emerald-500 font-medium line-clamp-2 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                            <strong>Next:</strong> {project.nextAction}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-glass-border/30">
                          <select
                            value={project.trackerStatus}
                            onChange={(e) => handleStatusChange(project._id, e.target.value)}
                            className="bg-secondary/40 text-[10px] font-semibold text-foreground rounded px-1.5 py-0.5 border border-glass-border/40 cursor-pointer"
                          >
                            {TRACKER_STATUS_OPTIONS.map((st) => (
                              <option key={st.id} value={st.id}>
                                Move to {st.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => setDetailDrawerProject(project)}
                            className="text-[10px] text-primary hover:underline font-semibold"
                          >
                            Details →
                          </button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: IMPORT IN-APP STUDIO WORK ───────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-glass-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" /> Import Studio Work
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select one of your existing manuscripts from your Writing Studio to track its progress automatically.
            </p>

            {unlinkedWorks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-glass-border rounded-xl">
                All your Studio manuscripts are already linked to trackers!
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {unlinkedWorks.map((work) => (
                  <div
                    key={work._id}
                    className="p-3 rounded-xl border border-glass-border bg-secondary/20 flex items-center justify-between hover:bg-secondary/40 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{work.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {work.contentType} • {work.chapters?.length || 0} chapters • {work.stats?.totalWordCount || 0} words
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleImportWork(work._id);
                        setIsImportModalOpen(false);
                      }}
                      className="rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Track Work
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD EXTERNAL PROJECT ────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-glass-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> Track External Writing Project
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExternalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Project Title *</label>
                <Input
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Chronicles of Eldoria (Novel)"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Content Type</label>
                  <select
                    value={createForm.contentType}
                    onChange={(e) => setCreateForm({ ...createForm, contentType: e.target.value })}
                    className="w-full bg-secondary/40 border border-glass-border rounded-xl p-2 text-xs text-foreground cursor-pointer"
                  >
                    {TRACKER_CONTENT_TYPES.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Initial Status</label>
                  <select
                    value={createForm.trackerStatus}
                    onChange={(e) => setCreateForm({ ...createForm, trackerStatus: e.target.value })}
                    className="w-full bg-secondary/40 border border-glass-border rounded-xl p-2 text-xs text-foreground cursor-pointer"
                  >
                    {TRACKER_STATUS_OPTIONS.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-secondary/20 p-3 rounded-xl border border-glass-border/30">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Drafted Ch</label>
                  <Input
                    type="number"
                    min="0"
                    value={createForm.drafted}
                    onChange={(e) => setCreateForm({ ...createForm, drafted: e.target.value })}
                    className="rounded-lg h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Edited Ch</label>
                  <Input
                    type="number"
                    min="0"
                    value={createForm.edited}
                    onChange={(e) => setCreateForm({ ...createForm, edited: e.target.value })}
                    className="rounded-lg h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Published Ch</label>
                  <Input
                    type="number"
                    min="0"
                    value={createForm.published}
                    onChange={(e) => setCreateForm({ ...createForm, published: e.target.value })}
                    className="rounded-lg h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Where You Left Off</label>
                <Input
                  value={createForm.whereILeftOff}
                  onChange={(e) => setCreateForm({ ...createForm, whereILeftOff: e.target.value })}
                  placeholder="e.g. Finished Chapter 4 draft on Word."
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Next Immediate Action</label>
                <Input
                  value={createForm.nextAction}
                  onChange={(e) => setCreateForm({ ...createForm, nextAction: e.target.value })}
                  placeholder="e.g. Outline Chapter 5 scene."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Tracker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: LOG WRITING SESSION ────────────────────────────── */}
      {isLogModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-glass-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" /> Log Writing Session
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Project: <strong className="text-foreground">{selectedProject.title}</strong>
            </p>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Words Written *</label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={logForm.wordsWritten}
                  onChange={(e) => setLogForm({ ...logForm, wordsWritten: e.target.value })}
                  placeholder="e.g. 750"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Date</label>
                <Input
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Optional Session Note</label>
                <Input
                  value={logForm.note}
                  onChange={(e) => setLogForm({ ...logForm, note: e.target.value })}
                  placeholder="e.g. Wrote opening scene for Chapter 3."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLogModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Log Words 🔥
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: ADJUST MAX ACTIVE LIMIT ────────────────────────── */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-glass-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Target Active Limit
              </h3>
              <button
                onClick={() => setIsLimitModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Set the maximum number of active projects (Idea through Editing) you want to manage concurrently before receiving warning notifications.
            </p>

            <div className="space-y-2">
              <label className="block font-semibold text-xs text-foreground">Max Active Projects</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={tempLimit}
                onChange={(e) => setTempLimit(parseInt(e.target.value) || 1)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLimitModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMaxLimit}
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                Save Limit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER: PROJECT DETAILS & CHAPTER BREAKDOWN ───────────────── */}
      {detailDrawerProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-card border-l border-glass-border max-w-lg w-full h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-glass-border pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  {detailDrawerProject.contentType} Tracker
                </span>
                <h2 className="text-lg font-bold font-display text-foreground leading-snug">
                  {detailDrawerProject.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {detailDrawerProject.trackerStatus}
                  </Badge>
                  {detailDrawerProject.isLinked && (
                    <Link
                      to={`/studio/edit/${detailDrawerProject.work._id}`}
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      Open in Studio →
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDetailDrawerProject(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Edit Notes Form */}
            <form onSubmit={handleSaveNotes} className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-glass-border/40">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-primary" /> Notes & Next Action
              </h4>

              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold mb-1">
                  Where You Left Off
                </label>
                <Input
                  value={editForm?.whereILeftOff ?? detailDrawerProject.whereILeftOff ?? ''}
                  onChange={(e) =>
                    setEditForm({
                      ...detailDrawerProject,
                      ...editForm,
                      whereILeftOff: e.target.value,
                    })
                  }
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold mb-1">
                  Next Action
                </label>
                <Input
                  value={editForm?.nextAction ?? detailDrawerProject.nextAction ?? ''}
                  onChange={(e) =>
                    setEditForm({
                      ...detailDrawerProject,
                      ...editForm,
                      nextAction: e.target.value,
                    })
                  }
                  className="rounded-xl text-xs"
                />
              </div>

              {editForm && (
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="submit" size="sm" className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
                    Save Notes
                  </Button>
                </div>
              )}
            </form>

            {/* Derived Chapter Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-foreground flex items-center justify-between">
                <span>Chapter Breakdown</span>
                <span className="text-muted-foreground font-normal text-[11px]">
                  {detailDrawerProject.counts?.totalChapters} total chapters
                </span>
              </h4>

              {detailDrawerProject.chaptersBreakdown?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-glass-border/30 rounded-xl p-2">
                  {detailDrawerProject.chaptersBreakdown.map((ch) => (
                    <div
                      key={ch._id}
                      className="p-2 rounded-lg bg-secondary/30 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {ch.chapterNumber}. {ch.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{ch.wordCount} words</span>
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded',
                            ch.status === 'PUBLISHED'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-amber-500/15 text-amber-500'
                          )}
                        >
                          {ch.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-secondary/20 rounded-xl text-xs text-muted-foreground">
                  Drafted: {detailDrawerProject.counts?.drafted} | Edited: {detailDrawerProject.counts?.edited} | Published: {detailDrawerProject.counts?.published}
                </div>
              )}
            </div>

            {/* Publication Links */}
            {detailDrawerProject.publications?.length > 0 && (
              <div className="space-y-2 border-t border-glass-border pt-4">
                <h4 className="font-bold text-xs text-foreground">External Publications</h4>
                <div className="space-y-2">
                  {detailDrawerProject.publications.map((pub, idx) => (
                    <a
                      key={idx}
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-glass-border bg-secondary/20 flex items-center justify-between hover:bg-secondary/40 text-xs transition-colors"
                    >
                      <div>
                        <p className="font-bold text-foreground">{pub.platform}</p>
                        <p className="text-[10px] text-muted-foreground">{pub.episodesPublished} episodes published</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
