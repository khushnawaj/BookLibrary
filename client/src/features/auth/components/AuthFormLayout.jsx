import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Check, Library, Sparkles } from 'lucide-react';
import { FormTransition } from '@/components/animations/PageTransition';
import { APP_NAME } from '@/constants';

const highlights = ['Track shelves and notes', 'Search books faster', 'Follow reading goals'];

export function AuthFormLayout({ title, description, footer, children, mode = 'login' }) {
  const isRegister = mode === 'register';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(73,106,49,0.14),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(46,94,143,0.13),transparent_30%)]" />
      <FormTransition className="relative mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="hidden lg:block"
        >
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DDD4C4] bg-white/70 px-4 py-2 text-sm font-semibold text-[#5B5148] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#C58A12]" />
              {isRegister ? 'Begin your reading system' : 'Welcome back to your shelves'}
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-[#1C1A17]">
              {isRegister ? 'Build a quieter home for every book.' : 'Step back into your reading rhythm.'}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#6D6258]">
              ShelfForge keeps your library, wishlist, reviews, and goals in one warm workspace designed for daily use.
            </p>

            <div className="mt-8 grid max-w-md gap-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[#DDD4C4] bg-white/70 p-3 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E7F0E1]">
                    <Check className="h-4 w-4 text-[#496A31]" />
                  </span>
                  <span className="text-sm font-semibold text-[#3D3530]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F4C3A] shadow">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-[#1C1A17]">{APP_NAME}</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#DDD4C4] bg-white shadow-xl shadow-[#3D2A1A]/10">
            <div className="border-b border-[#F0EBE3] bg-[#FBF8F2] px-7 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F4E8DD]">
                  <Library className="h-5 w-5 text-[#8B4513]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1A17]">{APP_NAME}</p>
                  <p className="text-xs text-[#8A7F74]">Your personal reading library</p>
                </div>
              </div>
            </div>

            <div className="px-7 py-7">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1C1A17]">{title}</h2>
                {description && (
                  <p className="mt-2 text-sm leading-6 text-[#8A7F74]">{description}</p>
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
      <Link to={to} className="font-semibold text-[#8B4513] underline-offset-2 hover:underline">
        {linkText}
      </Link>
    </>
  );
}
