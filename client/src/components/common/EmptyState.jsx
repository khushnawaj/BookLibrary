import { Leaf } from 'lucide-react';
import { Lottie } from '@/lib/lottie';
import { cn } from '@/lib/utils';
import emptyAnimation from '@/assets/animations/empty-state.json';
import successAnimation from '@/assets/animations/success-state.json';

const animations = {
  empty: emptyAnimation,
  success: successAnimation,
};

function EmptyIllustration({ animation }) {
  if (typeof Lottie === 'function') {
    return (
      <Lottie
        animationData={animations[animation] || animations.empty}
        loop={animation === 'empty'}
        className="h-40 w-40 opacity-90"
      />
    );
  }

  return (
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/25">
      <Leaf className="h-16 w-16 text-mint opacity-80" />
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  animation = 'empty',
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className
      )}
    >
      <EmptyIllustration animation={animation} />
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
