import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/authHooks';
import { workService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Feather, Plus, Edit2, Trash2, Eye, Heart, BookOpen, Sparkles,
  Loader2, Globe, Lock, Users, FileText, CheckCircle2, Bookmark,
  PenTool, Book, Languages, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { CreativeWorkCard } from '@/components/writing/CreativeWorkCard';

// Languages restricted strictly to English, Hindi, and Hinglish
const LANGUAGES = [
  { id: 'ALL', label: 'All Languages' },
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'Hindi (हिंदी)' },
  { id: 'Hinglish', label: 'Hinglish' },
];

export default function WritingStudioPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  
  // Studio Tab Mode: 'EXPLORE' | 'MY_STUDIO'
  const [activeStudioTab, setActiveStudioTab] = useState('EXPLORE');

  // Explore Community State
  const [exploreWorks, setExploreWorks] = useState([]);
  const [isExploreLoading, setIsExploreLoading] = useState(true);
  const [exploreContentType, setExploreContentType] = useState('ALL');
  const [exploreLanguage, setExploreLanguage] = useState('ALL');
  const [exploreSearch, setExploreSearch] = useState('');
  const [explorePage, setExplorePage] = useState(1);
  const [exploreTotalPages, setExploreTotalPages] = useState(1);
  const [exploreTotalWorks, setExploreTotalWorks] = useState(0);

  // My Author Studio State
  const [myWorks, setMyWorks] = useState([]);
  const [isMyWorksLoading, setIsMyWorksLoading] = useState(true);
  const [myFilterType, setMyFilterType] = useState('ALL');
  const [myStatusFilter, setMyStatusFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFT'
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Fetch Community Explore Works
  const fetchExploreWorks = async () => {
    try {
      setIsExploreLoading(true);
      const res = await workService.getExploreWorks({
        contentType: exploreContentType === 'ALL' ? undefined : exploreContentType,
        language: exploreLanguage === 'ALL' ? undefined : exploreLanguage,
        search: exploreSearch || undefined,
        page: explorePage,
        limit: 9,
      });
      const data = res.data.data;
      setExploreWorks(data.works || []);
      setExploreTotalPages(data.totalPages || 1);
      setExploreTotalWorks(data.totalWorks || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load community writings');
    } finally {
      setIsExploreLoading(false);
    }
  };

  // Fetch My Author Works
  const fetchMyWorks = async () => {
    if (!user) return;
    try {
      setIsMyWorksLoading(true);
      const res = await workService.getUserWorks(user.username);
      setMyWorks(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your works');
    } finally {
      setIsMyWorksLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreWorks();
  }, [exploreContentType, exploreLanguage, explorePage]);

  useEffect(() => {
    if (user?.username) {
      fetchMyWorks();
    }
  }, [user?.username, activeStudioTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setExplorePage(1);
    fetchExploreWorks();
  };

  const handleDeleteWork = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Writing',
      message: 'Are you sure you want to delete this work? This action cannot be undone.',
      confirmText: 'Delete Work',
      variant: 'destructive',
    });
    if (!isConfirmed) return;
    try {
      await workService.deleteWork(id);
      toast.success('Work deleted successfully');
      fetchMyWorks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete work');
    }
  };

  // Badge color helper
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'STORY':
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'POEM':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'BLOG':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'DIARY':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  // Author metrics totals
  const totalWords = myWorks.reduce((sum, w) => sum + (w.stats?.totalWordCount || 0), 0);
  const totalReads = myWorks.reduce((sum, w) => sum + (w.stats?.views || 0), 0);
  const totalLikes = myWorks.reduce((sum, w) => sum + (w.stats?.likesCount || 0), 0);

  const filteredMyWorks = myWorks.filter((w) => {
    const matchesType = myFilterType === 'ALL' || w.contentType === myFilterType;
    const matchesStatus = myStatusFilter === 'ALL' || w.status === myStatusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 pb-24 space-y-6">
      {/* Minimal Editorial Header */}
      <div className="rounded-2xl bg-card/85 backdrop-blur-xl border border-glass-border/70 p-5 sm:p-7 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
              Community Writings & Author Studio
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans max-w-xl">
              Discover stories, poems, blogs, and diaries — or publish your original manuscripts in English, Hindi, and Hinglish.
            </p>
          </div>

          <Link
            to="/studio/write"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl h-9 px-4 gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 text-xs border-none active:scale-95"
            title="Start writing a new manuscript"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Start New Writing</span>
            <span className="sm:hidden font-medium">Write</span>
          </Link>
        </div>
      </div>

      {/* Sleek Sub-Tab Switcher: Explore Community vs My Dashboard */}
      <div className="flex items-center gap-1.5 border-b border-glass-border/40 pb-2.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveStudioTab('EXPLORE')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
            activeStudioTab === 'EXPLORE'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          )}
          title="Browse community published works"
        >
          <Sparkles className={cn("w-3.5 h-3.5", activeStudioTab === 'EXPLORE' ? "text-primary-foreground" : "text-primary")} />
          <span className="hidden sm:inline">Explore Community</span>
          <span className="sm:hidden">Explore</span>
        </button>

        <button
          onClick={() => setActiveStudioTab('MY_STUDIO')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
            activeStudioTab === 'MY_STUDIO'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          )}
          title="View my author statistics and manuscripts"
        >
          <Feather className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">My Dashboard ({myWorks.length})</span>
          <span className="sm:hidden">Dashboard ({myWorks.length})</span>
        </button>
      </div>

      {/* ── MODE 1: EXPLORE COMMUNITY WRITINGS ────────────────────── */}
      {activeStudioTab === 'EXPLORE' && (
        <div className="space-y-6">
          {/* Search & Filter Controls Bar */}
          <div className="flex flex-col gap-3 bg-card/60 p-3.5 rounded-xl border border-glass-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Content Type Filter Pills */}
              <div className="flex bg-secondary/40 p-1 rounded-xl gap-1 w-fit max-w-full overflow-x-auto border border-glass-border/30 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Writings', icon: Globe },
                  { id: 'STORY', label: 'Stories', icon: BookOpen },
                  { id: 'POEM', label: 'Poems', icon: Feather },
                  { id: 'BLOG', label: 'Blogs', icon: PenTool },
                  { id: 'DIARY', label: 'Diaries', icon: Book },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setExploreContentType(tab.id);
                      setExplorePage(1);
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0',
                      exploreContentType === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={`Filter writings by ${tab.label}`}
                  >
                    <tab.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                <Input
                  value={exploreSearch}
                  onChange={(e) => setExploreSearch(e.target.value)}
                  placeholder="Search by title or topic..."
                  className="pl-9 border-glass-border rounded-xl h-9 text-xs"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              </form>
            </div>

            {/* Language Filter Pills */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1 shrink-0">
                <Languages className="w-3.5 h-3.5 text-primary" /> Language:
              </span>
              <div className="flex items-center gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setExploreLanguage(lang.id);
                      setExplorePage(1);
                    }}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border',
                      exploreLanguage === lang.id
                        ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                        : 'border-glass-border/30 text-muted-foreground hover:text-foreground'
                    )}
                    title={`Show works written in ${lang.label}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Community Works Grid */}
          {isExploreLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : exploreWorks.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-8 text-muted-foreground space-y-2">
              <Feather className="w-10 h-10 mx-auto opacity-50" />
              <p className="font-medium text-base text-foreground">No published writings found</p>
              <p className="text-xs text-muted-foreground">Be the first author to publish a work in this language!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {exploreWorks.map((work) => (
                <CreativeWorkCard key={work._id} work={work} />
              ))}
            </div>
          )}

          {/* Explore Pagination */}
          {exploreTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-glass-border pt-4 px-2">
              <Button
                variant="outline"
                size="sm"
                disabled={explorePage <= 1 || isExploreLoading}
                onClick={() => setExplorePage((p) => Math.max(1, p - 1))}
                className="rounded-xl text-xs font-medium gap-1"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <span className="text-xs font-medium text-muted-foreground">
                Page {explorePage} of {exploreTotalPages} ({exploreTotalWorks} writings)
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={explorePage >= exploreTotalPages || isExploreLoading}
                onClick={() => setExplorePage((p) => Math.min(exploreTotalPages, p + 1))}
                className="rounded-xl text-xs font-medium gap-1"
                title="Next page"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 2: MY AUTHOR DASHBOARD ───────────────────────────── */}
      {activeStudioTab === 'MY_STUDIO' && (
        <div className="space-y-6">
          {/* Author Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 rounded-xl border-glass-border bg-card/85 glass-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-medium text-foreground leading-none">{myWorks.length}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Works</span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-glass-border bg-card/85 glass-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-medium text-foreground leading-none">{totalWords.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Words Written</span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-glass-border bg-card/85 glass-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-medium text-foreground leading-none">{totalReads}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Reads</span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-glass-border bg-card/85 glass-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-medium text-foreground leading-none">{totalLikes}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Likes</span>
              </div>
            </Card>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-secondary/35 p-1 rounded-xl gap-1 w-fit max-w-full overflow-x-auto border border-glass-border/30 scrollbar-none">
              {[
                { id: 'ALL', label: 'All My Works', icon: Globe },
                { id: 'STORY', label: 'Stories', icon: BookOpen },
                { id: 'POEM', label: 'Poems', icon: Feather },
                { id: 'BLOG', label: 'Blogs', icon: PenTool },
                { id: 'DIARY', label: 'Diaries', icon: Book },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMyFilterType(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0',
                    myFilterType === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title={`Filter my works by ${tab.label}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Status Filter Toggle (All, Live, Drafts) */}
            <div className="flex bg-secondary/35 p-1 rounded-xl gap-1 border border-glass-border/30 shrink-0">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'PUBLISHED', label: 'Live' },
                { id: 'DRAFT', label: 'Drafts' },
              ].map((statusTab) => (
                <button
                  key={statusTab.id}
                  onClick={() => setMyStatusFilter(statusTab.id)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                    myStatusFilter === statusTab.id
                      ? 'bg-secondary text-foreground border border-glass-border shadow-sm font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {statusTab.label}
                </button>
              ))}
            </div>
          </div>

          {/* My Works Cards */}
          {isMyWorksLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredMyWorks.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-8 text-muted-foreground space-y-3">
              <Feather className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="font-medium text-base text-foreground">No writings found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You haven't written any {myFilterType === 'ALL' ? 'works' : myFilterType.toLowerCase() + 's'} yet.
              </p>
              <Link
                to="/studio/write"
                className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl cursor-pointer mt-2"
                title="Start writing a new story or poem"
              >
                <Plus className="w-4 h-4" /> Start New Writing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3">
              {filteredMyWorks.map((work) => (
                <div key={work._id} className="flex flex-col gap-2 group">
                  {/* Book Cover */}
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-secondary/40 flex items-center justify-center">
                    <Link to={`/read/${work._id}`} className="block w-full h-full relative">
                      {work.coverImage && !failedImages[work._id] ? (
                        <>
                          <img
                            src={work.coverImage}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none select-none"
                          />
                          <img
                            src={work.coverImage}
                            alt={work.title}
                            onError={() => handleImageError(work._id)}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-all duration-300"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 flex flex-col items-center justify-between p-3.5 text-center group-hover:brightness-90 transition-all duration-300 select-none">
                          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mt-2 shadow-sm">
                            {work.contentType === 'POEM' ? (
                              <Feather className="w-4.5 h-4.5" />
                            ) : work.contentType === 'BLOG' ? (
                              <PenTool className="w-4.5 h-4.5" />
                            ) : work.contentType === 'DIARY' ? (
                              <Book className="w-4.5 h-4.5" />
                            ) : (
                              <BookOpen className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <span className="text-xs font-medium font-display text-white/95 leading-snug line-clamp-4 px-1 my-auto">
                            {work.title}
                          </span>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[9px] font-medium text-primary/80 uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                              {work.contentType || 'STORY'}
                            </span>
                          </div>
                        </div>
                      )}
                    </Link>
                    {/* Status badge on cover */}
                    <div className="absolute top-2 left-2 z-20 pointer-events-none">
                      {work.status === 'PUBLISHED' ? (
                        <span className="text-[9px] font-medium text-white bg-emerald-600/80 rounded px-1.5 py-0.5 backdrop-blur-sm">Live</span>
                      ) : (
                        <span className="text-[9px] font-medium text-white bg-amber-600/80 rounded px-1.5 py-0.5 backdrop-blur-sm">Draft</span>
                      )}
                    </div>

                    {/* Edit & Delete Action Overlay Buttons */}
                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                      <Link
                        to={`/studio/edit/${work._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-black/60 hover:bg-primary text-white backdrop-blur-sm transition-colors shadow-sm"
                        title="Edit manuscript"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteWork(work._id);
                        }}
                        className="p-1.5 rounded-md bg-black/60 hover:bg-destructive text-white backdrop-blur-sm transition-colors shadow-sm cursor-pointer"
                        title="Delete manuscript"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Actions */}
                  <div className="space-y-1 px-0.5">
                    <Link to={`/read/${work._id}`}>
                      <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {work.title}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground font-normal">
                      <span>{work.chapters?.length || 0} ch • {work.stats?.totalWordCount || 0}w</span>
                      <Link
                        to={`/studio/edit/${work._id}`}
                        className="text-primary hover:underline font-medium flex items-center gap-0.5 text-[11px]"
                        title="Edit work in Writing Editor"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
