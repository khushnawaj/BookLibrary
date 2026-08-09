import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, Star, Clock, Feather, PenTool, Book, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES = {
  POETRY: { bg: 'bg-amber-500 text-white', label: 'Poetry' },
  FICTION: { bg: 'bg-emerald-600 text-white', label: 'Fiction' },
  STORY: { bg: 'bg-blue-600 text-white', label: 'Story' },
  BLOG: { bg: 'bg-purple-600 text-white', label: 'Article' },
  DIARY: { bg: 'bg-rose-600 text-white', label: 'Diary' },
  ESSAY: { bg: 'bg-indigo-600 text-white', label: 'Essay' },
};

export function CreativeWorkCard({ work, className }) {
  const [imageError, setImageError] = useState(false);

  if (!work) return null;

  const chapters = work.chapters || [];
  const hasMultipleChapters = chapters.length > 1;

  // Calculate dynamic reading time & rating
  const totalWords = chapters.reduce(
    (acc, ch) => acc + (ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0)),
    0
  );
  const readMinutes = Math.max(1, Math.ceil(totalWords / 200));

  const ratedChs = chapters.filter((c) => c.ratingsCount > 0);
  const avgRating = ratedChs.length > 0
    ? (ratedChs.reduce((acc, c) => acc + c.averageRating, 0) / ratedChs.length).toFixed(1)
    : null;

  const categoryType = (work.contentType || 'STORY').toUpperCase();
  const categoryStyle = CATEGORY_STYLES[categoryType] || {
    bg: 'bg-primary text-primary-foreground',
    label: work.genre || 'Story'
  };

  const formattedDate = work.createdAt ? format(new Date(work.createdAt), 'dd MMMM yyyy') : '';

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-lg border border-glass-border/60 bg-card/85 p-2 sm:p-2.5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer",
        className
      )}
    >
      <div className="space-y-2">
        {/* Cover Aspect ratio 2:3 */}
        <Link
          to={`/read/${work._id}`}
          className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-secondary/40 border border-glass-border/40 flex items-center justify-center"
        >
          {work.coverImage && !imageError ? (
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
                onError={() => setImageError(true)}
                className="relative z-10 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 flex flex-col items-center justify-between p-3 text-center transition-all duration-300 select-none">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mt-3 shadow-sm">
                {categoryType === 'POETRY' ? (
                  <Feather className="w-4 h-4" />
                ) : categoryType === 'BLOG' ? (
                  <PenTool className="w-4 h-4" />
                ) : categoryType === 'DIARY' ? (
                  <Book className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
              </div>

              <span className="text-xs font-bold font-display text-white/95 leading-snug line-clamp-3 px-1 my-auto">
                {work.title}
              </span>

              <div className="mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded">
                  {categoryType}
                </span>
              </div>
            </div>
          )}

          {/* Top-Left Category Badge (Exact Screenshot 2 styling) */}
          <div className="absolute top-1.5 left-1.5 z-20">
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm capitalize tracking-tight", categoryStyle.bg)}>
              {categoryStyle.label}
            </span>
          </div>

          {/* Conditional Bottom Cover Overlay: ONLY SHOW CHAPTER PARTS BADGE IF CHAPTERS > 1 */}
          {hasMultipleChapters && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-1.5 pt-4 text-white flex items-center justify-between pointer-events-none">
              <span className="bg-red-600/95 text-white font-extrabold px-1.5 py-0.5 rounded text-[9px] shadow-sm flex items-center gap-1">
                <Layers className="w-3 h-3" /> {chapters.length} parts
              </span>
              <span className="text-[9px] font-semibold text-white/90 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                <Clock className="w-3 h-3" /> {readMinutes}m
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/40">
            <span className="text-xs font-bold text-white bg-black/75 rounded-md px-3 py-1 shadow-md border border-white/20">
              Read →
            </span>
          </div>
        </Link>

        {/* Title & Author Info */}
        <div className="space-y-0.5 px-0.5">
          <Link to={`/read/${work._id}`}>
            <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors font-display">
              {work.title}
            </h4>
          </Link>
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="pt-1.5 border-t border-glass-border/30 flex items-center justify-between text-[11px] font-bold text-muted-foreground mt-1.5">
        <span className="flex items-center gap-1 text-[10.5px]">
          <Eye className="w-3.5 h-3.5 text-muted-foreground/70" />
          {work.stats?.views || 1}
        </span>

        {avgRating ? (
          <span className="flex items-center gap-1 text-amber-500 font-bold text-[10.5px]">
            <Star className="w-3 h-3 fill-amber-500" />
            {avgRating}
          </span>
        ) : (
          <span className="text-[9.5px] text-muted-foreground/70 font-medium">
            New
          </span>
        )}
      </div>
    </div>
  );
}
