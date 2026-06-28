import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/hooks/useAppStore';
import { updateLibraryEntry } from '@/features/library/librarySlice';
import toast from 'react-hot-toast';

const SHELF_LABELS = {
  READ: { label: 'Read', color: 'bg-success/20 text-success' },
  READING: { label: 'Reading', color: 'bg-primary/20 text-primary' },
  WISHLIST: { label: 'Wishlist', color: 'bg-mint/20 text-mint' },
  DROPPED: { label: 'Dropped', color: 'bg-destructive/20 text-destructive' },
};

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

export function BookCard({ entry, onEdit, onDelete }) {
  const dispatch = useAppDispatch();
  const book = entry?.book ?? entry;
  const shelfInfo = entry?.shelfType ? SHELF_LABELS[entry.shelfType] : null;
  const [imgError, setImgError] = useState(false);

  const handleShelfChange = async (newShelf) => {
    try {
      await dispatch(updateLibraryEntry({ id: entry._id, data: { shelfType: newShelf } })).unwrap();
      toast.success(`Moved to ${SHELF_LABELS[newShelf].label}`);
    } catch (err) {
      toast.error(err || 'Failed to update shelf');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card group overflow-hidden"
    >
      {/* Cover */}
      <Link to={`/library/${entry._id}`} className="block">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#EDE6D8]">
          {book?.coverImage && !imgError ? (
            <img
              src={book.coverImage}
              alt={book?.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3
                            bg-gradient-to-br from-[#D4C5A9] via-[#C8B896] to-[#B8A87A]">
              {/* Book spine decoration */}
              <div className="w-16 h-20 rounded-sm bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                <BookOpen className="h-8 w-8 text-white/70" />
              </div>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">No Cover</p>
            </div>
          )}
          {shelfInfo && (
            <span
              className={cn(
                'absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm',
                shelfInfo.color
              )}
            >
              {shelfInfo.label}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4">
        <Link to={`/library/${entry._id}`} className="block">
          <h3 className="line-clamp-1 font-semibold leading-snug hover:text-mint transition-colors">
            {book?.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {book?.author}
          </p>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {book?.genre && (
              <Badge variant="secondary" className="text-xs">
                {book.genre}
              </Badge>
            )}
            {entry?.rating && <StarRating rating={entry.rating} />}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                id={`book-menu-${entry._id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link to={`/library/${entry._id}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(entry)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Book
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Change Shelf
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44">
                    <DropdownMenuItem onClick={() => handleShelfChange('READING')}>
                      📖 Reading
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShelfChange('READ')}>
                      ✅ Read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShelfChange('WISHLIST')}>
                      📋 Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShelfChange('DROPPED')}>
                      🚫 Dropped
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(entry)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

export function BookListItem({ entry, onEdit, onDelete }) {
  const dispatch = useAppDispatch();
  const book = entry?.book ?? entry;
  const shelfInfo = entry?.shelfType ? SHELF_LABELS[entry.shelfType] : null;
  const [imgError, setImgError] = useState(false);

  const handleShelfChange = async (newShelf) => {
    try {
      await dispatch(updateLibraryEntry({ id: entry._id, data: { shelfType: newShelf } })).unwrap();
      toast.success(`Moved to ${SHELF_LABELS[newShelf].label}`);
    } catch (err) {
      toast.error(err || 'Failed to update shelf');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:bg-card"
    >
      {/* Thumbnail */}
      <Link to={`/library/${entry._id}`} className="shrink-0">
        <div className="h-16 w-12 overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-accent/30">
          {book?.coverImage && !imgError ? (
            <img
              src={book.coverImage}
              alt={book?.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary/40" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link to={`/library/${entry._id}`}>
          <p className="truncate font-semibold hover:text-mint transition-colors">
            {book?.title}
          </p>
        </Link>
        <p className="text-sm text-muted-foreground truncate">{book?.author}</p>
        <div className="mt-1 flex items-center gap-2">
          {book?.genre && (
            <Badge variant="secondary" className="text-xs">
              {book.genre}
            </Badge>
          )}
          {entry?.rating && <StarRating rating={entry.rating} />}
        </div>
      </div>

      {/* Shelf + actions */}
      <div className="flex shrink-0 items-center gap-2">
        {shelfInfo && (
          <span
            className={cn(
              'hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block',
              shelfInfo.color
            )}
          >
            {shelfInfo.label}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link to={`/library/${entry._id}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(entry)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Book
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderOpen className="mr-2 h-4 w-4" />
                Change Shelf
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-44">
                  <DropdownMenuItem onClick={() => handleShelfChange('READING')}>
                    📖 Reading
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShelfChange('READ')}>
                    ✅ Read
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShelfChange('WISHLIST')}>
                    📋 Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShelfChange('DROPPED')}>
                    🚫 Dropped
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(entry)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
