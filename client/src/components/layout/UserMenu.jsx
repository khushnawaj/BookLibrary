import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, UserCircle, ExternalLink, Shield, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/features/auth/authHooks';
import { useAppDispatch } from '@/hooks/useAppStore';
import { resetAuth } from '@/features/auth/authSlice';
import { tokenStorage } from '@/services/api';
import { Avatar } from '@/components/ui/avatar';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isGuest = user?.role === 'GUEST';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthRedirect = (route) => {
    setOpen(false);
    dispatch(resetAuth());
    tokenStorage.clear();
    navigate(route);
  };

  if (!user) return null;

  // Guest user: show compact sign-in / register button pair
  if (isGuest) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAuthRedirect(ROUTES.LOGIN)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-glass-border/50 transition-all"
        >
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Sign in</span>
        </button>
        <button
          onClick={() => handleAuthRedirect(ROUTES.REGISTER)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-sm hover:opacity-90 transition-all"
        >
          <UserPlus className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Register</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200',
          'hover:bg-secondary/40 border border-transparent',
          open && 'bg-secondary/60 border-glass-border'
        )}
      >
        <Avatar src={user.avatar} name={user.name} size="sm" />
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="max-w-[100px] truncate text-xs font-semibold text-foreground leading-tight">
            {user.name}
          </span>
          <span className="max-w-[100px] truncate text-[10px] text-muted-foreground leading-tight">
            @{user.username}
          </span>
        </div>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-glass-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* User header */}
          <div className="relative px-4 py-3 bg-gradient-to-br from-primary to-primary/80">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="md" className="ring-2 ring-white/30" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary-foreground">{user.name}</p>
                <p className="truncate text-xs text-primary-foreground/75">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5 px-1.5 space-y-0.5">
            {user.role === 'ADMIN' && (
              <Link
                to={ROUTES.ADMIN}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-secondary/45 transition-colors group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60 group-hover:bg-secondary transition-colors">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                </div>
                <span className="font-semibold text-primary">Admin Control Panel</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}

            <Link
              to={ROUTES.PROFILE}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-secondary/45 transition-colors group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60 group-hover:bg-secondary transition-colors">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium">Your Profile</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to={ROUTES.SETTINGS}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-secondary/45 transition-colors group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60 group-hover:bg-secondary transition-colors">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium">Settings</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-glass-border py-1.5 px-1.5">
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors group"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
