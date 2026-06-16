import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants';
import { LiquidGlassBackground } from '@/components/common/LiquidGlassBackground';

export default function NotFoundPage() {
  return (
    <LiquidGlassBackground className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card relative z-10 w-full max-w-md border border-glass-border p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <BookOpen className="h-8 w-8 animate-pulse" />
        </div>

        <h1 className="font-display text-8xl font-black tracking-tighter text-primary">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Oops! The book page you are looking for has been misplaced or doesn't exist. Let's get you back to your library shelves.
        </p>

        <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link to={ROUTES.HOME} className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.DASHBOARD} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              To Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </LiquidGlassBackground>
  );
}
