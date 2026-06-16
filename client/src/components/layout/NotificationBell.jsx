import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
      <Bell className="h-5 w-5" />
      <Badge
        variant="secondary"
        className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px]"
      >
        0
      </Badge>
    </Button>
  );
}
