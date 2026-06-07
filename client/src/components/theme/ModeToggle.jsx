import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/features/theme/themeHooks';
import { cn } from '@/lib/utils';

export function ModeToggle({ className, showLabel = false }) {
  const { isDark, toggleMode } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      onClick={toggleMode}
      className={cn('gap-2', className)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-mint" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
      {showLabel && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </Button>
  );
}
