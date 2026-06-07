import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide transition-all duration-150 select-none',
  {
    variants: {
      variant: {
        default:     'bg-gradient-to-r from-[#8B4513]/12 to-[#C0622F]/8 text-[#8B4513] border border-[#8B4513]/20 shadow-sm',
        secondary:   'bg-[#EDE6D8] text-[#3D3530] border border-[#DDD4C4]/70',
        outline:     'border border-[#DDD4C4] text-[#3D3530] bg-transparent',
        success:     'bg-[#5C7A3E]/10 text-[#5C7A3E] border border-[#5C7A3E]/20',
        destructive: 'bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/20',
        warning:     'bg-[#D4931A]/10 text-[#D4931A] border border-[#D4931A]/20',
        reading:     'bg-blue-50 text-blue-700 border border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { badgeVariants };
