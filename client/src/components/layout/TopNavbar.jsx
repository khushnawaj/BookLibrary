import { Menu, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { ModeToggle } from '../theme/ModeToggle';

export function TopNavbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#DDD4C4]/60 bg-[#F5F0E8]/95 px-4 backdrop-blur-xl sm:px-6 shadow-sm">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 shrink-0 text-[#3D3530] hover:bg-[#EDE6D8] rounded-xl"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title with decorative accent */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        {title && (
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="h-4 w-0.5 rounded-full bg-[#8B4513]/40" />
            <h1 className="text-base font-semibold text-[#1C1A17] tracking-tight truncate">
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle className="h-9 w-9 rounded-xl hover:bg-[#EDE6D8] text-[#3D3530]" />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

