import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '@/components/animations/FadeIn';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_NAME, APP_TAGLINE, ROUTES } from '@/constants';

const features = [
  {
    icon: BookOpen,
    title: 'Personal Library',
    description: 'Organize your reads across shelves — reading, read, wishlist, and more.',
  },
  {
    icon: Star,
    title: 'Reviews & Notes',
    description: 'Rate books, write personal reviews, and capture thoughts as you read.',
  },
  {
    icon: Heart,
    title: 'Wishlist',
    description: 'Save books you want to read and track your reading journey.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <BookOpen className="h-4 w-4" />
              Phase 1 — Foundation Ready
            </motion.div>

            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Your universe of{' '}
              <span className="text-gradient">stories</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {APP_NAME} — {APP_TAGLINE}. A modern social platform for book lovers,
              built with elegance and purpose.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" className="group">
                  Start your library
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button variant="glass" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 100}>
              <Card className="h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
