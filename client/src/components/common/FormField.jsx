import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function FormField({ label, error, children, className, htmlFor }) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={htmlFor} className={error ? 'text-destructive' : ''}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
