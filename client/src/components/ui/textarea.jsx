import { cn } from '@/lib/utils';

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1C1A17]',
        'placeholder:text-[#8A7F74]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]/30 focus-visible:border-[#8B4513]/50',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F0E8]',
        'transition-colors duration-150 resize-y',
        error
          ? 'border-[#C0392B] focus-visible:ring-[#C0392B]/30'
          : 'border-[#DDD4C4] hover:border-[#C4BAA8]',
        className
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}
