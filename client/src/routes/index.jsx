import { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthInitializer } from '@/app/AuthInitializer';
import { MainLayout } from '@/components/layout/MainLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ROUTES } from '@/constants';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute, PublicRoute, AdminRoute } from '@/routes/ProtectedRoute';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { safeLazy } from '@/utils';

// Lazy load pages with chunk reload resilience for optimized performance
const LandingPage = safeLazy(() => import('@/pages/LandingPage'));
const LoginPage = safeLazy(() => import('@/pages/LoginPage'));
const RegisterPage = safeLazy(() => import('@/pages/RegisterPage'));
const DashboardPage = safeLazy(() => import('@/pages/DashboardPage'));
const FeedPage = safeLazy(() => import('@/pages/FeedPage'));
const LibraryPage = safeLazy(() => import('@/pages/LibraryPage'));
const AddBookPage = safeLazy(() => import('@/pages/AddBookPage'));
const ImportBooksPage = safeLazy(() => import('@/pages/ImportBooksPage'));
const BookDetailsPage = safeLazy(() => import('@/pages/BookDetailsPage'));
const EditBookPage = safeLazy(() => import('@/pages/EditBookPage'));
const PublicBookPage = safeLazy(() => import('@/pages/PublicBookPage'));
const AnalyticsPage = safeLazy(() => import('@/pages/AnalyticsPage'));
const WishlistPage = safeLazy(() => import('@/pages/WishlistPage'));
const ProfilePage = safeLazy(() => import('@/pages/ProfilePage'));
const SettingsPage = safeLazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = safeLazy(() => import('@/pages/FeedbackPage'));
const WritingStudioPage = safeLazy(() => import('@/pages/WritingStudioPage'));
const WritingEditorPage = safeLazy(() => import('@/pages/WritingEditorPage'));
const ExploreWritingPage = safeLazy(() => import('@/pages/ExploreWritingPage'));
const ReadWorkPage = safeLazy(() => import('@/pages/ReadWorkPage'));
const AdminDashboard = safeLazy(() => import('@/pages/AdminDashboard'));
const NotFoundPage = safeLazy(() => import('@/pages/NotFoundPage'));

// High-fidelity fallback spinner for lazy route load transitions
function SuspenseLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
}

import { ConfirmDialogProvider } from '@/components/common/ConfirmDialog';

function RootLayout() {
  return (
    <AuthInitializer>
      <ConfirmDialogProvider>
        <Suspense fallback={<SuspenseLoader />}>
          <Outlet />
        </Suspense>
      </ConfirmDialogProvider>
    </AuthInitializer>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
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
          { path: ROUTES.WRITING_STUDIO, element: <WritingStudioPage /> },
          { path: ROUTES.WRITE_NEW, element: <WritingEditorPage /> },
          { path: ROUTES.WRITE_EDIT, element: <WritingEditorPage /> },
          { path: ROUTES.EXPLORE_WRITING, element: <WritingStudioPage /> },
          { path: ROUTES.READ_WORK, element: <ReadWorkPage /> },
          { path: '/read/:id/chapter/:chapterId', element: <ReadWorkPage /> },
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
