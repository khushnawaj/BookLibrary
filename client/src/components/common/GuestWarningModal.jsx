import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { setShowGuestWarning, resetAuth } from '@/features/auth/authSlice';
import { Modal } from './Modal';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { tokenStorage } from '@/services/api';

export function GuestWarningModal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const show = useAppSelector((state) => state.auth.showGuestWarning);

  const handleClose = () => {
    dispatch(setShowGuestWarning(false));
  };

  const handleSignUp = () => {
    dispatch(setShowGuestWarning(false));
    dispatch(resetAuth());
    tokenStorage.clear();
    navigate(ROUTES.REGISTER);
  };

  const handleLogin = () => {
    dispatch(setShowGuestWarning(false));
    dispatch(resetAuth());
    tokenStorage.clear();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Modal
      open={show}
      onClose={handleClose}
      title="Action Restricted"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 mb-5 animate-bounce">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>

        <h3 className="text-xl font-bold text-foreground tracking-tight">
          Account Required
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You are currently browsing ShelfForge in **Guest Mode**. Please sign up or log in to create custom book shelves, add reviews, post updates, and track goals!
        </p>

        <div className="mt-8 w-full flex flex-col gap-3">
          <Button
            onClick={handleSignUp}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent shadow-md shadow-primary/20"
            size="lg"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-border/80 hover:bg-secondary/40"
            size="lg"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>

          <button
            onClick={handleClose}
            className="mt-2 text-xs font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Keep Browsing as Guest
          </button>
        </div>
      </div>
    </Modal>
  );
}
