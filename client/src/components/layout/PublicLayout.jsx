import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, ROUTES } from '@/constants';
import { LiquidGlassBackground } from '@/components/common/LiquidGlassBackground';

export function PublicLayout() {
  return (
    <LiquidGlassBackground className="text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-mint shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight">{APP_NAME}</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:block">
                Reading studio
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm md:flex">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Track. Discover. Share.
          </div>

          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hover:bg-secondary/60">
              <Link to={ROUTES.LOGIN}>Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={ROUTES.REGISTER}>Get started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
    </LiquidGlassBackground>
  );
}
