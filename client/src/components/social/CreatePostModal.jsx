import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setShowGuestWarning } from '@/features/auth/authSlice';
import {
  X, Image as ImageIcon, Sparkles, Brain, BookOpen, Feather, Heart,
  Trophy, Calendar, Book, Globe, Users, Lock, ChevronDown, Check,
  Smile, Frown, Zap, Compass, Moon, Mic, UploadCloud, Loader2,
  AlignLeft, AlignCenter, AlignRight, Type
} from 'lucide-react';
import { createPost } from '@/features/feed/feedSlice';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/common/ImageUpload';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services';

const isDefaultTimestamp = (text) => {
  if (!text) return false;
  const lines = text.split('\n');
  if (lines.length > 3) return false;
  const firstLine = lines[0].trim();
  const pattern = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s[A-Za-z]{3}\s\d{1,2},\s\d{4},?/i;
  return pattern.test(firstLine);
};

// ── Post type definitions ──────────────────────────────────────────────────────
const POST_TYPES = [
  {
    id: 'journal',
    label: 'Journal',
    Icon: Book,
    placeholder: "Dear Diary, write down your day here...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'thought',
    label: 'Thought',
    Icon: Brain,
    placeholder: "What's on your mind right now? Share your ideas, opinions, or anything you're thinking about...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'poem',
    label: 'Poem',
    Icon: Feather,
    placeholder: "Pour your words onto the page...\n\nEvery line a brushstroke,\nevery stanza a world.",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'emotion',
    label: 'Feeling',
    Icon: Heart,
    placeholder: "How are you feeling today? Don't hold back — this is your safe space to express yourself...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'book',
    label: 'Book',
    Icon: BookOpen,
    placeholder: "Share a book recommendation, a review, a favourite quote, or what you're reading right now...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    Icon: Trophy,
    placeholder: "Celebrate a reading milestone! Finished a tough book? Hit a reading goal? Share the win...",
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    activeBg: 'bg-primary/15',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isGuest = user?.role === 'GUEST';
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [postType, setPostType] = useState('journal');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Poetry custom design states
  const [poemStep, setPoemStep] = useState(1);
  const [poetryFontSize, setPoetryFontSize] = useState(15);
  const [poetryColor, setPoetryColor] = useState('white');
  const [poetryFontFamily, setPoetryFontFamily] = useState('serif');
  const [poetryAlign, setPoetryAlign] = useState('center');
  const [poetryOverlay, setPoetryOverlay] = useState(25);
  const [poetryCaption, setPoetryCaption] = useState('');
  const [transliterateHindi, setTransliterateHindi] = useState(false);
  const [poetryBg, setPoetryBg] = useState('');
  const [poetryPosition, setPoetryPosition] = useState({ x: 15, y: 15 });
  const [isUploadingPoetryBg, setIsUploadingPoetryBg] = useState(false);
  const poetryBgInputRef = useRef(null);
  const previewRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
  };

  const handleTextareaChange = async (e) => {
    const textarea = e.target;
    const val = textarea.value;
    setContent(val);

    if (!transliterateHindi) return;

    const pos = textarea.selectionStart;
    if (pos === 0) return;

    const lastChar = val.charAt(pos - 1);
    if (lastChar === ' ' || lastChar === '\n' || lastChar === '\r') {
      const textBefore = val.substring(0, pos - 1);
      const lastSpaceIdx = Math.max(textBefore.lastIndexOf(' '), textBefore.lastIndexOf('\n'));
      const startIdx = lastSpaceIdx === -1 ? 0 : lastSpaceIdx + 1;
      const word = textBefore.substring(startIdx);

      if (word && /^[a-zA-Z]+$/.test(word)) {
        try {
          const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`);
          const data = await res.json();
          if (data && data[0] === 'SUCCESS') {
            const transliterated = data[1][0][1][0];
            const newText = val.substring(0, startIdx) + transliterated + val.substring(pos - 1);
            
            setContent(newText);
            
            const diff = transliterated.length - word.length;
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(pos + diff, pos + diff);
            }, 0);
          }
        } catch (err) {
          console.error("Hindi transliteration error:", err);
        }
      }
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      
      // Get pointer position (mouse or touch)
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Calculate relative position as percentage
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      // Clamp coordinates to keep text block inside card preview
      x = Math.max(0, Math.min(x, 80));
      y = Math.max(0, Math.min(y, 80));

      setPoetryPosition({ x, y });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handlePoetryBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingPoetryBg(true);
      const res = await uploadService.uploadBookCover(file);
      const imageUrl = res.data.data.secureUrl;
      setPoetryBg(imageUrl);
      setPoetryPosition({ x: 15, y: 15 }); // reset position on change
      toast.success('Custom background set!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload custom background');
    } finally {
      setIsUploadingPoetryBg(false);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Check speech recognition support
  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSpeechSupported = !!SpeechRecognition;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!isSpeechSupported) {
      toast.error('Voice-to-text is not supported in this browser. Try Chrome or Edge.', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
        }
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          toast('Listening... Speak now', {
            id: 'voice-text-toast',
            duration: 8000,
            style: {
              borderRadius: '12px',
              background: 'var(--color-card)',
              color: 'var(--color-foreground)',
              border: '1px solid var(--color-glass-border)',
              fontSize: '13px',
            }
          });
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setContent((prev) => {
            const space = prev.length && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + transcript;
          });
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          if (event.error !== 'no-speech') {
            toast.error(`Voice input error: ${event.error}`, {
              style: {
                borderRadius: '12px',
                background: 'var(--color-card)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-glass-border)',
              }
            });
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          toast.dismiss('voice-text-toast');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const visibilityDropdownRef = useRef(null);

  const VISIBILITY_OPTIONS = [
    { value: 'PUBLIC', label: 'Public', icon: Globe },
    { value: 'FOLLOWERS', label: 'Followers', icon: Users },
    { value: 'PRIVATE', label: 'Only me', icon: Lock },
  ];

  const activeVisibility = VISIBILITY_OPTIONS.find((v) => v.value === visibility) || VISIBILITY_OPTIONS[0];

  const activeType = POST_TYPES.find((t) => t.id === postType);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Click outside visibility dropdown handler
  useEffect(() => {
    if (!showVisibilityDropdown) return;
    const handler = (e) => {
      if (visibilityDropdownRef.current && !visibilityDropdownRef.current.contains(e.target)) {
        setShowVisibilityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVisibilityDropdown]);

  // Load draft on mount/open
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem('sf_post_draft');
      if (savedDraft && !content) {
        setContent(savedDraft);
        toast.success('Recovered your unsaved draft!', {
          style: {
            borderRadius: '12px',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-glass-border)',
            fontSize: '12px',
          }
        });
      }
    }
  }, [isOpen]);

  // Auto-save draft
  useEffect(() => {
    if (content.trim()) {
      localStorage.setItem('sf_post_draft', content);
      setIsDraftSaved(true);
    } else {
      localStorage.removeItem('sf_post_draft');
      setIsDraftSaved(false);
    }
  }, [content]);

  // Pre-fill journal template on open if empty
  useEffect(() => {
    if (isOpen && postType === 'journal') {
      const savedDraft = localStorage.getItem('sf_post_draft');
      if (!savedDraft && !content.trim()) {
        const now = new Date();
        const dateString = now.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setContent(`${dateString}\n\n`);
      }
    }
  }, [isOpen, postType]);

  const handleClose = () => {
    setContent('');
    setImages([]);
    setVisibility('PUBLIC');
    setPostType('journal');
    setShowImageUpload(false);
    setPoetryBg('');
    setPoetryPosition({ x: 15, y: 15 });
    setPoemStep(1);
    setPoetryFontSize(15);
    setPoetryColor('white');
    setPoetryFontFamily('serif');
    setPoetryAlign('center');
    setPoetryOverlay(25);
    setPoetryCaption('');
    setTransliterateHindi(false);
    localStorage.removeItem('sf_post_draft');
    onClose();
  };

  const handlePostTypeChange = (typeId) => {
    setPostType(typeId);
    
    if (typeId === 'journal') {
      if (!content.trim() || isDefaultTimestamp(content)) {
        const now = new Date();
        const dateString = now.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setContent(`${dateString}\n\n`);
      }
    } else {
      if (isDefaultTimestamp(content)) {
        setContent('');
      }
    }
  };


  const insertEmoji = (emoji) => {
    const textarea = document.getElementById('post-composer-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      setContent(text.substring(0, start) + emoji + text.substring(end));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  const insertTimestamp = () => {
    const now = new Date();
    const dateString = now.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const timestamp = dateString;

    const textarea = document.getElementById('post-composer-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      setContent(text.substring(0, start) + timestamp + text.substring(end));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + timestamp.length, start + timestamp.length);
      }, 0);
    } else {
      setContent((prev) => prev + timestamp);
    }

    toast.success('Timestamp inserted!', {
      style: {
        borderRadius: '12px',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        border: '1px solid var(--color-glass-border)',
        fontSize: '11px',
      }
    });
  };

  const handleSubmit = async () => {
    // Guest guard — close modal and open sign-in prompt
    if (isGuest) {
      onClose();
      dispatch(setShowGuestWarning(true));
      return;
    }

    if (!content.trim() && images.length === 0) {
      toast.error('Post cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const contentHashtags = content.match(/#[a-zA-Z0-9_]+/g)?.map((tag) => tag.slice(1)) || [];
      const captionHashtags = poetryCaption.match(/#[a-zA-Z0-9_]+/g)?.map((tag) => tag.slice(1)) || [];
      const hashtags = Array.from(new Set([...contentHashtags, ...captionHashtags]));

      await dispatch(
        createPost({
          content,
          images,
          hashtags,
          visibility,
          ...(postType === 'poem' ? {
            poetryBg: poetryBg || undefined,
            poetryPosition: poetryBg ? JSON.stringify({
              x: poetryPosition.x,
              y: poetryPosition.y,
              fontSize: poetryFontSize,
              color: poetryColor,
              fontFamily: poetryFontFamily,
              align: poetryAlign,
              overlay: poetryOverlay,
              caption: poetryCaption
            }) : undefined,
          } : {})
        })
      ).unwrap();

      toast.success('Post published!');
      handleClose();
    } catch (error) {
      toast.error(error || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card/95 glass-card w-full h-[100dvh] sm:h-auto max-w-[560px] rounded-t-3xl sm:rounded-2xl border-0 sm:border border-glass-border shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[92vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
        
        {/* Mobile drag handle */}
        <div className="mx-auto my-2 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden shrink-0" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-2 sm:pt-4 pb-3 border-b border-glass-border">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-primary" />
            Create Post
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full h-8 w-8 text-muted-foreground hover:bg-secondary/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Post type selector ── */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 overflow-x-auto scrollbar-none shrink-0">
          {POST_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handlePostTypeChange(type.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border shrink-0',
                postType === type.id
                  ? `${type.color} ${type.activeBg} ${type.border}`
                  : 'text-muted-foreground border-transparent hover:bg-secondary/40 hover:text-foreground'
              )}
            >
              <type.Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex-1 overflow-y-auto min-h-0 flex flex-col gap-3">
          {/* Active type hint bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border',
              activeType.bg, activeType.border, activeType.color
            )}>
              <activeType.Icon className="w-3.5 h-3.5 shrink-0" />
              <span>
                {postType === 'journal' && 'Writing in your daily journal'}
                {postType === 'thought' && 'Sharing a thought'}
                {postType === 'poem' && (poemStep === 1 ? 'Writing a poem' : 'Designing your poem card')}
                {postType === 'emotion' && 'Expressing a feeling'}
                {postType === 'book' && 'Talking about a book'}
                {postType === 'milestone' && 'Celebrating a milestone'}
              </span>
            </div>
          </div>

          {postType === 'poem' && poemStep === 2 ? (
            /* ── Step 2: Poetry Background Designer & Controls ── */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground/80 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    Select Poetry Background
                  </span>
                  {poetryBg && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPoetryBg('');
                        setPoetryPosition({ x: 15, y: 15 });
                      }}
                      className="h-7 text-[10px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                    >
                      Clear Background
                    </Button>
                  )}
                </div>

                {/* Preset List & Upload button */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none shrink-0">
                  {/* Upload Custom BG Button */}
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      ref={poetryBgInputRef}
                      onChange={handlePoetryBgUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => poetryBgInputRef.current?.click()}
                      disabled={isUploadingPoetryBg}
                      className={cn(
                        "w-12 h-12 rounded-xl border border-dashed border-glass-border bg-secondary/15 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/25 transition-all cursor-pointer select-none",
                        isUploadingPoetryBg && "opacity-50 cursor-wait"
                      )}
                      title="Upload Custom Image"
                    >
                      {isUploadingPoetryBg ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-primary" />
                          <span className="text-[8px] font-semibold mt-0.5">Upload</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preset items */}
                  {[
                    { id: 'parchment', name: 'Vintage', url: 'https://images.unsplash.com/photo-1587080266227-677cd237c267?auto=format&fit=crop&w=400&q=80' },
                    { id: 'starry', name: 'Midnight', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=400&q=80' },
                    { id: 'forest', name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80' },
                    { id: 'sunset', name: 'Sunset', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80' },
                    { id: 'misty', name: 'Misty', url: 'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=400&q=80' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPoetryBg(preset.url);
                        setPoetryPosition({ x: 15, y: 15 });
                      }}
                      className={cn(
                        "group relative w-12 h-12 rounded-xl overflow-hidden border transition-all cursor-pointer shrink-0 select-none",
                        poetryBg === preset.url
                          ? "border-primary scale-95 ring-2 ring-primary/20 shadow-md shadow-primary/10"
                          : "border-glass-border hover:border-muted-foreground/40 hover:scale-102"
                      )}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] font-bold text-white text-center py-0.5 select-none truncate">
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Controls (Size and Color) */}
              {/* Design Controls (Size, Color, Font, Alignment, Vignette) */}
              {poetryBg && (
                <div className="flex flex-col gap-3 bg-secondary/10 border border-glass-border/30 rounded-xl p-3 shrink-0 select-none text-xs">
                  {/* Row 1: Font Size & Alignment */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Font Size */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Size:</span>
                      <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-0.5 border border-glass-border/30">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPoetryFontSize((s) => Math.max(10, s - 1))}
                          className="w-6 h-6 hover:bg-secondary/40 text-[10px] font-bold rounded-md cursor-pointer"
                          title="Zoom Out Font"
                        >
                          A-
                        </Button>
                        <span className="text-[11px] font-bold px-1.5 min-w-[20px] text-center">
                          {poetryFontSize}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPoetryFontSize((s) => Math.min(32, s + 1))}
                          className="w-6 h-6 hover:bg-secondary/40 text-[10px] font-bold rounded-md cursor-pointer"
                          title="Zoom In Font"
                        >
                          A+
                        </Button>
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Align:</span>
                      <div className="flex bg-secondary/30 rounded-lg p-0.5 border border-glass-border/30">
                        {[
                          { value: 'left', Icon: AlignLeft },
                          { value: 'center', Icon: AlignCenter },
                          { value: 'right', Icon: AlignRight }
                        ].map((ta) => (
                          <button
                            key={ta.value}
                            type="button"
                            onClick={() => setPoetryAlign(ta.value)}
                            className={cn(
                              "w-6 h-6 flex items-center justify-center rounded-md transition-all cursor-pointer text-muted-foreground",
                              poetryAlign === ta.value 
                                ? "bg-card text-foreground shadow-sm font-black" 
                                : "hover:text-foreground"
                            )}
                          >
                            <ta.Icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Color & Vignette */}
                  <div className="flex flex-wrap items-center gap-4 border-t border-glass-border/10 pt-2.5">
                    {/* Text Color */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Color:</span>
                      <div className="flex bg-secondary/30 rounded-lg p-0.5 border border-glass-border/30">
                        {[
                          { value: 'white', label: 'White' },
                          { value: 'black', label: 'Black' }
                        ].map((tc) => (
                          <button
                            key={tc.value}
                            type="button"
                            onClick={() => setPoetryColor(tc.value)}
                            className={cn(
                              "px-2.5 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer",
                              poetryColor === tc.value 
                                ? "bg-card text-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {tc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vignette Overlay */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overlay:</span>
                      <div className="flex bg-secondary/30 rounded-lg p-0.5 border border-glass-border/30">
                        {[
                          { value: 0, label: 'None' },
                          { value: 25, label: 'Soft' },
                          { value: 55, label: 'Mood' }
                        ].map((ov) => (
                          <button
                            key={ov.value}
                            type="button"
                            onClick={() => setPoetryOverlay(ov.value)}
                            className={cn(
                              "px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer",
                              poetryOverlay === ov.value 
                                ? "bg-card text-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {ov.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Font Picker */}
                  <div className="flex flex-col gap-1.5 border-t border-glass-border/10 pt-2.5 w-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-0.5">Font Style:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { value: 'serif', label: 'Classic Serif' },
                        { value: 'sans', label: 'Modern Sans' },
                        { value: 'display', label: 'Royal Display' },
                        { value: 'yatra', label: 'Vintage Hindi' },
                        { value: 'cursive', label: 'Calligraphy' },
                        { value: 'handwritten', label: 'Handwritten' },
                        { value: 'mono', label: 'Retro Mono' }
                      ].map((ff) => (
                        <button
                          key={ff.value}
                          type="button"
                          onClick={() => setPoetryFontFamily(ff.value)}
                          className={cn(
                            "px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer border border-glass-border/10",
                            poetryFontFamily === ff.value 
                              ? "bg-card text-foreground border-primary/25 shadow-sm font-black" 
                              : "bg-secondary/10 text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                          )}
                        >
                          {ff.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Live Card Preview Box */}
              <div className="flex-1 flex flex-col gap-2 min-h-[220px]">
                <div className="flex items-center justify-between px-1 shrink-0">
                  <span className="text-[10px] font-extrabold text-muted-foreground/60 tracking-wider uppercase">
                    Live Card (Hold & Drag Text)
                  </span>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full select-none animate-pulse flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 shrink-0" /> Drag to position
                  </span>
                </div>

                <div
                  ref={previewRef}
                  className={cn(
                    "relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-glass-border shadow-md select-none flex items-center justify-center transition-all duration-300",
                    !poetryBg && "bg-secondary/10 border-dashed border-2 flex-col gap-2 p-6"
                  )}
                  style={poetryBg ? {
                    backgroundImage: `url(${poetryBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    containerType: 'inline-size',
                  } : {}}
                >
                  {poetryBg && (
                    <div 
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        opacity: poetryOverlay / 100
                      }}
                    />
                  )}

                  {poetryBg ? (
                    <div
                      onMouseDown={handleDragStart}
                      onTouchStart={handleDragStart}
                      className={cn(
                        "absolute cursor-move select-none p-3.5 max-w-[85%] shadow-none",
                        poetryAlign === 'left' ? 'text-left' : poetryAlign === 'right' ? 'text-right' : 'text-center',
                        isDragging ? "ring-2 ring-primary/40 rounded-xl cursor-grabbing scale-[1.01]" : ""
                      )}
                      style={{
                        left: `${poetryPosition.x}%`,
                        top: `${poetryPosition.y}%`,
                        fontSize: `${(poetryFontSize * 0.22).toFixed(2)}cqw`,
                        color: poetryColor === 'black' ? '#000000' : '#ffffff',
                        textShadow: poetryColor === 'black' 
                          ? '1px 1px 2px rgba(255,255,255,0.7)' 
                          : '1px 1px 3px rgba(0,0,0,0.85), 0 0 5px rgba(0,0,0,0.5)',
                        touchAction: 'none',
                        fontFamily: 
                          poetryFontFamily === 'serif' ? "'Playfair Display', Georgia, serif" :
                          poetryFontFamily === 'sans' ? "'Poppins', sans-serif" :
                          poetryFontFamily === 'display' ? "'Cinzel', serif" :
                          poetryFontFamily === 'yatra' ? "'Yatra One', cursive" :
                          poetryFontFamily === 'cursive' ? "'Great Vibes', cursive" :
                          poetryFontFamily === 'handwritten' ? "'Caveat', cursive" :
                          poetryFontFamily === 'mono' ? "Courier New, monospace" :
                          "'Playfair Display', Georgia, serif",
                        fontWeight: 
                          poetryFontFamily === 'serif' ? '600' :
                          poetryFontFamily === 'sans' ? '500' :
                          poetryFontFamily === 'display' ? '700' :
                          poetryFontFamily === 'yatra' ? '400' :
                          poetryFontFamily === 'cursive' ? '400' :
                          poetryFontFamily === 'handwritten' ? '600' :
                          'normal'
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {content.trim() || "Pour your words onto the page..."}
                      </p>
                      {(user?.penName || user?.username) && (
                        <p 
                          className="text-right mt-2.5 font-sans font-semibold tracking-wider opacity-80"
                          style={{ fontSize: `${(Math.max(10, poetryFontSize - 2.5) * 0.22).toFixed(2)}cqw` }}
                        >
                          — {user.penName ? user.penName : `@${user.username}`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40 animate-pulse" />
                      <p className="text-xs font-semibold">Select a background above to start designing</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Select presets or upload your own wallpaper</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Post Caption / Description */}
              {poetryBg && (
                <div className="flex flex-col gap-1 shrink-0 mt-2 select-none">
                  <span className="text-[10px] font-extrabold text-muted-foreground/60 tracking-wider uppercase pl-1">
                    Caption / Notes (shown below the card in feed)
                  </span>
                  <textarea
                    value={poetryCaption}
                    onChange={(e) => setPoetryCaption(e.target.value)}
                    placeholder="Add thoughts, the background story, or hashtags for your feed card..."
                    className="w-full min-h-[50px] max-h-[80px] text-xs font-sans rounded-xl border border-glass-border/30 bg-secondary/10 px-3 py-2 outline-none resize-none focus:border-primary/45 focus:ring-1 focus:ring-primary/20 text-foreground"
                  />
                </div>
              )}
            </div>
          ) : (
            /* ── Step 1: Standard Editor ── */
            <>
              <div className="flex flex-col mt-1 flex-1 min-h-0">
                {/* Mood Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border border-glass-border bg-secondary/15 rounded-t-xl select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Mood:</span>
                    <button
                      type="button"
                      onClick={() => setTransliterateHindi((v) => !v)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer select-none active:scale-95",
                        transliterateHindi 
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-black shadow-sm"
                          : "bg-secondary/20 text-muted-foreground border-glass-border/30 hover:text-foreground"
                      )}
                      title="Type in English (Hinglish) and press Space/Enter to convert to Hindi"
                    >
                      <Globe className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Hinglish → Hindi</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { Icon: Smile, label: 'Happy', emoji: '😊' },
                      { Icon: Compass, label: 'Calm', emoji: '🧘' },
                      { Icon: Frown, label: 'Sad', emoji: '😔' },
                      { Icon: Zap, label: 'Excited', emoji: '⚡' },
                      { Icon: Moon, label: 'Reflective', emoji: '🍂' },
                    ].map((m) => (
                      <button
                        key={m.label}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertEmoji(m.emoji)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                        title={m.label}
                      >
                        <m.Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea container */}
                <div className={cn(
                  "rounded-b-xl border border-t-0 border-glass-border bg-secondary/10 px-4 py-3.5 transition-all duration-200 flex-1 flex flex-col min-h-[140px]",
                  postType === 'journal' && 'focus-within:border-teal-500/40 focus-within:ring-4 focus-within:ring-teal-500/10',
                  postType === 'thought' && 'focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/10',
                  postType === 'poem' && 'focus-within:border-pink-500/40 focus-within:ring-4 focus-within:ring-pink-500/10',
                  postType === 'emotion' && 'focus-within:border-rose-500/40 focus-within:ring-4 focus-within:ring-rose-500/10',
                  postType === 'book' && 'focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10',
                  postType === 'milestone' && 'focus-within:border-amber-500/40 focus-within:ring-4 focus-within:ring-amber-500/10'
                )}>
                  <textarea
                    id="post-composer-textarea"
                    value={content}
                    onChange={handleTextareaChange}
                    placeholder={activeType.placeholder}
                    style={{
                      color: 'var(--color-foreground)',
                      ...(postType === 'journal' ? {
                        backgroundImage: 'linear-gradient(rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
                        backgroundSize: '100% 28px',
                        lineHeight: '28px',
                        paddingTop: '6px',
                      } : {
                        lineHeight: '24px',
                      })
                    }}
                    className={cn(
                      'w-full flex-1 resize-none border-none outline-none focus:outline-none focus:ring-0 p-0',
                      'bg-transparent text-[15.5px] font-serif tracking-wide text-foreground/90',
                      'placeholder:text-muted-foreground/50',
                      postType === 'poem' ? 'italic leading-loose text-center' : 'text-left'
                    )}
                  />
                </div>
              </div>

              {showImageUpload && (
                <div className="mt-2 p-2 border border-glass-border rounded-xl bg-secondary/10 relative shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full w-7 h-7 shadow-sm bg-background border-border z-10 hover:text-destructive"
                    onClick={() => {
                      setShowImageUpload(false);
                      setImages([]);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                  <ImageUpload
                    value={images[0]}
                    onChange={(url) => setImages(url ? [url] : [])}
                    compact
                  />
                </div>
              )}

              {/* Stats Bar */}
              <div className="mt-2.5 flex items-center justify-between px-1 select-none">
                <div className="flex gap-3 text-[10.5px] font-bold text-muted-foreground/50">
                  <span className={cn(wordCount > 10000 ? 'text-destructive font-extrabold' : '')}>
                    {wordCount} / 10,000 words
                  </span>
                  <span>•</span>
                  <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
                  {isDraftSaved && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-500/80 animate-pulse font-extrabold flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Auto-saved
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[10.5px] font-bold text-muted-foreground/45">
                  {content.length} characters
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 border-t border-glass-border flex flex-wrap items-center justify-between bg-secondary/5 rounded-b-2xl gap-2">
          {postType === 'poem' && poemStep === 2 ? (
            <Button
              variant="ghost"
              onClick={() => setPoemStep(1)}
              className="rounded-full px-5 font-semibold text-muted-foreground hover:bg-secondary/40 cursor-pointer"
            >
              ← Back to Edit
            </Button>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              {/* Image toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:text-primary hover:bg-primary/10 h-9 w-9 text-muted-foreground"
                onClick={() => setShowImageUpload((v) => !v)}
                title="Add image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>

              {/* Timestamp button */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:text-primary hover:bg-primary/10 h-9 w-9 text-muted-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertTimestamp}
                title="Insert Date & Time"
              >
                <Calendar className="w-4 h-4" />
              </Button>

              {/* Voice to text button */}
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className={cn(
                  "rounded-full h-9 w-9 transition-all duration-300 cursor-pointer",
                  isListening 
                    ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-600 animate-pulse border border-red-500/20" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                  !isSpeechSupported && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                )}
                onClick={toggleListening}
                title={!isSpeechSupported ? "Voice to text (not supported in this browser)" : isListening ? "Stop listening" : "Voice to text"}
              >
                <Mic className="w-4 h-4" />
              </Button>

              {/* Visibility Selector */}
              <div className="relative" ref={visibilityDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowVisibilityDropdown((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-border bg-card text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <activeVisibility.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>{activeVisibility.label}</span>
                  <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform shrink-0", showVisibilityDropdown && "rotate-180")} />
                </button>

                {showVisibilityDropdown && (
                  <div className="absolute left-0 bottom-full mb-1 w-32 rounded-xl border border-glass-border bg-card/95 backdrop-blur-md shadow-xl z-50 overflow-hidden py-1 animate-in fade-in duration-100">
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setVisibility(opt.value);
                          setShowVisibilityDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer",
                          opt.value === visibility ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <opt.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {postType === 'poem' && poemStep === 1 ? (
            <Button
              onClick={() => {
                if (!content.trim()) {
                  toast.error('Please write your poem first');
                  return;
                }
                setPoemStep(2);
              }}
              className="rounded-full px-6 font-semibold transition-all duration-150 shadow-sm cursor-pointer"
            >
              Next: Design Card →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && images.length === 0) || wordCount > 10000}
              className={cn(
                'rounded-full px-6 font-semibold transition-all duration-150',
                activeType.id !== 'thought' && !isSubmitting ? `shadow-sm` : ''
              )}
            >
              {isSubmitting ? 'Posting...' : 'Publish Post'}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
