import { cn } from '@/lib/utils';

export function Card({ className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#DDD4C4] bg-white text-[#1C1A17]',
        'shadow-sm transition-all duration-200',
        hover && 'hover:shadow-lg hover:shadow-black/6 hover:-translate-y-0.5 hover:border-[#C4BAA8]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-xl font-semibold leading-none tracking-tight text-[#1C1A17]', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn('text-sm text-[#8A7F74] leading-relaxed', className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
  );
}

