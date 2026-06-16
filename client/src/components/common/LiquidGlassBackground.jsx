import { cn } from '@/lib/utils';

export function LiquidGlassBackground({ className, children }) {
  return (
    <div className={cn('relative isolate min-h-screen w-full', className)}>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background transition-colors duration-300">
        {/* Animated fluid liquid glass blobs */}
        <div className="liquid-blob blob-indigo" />
        <div className="liquid-blob blob-cyan" />
        <div className="liquid-blob blob-pink" />
        <div className="liquid-blob blob-amber" />
        
        {/* Subtle premium glass micro-dot mesh/texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-[0.03]" />
      </div>
      {children}
    </div>
  );
}
