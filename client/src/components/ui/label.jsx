import { cn } from '@/lib/utils';

export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        'text-[10px] font-bold uppercase tracking-widest leading-none text-muted-foreground/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
}
