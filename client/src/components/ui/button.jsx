import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-wide transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:brightness-[1.03] active:brightness-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90',
        secondary:
          'bg-secondary text-secondary-foreground border border-border/40 hover:bg-accent hover:text-accent-foreground',
        outline:
          'border border-border bg-card/60 text-foreground hover:bg-accent hover:border-primary/40',
        ghost:
          'text-foreground hover:bg-secondary hover:text-foreground active:scale-100',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-95',
        glass:
          'border border-glass-border bg-glass/70 text-foreground backdrop-blur-md hover:bg-glass',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto active:scale-100',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm:      'h-9 px-4 text-xs',
        lg:      'h-13 px-8 text-base',
        icon:    'h-11 w-11 p-0',
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

