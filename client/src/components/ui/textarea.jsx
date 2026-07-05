import { cn } from '@/lib/utils';

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-2xl border px-5 py-3 text-sm transition-all duration-200 outline-none resize-y',
        'glass-input placeholder:text-muted-foreground/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-destructive focus-visible:ring-destructive/25'
          : '',
        className
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}
