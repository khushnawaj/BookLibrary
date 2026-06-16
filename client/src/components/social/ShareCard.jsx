import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Target, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ShareCard — renders a beautiful, shareable card for:
 *   type: 'review' | 'achievement' | 'goal' | 'book'
 *
 * Usage:
 *   <ShareCard type="review" data={{ title, author, rating, review, coverImage }} />
 *   <ShareCard type="achievement" data={{ name, description, icon }} />
 *   <ShareCard type="goal" data={{ title, current, target, unit }} />
 */
export function ShareCard({ type, data, onClose }) {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ShelfForge-${type}-card.png`;
      link.href = url;
      link.click();
    } catch {
      // fallback: just copy text
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleShare = async (platform) => {
    const text = getShareText(type, data);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        {/* The card itself */}
        <div ref={cardRef} className="relative overflow-hidden rounded-2xl">
          {type === 'review' && <ReviewCard data={data} />}
          {type === 'achievement' && <AchievementCard data={data} />}
          {type === 'goal' && <GoalCard data={data} />}
          {type === 'book' && <BookCard data={data} />}
        </div>

        {/* Share actions */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-center text-muted-foreground">Share to</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'twitter', label: 'X / Twitter', emoji: '𝕏' },
              { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
              { id: 'facebook', label: 'Facebook', emoji: '📘' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleShare(p.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[11px] text-muted-foreground">{p.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Save Image
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Card Layouts ─────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ data }) {
  return (
    <div
      className="p-6 flex flex-col gap-4 min-h-[420px]"
      style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff',
      }}
    >
      <div className="flex items-center gap-2 text-xs text-white/50 font-medium tracking-widest uppercase">
        <BookOpen className="w-3.5 h-3.5" />
        ShelfForge Review
      </div>

      <div className="flex gap-4 items-start">
        {data.coverImage && (
          <img
            src={data.coverImage}
            alt={data.title}
            className="w-20 h-28 object-cover rounded-lg shadow-2xl shrink-0"
            crossOrigin="anonymous"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold leading-tight">{data.title}</h2>
          <p className="text-white/60 text-sm mt-1">{data.author}</p>
          <div className="mt-2">
            <StarRating rating={data.rating} />
          </div>
        </div>
      </div>

      {data.review && (
        <blockquote className="text-sm text-white/80 leading-relaxed italic border-l-2 border-white/20 pl-4 line-clamp-4">
          "{data.review}"
        </blockquote>
      )}

      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-white/40">shelfforge.app</span>
        <span className="text-xs text-white/40">#{data.title?.replace(/\s/g, '')}</span>
      </div>
    </div>
  );
}

function AchievementCard({ data }) {
  return (
    <div
      className="p-6 flex flex-col items-center gap-4 min-h-[360px]"
      style={{
        background: 'linear-gradient(135deg, #1a1a0f 0%, #2d2600 50%, #1a1200 100%)',
        color: '#ffffff',
      }}
    >
      <div className="flex items-center gap-2 text-xs text-amber-400/70 font-medium tracking-widest uppercase">
        <Trophy className="w-3.5 h-3.5" />
        Achievement Unlocked
      </div>

      <div className="w-24 h-24 rounded-full border-4 border-amber-400/40 flex items-center justify-center text-5xl bg-amber-400/10 shadow-lg shadow-amber-400/20">
        {data.icon || '🏆'}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold">{data.name}</h2>
        <p className="text-white/60 text-sm mt-2">{data.description}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 w-full flex items-center justify-between">
        <span className="text-xs text-white/40">shelfforge.app</span>
        <span className="text-xs text-amber-400/60">#ReadingGoals</span>
      </div>
    </div>
  );
}

function GoalCard({ data }) {
  const progress = Math.min(100, Math.round((data.current / data.target) * 100));
  return (
    <div
      className="p-6 flex flex-col gap-5 min-h-[360px]"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #0f1f0f 50%, #0a0a1a 100%)',
        color: '#ffffff',
      }}
    >
      <div className="flex items-center gap-2 text-xs text-emerald-400/70 font-medium tracking-widest uppercase">
        <Target className="w-3.5 h-3.5" />
        Reading Goal
      </div>

      <div>
        <h2 className="text-2xl font-bold">{data.title}</h2>
        <p className="text-white/50 text-sm mt-1">{data.current} / {data.target} {data.unit}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-emerald-400">{progress}% complete</p>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-white/40">shelfforge.app</span>
        <span className="text-xs text-emerald-400/60">#ReadingChallenge</span>
      </div>
    </div>
  );
}

function BookCard({ data }) {
  return (
    <div
      className="p-6 flex flex-col gap-4 min-h-[420px]"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 100%)',
        color: '#ffffff',
      }}
    >
      <div className="flex items-center gap-2 text-xs text-violet-400/70 font-medium tracking-widest uppercase">
        <BookOpen className="w-3.5 h-3.5" />
        Currently Reading
      </div>

      <div className="flex gap-4 items-start">
        {data.coverImage && (
          <img
            src={data.coverImage}
            alt={data.title}
            className="w-24 h-36 object-cover rounded-lg shadow-2xl shrink-0"
            crossOrigin="anonymous"
          />
        )}
        <div className="flex-1 min-w-0 mt-2">
          <h2 className="text-xl font-bold leading-tight">{data.title}</h2>
          <p className="text-white/60 text-sm mt-1">{data.author}</p>
          {data.progress !== undefined && (
            <div className="mt-4 space-y-1.5">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              <p className="text-xs text-violet-400">{data.progress}% read</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-white/40">shelfforge.app</span>
        <span className="text-xs text-violet-400/60">#{data.title?.replace(/\s/g, '')}</span>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getShareText(type, data) {
  switch (type) {
    case 'review':
      return `I just rated "${data.title}" by ${data.author} ${'⭐'.repeat(data.rating)} on ShelfForge!\n\n"${data.review}"\n\nshelfforge.app`;
    case 'achievement':
      return `I unlocked the "${data.name}" achievement on ShelfForge! ${data.icon || '🏆'}\n\nshelfforge.app`;
    case 'goal':
      return `I'm ${Math.round((data.current / data.target) * 100)}% through my reading goal: "${data.title}" on ShelfForge! 📚\n\nshelfforge.app`;
    case 'book':
      return `Currently reading "${data.title}" by ${data.author} on ShelfForge 📖\n\nshelfforge.app`;
    default:
      return 'Check out ShelfForge - the social reading platform! shelfforge.app';
  }
}
