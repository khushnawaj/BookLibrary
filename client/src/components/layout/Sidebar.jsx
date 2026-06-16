import { NavLink } from 'react-router-dom';
import {
  Heart,
  Library,
  Settings,
  BarChart3,
  Users,
  Home,
  BookOpen,
  Import,
  UserCircle,
  Shield,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/authHooks';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
      { to: ROUTES.FEED, label: 'Community Feed', icon: Users },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: ROUTES.LIBRARY, label: 'My Library', icon: Library },
      { to: ROUTES.LIBRARY_ADD, label: 'Add Book', icon: BookOpen },
      { to: ROUTES.LIBRARY_IMPORT, label: 'Import Books', icon: Import },
      { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: ROUTES.ANALYTICS, label: 'Analytics & Goals', icon: BarChart3 },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: ROUTES.PROFILE, label: 'Profile', icon: UserCircle },
      { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({ className, onNavigate }) {
  const { user } = useAuth();

  // Dynamically add Admin controls if authorized
  const activeSections = [...NAV_SECTIONS];
  if (user?.role === 'ADMIN') {
    activeSections.push({
      label: 'Admin Controls',
      items: [
        { to: ROUTES.ADMIN, label: 'Control Panel', icon: Shield },
      ],
    });
  }

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col',
        'bg-sidebar backdrop-blur-xl',
        'border-r border-border/40',
        className
      )}
    >
      {/* Logo header */}
      <div className="flex h-16 items-center px-5 border-b border-border/40">
        <Logo />
      </div>

      {/* Nav sections */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5 scrollbar-none">
        {activeSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === ROUTES.DASHBOARD}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-mint text-primary-foreground shadow-lg shadow-primary/15'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 shrink-0',
                        isActive
                          ? 'bg-primary-foreground/15'
                          : 'bg-secondary group-hover:bg-accent'
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate">{label}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70 shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom version tag */}
      <div className="px-5 py-4 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground/30 font-medium">ShelfForge v1.0</p>
      </div>
    </aside>
  );
}
