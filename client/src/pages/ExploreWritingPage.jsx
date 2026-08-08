import { useState, useEffect } from 'react';
import { workService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Search, Feather, BookOpen, Heart, Eye, Sparkles, Loader2,
  ChevronLeft, ChevronRight, Plus, PenTool, Book, Languages, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { id: 'ALL', label: 'All Languages' },
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'Hindi (हिंदी)' },
  { id: 'Hinglish', label: 'Hinglish' },
  { id: 'Marathi', label: 'Marathi (मराठी)' },
  { id: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { id: 'Bengali', label: 'Bengali (বাংলা)' },
  { id: 'Tamil', label: 'Tamil (தமிழ்)' },
  { id: 'Spanish', label: 'Spanish' },
  { id: 'French', label: 'French' },
];

export default function ExploreWritingPage() {
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentType, setContentType] = useState('ALL'); // ALL | STORY | POEM | BLOG | DIARY
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorks, setTotalWorks] = useState(0);

  const fetchWorks = async () => {
    try {
      setIsLoading(true);
      const res = await workService.getExploreWorks({
        contentType: contentType === 'ALL' ? undefined : contentType,
        language: languageFilter === 'ALL' ? undefined : languageFilter,
        search: search || undefined,
        page,
        limit: 9,
      });
      const data = res.data.data;
      setWorks(data.works || []);
      setTotalPages(data.totalPages || 1);
      setTotalWorks(data.totalWorks || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load writings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [contentType, languageFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWorks();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-accent to-amber-500 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Creative Publishing Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
              Explore Stories, Poems & Blogs
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-lg leading-relaxed font-sans">
              Discover original stories, poetry stanzas, insightful blogs, and public diaries written by community authors across multiple languages.
            </p>
          </div>

          <Link
            to="/studio"
            className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/95 font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm shadow-lg shrink-0 transition-all cursor-pointer"
          >
            <Feather className="w-4 h-4" /> Writing Studio
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 bg-secondary/15 p-3.5 rounded-2xl border border-glass-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Content Type Filter Pills */}
          <div className="flex bg-secondary/35 p-1 rounded-full gap-1 w-fit max-w-full overflow-x-auto border border-glass-border/30">
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
                  setContentType(tab.id);
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                  contentType === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or topic..."
              className="pl-9 border-glass-border rounded-xl h-9 text-xs"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Language Filter Selector Row */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 shrink-0">
            <Languages className="w-3.5 h-3.5 text-primary" /> Language:
          </span>
          <div className="flex items-center gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguageFilter(lang.id);
                  setPage(1);
                }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border',
                  languageFilter === lang.id
                    ? 'bg-card text-primary font-bold border-primary/40 shadow-sm'
                    : 'border-glass-border/30 text-muted-foreground hover:text-foreground'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Works Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-glass-border p-8 text-muted-foreground space-y-2">
          <Feather className="w-10 h-10 mx-auto opacity-50" />
          <p className="font-bold text-base text-foreground">No published writings found</p>
          <p className="text-xs text-muted-foreground">Be the first to publish a work in this category or language!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.map((work) => (
            <Card
              key={work._id}
              className="border-glass-border bg-card/85 glass-card shadow-sm hover:shadow-md rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Badge className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-none px-2.5 py-0.5 rounded-full">
                      {work.contentType}
                    </Badge>
                    {work.language && (
                      <Badge variant="outline" className="text-[10px] font-semibold border-glass-border px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Languages className="w-3 h-3 text-primary" /> {work.language}
                      </Badge>
                    )}
                  </div>

                  <span className="text-[10px] text-muted-foreground font-bold">
                    {work.stats?.totalWordCount || 0} words
                  </span>
                </div>

                <h3 className="font-extrabold text-base sm:text-lg font-display text-foreground leading-snug line-clamp-2">
                  {work.title}
                </h3>

                {work.summary ? (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-sans">
                    {work.summary}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic line-clamp-3 font-serif">
                    "{work.chapters && work.chapters[0]?.content ? work.chapters[0].content.slice(0, 110) + '...' : ''}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-glass-border space-y-3">
                {/* Author Info */}
                <div className="flex items-center justify-between text-xs">
                  <Link to={`/profile/${work.author?.username}`} className="flex items-center gap-2 group min-w-0">
                    <Avatar src={work.author?.avatar} name={work.author?.name} size="xs" />
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {work.author?.penName || work.author?.name}
                    </span>
                  </Link>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3 text-primary" /> {work.stats?.views || 0}</span>
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-500 fill-red-500" /> {work.stats?.likesCount || 0}</span>
                  </div>
                </div>

                <Link
                  to={`/read/${work._id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read Work
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-glass-border pt-4 px-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl text-xs font-semibold gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <span className="text-xs font-bold text-muted-foreground">
            Page {page} of {totalPages} ({totalWorks} writings)
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl text-xs font-semibold gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
