import { cn } from '@/lib/utils';

export function Input({ className, type = 'text', error, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border px-3.5 py-2 text-sm transition-all duration-200 outline-none',
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

