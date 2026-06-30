import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  Library,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchLibraryEntries,
  removeFromLibrary,
  setLibraryFilters,
  setLibraryPage,
  selectLibraryEntries,
  selectLibraryFetching,
  selectLibraryPagination,
  selectLibraryFilters,
} from '@/features/library/librarySlice';
import { BookCard, BookListItem } from '@/components/common/BookCard';
import { BookShelfView } from '@/components/common/BookShelfView';
import { BookCardSkeleton, BookListSkeleton } from '@/components/common/Skeletons';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

const SHELF_OPTIONS = [
  { value: '', label: 'All Shelves' },
  { value: 'READ', label: 'Read' },
  { value: 'READING', label: 'Reading' },
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'DROPPED', label: 'Dropped' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'rating', label: 'Rating' },
];

export default function LibraryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const entries = useAppSelector(selectLibraryEntries);
  const isFetching = useAppSelector(selectLibraryFetching);
  const pagination = useAppSelector(selectLibraryPagination);
  const filters = useAppSelector(selectLibraryFilters);

  const [viewMode, setViewMode] = useState('grid');
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search to Redux filters
  useEffect(() => {
    dispatch(setLibraryFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  // Fetch whenever filters or page changes
  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.shelfType && { shelfType: filters.shelfType }),
      ...(filters.sort && { sort: filters.sort }),
    };
    dispatch(fetchLibraryEntries(params));
  }, [dispatch, pagination.page, filters.search, filters.shelfType, filters.sort, pagination.limit]);

  const handleShelfChange = (value) => {
    dispatch(setLibraryFilters({ shelfType: value === 'all' ? '' : value }));
  };

  const handleSortChange = (value) => {
    dispatch(setLibraryFilters({ sort: value === 'default' ? '' : value }));
  };

  const handleEdit = (entry) => {
    navigate(`/library/${entry._id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading('Deleting book…');
    const result = await dispatch(removeFromLibrary(deleteTarget._id));
    if (removeFromLibrary.fulfilled.match(result)) {
      toast.success('Book removed from library', { id: toastId });
    } else {
      toast.error(result.payload || 'Delete failed', { id: toastId });
    }
    setDeleteTarget(null);
  };

  const clearSearch = () => {
    setSearchInput('');
    dispatch(setLibraryFilters({ search: '' }));
  };

  const hasActiveFilters = filters.search || filters.shelfType || filters.sort;
  const skeletonCount = viewMode === 'list' ? 5 : 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2">Library</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">My Library</h1>
          <p className="mt-1 text-muted-foreground">
            {pagination.total > 0
              ? `${pagination.total} book${pagination.total !== 1 ? 's' : ''} in your collection`
              : 'Manage your personal book collection'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.ROUTES?.LIBRARY_IMPORT || ROUTES.LIBRARY_IMPORT}>
              Import
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={ROUTES.LIBRARY_ADD}>
              <Plus className="h-4 w-4 shrink-0" />
              Add Book
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="library-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, author, genre…"
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <Select
            value={filters.shelfType || 'all'}
            onValueChange={handleShelfChange}
          >
            <SelectTrigger className="flex-1 sm:flex-initial sm:w-36" id="library-shelf-filter">
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHELF_OPTIONS.map((o) => (
                <SelectItem key={o.value || 'all'} value={o.value || 'all'}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sort || 'default'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="flex-1 sm:flex-initial sm:w-36" id="library-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value || 'default'} value={o.value || 'default'}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-secondary/5 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              id="view-grid"
              title="Grid View"
              className={cn(
                'rounded-md p-1.5 transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('shelf')}
              id="view-shelf"
              title="Shelf View"
              className={cn(
                'rounded-md p-1.5 transition-colors cursor-pointer',
                viewMode === 'shelf'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              <Library className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              id="view-list"
              title="List View"
              className={cn(
                'rounded-md p-1.5 transition-colors cursor-pointer',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="gap-1">
              Search: "{filters.search}"
              <button onClick={clearSearch}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.shelfType && (
            <Badge variant="outline" className="gap-1">
              {SHELF_OPTIONS.find((o) => o.value === filters.shelfType)?.label}
              <button onClick={() => dispatch(setLibraryFilters({ shelfType: '' }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {isFetching ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'list'
                ? 'space-y-3'
                : 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            }
          >
            {Array.from({ length: skeletonCount }).map((_, i) =>
              viewMode === 'list' ? (
                <BookListSkeleton key={i} />
              ) : (
                <BookCardSkeleton key={i} />
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
              title={hasActiveFilters ? 'No results found' : 'No books yet'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Start building your library. Add your first book!'
              }
              animation="empty"
              action={
                !hasActiveFilters && (
                  <Button asChild>
                    <Link to={ROUTES.LIBRARY_ADD}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first book
                    </Link>
                  </Button>
                )
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : viewMode === 'shelf'
                ? 'w-full'
                : 'space-y-3'
            }
          >
            {viewMode === 'shelf' ? (
              <BookShelfView
                entries={entries}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ) : (
              entries.map((entry) =>
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
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!isFetching && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => dispatch(setLibraryPage(p))}
          className="mt-6"
        />
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Library?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{' '}
              <strong>{deleteTarget?.book?.title ?? 'this book'}</strong> from your library.
              The book record itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="delete-confirm"
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
