import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthInitializer } from '@/app/AuthInitializer';
import { MainLayout } from '@/components/layout/MainLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ROUTES } from '@/constants';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute, PublicRoute, AdminRoute } from '@/routes/ProtectedRoute';

// Lazy load pages for chunk splitting and optimized performance
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const AddBookPage = lazy(() => import('@/pages/AddBookPage'));
const ImportBooksPage = lazy(() => import('@/pages/ImportBooksPage'));
const BookDetailsPage = lazy(() => import('@/pages/BookDetailsPage'));
const EditBookPage = lazy(() => import('@/pages/EditBookPage'));
const PublicBookPage = lazy(() => import('@/pages/PublicBookPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// High-fidelity fallback spinner for lazy route load transitions
function SuspenseLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
}

function RootLayout() {
  return (
    <AuthInitializer>
      <Suspense fallback={<SuspenseLoader />}>
        <Outlet />
      </Suspense>
    </AuthInitializer>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: ROUTES.HOME, element: <LandingPage /> },
          {
            path: ROUTES.LOGIN,
            element: (
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            ),
          },
          {
            path: ROUTES.REGISTER,
            element: (
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            ),
          },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.FEED, element: <FeedPage /> },
          { path: ROUTES.LIBRARY, element: <LibraryPage /> },
          { path: ROUTES.LIBRARY_ADD, element: <AddBookPage /> },
          { path: ROUTES.LIBRARY_IMPORT, element: <ImportBooksPage /> },
          { path: ROUTES.LIBRARY_BOOK, element: <BookDetailsPage /> },
          { path: ROUTES.LIBRARY_EDIT, element: <EditBookPage /> },
          { path: '/books/:id', element: <PublicBookPage /> },
          { path: ROUTES.ANALYTICS, element: <AnalyticsPage /> },
          { path: ROUTES.WISHLIST, element: <WishlistPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: `${ROUTES.PROFILE}/:username`, element: <ProfilePage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
          { path: ROUTES.FEEDBACK, element: <FeedbackPage /> },
          {
            path: ROUTES.ADMIN,
            element: (
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            ),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
