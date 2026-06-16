import { cn } from '@/lib/utils';

export function SkeletonBox({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-primary/10',
        className
      )}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <SkeletonBox className="w-full aspect-[3/4] rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <SkeletonBox className="h-5 w-16 rounded-full" />
          <SkeletonBox className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BookListSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border p-4">
      <SkeletonBox className="h-16 w-12 shrink-0 rounded-md" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-2/3" />
        <SkeletonBox className="h-3 w-1/3" />
      </div>
      <SkeletonBox className="h-7 w-20 rounded-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="flex justify-between">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-4 w-4 rounded" />
      </div>
      <SkeletonBox className="h-8 w-16" />
    </div>
  );
}
