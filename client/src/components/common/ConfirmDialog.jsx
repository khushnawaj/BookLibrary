import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ConfirmContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' | 'alert'
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'destructive', // 'destructive' | 'primary' | 'warning' | 'info'
    icon: null,
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title: options.title || 'Are you sure?',
        message: options.message || 'Do you really want to proceed with this action?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'destructive',
        icon: options.icon || null,
      });
    });
  }, []);

  const alert = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        type: 'alert',
        title: typeof options === 'string' ? 'Notice' : (options.title || 'Notice'),
        message: typeof options === 'string' ? options : (options.message || ''),
        confirmText: typeof options === 'object' ? (options.confirmText || options.buttonText || 'OK') : 'OK',
        cancelText: '',
        variant: typeof options === 'object' ? (options.variant || 'info') : 'info',
        icon: typeof options === 'object' ? (options.icon || null) : null,
      });
    });
  }, []);

  const handleClose = (result) => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const getVariantStyles = () => {
    switch (dialogState.variant) {
      case 'destructive':
        return {
          bgIcon: 'bg-red-500/10 text-red-500 border border-red-500/20',
          btnConfirm: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20',
          DefaultIcon: Trash2,
        };
      case 'warning':
        return {
          bgIcon: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20',
          DefaultIcon: AlertTriangle,
        };
      case 'info':
        return {
          bgIcon: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
          btnConfirm: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md',
          DefaultIcon: Info,
        };
      default:
        return {
          bgIcon: 'bg-primary/10 text-primary border border-primary/20',
          btnConfirm: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md',
          DefaultIcon: HelpCircle,
        };
    }
  };

  const { bgIcon, btnConfirm, DefaultIcon } = getVariantStyles();
  const IconComponent = dialogState.icon || DefaultIcon;

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {dialogState.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-md"
                  onClick={() => handleClose(false)}
                />

                {/* Dialog Body */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 12 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="relative z-10 w-full max-w-sm sm:max-w-md bg-card/95 border border-glass-border rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", bgIcon)}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                      <h3 className="text-base sm:text-lg font-medium text-foreground leading-snug">
                        {dialogState.title}
                      </h3>
                      {dialogState.message && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                          {dialogState.message}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleClose(false)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary/40 transition-colors"
                      aria-label="Close dialog"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-glass-border/40">
                    {dialogState.type === 'confirm' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleClose(false)}
                        className="rounded-xl px-4 h-9 text-xs font-medium border-glass-border hover:bg-secondary/40 text-foreground flex-1 sm:flex-initial"
                      >
                        {dialogState.cancelText}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleClose(true)}
                      className={cn("rounded-xl px-5 h-9 text-xs font-medium flex-1 sm:flex-initial cursor-pointer", btnConfirm)}
                    >
                      {dialogState.confirmText}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context.confirm;
}

export function useAlert() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useAlert must be used within a ConfirmDialogProvider');
  }
  return context.alert;
}
