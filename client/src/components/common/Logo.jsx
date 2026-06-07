import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30 transition-all group-hover:bg-primary/25 group-hover:ring-primary/50">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>
      {showText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
