import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({ className, size = 'default', label = 'Loading' }) {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';

  return (
    <Loader2
      className={cn('animate-spin text-[#8B4513]', sizeClass, className)}
      aria-label={label}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
      <div className="flex flex-col items-center gap-4">
        {/* Logo mark */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B4513] shadow-lg">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#1C1A17]">ShelfForge</p>
          <p className="text-xs text-[#8A7F74] mt-0.5">Loading your library...</p>
        </div>
      </div>
    </div>
  );
}

export function InlineLoader({ className }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader size="lg" />
    </div>
  );
}
