import { Check } from 'lucide-react';
import { PALETTE_META } from '@/constants/themes';
import { useTheme } from '@/features/theme/themeHooks';
import { cn } from '@/lib/utils';

export function PaletteSelector({ className }) {
  const { palette, setPalette } = useTheme();

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {PALETTE_META.map((item) => {
        const active = palette === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setPalette(item.id)}
            className={cn(
              'relative rounded-xl border p-4 text-left transition-all duration-200',
              'hover:border-primary/40 hover:bg-primary/5',
              active
                ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30'
                : 'border-border bg-card/50'
            )}
          >
            {active && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            )}

            <div className="mb-3 flex gap-1.5">
              {item.swatch.map((color) => (
                <span
                  key={color}
                  className="h-6 w-6 rounded-full ring-1 ring-border/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <p className="font-medium">{item.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          </button>
        );
      })}
    </div>
  );
}
