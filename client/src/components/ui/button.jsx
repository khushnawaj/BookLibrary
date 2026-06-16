import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:shadow-md active:opacity-85',
        secondary:
          'bg-secondary text-secondary-foreground border border-border/40 hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
        outline:
          'border border-border bg-card/60 text-foreground hover:bg-accent hover:border-primary/40 hover:shadow-sm',
        ghost:
          'text-foreground hover:bg-secondary hover:text-foreground hover:-translate-y-0 active:translate-y-0 active:scale-100',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90 hover:shadow-md',
        glass:
          'border border-glass-border bg-glass/70 text-foreground backdrop-blur-md hover:bg-glass hover:shadow-md',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto hover:-translate-y-0 active:translate-y-0 active:scale-100',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8.5 rounded-lg px-3.5 text-xs',
        lg:      'h-12 rounded-xl px-7 text-base',
        icon:    'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  asChild = false,
  ...props
}) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(buttonVariants({ variant, size, className }), children.props.className),
      ...props,
    });
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}

export { buttonVariants };

