import { Link, Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { APP_NAME } from '@/constants';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#DDD4C4] bg-[#F5F0E8]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B4513] shadow-sm">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-[#1C1A17] tracking-tight">{APP_NAME}</span>
          </Link>
          {/* Actions */}
          <nav className="flex items-center gap-2">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
