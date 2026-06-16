import { cn } from '@/lib/utils';

/**
 * Decorative ginkgo leaf texture overlay — inspired by "Magic ginkgo" palette.
 */
export function GinkgoBackground({ className, children }) {
  return (
    <div className={cn('relative isolate', className)}>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="relative h-full w-full">
          {/* Base Gradient Layer */}
          <div className="app-base absolute inset-0" />

          {/* Ambient Glow */}
          <div className="app-glow absolute inset-0" />
        </div>
      </div>
      {children}
    </div>
  );
}
