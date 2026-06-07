import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }) {
  return (
    <Link to="/" className={cn('flex items-center gap-3 group', className)}>
      {/* Icon mark — gradient with glow */}
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C0622F] to-[#8B4513] shadow-md transition-all group-hover:shadow-[0_0_12px_rgba(139,69,19,0.5)] group-hover:scale-105">
        <BookOpen className="h-4.5 w-4.5 text-white" />
        {/* subtle shine */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
      </div>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-[#EDE6D8] group-hover:text-white transition-colors">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
