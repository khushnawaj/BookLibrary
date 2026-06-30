import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Import } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { createBook, selectBooksLoading } from '@/features/books/booksSlice';
import { addToLibrary } from '@/features/library/librarySlice';
import { BookForm } from '@/components/common/BookForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES, SHELF_TYPES } from '@/constants';
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SHELF_OPTIONS = [
  { value: SHELF_TYPES.WISHLIST, label: 'Wishlist' },
  { value: SHELF_TYPES.READING, label: 'Currently Reading' },
  { value: SHELF_TYPES.READ, label: 'Already Read' },
  { value: SHELF_TYPES.DROPPED, label: 'Dropped' },
];

export default function AddBookPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectBooksLoading);
  const [shelfType, setShelfType] = useState(SHELF_TYPES.WISHLIST);

  const handleSubmit = async (data) => {
    const toastId = toast.loading('Adding book…');

    // Step 1: Create the book record
    const bookResult = await dispatch(createBook(data));
    if (!createBook.fulfilled.match(bookResult)) {
      toast.error(bookResult.payload || 'Failed to create book', { id: toastId });
      return;
    }

    const newBook = bookResult.payload.data?.book;

    // Step 2: Add to library on selected shelf
    if (newBook?._id) {
      const libResult = await dispatch(
        addToLibrary({ book: newBook._id, shelfType })
      );
      if (!addToLibrary.fulfilled.match(libResult)) {
        // Book was created — soft warn
        toast.success('Book added! (Shelf assignment failed — check library)', {
          id: toastId,
        });
        navigate(ROUTES.LIBRARY);
        return;
      }
    }

    toast.success('Book added to your library!', { id: toastId });
    navigate(ROUTES.LIBRARY);
  };

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            id="add-book-back"
            className="shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Badge variant="secondary" className="mb-1 text-[10px]">New Book</Badge>
            <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight leading-tight">Add a Book</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
              Fill in the details or search to auto-fill.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.LIBRARY_IMPORT)}
          className="gap-2 w-full sm:w-auto rounded-xl cursor-pointer text-xs sm:text-sm h-9"
        >
          <Import className="h-3.5 w-3.5 shrink-0" />
          <span>Import (CSV / JSON)</span>
        </Button>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 sm:p-8"
      >
        {/* Shelf selector */}
        <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label className="text-sm font-semibold">Add to Shelf</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose which shelf this book goes on.
              </p>
            </div>
            <Select value={shelfType} onValueChange={setShelfType}>
              <SelectTrigger className="w-full sm:w-52 h-9 text-sm" id="shelf-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHELF_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <BookForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Add to Library"
        />
      </motion.div>
    </div>
  );
}
