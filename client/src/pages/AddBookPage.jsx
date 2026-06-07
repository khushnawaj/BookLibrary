import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
  { value: SHELF_TYPES.WISHLIST, label: '📋 Wishlist' },
  { value: SHELF_TYPES.READING, label: '📖 Currently Reading' },
  { value: SHELF_TYPES.READ, label: '✅ Already Read' },
  { value: SHELF_TYPES.DROPPED, label: '🚫 Dropped' },
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          id="add-book-back"
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <Badge variant="secondary" className="mb-1">New Book</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">Add a Book</h1>
          <p className="mt-1 text-muted-foreground">
            Fill in the details below to add a book to your collection.
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8"
      >
        {/* Shelf selector — shown above form */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex-1">
            <Label className="text-sm font-medium">Add to Shelf</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose which shelf this book goes on.
            </p>
          </div>
          <Select value={shelfType} onValueChange={setShelfType}>
            <SelectTrigger className="w-52" id="shelf-selector">
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

        <BookForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Add to Library"
        />
      </motion.div>
    </div>
  );
}
