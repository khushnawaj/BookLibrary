import { cn } from '@/lib/utils';

export function Input({ className, type = 'text', error, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-[#1C1A17]',
        'placeholder:text-[#B5A898]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]/25 focus-visible:border-[#8B4513]/50',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F0E8]',
        'transition-all duration-200',
        error
          ? 'border-[#C0392B] focus-visible:ring-[#C0392B]/25'
          : 'border-[#DDD4C4] hover:border-[#C4BAA8] hover:shadow-sm',
        className
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}

