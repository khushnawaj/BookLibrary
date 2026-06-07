import { NavLink } from 'react-router-dom';
import {
  Heart,
  Library,
  Settings,
  User,
  BarChart3,
  Users,
  Home,
  BookOpen,
  Import,
  UserCircle,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

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

// Flat list kept for legacy usage
export const navItems = NAV_SECTIONS.flatMap(s => s.items);

export function Sidebar({ className, onNavigate }) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col',
        'bg-[#1E1915]',
        // subtle left border as ambient glow separator
        'border-r border-white/5',
        className
      )}
    >
      {/* Logo header */}
      <div className="flex h-16 items-center px-5 border-b border-white/6">
        <Logo />
      </div>

      {/* Nav sections */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">
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
                        ? 'bg-gradient-to-r from-[#8B4513] to-[#C0622F] text-white shadow-lg shadow-[#8B4513]/25'
                        : 'text-white/50 hover:bg-white/6 hover:text-white/90'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 shrink-0',
                        isActive
                          ? 'bg-white/15'
                          : 'bg-white/5 group-hover:bg-white/10'
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate">{label}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70 shrink-0" />
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
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-white/20 font-medium">BookVerse v1.0</p>
      </div>
    </aside>
  );
}
