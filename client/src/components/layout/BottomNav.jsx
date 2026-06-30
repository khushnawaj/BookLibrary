import { NavLink } from 'react-router-dom';
import { Home, Library, Plus, Users, BarChart3, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/authHooks';

export function BottomNav() {
  const { user } = useAuth();

  const navItems = [
    { to: ROUTES.FEED, label: 'Feed', icon: Users },
    { to: ROUTES.LIBRARY, label: 'Library', icon: Library },
    { to: ROUTES.LIBRARY_ADD, label: 'Add Book', icon: Plus, isMain: true },
    { to: ROUTES.ANALYTICS, label: 'Insights', icon: BarChart3 },
    { to: ROUTES.PROFILE, label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <nav className="flex items-center justify-between px-2 py-1.5 bg-card/85 backdrop-blur-xl border border-glass-border rounded-2xl shadow-xl shadow-black/15">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center py-1 flex-1 relative min-w-0 transition-all duration-200 rounded-xl",
                isActive 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.isMain ? (
                  <div className="flex h-11 w-11 -mt-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 border-4 border-background transition-transform active:scale-95">
                    <item.icon className="h-5 w-5 shrink-0" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-0.5">
                    <item.icon className="h-4.5 w-4.5 shrink-0 transition-transform duration-200 active:scale-90" />
                    <span className="text-[10px] tracking-tight">{item.label}</span>
                  </div>
                )}
                {isActive && !item.isMain && (
                  <span className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
