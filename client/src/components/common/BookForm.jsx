import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { bookSchema } from '@/schemas/book.schema';
import { googleBooksService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/common/ImageUpload';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery',
  'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Self-Help',
  'Business', 'Technology', 'Science', 'Philosophy', 'Psychology',
  'Poetry', 'Drama', 'Graphic Novel', 'Children', 'Young Adult', 'Other',
];

const pickGenre = (genre = '') => {
  const normalized = genre.toLowerCase();
  return GENRES.find((genre) => normalized.includes(genre.toLowerCase())) || '';
};

function FieldError({ error }) {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1 text-xs text-destructive"
    >
      {error.message}
    </motion.p>
  );
}

function FormGroup({ label, required, error, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      <FieldError error={error} />
    </div>
  );
}

export function BookForm({ onSubmit, defaultValues, isLoading, submitLabel = 'Save Book' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      publisher: '',
      publicationDate: '',
      isbn: '',
      genre: '',
      language: 'English',
      pages: undefined,
      coverImage: '',
      description: '',
      purchaseLinks: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchaseLinks',
  });

  // Re-seed form when defaultValues change (edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset({
        title: '',
        author: '',
        publisher: '',
        publicationDate: '',
        isbn: '',
        genre: '',
        language: 'English',
        pages: undefined,
        coverImage: '',
        description: '',
        purchaseLinks: [],
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  const handleGoogleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsGoogleLoading(true);
    setGoogleError('');

    try {
      const response = await googleBooksService.search(query);
      setGoogleResults(response.data?.data?.books || []);
    } catch (error) {
      setGoogleResults([]);
      setGoogleError(error.response?.data?.message || 'Could not search Google Books');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const applyGoogleBook = (book) => {
    const mapped = {
      title: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
      publicationDate: book.publicationDate || '',
      isbn: book.isbn || '',
      genre: pickGenre(book.genre),
      language: book.language || 'English',
      pages: book.pages || undefined,
      coverImage: book.coverImage || '',
      description: book.description || '',
    };

    Object.entries(mapped).forEach(([field, value]) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    });

    setGoogleResults([]);
    setSearchQuery(mapped.title);
  };

  const processSubmit = (data) => {
    const clean = {
      ...data,
      pages: data.pages ? Number(data.pages) : undefined,
      publicationDate: data.publicationDate || undefined,
      isbn: data.isbn || undefined,
      coverImage: data.coverImage || undefined,
      purchaseLinks: data.purchaseLinks?.filter((l) => l.platform && l.url) ?? [],
    };
    onSubmit(clean);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-5" noValidate>
      {/* ── Google Books Search ── */}
      <div className="space-y-3 rounded-xl border border-glass-border bg-glass/40 backdrop-blur-sm p-3 sm:p-4">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Quick Fill from Google Books
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="google-books-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleGoogleSearch();
                }
              }}
              placeholder="Search title, author, or ISBN"
              className="pl-9"
            />
          </div>
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery('');
                setGoogleResults([]);
                setGoogleError('');
              }}
              aria-label="Clear Google Books search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSearch}
            disabled={isGoogleLoading || !searchQuery.trim()}
            className="px-3 sm:min-w-24"
          >
            {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {googleError && <p className="text-xs text-destructive">{googleError}</p>}

        {googleResults.length > 0 && (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {googleResults.slice(0, 6).map((book) => {
              return (
                <button
                  key={book.googleBooksId}
                  type="button"
                  onClick={() => applyGoogleBook(book)}
                  className="flex min-h-24 gap-3 rounded-xl border border-glass-border bg-glass/60 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/10 text-foreground"
                >
                  <div className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {book.title || 'Untitled book'}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {book.author || 'Unknown author'}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {[book.publisher, book.publicationDate].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Core Info ── */}
      <div>
        <p className="mb-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Book Details</p>
        <div className="grid gap-4 sm:grid-cols-2">
        <FormGroup label="Title" required error={errors.title} className="sm:col-span-2">
          <Input
            {...register('title')}
            placeholder="e.g. The Great Gatsby"
            className={cn(errors.title && 'border-destructive')}
            id="book-title"
          />
        </FormGroup>

        <FormGroup label="Author" required error={errors.author}>
          <Input
            {...register('author')}
            placeholder="e.g. F. Scott Fitzgerald"
            id="book-author"
          />
        </FormGroup>

        <FormGroup label="Publisher" error={errors.publisher}>
          <Input
            {...register('publisher')}
            placeholder="e.g. Scribner"
            id="book-publisher"
          />
        </FormGroup>

        <FormGroup label="Genre" error={errors.genre}>
          <Controller
            name="genre"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger id="book-genre">
                  <SelectValue placeholder="Select genre…" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormGroup>

        <FormGroup label="Language" error={errors.language}>
          <Input
            {...register('language')}
            placeholder="e.g. English"
            id="book-language"
          />
        </FormGroup>

        <FormGroup label="Publication Date" error={errors.publicationDate}>
          <Input
            type="date"
            {...register('publicationDate')}
            id="book-pub-date"
          />
        </FormGroup>

        <FormGroup label="Pages" error={errors.pages}>
          <Input
            type="number"
            {...register('pages', { valueAsNumber: true })}
            placeholder="e.g. 320"
            min={1}
            id="book-pages"
          />
        </FormGroup>

        <FormGroup label="ISBN" error={errors.isbn}>
          <Input
            {...register('isbn')}
            placeholder="e.g. 978-3-16-148410-0"
            id="book-isbn"
          />
        </FormGroup>
        </div>
      </div>

      {/* Cover Image */}
      <FormGroup label="Cover Image" error={errors.coverImage}>
        <Controller
          name="coverImage"
          control={control}
          render={({ field }) => (
            <ImageUpload 
              value={field.value} 
              onChange={field.onChange} 
            />
          )}
        />
      </FormGroup>

      {/* Description */}
      <FormGroup label="Description" error={errors.description}>
        <Textarea
          {...register('description')}
          placeholder="A brief description of the book…"
          rows={4}
          id="book-description"
        />
      </FormGroup>

      {/* ── Purchase Links ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Purchase Links</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ platform: '', url: '' })}
            disabled={fields.length >= 10}
            id="add-purchase-link"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Link
          </Button>
        </div>

        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row gap-2 sm:items-center py-1"
            >
              <div className="flex gap-2 w-full sm:flex-1">
                <Input
                  {...register(`purchaseLinks.${index}.platform`)}
                  placeholder="Platform"
                  className="w-[38%] sm:w-auto sm:flex-none"
                />
                <Input
                  {...register(`purchaseLinks.${index}.url`)}
                  placeholder="https://…"
                  className="flex-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-3 border-t border-glass-border">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto sm:min-w-[160px] h-10 text-sm font-semibold"
          id="book-form-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
