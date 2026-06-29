import { NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  Library,
  BarChart3,
  Users,
  Home,
  BookOpen,
  UserCircle,
  Shield,
  HelpCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/authHooks';
import { useAppDispatch } from '@/hooks/useAppStore';
import { resetAuth } from '@/features/auth/authSlice';
import { tokenStorage } from '@/services/api';
import { Button } from '@/components/ui/button';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: ROUTES.FEED, label: 'Community Feed', icon: Users },
      { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: ROUTES.LIBRARY, label: 'My Library', icon: Library },
      { to: ROUTES.LIBRARY_ADD, label: 'Add Book', icon: BookOpen },
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
      { to: ROUTES.FEEDBACK, label: 'Feedback & Support', icon: HelpCircle },
    ],
  },
];

export function Sidebar({ className, onNavigate }) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isGuest = user?.role === 'GUEST';

  const handleSignIn = () => {
    dispatch(resetAuth());
    tokenStorage.clear();
    navigate(ROUTES.LOGIN);
    onNavigate?.();
  };

  const handleRegister = () => {
    dispatch(resetAuth());
    tokenStorage.clear();
    navigate(ROUTES.REGISTER);
    onNavigate?.();
  };

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
        'bg-card/75 backdrop-blur-xl',
        'border-r border-border/40 shadow-lg shadow-primary/5',
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
                      'group flex items-center gap-3 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/15'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 shrink-0',
                        isActive
                          ? 'bg-primary-foreground/15'
                          : 'bg-secondary/40 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary'
                      )}>
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <span className="truncate">{label}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80 shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section — guest: sign-in/register, otherwise version tag */}
      {isGuest ? (
        <div className="px-3 py-4 border-t border-border/40 space-y-1.5">
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50">Get Started</p>
          <button
            onClick={handleRegister}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all duration-200
                       bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/15 hover:opacity-90"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-foreground/15 shrink-0">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
            <span>Create Account</span>
          </button>
          <button
            onClick={handleSignIn}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all duration-200
                       text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/40 shrink-0">
              <LogIn className="h-3.5 w-3.5" />
            </div>
            <span>Sign In</span>
          </button>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground/30 font-medium">ShelfForge v1.0</p>
        </div>
      )}
    </aside>
  );
}
