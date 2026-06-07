import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { bookSchema } from '@/schemas/book.schema';
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
  const {
    register,
    handleSubmit,
    control,
    reset,
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
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6" noValidate>
      {/* Core Info */}
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

      {/* Purchase Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Purchase Links</Label>
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
              className="flex gap-2 overflow-hidden"
            >
              <Input
                {...register(`purchaseLinks.${index}.platform`)}
                placeholder="Platform (e.g. Amazon)"
                className="w-1/3"
              />
              <Input
                {...register(`purchaseLinks.${index}.url`)}
                placeholder="https://…"
                className="flex-1"
              />
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
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[140px]"
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
