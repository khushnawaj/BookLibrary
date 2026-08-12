import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Library, Plus, Users, BarChart3, UserCircle, Feather, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/authHooks';

export function BottomNav() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(() => {
    try {
      const stored = localStorage.getItem('shelfforge_bottom_nav_hidden');
      return stored !== 'true';
    } catch {
      return true;
    }
  });

  const toggleVisibility = () => {
    setIsVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('shelfforge_bottom_nav_hidden', String(!next));
      } catch {}
      return next;
    });
  };

  const navItems = [
    { to: ROUTES.FEED, label: 'Feed', icon: Users, activeColor: 'text-indigo-500', dotColor: 'bg-indigo-500' },
    { to: ROUTES.WRITING_STUDIO, label: 'Studio', icon: Feather, activeColor: 'text-amber-500', dotColor: 'bg-amber-500' },
    { to: ROUTES.LIBRARY_ADD, label: 'Create', icon: Plus, isMain: true },
    { to: ROUTES.LIBRARY, label: 'Library', icon: Library, activeColor: 'text-violet-500', dotColor: 'bg-violet-500' },
    { to: ROUTES.PROFILE, label: 'Profile', icon: UserCircle, activeColor: 'text-slate-600', dotColor: 'bg-slate-600' },
  ];

  return (
    <>
      {isVisible ? (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden animate-in slide-in-from-bottom duration-300">
          <div className="relative">
            <nav className="flex items-center justify-between px-2 py-1.5 bg-card/90 backdrop-blur-xl border border-glass-border rounded-2xl shadow-xl shadow-black/20">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center justify-center py-1 flex-1 relative min-w-0 transition-all duration-200 rounded-xl",
                      isActive 
                        ? cn(item.activeColor || "text-primary", "font-medium") 
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
                          <div className="relative">
                            <item.icon className="h-4.5 w-4.5 shrink-0 transition-transform duration-200 active:scale-90" />
                            {item.badge && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                          <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
                        </div>
                      )}
                      {isActive && !item.isMain && (
                        <span className={cn("absolute bottom-0 h-1 w-1 rounded-full", item.dotColor || "bg-primary")} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Quick Hide Button on top-right edge */}
            <button
              onClick={toggleVisibility}
              className="absolute -top-3.5 right-3 h-6 px-2 rounded-full border border-glass-border/60 bg-card/95 backdrop-blur-md shadow-md flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-all active:scale-95"
              title="Hide Bottom Navigation"
              aria-label="Hide Bottom Navigation"
            >
              <ChevronDown className="h-3 w-3 text-primary" />
              <span>Hide</span>
            </button>
          </div>
        </div>
      ) : (
        /* Tiny Floating Toggle Button when hidden */
        <button
          onClick={toggleVisibility}
          className="fixed bottom-3 right-3 z-40 lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-glass-border/60 bg-card/95 backdrop-blur-md shadow-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-all active:scale-95 animate-pulse"
          title="Show Bottom Navigation"
          aria-label="Show Bottom Navigation"
        >
          <ChevronUp className="h-4 w-4 text-primary" />
          <span>Show Nav</span>
        </button>
      )}
    </>
  );
}
