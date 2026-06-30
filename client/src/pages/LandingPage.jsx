import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/authHooks';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BarChart3, BookMarked, BookOpen,
  Library, Search, Star, Target, Sparkles, Users,
  MessageCircle, Bookmark, Trophy, Zap, Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { APP_NAME, ROUTES } from '@/constants';

/* ─── Static Data ─────────────────────────────────────────────── */
const BOOKS = [
  { title: 'Fourth Wing', author: 'Rebecca Yarros', genre: 'Fantasy', status: 'Reading', color: '#7c3aed' },
  { title: 'Educated', author: 'Tara Westover', genre: 'Memoir', status: 'Read', color: '#059669' },
  { title: 'Piranesi', author: 'Susanna Clarke', genre: 'Mystery', status: 'Wishlist', color: '#d97706' },
  { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', status: 'Read', color: '#059669' },
  { title: 'The Midnight Library', author: 'Matt Haig', genre: 'Fiction', status: 'Reading', color: '#7c3aed' },
];

const FEATURES = [
  {
    icon: Library,
    title: 'Smart Shelves',
    description: 'Organize into Reading, Read, Wishlist, or Dropped. Never lose track of where you left off.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Search,
    title: 'Google Books Import',
    description: 'Search millions of titles. One click fills in cover, author, ISBN, and description.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: BarChart3,
    title: 'Reading Analytics',
    description: 'Track pages per day, yearly targets, streaks, and genre distributions with rich charts.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Users,
    title: 'Community Feed',
    description: 'Share reviews, book quotes, and updates with fellow readers. Like and comment on posts.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Star,
    title: 'Notes & Ratings',
    description: 'Private ratings, detailed reviews, and personal reflections stored alongside each book.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Earn badges, unlock streaks, and hit milestones that keep your reading habit alive.',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
];

const STATS = [
  { value: '6', label: 'Core Features', icon: Zap },
  { value: '4', label: 'Shelf Types', icon: Library },
  { value: '∞', label: 'Books to track', icon: BookOpen },
  { value: '100%', label: 'Free to Use', icon: Sparkles },
];

const TESTIMONIALS = [
  { name: 'Arjun S.', handle: '@arjun_reads', text: 'Finally a reading tracker that doesn\'t feel like a chore. The community feed alone makes it worth it.', avatar: 'AS' },
  { name: 'Priya M.', handle: '@priya_books', text: 'Hit my annual reading goal for the first time ever. ShelfForge kept me accountable all year.', avatar: 'PM' },
  { name: 'Rahul K.', handle: '@rahulkumar', text: 'The Google Books import is a game changer. Added my entire 80-book backlog in under 10 minutes.', avatar: 'RK' },
];

/* ─── Animated Book Spine ─────────────────────────────────────── */
function BookSpine({ book, index, total }) {
  const angle = ((index - total / 2) * 8);
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -30, y: 20 }}
      animate={{ opacity: 1, rotateY: angle, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.08, rotateY: 0, zIndex: 20 }}
      className="relative cursor-pointer group"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="w-12 h-36 rounded-sm shadow-xl flex flex-col items-center justify-end pb-2 border border-white/10"
        style={{ background: `linear-gradient(160deg, ${book.color}cc, ${book.color}66)` }}
      >
        <span className="text-white/80 text-[8px] font-bold tracking-wider rotate-90 whitespace-nowrap"
          style={{ writingMode: 'vertical-rl' }}>
          {book.title}
        </span>
      </div>
      {/* Hover tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-36 bg-card/95 backdrop-blur-md border border-glass-border rounded-xl p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-none user-menu-dropdown">
        <p className="text-[11px] font-bold text-foreground truncate">{book.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{book.author}</p>
        <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold"
          style={{ background: `${book.color}20`, color: book.color }}>
          {book.status}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Floating Activity Card ──────────────────────────────────── */
function ActivityCard({ icon: Icon, text, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-2xl border border-glass-border bg-card/80 backdrop-blur-md px-4 py-3 shadow-lg"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-foreground truncate">{text}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function LandingPage() {
  const { isAuthenticated, user, guestLogin } = useAuth();
  const [isLoggingInGuest, setIsLoggingInGuest] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleGuestLogin = async () => {
    setIsLoggingInGuest(true);
    try { await guestLogin(); } catch (e) { console.error(e); } finally { setIsLoggingInGuest(false); }
  };

  return (
    <div className="overflow-x-hidden bg-transparent">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-32 top-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[80px]"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto grid w-full max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28"
        >
          {/* Left Column */}
          <div>
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              {isAuthenticated
                ? `Welcome back, ${user?.name || user?.username}! 👋`
                : 'Your personal reading companion'}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl font-extrabold leading-[1.0] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              Forge Your
              <span className="block mt-1 bg-gradient-to-r from-primary via-accent to-emerald-400 bg-clip-text text-transparent">
                Reading Legacy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
            >
              {APP_NAME} is where readers track every book, discover their habits, share thoughts with a community, and hit reading goals — all in one beautiful space.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow text-sm font-bold px-7">
                    <Link to={ROUTES.DASHBOARD}>Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-glass-border hover:border-primary/50 px-7">
                    <Link to={ROUTES.LIBRARY}>My Library</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 hover:opacity-90 text-sm font-bold px-7 py-5">
                    <Link to={ROUTES.REGISTER}>Start for Free <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-glass-border hover:border-primary/50 px-7 py-5">
                    <Link to={ROUTES.LOGIN}>Sign In</Link>
                  </Button>
                  <button
                    onClick={handleGuestLogin}
                    disabled={isLoggingInGuest}
                    className="text-sm font-semibold text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors disabled:opacity-50"
                  >
                    {isLoggingInGuest ? 'Loading preview…' : 'Browse as Guest →'}
                  </button>
                </>
              )}
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {['AR', 'PM', 'RK', 'SJ'].map((initials, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary-foreground"
                    style={{ background: `hsl(${240 + i * 30}, 70%, 55%)` }}>
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">200+</span> readers already tracking
              </p>
            </motion.div>
          </div>

          {/* Right Column — Book shelf + activity */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex flex-col items-center gap-8"
          >
            {/* 3-D Bookshelf */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-x-0 bottom-0 h-2 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm" />
              <div className="flex items-end justify-center gap-2 perspective-[800px]" style={{ perspective: '800px' }}>
                {BOOKS.map((book, i) => (
                  <BookSpine key={book.title} book={book} index={i} total={BOOKS.length} />
                ))}
              </div>
              {/* Shelf plank */}
              <div className="mt-1 h-3 rounded-sm bg-gradient-to-r from-secondary/60 via-secondary/80 to-secondary/60 border border-glass-border shadow-md" />
              <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground/60 tracking-wider uppercase">Hover to preview</p>
            </div>

            {/* Live-ish activity cards */}
            <div className="w-full max-w-xs space-y-2.5">
              <ActivityCard icon={BookOpen} text="Started reading Piranesi" sub="2 minutes ago" color="bg-violet-500" delay={0.6} />
              <ActivityCard icon={Star} text="Rated Fourth Wing ★ 5" sub="15 minutes ago" color="bg-amber-500" delay={0.75} />
              <ActivityCard icon={MessageCircle} text="Left a comment on Educated" sub="1 hour ago" color="bg-blue-500" delay={0.9} />
              <ActivityCard icon={Trophy} text="Goal reached: 12 books 🎉" sub="Yesterday" color="bg-emerald-500" delay={1.05} />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section className="border-y border-glass-border/60 bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold uppercase tracking-widest text-primary"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Built for<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> serious readers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-4 max-w-xl mx-auto text-base text-muted-foreground"
          >
            Every feature is designed around one goal: helping you read more, remember better, and share freely.
          </motion.p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-card/60 backdrop-blur-sm p-6 shadow-sm transition-shadow hover:shadow-xl`}
            >
              {/* Gradient accent top bar */}
              <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-base font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="border-y border-glass-border/50 bg-card/30 backdrop-blur-md py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-8">What readers say</p>
          <div className="relative h-40">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t, i) =>
                i === activeTestimonial ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm shadow-md">
                      {t.avatar}
                    </div>
                    <p className="text-lg font-semibold text-foreground leading-relaxed max-w-xl">
                      "{t.text}"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">{t.name}</span> {t.handle}
                    </p>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-emerald-500 p-12 text-center shadow-2xl shadow-primary/20"
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <Bookmark className="mx-auto mb-6 h-10 w-10 text-white/80" />
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Ready to forge your library?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80 text-base leading-relaxed">
            Join readers who never lose track of a book again. Free, forever.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl px-8 py-5">
                <Link to={ROUTES.DASHBOARD}>Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl px-8 py-5">
                  <Link to={ROUTES.REGISTER}>Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <button
                  onClick={handleGuestLogin}
                  disabled={isLoggingInGuest}
                  className="text-sm font-semibold text-white/80 hover:text-white underline-offset-4 hover:underline transition-colors disabled:opacity-50 self-center"
                >
                  {isLoggingInGuest ? 'Loading…' : 'Browse as Guest first'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </section>

    </div>
  );
}
