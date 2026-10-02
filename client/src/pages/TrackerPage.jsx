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
  Edit2,
  Globe,
  Save,
  Check,
  Image as ImageIcon,
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

// ── HELPER: MANUSCRIPT COVER THUMBNAIL COMPONENT ──────────────────────────
const TrackerCardCover = ({ coverImage, title, genre, contentType, className }) => {
  const genreLower = (genre || '').toLowerCase();

  let bgGradient = 'from-amber-900 via-stone-800 to-zinc-900'; // Default warm espresso
  if (genreLower.includes('fantasy')) bgGradient = 'from-indigo-900 via-purple-900 to-slate-950';
  else if (genreLower.includes('romance')) bgGradient = 'from-rose-900 via-pink-900 to-zinc-950';
  else if (genreLower.includes('sci-fi') || genreLower.includes('scifi')) bgGradient = 'from-cyan-900 via-blue-950 to-slate-950';
  else if (genreLower.includes('thriller') || genreLower.includes('mystery')) bgGradient = 'from-emerald-900 via-teal-950 to-slate-950';
  else if (genreLower.includes('horror')) bgGradient = 'from-red-950 via-zinc-900 to-black';
  else if (genreLower.includes('poetry')) bgGradient = 'from-pink-900 via-amber-900 to-slate-950';

  if (coverImage) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl shadow-md border border-glass-border/40 group/cover shrink-0 bg-secondary/30", className)}>
        <img
          src={coverImage}
          alt={title || 'Manuscript Cover'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.classList.add('bg-gradient-to-br', 'from-amber-900', 'to-zinc-900');
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl shadow-md border border-white/10 bg-gradient-to-br p-2 flex flex-col justify-between select-none shrink-0 group/cover transition-all duration-300 hover:shadow-lg",
        bgGradient,
        className
      )}
    >
      <div className="absolute -top-6 -right-6 w-14 h-14 bg-white/10 rounded-full blur-md pointer-events-none" />
      <div className="flex items-center justify-between text-[8px] font-extrabold text-white/80 uppercase tracking-widest relative z-10">
        <span className="truncate max-w-[55px]">{contentType || 'MANUSCRIPT'}</span>
        <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
      </div>

      <div className="my-auto text-center py-1 relative z-10 space-y-1">
        <BookOpen className="w-4 h-4 mx-auto text-white/90 group-hover/cover:scale-110 transition-transform" />
        <h4 className="font-display font-black text-[10px] sm:text-[11px] leading-tight text-white line-clamp-2 drop-shadow-md px-0.5">
          {title || 'Untitled'}
        </h4>
      </div>

      <div className="text-[8px] font-bold text-white/70 text-center uppercase tracking-wider relative z-10 truncate bg-black/20 py-0.5 rounded backdrop-blur-xs">
        {genre || 'General'}
      </div>
    </div>
  );
};

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTracker, setEditingTracker] = useState(null);
  const [detailDrawerProject, setDetailDrawerProject] = useState(null);

  // Card Inline Edit State
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditForm, setQuickEditForm] = useState({
    title: '',
    coverImage: '',
    trackerStatus: 'DRAFTING',
    plannedChapters: '',
    drafted: 0,
    edited: 0,
    published: 0,
    whereILeftOff: '',
    nextAction: '',
  });
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  // Card Inline Quick Notes Edit State (Left Off & Next Action)
  const [quickNoteEditId, setQuickNoteEditId] = useState(null);
  const [quickNoteForm, setQuickNoteForm] = useState({ whereILeftOff: '', nextAction: '' });

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    contentType: 'NOVEL',
    genre: 'General',
    coverImage: '',
    language: 'English',
    trackerStatus: 'DRAFTING',
    plannedChapters: '',
    drafted: 0,
    edited: 0,
    published: 0,
    whereILeftOff: '',
    nextAction: '',
  });

  const [editTrackerForm, setEditTrackerForm] = useState({
    title: '',
    contentType: 'NOVEL',
    genre: 'General',
    coverImage: '',
    language: 'English',
    trackerStatus: 'DRAFTING',
    plannedChapters: '',
    drafted: 0,
    edited: 0,
    published: 0,
    whereILeftOff: '',
    nextAction: '',
    publications: [],
  });

  const [editNotesForm, setEditNotesForm] = useState(null);

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

  // Keyboard shortcut listener to close right sidebar drawer & modals with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (detailDrawerProject) setDetailDrawerProject(null);
        if (isEditModalOpen) setIsEditModalOpen(false);
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (isImportModalOpen) setIsImportModalOpen(false);
        if (isLogModalOpen) setIsLogModalOpen(false);
        if (isLimitModalOpen) setIsLimitModalOpen(false);
        if (quickEditId) setQuickEditId(null);
        if (quickNoteEditId) setQuickNoteEditId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    detailDrawerProject,
    isEditModalOpen,
    isCreateModalOpen,
    isImportModalOpen,
    isLogModalOpen,
    isLimitModalOpen,
    quickEditId,
    quickNoteEditId,
  ]);

  // Lock body scroll when detail drawer is open to eliminate footer disturbance
  useEffect(() => {
    if (detailDrawerProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [detailDrawerProject]);

  // Re-fetch trackers when filters change
  const handleFilterChange = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    dispatch(setFilters(newFilters));
    dispatch(fetchTrackers(updated));
  };

  // Open Full Edit Modal for a project card
  const handleOpenEditModal = (project) => {
    setEditingTracker(project);
    setEditTrackerForm({
      title: project.title || '',
      contentType: project.contentType || 'NOVEL',
      genre: project.genre || 'General',
      coverImage: project.coverImage || project.work?.coverImage || '',
      language: project.language || 'English',
      trackerStatus: project.trackerStatus || 'DRAFTING',
      plannedChapters: project.counts?.plannedChapters ?? project.plannedChapters ?? '',
      drafted: project.counts?.drafted ?? project.externalCounts?.drafted ?? 0,
      edited: project.counts?.edited ?? project.externalCounts?.edited ?? 0,
      published: project.counts?.published ?? project.externalCounts?.published ?? 0,
      whereILeftOff: project.whereILeftOff || '',
      nextAction: project.nextAction || '',
      publications: project.publications ? JSON.parse(JSON.stringify(project.publications)) : [],
    });
    setIsEditModalOpen(true);
  };

  // Start inline quick editing directly on card
  const handleStartQuickEdit = (project, e) => {
    e?.stopPropagation();
    setQuickEditId(project._id);
    setQuickEditForm({
      title: project.title || '',
      coverImage: project.coverImage || project.work?.coverImage || '',
      trackerStatus: project.trackerStatus || 'DRAFTING',
      plannedChapters: project.counts?.plannedChapters ?? project.plannedChapters ?? '',
      drafted: project.counts?.drafted ?? project.externalCounts?.drafted ?? 0,
      edited: project.counts?.edited ?? project.externalCounts?.edited ?? 0,
      published: project.counts?.published ?? project.externalCounts?.published ?? 0,
      whereILeftOff: project.whereILeftOff || '',
      nextAction: project.nextAction || '',
    });
  };

  // Submit inline card edit
  const handleSaveQuickEdit = async (projectId, e) => {
    e?.preventDefault();
    setIsQuickSaving(true);
    try {
      const payload = {
        title: quickEditForm.title,
        coverImage: quickEditForm.coverImage,
        trackerStatus: quickEditForm.trackerStatus,
        plannedChapters: quickEditForm.plannedChapters ? parseInt(quickEditForm.plannedChapters) : null,
        externalCounts: {
          drafted: parseInt(quickEditForm.drafted) || 0,
          edited: parseInt(quickEditForm.edited) || 0,
          published: parseInt(quickEditForm.published) || 0,
        },
        whereILeftOff: quickEditForm.whereILeftOff,
        nextAction: quickEditForm.nextAction,
      };

      const updatedRes = await dispatch(updateTracker({ id: projectId, data: payload })).unwrap();
      toast.success('Project card updated!');
      setQuickEditId(null);

      if (detailDrawerProject?._id === projectId) {
        setDetailDrawerProject(updatedRes.data || null);
      }
      dispatch(fetchTrackerStats());
      dispatch(fetchTrackers(filters));
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update card');
    } finally {
      setIsQuickSaving(false);
    }
  };

  // 1-Click Quick Increment Counter for ongoing serials & novels
  const handleQuickIncrement = async (project, field) => {
    try {
      const currentDrafted = project.counts?.drafted ?? project.externalCounts?.drafted ?? 0;
      const currentEdited = project.counts?.edited ?? project.externalCounts?.edited ?? 0;
      const currentPublished = project.counts?.published ?? project.externalCounts?.published ?? 0;

      let newDrafted = currentDrafted;
      let newEdited = currentEdited;
      let newPublished = currentPublished;

      if (field === 'drafted') newDrafted += 1;
      if (field === 'edited') newEdited += 1;
      if (field === 'published') newPublished += 1;

      const payload = {
        externalCounts: {
          drafted: newDrafted,
          edited: newEdited,
          published: newPublished,
        },
      };

      const updatedRes = await dispatch(updateTracker({ id: project._id, data: payload })).unwrap();
      const label = field === 'drafted' ? 'Draft' : field === 'edited' ? 'Edited' : 'Published Episode';
      const newVal = field === 'drafted' ? newDrafted : field === 'edited' ? newEdited : newPublished;

      toast.success(`"${project.title}": ${label} count is now ${newVal}! 🚀`);

      if (detailDrawerProject?._id === project._id) {
        setDetailDrawerProject(updatedRes.data || null);
      }
      dispatch(fetchTrackerStats());
      dispatch(fetchTrackers(filters));
    } catch (err) {
      toast.error('Failed to update chapter count');
    }
  };

  // Start Quick Notes Edit on Card
  const handleStartQuickNoteEdit = (project, e) => {
    e?.stopPropagation();
    setQuickNoteEditId(project._id);
    setQuickNoteForm({
      whereILeftOff: project.whereILeftOff || '',
      nextAction: project.nextAction || '',
    });
  };

  // Save Quick Notes on Card
  const handleSaveQuickNotesOnCard = async (projectId, e) => {
    e?.preventDefault();
    try {
      await dispatch(
        updateTracker({
          id: projectId,
          data: {
            whereILeftOff: quickNoteForm.whereILeftOff,
            nextAction: quickNoteForm.nextAction,
          },
        })
      ).unwrap();
      toast.success('Notes updated!');
      setQuickNoteEditId(null);
      dispatch(fetchTrackers(filters));
    } catch (err) {
      toast.error('Failed to save notes');
    }
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
        coverImage: createForm.coverImage,
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
        coverImage: '',
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
        toast.error(typeof err === 'string' ? err : err.message || 'Failed to create tracker');
      }
    }
  };

  // Update existing project tracker handler (Full Modal)
  const handleUpdateTrackerSubmit = async (e) => {
    e.preventDefault();
    if (!editingTracker) return;

    try {
      const payload = {
        title: editTrackerForm.title,
        contentType: editTrackerForm.contentType,
        genre: editTrackerForm.genre,
        coverImage: editTrackerForm.coverImage,
        language: editTrackerForm.language,
        trackerStatus: editTrackerForm.trackerStatus,
        plannedChapters: editTrackerForm.plannedChapters ? parseInt(editTrackerForm.plannedChapters) : null,
        externalCounts: {
          drafted: parseInt(editTrackerForm.drafted) || 0,
          edited: parseInt(editTrackerForm.edited) || 0,
          published: parseInt(editTrackerForm.published) || 0,
        },
        whereILeftOff: editTrackerForm.whereILeftOff,
        nextAction: editTrackerForm.nextAction,
        publications: editTrackerForm.publications || [],
      };

      const updatedRes = await dispatch(updateTracker({ id: editingTracker._id, data: payload })).unwrap();
      toast.success(`"${editTrackerForm.title}" updated successfully!`);
      setIsEditModalOpen(false);

      if (detailDrawerProject?._id === editingTracker._id) {
        setDetailDrawerProject(updatedRes.data || null);
      }
      setEditingTracker(null);
      dispatch(fetchTrackerStats());
      dispatch(fetchTrackers(filters));
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        toast.error(err.errors[0]?.message || 'Validation error');
      } else {
        toast.error(typeof err === 'string' ? err : err.message || 'Failed to update tracker');
      }
    }
  };

  // Add publication row in edit modal
  const handleAddPublicationRow = () => {
    setEditTrackerForm((prev) => ({
      ...prev,
      publications: [
        ...(prev.publications || []),
        { platform: 'Webnovel', url: '', episodesPublished: 0 },
      ],
    }));
  };

  // Remove publication row in edit modal
  const handleRemovePublicationRow = (index) => {
    setEditTrackerForm((prev) => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index),
    }));
  };

  // Import in-app work handler
  const handleImportWork = async (workId) => {
    try {
      await dispatch(createTracker({ workId })).unwrap();
      toast.success('In-app manuscript linked to tracker!');
      setIsImportModalOpen(false);
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
    if (!editNotesForm) return;
    try {
      await dispatch(
        updateTracker({
          id: editNotesForm._id,
          data: {
            whereILeftOff: editNotesForm.whereILeftOff,
            nextAction: editNotesForm.nextAction,
            plannedChapters: editNotesForm.plannedChapters ? parseInt(editNotesForm.plannedChapters) : null,
          },
        })
      ).unwrap();
      toast.success('Notes & next action saved!');
      if (detailDrawerProject?._id === editNotesForm._id) {
        setDetailDrawerProject((prev) => ({
          ...prev,
          whereILeftOff: editNotesForm.whereILeftOff,
          nextAction: editNotesForm.nextAction,
          plannedChapters: editNotesForm.plannedChapters,
        }));
      }
      setEditNotesForm(null);
      dispatch(fetchTrackers(filters));
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
    <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 pb-12 space-y-6">
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

        {/* Status Filter Pills, Search & Type */}
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          {/* Search Bar Input */}
          <div className="relative min-w-[160px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="pl-8 pr-7 h-8 rounded-xl text-xs bg-secondary/40 border-glass-border/40 focus:bg-card"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange({ search: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

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
            {filters.status !== 'ALL' || filters.neglected || filters.search
              ? 'No projects match your current search/filters. Try resetting filters.'
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

            const isInlineEditing = quickEditId === project._id;

            return (
              <Card
                key={project._id}
                className={cn(
                  'p-4 rounded-xl border-glass-border bg-card/85 glass-card flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all shadow-sm group',
                  isInlineEditing && 'ring-2 ring-primary/40 border-primary/50 bg-card'
                )}
              >
                {isInlineEditing ? (
                  /* ── INLINE CARD EDIT FORM ─────────────────────────── */
                  <form onSubmit={(e) => handleSaveQuickEdit(project._id, e)} className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-glass-border">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Quick Edit Card
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuickEditId(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                        title="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                        Title
                      </label>
                      <Input
                        value={quickEditForm.title}
                        onChange={(e) => setQuickEditForm({ ...quickEditForm, title: e.target.value })}
                        className="rounded-xl h-8 text-xs font-bold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                          Status
                        </label>
                        <select
                          value={quickEditForm.trackerStatus}
                          onChange={(e) => setQuickEditForm({ ...quickEditForm, trackerStatus: e.target.value })}
                          className="w-full bg-secondary/40 border border-glass-border rounded-xl p-1.5 text-xs text-foreground cursor-pointer font-semibold"
                        >
                          {TRACKER_STATUS_OPTIONS.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                          Target Ch.
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={quickEditForm.plannedChapters}
                          onChange={(e) => setQuickEditForm({ ...quickEditForm, plannedChapters: e.target.value })}
                          placeholder="Target"
                          className="rounded-xl h-8 text-xs"
                        />
                      </div>
                    </div>

                    {!project.isLinked && (
                      <div className="grid grid-cols-3 gap-1.5 bg-secondary/20 p-2 rounded-xl border border-glass-border/30">
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">Drafted</label>
                          <Input
                            type="number"
                            min="0"
                            value={quickEditForm.drafted}
                            onChange={(e) => setQuickEditForm({ ...quickEditForm, drafted: e.target.value })}
                            className="rounded-lg h-7 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">Edited</label>
                          <Input
                            type="number"
                            min="0"
                            value={quickEditForm.edited}
                            onChange={(e) => setQuickEditForm({ ...quickEditForm, edited: e.target.value })}
                            className="rounded-lg h-7 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">Published</label>
                          <Input
                            type="number"
                            min="0"
                            value={quickEditForm.published}
                            onChange={(e) => setQuickEditForm({ ...quickEditForm, published: e.target.value })}
                            className="rounded-lg h-7 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                        Where Left Off
                      </label>
                      <Input
                        value={quickEditForm.whereILeftOff}
                        onChange={(e) => setQuickEditForm({ ...quickEditForm, whereILeftOff: e.target.value })}
                        placeholder="Left off..."
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                        Next Action
                      </label>
                      <Input
                        value={quickEditForm.nextAction}
                        onChange={(e) => setQuickEditForm({ ...quickEditForm, nextAction: e.target.value })}
                        placeholder="Next step..."
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-glass-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuickEditId(null)}
                        className="rounded-xl text-xs h-7 px-2.5 font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isQuickSaving}
                        size="sm"
                        className="rounded-xl text-xs h-7 px-3 font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                      >
                        {isQuickSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save Card
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* ── NORMAL CARD DISPLAY ────────────────────────────── */
                  <>
                    <div className="space-y-3">
                      {/* Top Header Banner with Manuscript Cover Poster */}
                      <div className="flex items-start gap-3">
                        <TrackerCardCover
                          coverImage={project.coverImage || project.work?.coverImage}
                          title={project.title}
                          genre={project.genre}
                          contentType={project.contentType}
                          className="w-20 h-28 sm:w-22 sm:h-30"
                        />

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>

                            <div className="flex items-center gap-0.5 shrink-0">
                              {/* Quick Edit Card Button */}
                              <button
                                onClick={(e) => handleStartQuickEdit(project, e)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                title="Quick edit card inline"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Full Edit Modal Button */}
                              <button
                                onClick={() => handleOpenEditModal(project)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                                title="Full edit project details & links"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md border border-glass-border/30">
                              {project.contentType}
                            </span>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', statusMeta.color)}>
                              {statusMeta.label}
                            </span>
                            {project.isLinked ? (
                              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <LinkIcon className="w-2.5 h-2.5" /> In-App Work
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded-md">
                                External
                              </span>
                            )}
                          </div>

                          {project.isNeglected && (
                            <div className="pt-0.5">
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit animate-pulse">
                                <Clock className="w-3 h-3" /> {project.daysNeglected}d idle
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Chapter Counts Progress & Quick Counter Increments */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span className="font-semibold text-foreground">
                            {project.counts?.published || 0} pub • {project.counts?.drafted || 0} draft
                            {project.counts?.edited > 0 && ` • ${project.counts.edited} edit`}
                          </span>
                          {project.counts?.plannedChapters && (
                            <span>Target: {project.counts.plannedChapters} ch</span>
                          )}
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                ((project.counts?.published || 0) / (project.counts?.plannedChapters || 20)) * 100
                              )}%`,
                            }}
                            title={`${project.counts?.published} published episodes/chapters`}
                          />
                          <div
                            className="bg-amber-500 h-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                ((project.counts?.drafted || 0) / (project.counts?.plannedChapters || 20)) * 100
                              )}%`,
                            }}
                            title={`${project.counts?.drafted} drafted chapters`}
                          />
                        </div>

                        {/* 1-Click Serial Chapter Quick Increments Bar */}
                        <div className="flex items-center gap-1 pt-1 flex-wrap">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mr-0.5">
                            Bump Count:
                          </span>
                          <button
                            onClick={() => handleQuickIncrement(project, 'drafted')}
                            className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 text-[10px] font-bold border border-amber-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-0.5"
                            title="Quick add 1 drafted chapter"
                          >
                            <Plus className="w-2.5 h-2.5" /> 1 Draft
                          </button>
                          <button
                            onClick={() => handleQuickIncrement(project, 'edited')}
                            className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-500 hover:bg-cyan-500/25 text-[10px] font-bold border border-cyan-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-0.5"
                            title="Quick add 1 edited chapter"
                          >
                            <Plus className="w-2.5 h-2.5" /> 1 Edit
                          </button>
                          <button
                            onClick={() => handleQuickIncrement(project, 'published')}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 text-[10px] font-bold border border-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-0.5"
                            title="Quick add 1 published episode/chapter"
                          >
                            <Plus className="w-2.5 h-2.5" /> 1 Publish
                          </button>
                        </div>
                      </div>

                      {/* External Publications Platform Chips */}
                      {project.publications && project.publications.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {project.publications.map((pub, idx) => (
                            <a
                              key={idx}
                              href={pub.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-primary/20 transition-colors"
                              title={`Open ${pub.platform} (${pub.episodesPublished} episodes published)`}
                            >
                              <Globe className="w-2.5 h-2.5" />
                              <span>{pub.platform}: {pub.episodesPublished} ep</span>
                              {pub.url && <ExternalLink className="w-2.5 h-2.5 opacity-70" />}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Where I left off & Next action with Inline Notes Editor */}
                    <div className="space-y-2 bg-secondary/20 p-2.5 rounded-lg border border-glass-border/30 text-xs relative group/note">
                      {quickNoteEditId === project._id ? (
                        <form onSubmit={(e) => handleSaveQuickNotesOnCard(project._id, e)} className="space-y-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">Where Left Off</label>
                            <Input
                              value={quickNoteForm.whereILeftOff}
                              onChange={(e) => setQuickNoteForm({ ...quickNoteForm, whereILeftOff: e.target.value })}
                              className="h-7 text-xs rounded-lg"
                              placeholder="Where did you stop writing?"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">Next Action</label>
                            <Input
                              value={quickNoteForm.nextAction}
                              onChange={(e) => setQuickNoteForm({ ...quickNoteForm, nextAction: e.target.value })}
                              className="h-7 text-xs rounded-lg"
                              placeholder="What scene to write next?"
                            />
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setQuickNoteEditId(null)}
                              className="h-6 text-[10px] px-2 rounded-md"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="h-6 text-[10px] px-2 rounded-md font-bold bg-primary text-primary-foreground"
                            >
                              Save Notes
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-1">
                          <div className="space-y-1 flex-1">
                            {project.whereILeftOff ? (
                              <p className="text-muted-foreground line-clamp-2">
                                <strong className="text-foreground">Left off:</strong> {project.whereILeftOff}
                              </p>
                            ) : (
                              <p className="text-muted-foreground/60 italic text-[11px]">No left-off note set.</p>
                            )}
                            {project.nextAction ? (
                              <p className="text-emerald-500 font-medium line-clamp-2 flex items-start gap-1">
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span><strong>Next:</strong> {project.nextAction}</span>
                              </p>
                            ) : (
                              <p className="text-muted-foreground/60 italic text-[11px]">No next action set.</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleStartQuickNoteEdit(project, e)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground opacity-60 group-hover/note:opacity-100 transition-opacity cursor-pointer"
                            title="Quick edit notes"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer Controls & Actions */}
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

                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsLogModalOpen(true);
                          }}
                          className="text-[11px] font-bold h-7 px-2 rounded-lg border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 gap-1"
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
                  </>
                )}
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
                        className="p-3 rounded-lg border-glass-border bg-card glass-card hover:border-primary/40 transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start gap-2.5">
                          <TrackerCardCover
                            coverImage={project.coverImage || project.work?.coverImage}
                            title={project.title}
                            genre={project.genre}
                            contentType={project.contentType}
                            className="w-12 h-16"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                                {project.title}
                              </h4>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => handleStartQuickEdit(project, e)}
                                  className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Edit project"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                {project.isNeglected && (
                                  <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Neglected project" />
                                )}
                              </div>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-glass-border/30 inline-block mt-1">
                              {project.contentType}
                            </span>
                          </div>
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
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
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
                      onClick={() => handleImportWork(work._id)}
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
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
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

              <div>
                <label className="block font-semibold mb-1 text-foreground flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" /> Cover Image URL (Optional)
                </label>
                <Input
                  value={createForm.coverImage}
                  onChange={(e) => setCreateForm({ ...createForm, coverImage: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/... or cover image URL"
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

      {/* ── MODAL 3: EDIT EXISTING PROJECT TRACKER ──────────────────── */}
      {isEditModalOpen && editingTracker && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-glass-border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" /> Edit Project Tracker: {editingTracker.title}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrackerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Project Title</label>
                <Input
                  required
                  value={editTrackerForm.title}
                  onChange={(e) => setEditTrackerForm({ ...editTrackerForm, title: e.target.value })}
                  className="rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" /> Cover Image URL
                </label>
                <Input
                  value={editTrackerForm.coverImage}
                  onChange={(e) => setEditTrackerForm({ ...editTrackerForm, coverImage: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/... or cover image URL"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Content Type</label>
                  <select
                    value={editTrackerForm.contentType}
                    onChange={(e) => setEditTrackerForm({ ...editTrackerForm, contentType: e.target.value })}
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
                  <label className="block font-semibold mb-1 text-foreground">Tracker Status</label>
                  <select
                    value={editTrackerForm.trackerStatus}
                    onChange={(e) => setEditTrackerForm({ ...editTrackerForm, trackerStatus: e.target.value })}
                    className="w-full bg-secondary/40 border border-glass-border rounded-xl p-2 text-xs text-foreground cursor-pointer"
                  >
                    {TRACKER_STATUS_OPTIONS.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Target Chapters</label>
                  <Input
                    type="number"
                    min="0"
                    value={editTrackerForm.plannedChapters}
                    onChange={(e) => setEditTrackerForm({ ...editTrackerForm, plannedChapters: e.target.value })}
                    placeholder="e.g. 25"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* External counts */}
              {!editingTracker.isLinked && (
                <div className="space-y-1">
                  <label className="block font-semibold text-foreground">External Chapter Counts</label>
                  <div className="grid grid-cols-3 gap-2 bg-secondary/20 p-3 rounded-xl border border-glass-border/30">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Drafted</label>
                      <Input
                        type="number"
                        min="0"
                        value={editTrackerForm.drafted}
                        onChange={(e) => setEditTrackerForm({ ...editTrackerForm, drafted: e.target.value })}
                        className="rounded-lg h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Edited</label>
                      <Input
                        type="number"
                        min="0"
                        value={editTrackerForm.edited}
                        onChange={(e) => setEditTrackerForm({ ...editTrackerForm, edited: e.target.value })}
                        className="rounded-lg h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Published</label>
                      <Input
                        type="number"
                        min="0"
                        value={editTrackerForm.published}
                        onChange={(e) => setEditTrackerForm({ ...editTrackerForm, published: e.target.value })}
                        className="rounded-lg h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-foreground">Where You Left Off</label>
                <Input
                  value={editTrackerForm.whereILeftOff}
                  onChange={(e) => setEditTrackerForm({ ...editTrackerForm, whereILeftOff: e.target.value })}
                  placeholder="e.g. Finished Chapter 4 draft."
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Next Immediate Action</label>
                <Input
                  value={editTrackerForm.nextAction}
                  onChange={(e) => setEditTrackerForm({ ...editTrackerForm, nextAction: e.target.value })}
                  placeholder="e.g. Outline Chapter 5 scene."
                  className="rounded-xl text-xs"
                />
              </div>

              {/* External Publications List Editor */}
              <div className="space-y-2 border-t border-glass-border/40 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" /> External Publications
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddPublicationRow}
                    className="text-[11px] h-7 rounded-lg gap-1 border-glass-border"
                  >
                    <Plus className="w-3 h-3" /> Add Link
                  </Button>
                </div>

                {(editTrackerForm.publications || []).map((pub, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-secondary/20 p-2 rounded-xl border border-glass-border/30 items-center">
                    <div className="col-span-4">
                      <Input
                        value={pub.platform || ''}
                        onChange={(e) => {
                          const updated = [...editTrackerForm.publications];
                          updated[idx].platform = e.target.value;
                          setEditTrackerForm({ ...editTrackerForm, publications: updated });
                        }}
                        placeholder="Platform (e.g. Wattpad)"
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        value={pub.url || ''}
                        onChange={(e) => {
                          const updated = [...editTrackerForm.publications];
                          updated[idx].url = e.target.value;
                          setEditTrackerForm({ ...editTrackerForm, publications: updated });
                        }}
                        placeholder="https://..."
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePublicationRow(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-glass-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: LOG WRITING SESSION ────────────────────────────── */}
      {isLogModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
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

      {/* ── MODAL 5: ADJUST MAX ACTIVE LIMIT ────────────────────────── */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
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

      {/* ── RIGHT SIDEBAR DRAWER: PROJECT DETAILS & CHAPTER BREAKDOWN ── */}
      {detailDrawerProject && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex justify-end transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailDrawerProject(null);
          }}
        >
          <div className="bg-card border-l border-glass-border max-w-lg w-full h-full p-6 overflow-y-auto space-y-6 shadow-2xl relative z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Drawer Header with Cover Thumbnail & Close Button */}
              <div className="flex items-start justify-between border-b border-glass-border pb-4 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <TrackerCardCover
                    coverImage={detailDrawerProject.coverImage || detailDrawerProject.work?.coverImage}
                    title={detailDrawerProject.title}
                    genre={detailDrawerProject.genre}
                    contentType={detailDrawerProject.contentType}
                    className="w-20 h-28 shrink-0"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                      {detailDrawerProject.contentType} Tracker
                    </span>
                    <h2 className="text-base font-bold font-display text-foreground leading-snug">
                      {detailDrawerProject.title}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {detailDrawerProject.trackerStatus}
                      </Badge>

                      {/* Edit Button in Drawer */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditModal(detailDrawerProject)}
                        className="h-6 text-[11px] font-bold rounded border-glass-border gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-primary" /> Full Edit
                      </Button>

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
                </div>
                <button
                  onClick={() => setDetailDrawerProject(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-secondary/50 transition-colors shrink-0"
                  title="Close sidebar drawer (Esc or click outside)"
                  aria-label="Close sidebar"
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
                    value={editNotesForm?.whereILeftOff ?? detailDrawerProject.whereILeftOff ?? ''}
                    onChange={(e) =>
                      setEditNotesForm({
                        ...detailDrawerProject,
                        ...editNotesForm,
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
                    value={editNotesForm?.nextAction ?? detailDrawerProject.nextAction ?? ''}
                    onChange={(e) =>
                      setEditNotesForm({
                        ...detailDrawerProject,
                        ...editNotesForm,
                        nextAction: e.target.value,
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                {editNotesForm && (
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

            {/* Bottom Close Sidebar Button */}
            <div className="pt-4 border-t border-glass-border flex items-center justify-between gap-3 mt-6">
              <span className="text-[11px] text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono border border-glass-border">Esc</kbd> or click outside to close
              </span>
              <Button
                type="button"
                onClick={() => setDetailDrawerProject(null)}
                variant="outline"
                className="rounded-xl text-xs font-bold gap-1.5 border-glass-border hover:bg-secondary/50 cursor-pointer"
              >
                <X className="w-4 h-4" /> Close Sidebar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
