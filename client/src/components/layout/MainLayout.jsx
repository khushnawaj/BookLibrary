import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/animations/PageTransition';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileNav } from './MobileNav';
import { SupportModal } from '@/components/common/SupportModal';
import { BookOpen, Code2, Share2, Heart } from 'lucide-react';
import { LiquidGlassBackground } from '@/components/common/LiquidGlassBackground';

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
  return 'ShelfForge';
}

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

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
        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <PageTransition key={pathname} className="page-container mx-auto w-full max-w-7xl">
            <Outlet />
          </PageTransition>
        </main>

        {/* ── Rich Footer ── */}
        <footer className="relative border-t border-border/40 bg-card/30 backdrop-blur-md mt-auto">
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

              {/* Quick Links */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Navigate</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Dashboard',   to: '/dashboard' },
                    { label: 'My Library',  to: '/library' },
                    { label: 'Community Feed', to: '/feed' },
                    { label: 'Analytics',   to: '/analytics' },
                    { label: 'Wishlist',    to: '/wishlist' },
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

              {/* Support button → opens QR modal */}
              <button
                onClick={() => setSupportOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-[13px]
                           bg-primary text-primary-foreground shadow-sm
                           hover:opacity-90 hover:shadow-md
                           active:scale-95
                           transition-all duration-150"
              >
                <span className="text-base leading-none transition-transform duration-300 group-hover:rotate-12">🍵</span>
                Buy me a Tea
              </button>

              <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> for readers everywhere
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Support / QR Modal */}
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </LiquidGlassBackground>
  );
}

export const AppLayout = MainLayout;
