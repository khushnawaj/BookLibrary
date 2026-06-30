import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UPI_ID = import.meta.env.VITE_UPI_ID || 'yourname@upi';
const UPI_QR = import.meta.env.VITE_UPI_QR || '/upi-qr.png';

export function SupportModal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied!');
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

              {/* Top gradient strip */}
              <div className="h-2 w-full bg-gradient-to-r from-[#FFDD00] via-[#FFB800] to-[#FF8C00]" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full
                           bg-[#F5F0E8] text-[#8A7F74] hover:text-[#1C1A17] hover:bg-[#EDE6D8]
                           transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-6 pt-5 pb-7 space-y-5">
                {/* Header */}
                <div className="text-center space-y-1">
                  <div className="text-3xl">🍵</div>
                  <h2 className="text-xl font-bold text-[#1C1A17]">Buy me a Tea</h2>
                  <p className="text-xs text-[#8A7F74] leading-relaxed">
                    If ShelfForge has been useful to you, a small contribution<br />
                    keeps the servers running and new features coming!
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-3 rounded-2xl border-2 border-[#FFDD00] shadow-md bg-white">
                    <img
                      src={UPI_QR}
                      alt="UPI QR Code"
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                  </div>
                </div>

                {/* Scan instruction */}
                <p className="text-center text-[11px] font-semibold text-[#8A7F74] uppercase tracking-widest">
                  Scan with any UPI app
                </p>

                {/* UPI ID copy row */}
                <div className="flex items-center gap-2 bg-[#F5F0E8] border border-[#DDD4C4] rounded-xl px-4 py-2.5">
                  <span className="flex-1 text-sm font-mono text-[#3D3530] truncate">{UPI_ID}</span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#8B4513]
                               hover:text-[#C0622F] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>

                {/* Supported apps */}
                <div className="flex items-center justify-center gap-3">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <span
                      key={app}
                      className="text-[10px] font-semibold text-[#8A7F74] bg-[#F5F0E8]
                                 border border-[#DDD4C4] px-2 py-1 rounded-lg"
                    >
                      {app}
                    </span>
                  ))}
                </div>

                {/* Footer note */}
                <p className="text-center text-[11px] text-[#B5A898] flex items-center justify-center gap-1">
                  Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> — Thank you for your support!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
