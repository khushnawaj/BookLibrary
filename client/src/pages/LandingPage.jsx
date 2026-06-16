import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Library,
  Search,
  Star,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '@/components/animations/FadeIn';
import { Button } from '@/components/ui/button';
import { APP_NAME, APP_TAGLINE, ROUTES } from '@/constants';

const features = [
  {
    icon: Library,
    title: 'Shelves that stay tidy',
    description: 'Sort every book into reading, read, wishlist, or dropped without losing context.',
  },
  {
    icon: Search,
    title: 'Add books faster',
    description: 'Search Google Books, select a result, and let ShelfForge fill in the details.',
  },
  {
    icon: Star,
    title: 'Notes and ratings',
    description: 'Keep private ratings, reviews, and reflections close to each title.',
  },
  {
    icon: BarChart3,
    title: 'Progress you can see',
    description: 'Track goals, pages, streaks, and reading patterns from one dashboard.',
  },
];

const shelfRows = [
  { title: 'Fourth Wing', author: 'Rebecca Yarros', status: 'Reading', tone: 'var(--color-primary)' },
  { title: 'Educated', author: 'Tara Westover', status: 'Read', tone: 'var(--color-success)' },
  { title: 'Piranesi', author: 'Susanna Clarke', status: 'Wishlist', tone: 'var(--color-primary)' },
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-4 rounded-[28px] bg-primary/10 blur-xl" />
      <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass/60 backdrop-blur-md shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-glass-border bg-glass/80 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dashboard</p>
            <p className="mt-1 text-lg font-bold text-foreground">Your reading week</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 p-5">
          {[
            { label: 'Library', value: 48 },
            { label: 'Reading', value: 3 },
            { label: 'Finished', value: 21 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-glass-border bg-secondary/40 p-3">
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Recent books</p>
            <span className="text-xs font-semibold text-primary">See all</span>
          </div>
          <div className="space-y-3">
            {shelfRows.map((book) => (
              <div key={book.title} className="flex items-center gap-3 rounded-xl border border-glass-border p-3 bg-secondary/20">
                <div className="h-14 w-9 rounded-md bg-secondary" style={{ borderBottom: `5px solid ${book.tone}` }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{book.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                </div>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-bold text-primary">
                  {book.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-glass-border bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Goal progress</p>
                <p className="text-xs text-muted-foreground">12 of 24 books</p>
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                50%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  return (
    <FadeIn delay={index * 80}>
      <div className="h-full rounded-xl border border-glass-border bg-glass/60 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <feature.icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
      </div>
    </FadeIn>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-transparent">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <FadeIn>
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass/60 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-foreground shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
              Built for readers who track what matters
            </motion.div>

            <h1 className="font-display text-5xl font-bold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
              {APP_NAME}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              {APP_TAGLINE}. A warm, practical place to organize your books, remember your thoughts, and keep your reading momentum visible.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Button asChild size="lg">
                <Link to={ROUTES.REGISTER}>
                  Start your library
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={ROUTES.LOGIN}>Sign in</Link>
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3.5">
              {[
                { value: '4', label: 'Shelf types' },
                { value: '20+', label: 'Book fields' },
                { value: '1', label: 'Reading home' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-glass-border bg-glass/60 backdrop-blur-sm p-4 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <ProductPreview />
        </FadeIn>
      </section>

      <section className="border-y border-glass-border bg-glass/30 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:grid-cols-3 sm:px-6">
          {[
            { icon: BookMarked, text: 'Build a personal library' },
            { icon: Search, text: 'Autofill from Google Books' },
            { icon: BarChart3, text: 'See your reading patterns' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3.5 text-sm font-semibold text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15">
                <item.icon className="h-4 w-4 text-success" />
              </span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">A cleaner way to read deliberately</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Simple tools, daily-useful details</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
