import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }) {
  return (
    <Link to="/" className={cn('flex items-center gap-3.5 group', className)}>
      {/* Icon mark — gradient with glow */}
      <div className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-mint shadow-md transition-all group-hover:shadow-[0_0_12px_var(--color-primary)] group-hover:scale-105">
        <BookOpen className="h-5 w-5 text-primary-foreground" />
        {/* subtle shine */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
      </div>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
