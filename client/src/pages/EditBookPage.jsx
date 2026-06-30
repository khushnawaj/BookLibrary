import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, BookOpen, Check, Ban, Library } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchLibraryEntryById,
  updateLibraryEntry,
  selectSelectedEntry,
  selectLibraryLoading,
  clearSelectedEntry,
} from '@/features/library/librarySlice';
import {
  updateBook,
  selectBooksLoading,
} from '@/features/books/booksSlice';
import { BookForm } from '@/components/common/BookForm';
import { BookCardSkeleton } from '@/components/common/Skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES, SHELF_TYPES } from '@/constants';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { libraryEntrySchema } from '@/schemas/book.schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const SHELF_OPTIONS = [
  { value: SHELF_TYPES.WISHLIST, label: 'Wishlist', icon: Bookmark },
  { value: SHELF_TYPES.READING, label: 'Currently Reading', icon: BookOpen },
  { value: SHELF_TYPES.READ, label: 'Already Read', icon: Check },
  { value: SHELF_TYPES.DROPPED, label: 'Dropped', icon: Ban },
];

function LibraryDetailsForm({ entry, onSave, isSaving }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(libraryEntrySchema),
    defaultValues: {
      shelfType: entry?.shelfType ?? SHELF_TYPES.WISHLIST,
      rating: entry?.rating ?? undefined,
      notes: entry?.notes ?? '',
      review: entry?.review ?? '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSave({
          shelfType: data.shelfType,
          rating: data.rating ? Number(data.rating) : null,
          notes: data.notes,
          review: data.review,
        })
      )}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Shelf</Label>
          <Controller
            name="shelfType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="edit-shelf">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHELF_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex items-center gap-2">
                        <o.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{o.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Rating (1–5)</Label>
          <Input
            type="number"
            min={1}
            max={5}
            step={1}
            {...register('rating', { valueAsNumber: true })}
            placeholder="e.g. 4"
            id="edit-rating"
          />
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes (private)</Label>
        <Textarea {...register('notes')} rows={3} placeholder="Personal notes…" id="edit-notes" />
      </div>

      <div className="space-y-1.5">
        <Label>Review</Label>
        <Textarea {...register('review')} rows={3} placeholder="Your review…" id="edit-review" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} id="save-library-details">
          Save Library Details
        </Button>
      </div>
    </form>
  );
}

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const entry = useAppSelector(selectSelectedEntry);
  const isLibraryLoading = useAppSelector(selectLibraryLoading);
  const isBooksLoading = useAppSelector(selectBooksLoading);

  useEffect(() => {
    dispatch(fetchLibraryEntryById(id));
    return () => { dispatch(clearSelectedEntry()); };
  }, [id, dispatch]);

  const book = entry?.book;

  const handleBookUpdate = async (data) => {
    if (!book?._id) return;
    const toastId = toast.loading('Updating book info…');
    const result = await dispatch(updateBook({ id: book._id, data }));
    if (updateBook.fulfilled.match(result)) {
      toast.success('Book updated!', { id: toastId });
    } else {
      toast.error(result.payload || 'Update failed', { id: toastId });
    }
  };

  const handleLibraryUpdate = async (data) => {
    const toastId = toast.loading('Updating library entry…');
    const result = await dispatch(updateLibraryEntry({ id, data }));
    if (updateLibraryEntry.fulfilled.match(result)) {
      toast.success('Library details saved!', { id: toastId });
      navigate(`/library/${id}`);
    } else {
      toast.error(result.payload || 'Update failed', { id: toastId });
    }
  };

  if (isLibraryLoading && !entry) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!entry && !isLibraryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold">Entry not found</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.LIBRARY)}>
          Back to Library
        </Button>
      </div>
    );
  }

  const bookDefaults = book
    ? {
        title: book.title,
        author: book.author,
        publisher: book.publisher ?? '',
        publicationDate: book.publicationDate
          ? new Date(book.publicationDate).toISOString().split('T')[0]
          : '',
        isbn: book.isbn ?? '',
        genre: book.genre ?? '',
        language: book.language ?? 'English',
        pages: book.pages ?? undefined,
        coverImage: book.coverImage ?? '',
        description: book.description ?? '',
        purchaseLinks: book.purchaseLinks ?? [],
      }
    : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} id="edit-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <Badge variant="secondary" className="mb-1">Edit</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {book?.title ?? 'Edit Book'}
          </h1>
          <p className="mt-1 text-muted-foreground">Update book info or library details below.</p>
        </div>
      </motion.div>

      {/* Book Info Form */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6 sm:p-8"
      >
        <h2 className="mb-6 text-lg font-semibold border-b border-border pb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary shrink-0" />
          <span>Book Information</span>
        </h2>
        <BookForm
          defaultValues={bookDefaults}
          onSubmit={handleBookUpdate}
          isLoading={isBooksLoading}
          submitLabel="Update Book Info"
        />
      </motion.section>

      {/* Library Entry Form */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8"
      >
        <h2 className="mb-6 text-lg font-semibold border-b border-border pb-3 flex items-center gap-2">
          <Library className="w-5 h-5 text-primary shrink-0" />
          <span>Library Details</span>
        </h2>
        <LibraryDetailsForm
          entry={entry}
          onSave={handleLibraryUpdate}
          isSaving={isLibraryLoading}
        />
      </motion.section>
    </div>
  );
}
