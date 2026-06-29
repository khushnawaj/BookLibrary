import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/animations/PageTransition';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileNav } from './MobileNav';
import { SupportModal } from '@/components/common/SupportModal';
import { GuestWarningModal } from '@/components/common/GuestWarningModal';
import { BookOpen, Code2, Share2, Heart, Lock, ArrowRight, LogIn } from 'lucide-react';
import { LiquidGlassBackground } from '@/components/common/LiquidGlassBackground';
import { useAuth } from '@/features/auth/authHooks';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppStore';
import { resetAuth } from '@/features/auth/authSlice';
import { tokenStorage } from '@/services/api';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/library') return 'My Library';
  if (pathname === '/library/add') return 'Add Book';
  if (pathname.endsWith('/edit')) return 'Edit Book';
  if (pathname.startsWith('/library/')) return 'Book Details';
  if (pathname === '/analytics') return 'Analytics & Goals';
  if (pathname === '/wishlist') return 'Wishlist';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/feed') return 'Community Feed';
  if (pathname === '/library/import') return 'Import Books';
  if (pathname === '/feedback') return 'Feedback & Support';
  return 'ShelfForge';
}

function GuestLockedPage({ pathname, pageTitle }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const getPageInfo = () => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Your Reading Dashboard',
          desc: 'Track your active reading streaks, monitor daily page targets, and see your personalized dashboard overview.',
          feature: 'Streaks & Quick Stats'
        };
      case '/library':
        return {
          title: 'Your Virtual Library',
          desc: 'Sort your books into customizable shelves like Reading, Read, Wishlist, or Dropped, and keep notes on each.',
          feature: 'Collection Management'
        };
      case '/library/add':
        return {
          title: 'Add Books to Library',
          desc: 'Instantly import metadata, cover art, and descriptions from the Google Books database.',
          feature: 'Google Books Import'
        };
      case '/wishlist':
        return {
          title: 'Your Wishlist',
          desc: 'Keep a clean, dedicated record of all the titles you want to acquire or read in the future.',
          feature: 'Reading Wishlist'
        };
      case '/analytics':
        return {
          title: 'Reading Insights & Goals',
          desc: 'Set annual reading targets, unlock achievements, and see charts of your reading progress over time.',
          feature: 'Goal Tracking & Charts'
        };
      case '/feedback':
        return {
          title: 'Feedback & Support',
          desc: 'Have a feature request or need help? Send direct queries to the ShelfForge team.',
          feature: 'Admin Resolution Replies'
        };
      case '/settings':
        return {
          title: 'Account Settings',
          desc: 'Configure notification preferences, customize your display theme, and update credentials.',
          feature: 'Profile Personalization'
        };
      default:
        return {
          title: pageTitle || 'Premium Feature',
          desc: 'Access advanced tracking, custom notes, and social interactions to enhance your reading experience.',
          feature: 'Member Benefits'
        };
    }
  };

  const info = getPageInfo();

  const handleRedirect = (route) => {
    dispatch(resetAuth());
    tokenStorage.clear();
    navigate(route);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-3xl border border-glass-border bg-glass/60 backdrop-blur-xl p-8 text-center shadow-xl shadow-primary/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6 animate-pulse">
          <Lock className="h-6 w-6" />
        </div>
        
        <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          {info.feature}
        </span>
        
        <h2 className="mt-4 text-2xl font-bold text-foreground tracking-tight sm:text-3xl">
          Unlock {info.title}
        </h2>
        
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
          {info.desc} Join ShelfForge to set up your own collection and keep your reading habits organized.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => handleRedirect(ROUTES.REGISTER)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent shadow-md shadow-primary/15 px-6 py-5"
          >
            Start your library
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleRedirect(ROUTES.LOGIN)}
            variant="outline"
            className="flex items-center justify-center gap-2 border-border/80 hover:bg-secondary/50 px-6 py-5"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);
  const { user } = useAuth();

  const isGuest = user?.role === 'GUEST';
  const isPublicRoute =
    pathname === '/feed' ||
    pathname.startsWith('/books/') ||
    (pathname.startsWith('/profile/') && pathname !== '/profile');
  const isLockedGuestPage = isGuest && !isPublicRoute;

  return (
    <LiquidGlassBackground className="lg:flex">
      {/* Sidebar — fixed on desktop, wider at w-64 */}
      <div className="fixed inset-y-0 left-0 z-20 hidden lg:block">
        <Sidebar />
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content area — offset by sidebar width (w-64 = 256px) */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col lg:pl-64">
        <TopNavbar title={title} onMenuClick={() => setMobileOpen(true)} />
         <main className="relative z-10 flex-1 p-5 sm:p-6 lg:p-8">
          <PageTransition key={pathname} className="page-container mx-auto w-full max-w-7xl">
            {isLockedGuestPage ? (
              <GuestLockedPage pathname={pathname} pageTitle={title} />
            ) : (
              <Outlet />
            )}
          </PageTransition>
        </main>

        {/* ── Rich Footer ── */}
        <footer className="relative z-0 border-t border-border/40 bg-card/30 backdrop-blur-md mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

              {/* Branding */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-mint shadow-sm">
                    <BookOpen className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display text-lg font-bold text-foreground">ShelfForge</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                  Forge your personal library. Track, discover, and share your reading journey.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Navigate */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Navigate</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Dashboard',   to: '/dashboard' },
                    { label: 'My Library',  to: '/library' },
                    { label: 'Community Feed', to: '/feed' },
                    { label: 'Analytics',   to: '/analytics' },
                    { label: 'Wishlist',    to: '/wishlist' },
                    { label: 'Feedback & Suggestions', to: '/feedback' },
                  ].map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => setSupportOpen(true)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors text-left font-medium"
                    >
                      Buy me a Tea 🍵
                    </button>
                  </li>
                </ul>
              </div>

              {/* Account */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Account</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Profile',  to: '/profile' },
                    { label: 'Settings', to: '/settings' },
                    { label: 'Import Books', to: '/library/import' },
                  ].map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-5 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-muted-foreground/80">
                © {new Date().getFullYear()} ShelfForge. All rights reserved.
              </p>

              <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> for readers everywhere
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Support / QR Modal */}
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* Guest Warning Modal */}
      <GuestWarningModal />
    </LiquidGlassBackground>
  );
}

export const AppLayout = MainLayout;
