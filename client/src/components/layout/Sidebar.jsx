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
  Feather,
  Sparkles,
  Kanban,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/authHooks';
import { useAppDispatch } from '@/hooks/useAppStore';
import { resetAuth } from '@/features/auth/authSlice';
import { tokenStorage } from '@/services/api';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { 
        to: ROUTES.FEED, 
        label: 'Community Feed', 
        icon: Users, 
        activeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
      },
      { 
        to: ROUTES.DASHBOARD, 
        label: 'Dashboard', 
        icon: Home, 
        activeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
      },
    ],
  },
  {
    label: 'Writing Platform',
    items: [
      { 
        to: ROUTES.WRITING_STUDIO, 
        label: 'Writing Studio', 
        icon: Feather, 
        activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
      },
      { 
        to: ROUTES.WRITING_TRACKER, 
        label: 'Writing Tracker', 
        icon: Kanban, 
        activeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      },
    ],
  },
  {
    label: 'Library',
    items: [
      { 
        to: ROUTES.LIBRARY, 
        label: 'My Library', 
        icon: Library, 
        activeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
      },
      { 
        to: ROUTES.LIBRARY_ADD, 
        label: 'Add Book', 
        icon: BookOpen, 
        activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
      },
      { 
        to: ROUTES.WISHLIST, 
        label: 'Wishlist', 
        icon: Heart, 
        activeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      { 
        to: ROUTES.ANALYTICS, 
        label: 'Analytics & Goals', 
        icon: BarChart3, 
        activeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { 
        to: ROUTES.PROFILE, 
        label: 'Profile', 
        icon: UserCircle, 
        activeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
      },
      { 
        to: ROUTES.FEEDBACK, 
        label: 'Feedback & Support', 
        icon: HelpCircle, 
        activeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
      },
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
        { 
          to: ROUTES.ADMIN, 
          label: 'Control Panel', 
          icon: Shield, 
          activeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
        },
      ],
    });
  }

  return (
    <aside
      className={cn(
        'flex flex-col transition-all duration-300',
        'w-72 lg:w-64',
        'h-full lg:h-[calc(100vh-2rem)]',
        'my-0 lg:my-4 ml-0 lg:ml-4',
        'rounded-none rounded-r-[2rem] lg:rounded-[2rem]',
        'border-y-0 border-l-0 border-r lg:border border-glass-border/40',
        'bg-card/85 backdrop-blur-2xl shadow-xl shadow-primary/5',
        className
      )}
    >
      {/* Logo header */}
      <div className="flex h-16 items-center px-6 border-b border-glass-border/30">
        <Logo />
      </div>

      {/* Nav sections */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5 scrollbar-none">
        {activeSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-150 active:scale-[0.97]',
                      isActive
                        ? item.activeColor
                        : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent'
                    )
                  }
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500/50 mr-1 shrink-0" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section — guest: sign-in/register, otherwise version tag */}
      {isGuest ? (
        <div className="px-3 py-4 border-t border-glass-border/30 space-y-2">
          <p className="px-3 mb-1 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">Get Started</p>
          <button
            onClick={handleRegister}
            className="w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-150 active:scale-[0.97]
                       bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/15 hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 shrink-0">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
            <span>Create Account</span>
          </button>
          <button
            onClick={handleSignIn}
            className="w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-150 active:scale-[0.97]
                       text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/40 shrink-0">
              <LogIn className="h-3.5 w-3.5" />
            </div>
            <span>Sign In</span>
          </button>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-glass-border/30">
          <p className="text-[10px] text-muted-foreground/30 font-medium">ShelfForge v1.0</p>
        </div>
      )}
    </aside>
  );
}
