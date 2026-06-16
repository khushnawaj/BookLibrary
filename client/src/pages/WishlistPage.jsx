import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchLibraryEntries,
  removeFromLibrary,
  setLibraryFilters,
  selectLibraryEntries,
  selectLibraryFetching,
  selectLibraryPagination,
} from '@/features/library/librarySlice';
import { BookCard, BookListItem } from '@/components/common/BookCard';
import { BookCardSkeleton, BookListSkeleton } from '@/components/common/Skeletons';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const entries = useAppSelector(selectLibraryEntries);
  const isFetching = useAppSelector(selectLibraryFetching);
  const pagination = useAppSelector(selectLibraryPagination);

  const [viewMode, setViewMode] = useState('grid');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Set active filter to only show WISHLIST books
  useEffect(() => {
    dispatch(setLibraryFilters({ shelfType: 'WISHLIST' }));
  }, [dispatch]);

  // Fetch whenever page changes (but ensure filters stay pinned to WISHLIST)
  useEffect(() => {
    dispatch(
      fetchLibraryEntries({
        page: 1,
        limit: 100, // retrieve wishlist items together
        shelfType: 'WISHLIST',
      })
    );
  }, [dispatch]);

  const handleEdit = (entry) => {
    navigate(`/library/${entry._id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading('Removing book…');
    const result = await dispatch(removeFromLibrary(deleteTarget._id));
    if (removeFromLibrary.fulfilled.match(result)) {
      toast.success('Book removed from wishlist', { id: toastId });
    } else {
      toast.error(result.payload || 'Remove failed', { id: toastId });
    }
    setDeleteTarget(null);
  };

  const skeletonCount = viewMode === 'grid' ? 12 : 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-[#8B4513]/10 text-[#8B4513] border-none font-medium">
            Wishlist
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1C1A17]">Wishlist</h1>
          <p className="mt-1 text-[#8A7F74]">
            {entries.length > 0
              ? `${entries.length} book${entries.length !== 1 ? 's' : ''} you plan to read`
              : 'Keep track of the books you want to read next'}
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-[#DDD4C4] bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#F5F0E8] text-[#8B4513]'
                    : 'text-[#8A7F74] hover:text-[#1C1A17]'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#F5F0E8] text-[#8B4513]'
                    : 'text-[#8A7F74] hover:text-[#1C1A17]'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isFetching ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'space-y-3'
            }
          >
            {Array.from({ length: skeletonCount }).map((_, i) =>
              viewMode === 'grid' ? (
                <BookCardSkeleton key={i} />
              ) : (
                <BookListSkeleton key={i} />
              )
            )}
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              title="Your wishlist is empty"
              description="Books you tag as 'Wishlist' in your library or search will show up here."
              animation="empty"
            />
          </motion.div>
        ) : (
          <motion.div
            key="list-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'space-y-3'
            }
          >
            {entries.map((entry) =>
              viewMode === 'grid' ? (
                <BookCard
                  key={entry._id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ) : (
                <BookListItem
                  key={entry._id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-[#DDD4C4] bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1C1A17] font-semibold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8A7F74] mt-2">
              This will remove <span className="font-semibold text-[#1C1A17]">"{deleteTarget?.book?.title}"</span> from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-[#DDD4C4] text-[#3D3530] hover:bg-[#F5F0E8] rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
            >
              Remove Book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
