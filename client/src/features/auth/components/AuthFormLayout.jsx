import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { FormTransition } from '@/components/animations/PageTransition';
import { APP_NAME } from '@/constants';

export function AuthFormLayout({ title, description, footer, children }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <FormTransition className="w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Logo — mobile only */}
          <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B4513] shadow">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-[#1C1A17]">{APP_NAME}</span>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[#DDD4C4] bg-white shadow-sm overflow-hidden">
            {/* Header accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#8B4513] via-[#C0622F] to-[#D4931A]" />

            <div className="px-7 py-7">
              <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-[#1C1A17]">{title}</h1>
                {description && (
                  <p className="mt-1.5 text-sm text-[#8A7F74]">{description}</p>
                )}
              </div>
              {children}
            </div>
          </div>

          {footer && (
            <p className="mt-5 text-center text-sm text-[#8A7F74]">{footer}</p>
          )}
        </motion.div>
      </FormTransition>
    </div>
  );
}

export function AuthFooterLink({ text, linkText, to }) {
  return (
    <>
      {text}{' '}
      <Link to={to} className="font-semibold text-[#8B4513] hover:underline underline-offset-2">
        {linkText}
      </Link>
    </>
  );
}
