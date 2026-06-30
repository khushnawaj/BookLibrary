import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/hooks/useAppStore';
import { updateLibraryEntry } from '@/features/library/librarySlice';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const SHELF_LABELS = {
  READ: { label: 'Read', color: 'bg-success/20 text-success border-success/30' },
  READING: { label: 'Reading', color: 'bg-primary/20 text-primary border-primary/30' },
  WISHLIST: { label: 'Wishlist', color: 'bg-mint/20 text-mint border-mint/30' },
  DROPPED: { label: 'Dropped', color: 'bg-destructive/20 text-destructive border-destructive/30' },
};

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-2.5 w-2.5',
            i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function ShelfBook({ entry, index, onEdit, onDelete }) {
  const dispatch = useAppDispatch();
  const book = entry?.book ?? entry;
  const shelfInfo = entry?.shelfType ? SHELF_LABELS[entry.shelfType] : null;
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Deterministic tilt angle to make it feel natural
  const angles = [-1.5, 2, -0.5, 1, -2, 0.5];
  const tilt = angles[index % angles.length];

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Hover Tooltip Card ── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-3 w-48 p-3 rounded-xl border border-glass-border bg-card/95 glass-card shadow-xl z-50 pointer-events-auto user-menu-dropdown"
            style={{ originX: 0.5, originY: 1 }}
          >
            {/* Invisible cursor bridge to prevent mouse-leave jitter */}
            <div className="absolute top-full left-0 right-0 h-4 bg-transparent pointer-events-auto" />

            <Link to={`/library/${entry._id}`} className="block text-left">
              <p className="font-bold text-xs text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors">
                {book?.title}
              </p>
              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                {book?.author}
              </p>
            </Link>

            <div className="mt-2 flex items-center justify-between gap-1.5 flex-wrap">
              {shelfInfo && (
                <Badge variant="outline" className={cn('text-[9px] px-1 py-0 border font-medium', shelfInfo.color)}>
                  {shelfInfo.label}
                </Badge>
              )}
              {entry?.rating && <StarRating rating={entry.rating} />}
            </div>

            <div className="mt-2 pt-2 border-t border-glass-border/30 flex items-center justify-between">
              <Link
                to={`/library/${entry._id}`}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <BookOpen className="w-3 h-3" /> View
              </Link>

              <div className="flex gap-1.5">
                <button
                  onClick={() => onEdit?.(entry)}
                  className="p-1 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Edit Book"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete?.(entry)}
                  className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete Book"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Standing 3D Book Cover ── */}
      <Link to={`/library/${entry._id}`} className="relative block focus:outline-none">
        <motion.div
          animate={{
            scale: hovered ? 1.03 : 1,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={cn(
            "relative w-14 sm:w-20 md:w-24 aspect-[2/3] rounded-sm overflow-hidden bg-[#EDE6D8] cursor-pointer shadow-lg origin-bottom",
            "border border-black/10"
          )}
          style={{
            // 3D book cover depth shading
            boxShadow: hovered 
              ? '0 15px 25px -5px rgba(0,0,0,0.45), 0 8px 10px -6px rgba(0,0,0,0.3)' 
              : '0 8px 12px -3px rgba(0,0,0,0.35), 0 4px 6px -4px rgba(0,0,0,0.2)'
          }}
        >
          {book?.coverImage && !imgError ? (
            <img
              src={book.coverImage}
              alt={book?.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5
                            bg-gradient-to-br from-[#D4C5A9] via-[#C8B896] to-[#B8A87A] p-1">
              <BookOpen className="h-4 w-4 text-white/50" />
              <p className="text-[8px] text-white/80 font-bold uppercase tracking-wider text-center line-clamp-2">
                {book?.title}
              </p>
            </div>
          )}

          {/* Left Spine Overlay Highlight */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none" />

          {/* Right Page Edge Overlay highlight */}
          <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-black/10 pointer-events-none" />
        </motion.div>
      </Link>
    </div>
  );
}

export function BookShelfView({ entries, onEdit, onDelete }) {
  // Helper to chunk entries into rows of 6
  const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const shelfRows = chunk(entries, 6);

  return (
    <div className="w-full flex flex-col py-6">
      {shelfRows.map((row, rowIndex) => (
        <div key={rowIndex} className="relative mb-14 last:mb-6 pt-6">
          {/* Books row */}
          <div className="flex items-end justify-center px-4 gap-4 sm:gap-6 min-h-[110px] sm:min-h-[140px] pb-1.5 z-10 relative">
            {row.map((entry, index) => (
              <ShelfBook
                key={entry._id}
                entry={entry}
                index={rowIndex * 6 + index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Wooden Shelf Plank */}
          <div
            className="h-4 w-full rounded-md relative z-0"
            style={{
              background: 'linear-gradient(to bottom, #a16207, #713f12)',
              borderTop: '2px solid #ca8a04',
              boxShadow: '0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* 3D bottom shadow and bevel */}
            <div className="absolute top-full left-0 right-0 h-1.5 bg-[#451a03] rounded-b-md opacity-90 shadow-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
