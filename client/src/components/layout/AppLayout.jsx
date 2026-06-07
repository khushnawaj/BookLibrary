import { Outlet, NavLink } from 'react-router-dom';
import {
  BookMarked,
  Heart,
  LayoutDashboard,
  Library,
  Settings,
  User,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.LIBRARY, label: 'My Library', icon: Library },
  { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart },
  { to: ROUTES.PROFILE, label: 'Profile', icon: User },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function AppLayout() {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/40 lg:flex">
        <div className="flex h-16 items-center border-b border-border/40 px-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/40 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            <BookMarked className="h-4 w-4" />
            Phase 1 Foundation
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
