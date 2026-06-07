import { Link, Outlet } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-3">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
