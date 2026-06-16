import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, UserCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/features/auth/authHooks';
import { Avatar } from '@/components/ui/avatar';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200',
          'hover:bg-[#EDE6D8] border border-transparent',
          open && 'bg-[#EDE6D8] border-[#DDD4C4]'
        )}
      >
        <Avatar src={user.avatar} name={user.name} size="sm" />
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="max-w-[100px] truncate text-xs font-semibold text-[#1C1A17] leading-tight">
            {user.name}
          </span>
          <span className="max-w-[100px] truncate text-[10px] text-[#8A7F74] leading-tight">
            @{user.username}
          </span>
        </div>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-[#8A7F74] transition-transform duration-200 shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-[#DDD4C4] bg-white shadow-xl shadow-black/8 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* User header */}
          <div className="relative px-4 py-3 bg-gradient-to-br from-[#8B4513] to-[#C0622F]">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="md" className="ring-2 ring-white/30" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{user.name}</p>
                <p className="truncate text-xs text-white/70">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5 px-1.5">
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3D3530] hover:bg-[#F5F0E8] transition-colors group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F0E8] group-hover:bg-[#EDE6D8] transition-colors">
                <UserCircle className="h-4 w-4 text-[#8B4513]" />
              </div>
              <span className="font-medium">Your Profile</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-[#8A7F74] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              to={ROUTES.SETTINGS}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3D3530] hover:bg-[#F5F0E8] transition-colors group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F0E8] group-hover:bg-[#EDE6D8] transition-colors">
                <Settings className="h-4 w-4 text-[#8B4513]" />
              </div>
              <span className="font-medium">Settings</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-[#8A7F74] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-[#EDE6D8]/80 py-1.5 px-1.5">
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 transition-colors group"
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
