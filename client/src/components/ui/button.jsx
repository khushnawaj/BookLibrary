import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#8B4513] text-white shadow-sm hover:bg-[#7A3B10] hover:shadow-md active:bg-[#6B3310]',
        secondary:
          'bg-[#EDE6D8] text-[#3D3530] border border-[#DDD4C4]/60 hover:bg-[#E5DDD0] hover:shadow-sm',
        outline:
          'border border-[#DDD4C4] bg-white text-[#3D3530] hover:bg-[#F5F0E8] hover:border-[#8B4513]/40 hover:shadow-sm',
        ghost:
          'text-[#3D3530] hover:bg-[#EDE6D8]/60 hover:text-[#1C1A17] hover:-translate-y-0 active:translate-y-0 active:scale-100',
        destructive:
          'bg-[#C0392B] text-white hover:bg-[#A93226] hover:shadow-md',
        glass:
          'border border-[#DDD4C4] bg-white/70 text-[#3D3530] backdrop-blur-md hover:bg-white hover:shadow-md',
        link:
          'text-[#8B4513] underline-offset-4 hover:underline p-0 h-auto hover:-translate-y-0 active:translate-y-0 active:scale-100',
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

