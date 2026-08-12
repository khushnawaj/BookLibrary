import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Bold, Italic, Strikethrough, Code, Quote, Heading3,
  Sparkles, Loader2, BookOpen, Feather, Lock, Globe, FileText,
  Image as ImageIcon, Upload, Languages, Users, Send, PenTool, Book,
  ChevronLeft, Trash2, RefreshCw, Eye, EyeOff, X, Settings2, CheckCircle2,
  Maximize2, Check, SlidersHorizontal, Plus, ToggleLeft, ToggleRight,
  Layers, FolderPlus, BookMarked, Edit3, MoreVertical, Edit2, ArrowLeft, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workService, uploadService } from '@/services';
import { cn } from '@/lib/utils';
import { format as formatDate } from 'date-fns';
import { useConfirm } from '@/components/common/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

// Languages restricted strictly to English, Hindi, and Hinglish
const LANGUAGES = [
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'Hindi (हिंदी)' },
  { id: 'Hinglish', label: 'Hinglish' },
];

const WORK_CATEGORIES = [
  'Action & Adventure', 'Biography', 'Children', 'Creative Non-Fiction',
  'Crime', 'Fantasy', 'Historical', 'Horror', 'Humour', 'Motivational',
  'Romance', 'Satire', 'Sci-Fi', 'Short Story', 'Thriller', 'Young Adult'
];

export default function WritingEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const fileInputRef = useRef(null);

  // Storage key for localStorage auto-save draft
  const draftStorageKey = `shelfforge_manuscript_draft_${id || 'new'}`;

  // Publishing Mode: 'NEW_POST' | 'EXISTING_POST'
  const [publishMode, setPublishMode] = useState('NEW_POST');
  const [existingWorks, setExistingWorks] = useState([]);
  const [selectedExistingWorkId, setSelectedExistingWorkId] = useState('');

  // Canvas Mode: 'EDIT' | 'PREVIEW' (WYSIWYG Live Rendered View)
  const [editorCanvasMode, setEditorCanvasMode] = useState('EDIT');

  // Active Focused Field Target for Transliteration: 'CONTENT' | 'TITLE'
  const [activeFieldTarget, setActiveFieldTarget] = useState('CONTENT');

  // Manuscript Overview State
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('STORY'); // STORY | POEM | BLOG | DIARY
  const [language, setLanguage] = useState('English');
  const [transliterateHindi, setTransliterateHindi] = useState(false); // Optional Hinglish → Hindi Transliteration
  const [usePurnaViram, setUsePurnaViram] = useState(true); // Automatically convert '.' to Devnagari '।'
  const [genre, setGenre] = useState('General');
  const [selectedCategories, setSelectedCategories] = useState(['Romance']);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('PUBLISHED'); // PUBLISHED | DRAFT
  const [visibility, setVisibility] = useState('PUBLIC'); // PUBLIC | FOLLOWERS | PRIVATE
  const [copyrightAccepted, setCopyrightAccepted] = useState(true);

  // Multi-Chapter Management State
  const [chaptersList, setChaptersList] = useState([
    { id: 'ch-1', title: 'Chapter 1', content: '' }
  ]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Auto-Save Status: 'idle' | 'saving' | 'saved'
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');

  // Hindi Transliteration Candidates State (e.g. beta -> ['बेटा', 'बीटा', 'बेट'])
  const [transliterationCandidates, setTransliterationCandidates] = useState([]);
  const [activeWordInfo, setActiveWordInfo] = useState(null); // { word, startIdx, pos, isTitle }

  // UI Modals & Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);

  // Fetch author's existing works for append mode
  useEffect(() => {
    if (!user) return;
    const fetchUserWorks = async () => {
      try {
        const res = await workService.getUserWorks(user.username);
        setExistingWorks(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserWorks();
  }, [user]);

  // Active Chapter Pointer
  const activeChapter = chaptersList[activeChapterIndex] || chaptersList[0] || { id: 'ch-1', title: 'Chapter 1', content: '' };

  // Update active chapter fields cleanly
  const setChapterTitle = (newTitle) => {
    setChaptersList((prev) => {
      const copy = [...prev];
      if (copy[activeChapterIndex]) {
        copy[activeChapterIndex] = { ...copy[activeChapterIndex], title: newTitle };
      }
      return copy;
    });
  };

  const setContent = (newContent) => {
    setChaptersList((prev) => {
      const copy = [...prev];
      if (copy[activeChapterIndex]) {
        copy[activeChapterIndex] = { ...copy[activeChapterIndex], content: newContent };
      }
      return copy;
    });
  };

  // Handle selecting an existing work to append chapter into
  const handleSelectExistingWork = (workId) => {
    setSelectedExistingWorkId(workId);
    if (!workId) return;
    const targetWork = existingWorks.find((w) => w._id === workId);
    if (targetWork) {
      setTitle(targetWork.title || '');
      setContentType(targetWork.contentType || 'STORY');
      setLanguage(targetWork.language || 'English');
      setCoverImage(targetWork.coverImage || '');
      setSummary(targetWork.summary || '');
      if (targetWork.genre) setSelectedCategories([targetWork.genre]);
      
      const nextChapterNum = (targetWork.chapters?.length || 0) + 1;
      setChapterTitle(`Chapter ${nextChapterNum}`);
      toast.success(`Will publish as Chapter ${nextChapterNum} of "${targetWork.title}"`);
    }
  };

  // Add new chapter to single post manuscript
  const handleAddChapter = () => {
    const nextNum = chaptersList.length + 1;
    const defaultLabel = contentType === 'POEM' ? `Stanza ${nextNum}` : `Chapter ${nextNum}`;
    const newChapterObj = {
      id: `ch-${Date.now()}`,
      title: defaultLabel,
      content: '',
    };
    const updated = [...chaptersList, newChapterObj];
    setChaptersList(updated);
    setActiveChapterIndex(updated.length - 1);
    toast.success(`Added ${defaultLabel}`);
  };

  // Remove chapter from manuscript
  const handleDeleteChapter = async (indexToDelete, e) => {
    e.stopPropagation();
    if (chaptersList.length <= 1) {
      toast.error('Manuscript must have at least 1 chapter');
      return;
    }
    const isConfirmed = await confirm({
      title: 'Delete Chapter',
      message: `Are you sure you want to delete "${chaptersList[indexToDelete]?.title}"?`,
      confirmText: 'Delete Chapter',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    const updated = chaptersList.filter((_, idx) => idx !== indexToDelete);
    setChaptersList(updated);
    setActiveChapterIndex((prev) => (prev >= updated.length ? updated.length - 1 : prev));
    toast.success('Chapter removed');
  };

  // Toggle chapter published vs draft status (Unpublish/Publish)
  const toggleChapterStatus = async (indexToToggle, e) => {
    if (e) e.stopPropagation();
    const targetChapter = chaptersList[indexToToggle];
    if (!targetChapter) return;

    const newStatus = targetChapter.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';

    if (id && targetChapter._id) {
      try {
        await workService.updateChapter(id, targetChapter._id, { status: newStatus });
      } catch (err) {
        console.error('Failed to update chapter status:', err);
      }
    }

    setChaptersList((prev) => {
      const copy = [...prev];
      if (copy[indexToToggle]) {
        copy[indexToToggle] = { ...copy[indexToToggle], status: newStatus };
      }
      return copy;
    });

    toast.success(
      newStatus === 'DRAFT'
        ? `"${targetChapter.title || 'Chapter'}" unpublished (Saved to drafts)`
        : `"${targetChapter.title || 'Chapter'}" set to Published!`
    );
  };

  // Reorder chapter (Move Left/Up or Move Right/Down)
  const moveChapter = (index, direction, e) => {
    if (e) e.stopPropagation();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= chaptersList.length) return;

    setChaptersList((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });

    if (activeChapterIndex === index) {
      setActiveChapterIndex(targetIndex);
    } else if (activeChapterIndex === targetIndex) {
      setActiveChapterIndex(index);
    }

    toast.success(`Chapter moved ${direction < 0 ? 'earlier' : 'later'}`);
  };

  // Load existing work or restore local draft
  useEffect(() => {
    if (!id) {
      // Check for saved local draft
      const savedDraftRaw = localStorage.getItem(draftStorageKey);
      if (savedDraftRaw) {
        try {
          const draft = JSON.parse(savedDraftRaw);
          setTitle(draft.title || '');
          setContentType(draft.contentType || 'STORY');
          setLanguage(draft.language || 'English');
          setTransliterateHindi(!!draft.transliterateHindi);
          setGenre(draft.genre || 'General');
          setSummary(draft.summary || '');
          setCoverImage(draft.coverImage || '');
          if (draft.chaptersList && Array.isArray(draft.chaptersList) && draft.chaptersList.length > 0) {
            setChaptersList(draft.chaptersList);
          } else if (draft.chapterTitle || draft.content) {
            setChaptersList([{ id: 'ch-1', title: draft.chapterTitle || 'Chapter 1', content: draft.content || '', status: 'PUBLISHED' }]);
          }
          if (draft.selectedCategories) setSelectedCategories(draft.selectedCategories);
          toast.success('Restored unsaved manuscript draft!');
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const fetchWork = async () => {
      try {
        setIsLoading(true);
        const res = await workService.getWorkById(id);
        const work = res.data.data;
        setTitle(work.title || '');
        setContentType(work.contentType || 'STORY');
        setLanguage(work.language || 'English');
        if (work.language === 'Hindi' || work.language === 'Hinglish') {
          setTransliterateHindi(true);
        }
        setGenre(work.genre || 'General');
        setSummary(work.summary || '');
        setCoverImage(work.coverImage || '');
        setStatus(work.status || 'PUBLISHED');
        setVisibility(work.visibility || 'PUBLIC');
        if (work.genre) {
          setSelectedCategories([work.genre]);
        }
        if (work.chapters && work.chapters.length > 0) {
          setChaptersList(
            work.chapters.map((ch, idx) => ({
              id: ch._id || `ch-${idx + 1}`,
              _id: ch._id,
              title: ch.title || `Chapter ${idx + 1}`,
              content: ch.content || '',
              status: ch.status || 'PUBLISHED',
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load work for editing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWork();
  }, [id]);

  // Auto-Save Draft to LocalStorage whenever content changes
  useEffect(() => {
    if (isLoading) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      const draftData = {
        title,
        contentType,
        language,
        transliterateHindi,
        genre,
        selectedCategories,
        summary,
        coverImage,
        chaptersList,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
      setAutoSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, contentType, language, transliterateHindi, genre, selectedCategories, summary, coverImage, chaptersList]);

  // Statistics calculation across all chapters
  const totalWordCount = chaptersList.reduce((sum, ch) => {
    const words = (ch.content || '').trim() ? (ch.content || '').trim().split(/\s+/).filter(Boolean).length : 0;
    return sum + words;
  }, 0);
  const activeChapterWordCount = (activeChapter.content || '').trim() ? (activeChapter.content || '').trim().split(/\s+/).filter(Boolean).length : 0;
  const activeChapterCharCount = (activeChapter.content || '').length;
  const readingTimeMinutes = Math.max(1, Math.ceil(totalWordCount / 200));

  // Smart Selection Markdown Formatting
  const applyFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('full-page-writing-editor');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);

    if (start !== end && selectedText) {
      if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && suffix !== '') {
        const unwrapped = selectedText.substring(prefix.length, selectedText.length - suffix.length);
        const newContent = text.substring(0, start) + unwrapped + text.substring(end);
        setContent(newContent);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + unwrapped.length);
        }, 0);
        return;
      }
    }

    const placeholder = selectedText || 'text';
    const replacement = `${prefix}${placeholder}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
      }
    }, 0);
  };

  const insertPurnaViram = () => {
    applyFormatting('। ');
  };

  // Replace target word with chosen Hindi candidate (focus-preserving)
  const selectTransliterationCandidate = (candidate) => {
    if (!activeWordInfo) return;
    const isTitle = activeWordInfo.isTitle;
    const targetElementId = isTitle ? 'chapter-title-input' : 'full-page-writing-editor';
    const textarea = document.getElementById(targetElementId);
    const { startIdx, pos } = activeWordInfo;
    const val = isTitle ? (activeChapter.title || '') : (activeChapter.content || '');

    const endPos = pos;
    const newText = val.substring(0, startIdx) + candidate + val.substring(endPos);

    if (isTitle) {
      setChapterTitle(newText);
    } else {
      setContent(newText);
    }

    setTransliterationCandidates([]);
    setActiveWordInfo(null);

    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(startIdx + candidate.length + 1, startIdx + candidate.length + 1);
      }, 0);
    }
  };

  // Calculate 2-4px offset below current line for active field
  const getCaretOffset = () => {
    if (!activeWordInfo) return { top: 35, left: 10 };
    const { pos, isTitle } = activeWordInfo;
    if (isTitle) {
      return { top: 40, left: 12 };
    }
    const lines = (activeChapter.content || '').substring(0, pos).split('\n');
    const lineIndex = lines.length - 1;
    const currentLine = lines[lineIndex] || '';
    
    // Line height ~26px in text-[17px] textarea
    const top = (lineIndex + 1) * 26 + 55;
    const left = Math.min(Math.max(12, currentLine.length * 8.5), 380);
    return { top, left };
  };

  // Automatic Transliteration for both Chapter Title and Content Textarea
  const handleGenericChange = async (e, isTitle = false) => {
    const field = e.target;
    const val = field.value;

    if (isTitle) {
      setChapterTitle(val);
      setActiveFieldTarget('TITLE');
    } else {
      setContent(val);
      setActiveFieldTarget('CONTENT');
    }

    const pos = field.selectionStart;
    if (pos === 0) {
      setTransliterationCandidates([]);
      setActiveWordInfo(null);
      return;
    }

    const lastChar = val.charAt(pos - 1);

    // Hindi Purna Viram Conversion: '.' -> '।'
    if (lastChar === '.' && (transliterateHindi || language === 'Hindi') && usePurnaViram) {
      const newText = val.substring(0, pos - 1) + '।' + val.substring(pos);
      if (isTitle) setChapterTitle(newText);
      else setContent(newText);
      setTimeout(() => {
        field.focus();
        field.setSelectionRange(pos, pos);
      }, 0);
      return;
    }

    if (!transliterateHindi) return;

    const isDelimiter = lastChar === ' ' || lastChar === '\n' || lastChar === '\r';

    // Get text before cursor (excluding space if just typed)
    const textToSearch = isDelimiter ? val.substring(0, pos - 1) : val.substring(0, pos);
    const lastSpaceIdx = Math.max(
      textToSearch.lastIndexOf(' '),
      textToSearch.lastIndexOf('\n'),
      textToSearch.lastIndexOf('\r'),
      textToSearch.lastIndexOf('।')
    );
    const startIdx = lastSpaceIdx === -1 ? 0 : lastSpaceIdx + 1;
    const currentWord = textToSearch.substring(startIdx).trim();

    if (currentWord && /^[a-zA-Z]+$/.test(currentWord)) {
      try {
        const res = await fetch(
          `https://inputtools.google.com/request?text=${encodeURIComponent(currentWord)}&itc=hi-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`
        );
        const data = await res.json();
        if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
          const candidates = data[1][0][1]; // e.g. ["बेटा", "बीटा", "बेट"]

          if (isDelimiter) {
            // SPACE or ENTER: Automatically convert to top candidate + trailing space/enter
            const topCandidate = candidates[0];
            const newText = val.substring(0, startIdx) + topCandidate + val.substring(pos - 1);
            if (isTitle) setChapterTitle(newText);
            else setContent(newText);
            setTransliterationCandidates([]);
            setActiveWordInfo(null);
            
            const diff = topCandidate.length - currentWord.length;
            setTimeout(() => {
              field.focus();
              field.setSelectionRange(pos + diff, pos + diff);
            }, 0);
          } else {
            // Typing letters: Show candidate suggestion bar 2-4px below line
            setTransliterationCandidates(candidates);
            setActiveWordInfo({ word: currentWord, startIdx, pos, isTitle });
          }
        }
      } catch (err) {
        console.error("Hindi transliteration error:", err);
      }
    } else {
      setTransliterationCandidates([]);
      setActiveWordInfo(null);
    }
  };

  const handleCoverFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const res = await uploadService.uploadBookCover(file);
      const uploadedUrl = res.data?.data?.secureUrl || res.data?.data?.url || res.data?.secureUrl || res.data?.url;
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
        toast.success('Cover image uploaded from device!');
      } else {
        toast.error('Could not parse uploaded image URL');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const toggleCategoryTag = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
      setGenre(cat);
    }
  };

  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!customCategoryInput.trim()) return;
    const newCat = customCategoryInput.trim();
    if (!selectedCategories.includes(newCat)) {
      setSelectedCategories([...selectedCategories, newCat]);
      setGenre(newCat);
    }
    setCustomCategoryInput('');
  };

  const handleDeleteWork = async () => {
    if (!id) {
      const isConfirmed = await confirm({
        title: 'Discard Draft',
        message: 'Are you sure you want to discard this local draft manuscript?',
        confirmText: 'Discard Draft',
        variant: 'destructive',
      });
      if (isConfirmed) {
        localStorage.removeItem(draftStorageKey);
        toast.success('Local draft discarded');
        navigate('/studio');
      }
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete Manuscript',
      message: 'Are you sure you want to delete this manuscript permanently? This action cannot be undone.',
      confirmText: 'Delete Manuscript',
      variant: 'destructive',
    });

    if (isConfirmed) {
      try {
        setIsSubmitting(true);
        await workService.deleteWork(id);
        localStorage.removeItem(draftStorageKey);
        toast.success('Manuscript deleted successfully!');
        setIsMetadataModalOpen(false);
        navigate('/studio');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to delete manuscript');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (submitStatus = status) => {
    if (!title.trim()) {
      setIsMetadataModalOpen(true);
      toast.error('Please enter a title for your manuscript');
      return;
    }
    if (!copyrightAccepted) {
      toast.error('Please accept the copyright terms');
      return;
    }
    
    // Check that at least one chapter has content
    const hasAnyContent = chaptersList.some(ch => (ch.content || '').trim().length > 0);
    if (!hasAnyContent) {
      toast.error('Please write some content before publishing');
      return;
    }

    try {
      setIsSubmitting(true);
      const primaryGenre = selectedCategories[0] || genre || 'General';

      let finalWorkId = id;

      // ── MODE 1: APPEND CHAPTER TO AN EXISTING BOOK ──
      if (publishMode === 'EXISTING_POST' && selectedExistingWorkId) {
        for (const ch of chaptersList) {
          if (ch.content.trim()) {
            await workService.addChapter(selectedExistingWorkId, {
              title: ch.title || 'New Chapter',
              content: ch.content,
            });
          }
        }
        finalWorkId = selectedExistingWorkId;
        toast.success(`Appended new chapter(s) to existing book!`);
      } else if (id) {
        // ── MODE 2: UPDATE EXISTING STANDALONE BOOK ──
        await workService.updateWork(id, {
          title,
          contentType,
          language,
          genre: primaryGenre,
          summary,
          coverImage,
          status: submitStatus,
          visibility,
        });

        for (let idx = 0; idx < chaptersList.length; idx++) {
          const ch = chaptersList[idx];
          if (ch._id) {
            await workService.updateChapter(id, ch._id, {
              title: ch.title || `Chapter ${idx + 1}`,
              content: ch.content || '',
            });
          } else {
            await workService.addChapter(id, {
              title: ch.title || `Chapter ${idx + 1}`,
              content: ch.content || '',
            });
          }
        }
        toast.success('Manuscript updated successfully!');
      } else {
        // ── CREATE NEW STANDALONE BOOK ──
        const createRes = await workService.createWork({
          title,
          contentType,
          language,
          genre: primaryGenre,
          summary,
          coverImage,
          status: submitStatus,
          visibility,
          initialChapterTitle: chaptersList[0]?.title || 'Chapter 1',
          initialChapterContent: chaptersList[0]?.content || '',
        });

        const createdWork = createRes.data.data;
        finalWorkId = createdWork._id;

        if (chaptersList.length > 1 && finalWorkId) {
          for (let i = 1; i < chaptersList.length; i++) {
            await workService.addChapter(finalWorkId, {
              title: chaptersList[i].title || `Chapter ${i + 1}`,
              content: chaptersList[i].content || '',
            });
          }
        }

        toast.success(`${contentType} ${submitStatus === 'PUBLISHED' ? 'published' : 'saved as draft'} with ${chaptersList.length} chapter(s)!`);
      }

      // Clear local draft upon successful save/publish
      localStorage.removeItem(draftStorageKey);
      setIsMetadataModalOpen(false);

      // Redirect to published work's public details/reading page
      if (submitStatus === 'PUBLISHED' && finalWorkId) {
        navigate(`/read/${finalWorkId}`);
      } else {
        navigate('/studio');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save work');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast Markdown rich HTML renderer for WYSIWYG preview mode
  const renderRichMarkdownText = (raw) => {
    if (!raw) return <p className="italic text-muted-foreground">No content written yet...</p>;

    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold font-display text-primary my-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-primary pl-4 py-1.5 my-3 italic bg-primary/5 rounded-r-lg font-serif">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return <pre key={idx} className="bg-secondary/60 p-3 rounded-md text-xs font-mono my-2 overflow-x-auto">{line.slice(1, -1)}</pre>;
      }

      return (
        <p key={idx} className="my-2 leading-relaxed font-sans text-foreground text-base">
          {line.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g).map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="italic font-serif">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('~~') && part.endsWith('~~')) {
              return <del key={pIdx} className="line-through opacity-70">{part.slice(2, -2)}</del>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* ── TOP HEADER BAR ── */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-glass-border px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/studio"
            className="p-1.5 rounded-md hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
            title="Back to Writing Studio"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground truncate max-w-[150px] sm:max-w-xs font-display">
                {title ? title : 'New Manuscript'}
              </span>
            </div>
            <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
              {contentType} ({language}) • {chaptersList.length} Chapter{chaptersList.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Action Buttons: Save Draft, Primary Publish */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="rounded-md text-xs font-bold h-9 px-3.5 border-glass-border cursor-pointer hover:bg-secondary/60"
            title="Save as Draft"
          >
            Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => {
              // ALWAYS open the Details Modal first so user reviews details before final publish!
              setIsMetadataModalOpen(true);
            }}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold rounded-md text-xs h-9 px-4 sm:px-5 gap-1.5 shadow-sm cursor-pointer border-none transition-all"
            title="Review Cover & Details to Publish"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>PUBLISH</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ── STICKY FORMATTING TOOLBAR ── */}
      <div className="sticky top-[53px] z-20 bg-card/95 backdrop-blur-xl border border-glass-border/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 max-w-4xl mx-auto rounded-xl mt-3 shadow-md">
        {/* Left: Hinglish → Hindi Transliteration Switch & Purna Viram */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextVal = !transliterateHindi;
              setTransliterateHindi(nextVal);
              if (nextVal) {
                setLanguage('Hindi');
                toast.success('Hinglish → Hindi Transliteration ON (Title & Content)');
              } else {
                toast('Hinglish → Hindi Transliteration OFF');
                setTransliterationCandidates([]);
              }
            }}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm',
              transliterateHindi
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                : 'bg-card text-muted-foreground border-glass-border hover:text-foreground'
            )}
            title="Optional: Type in Hinglish (English) to automatically convert words in Title & Content to Devnagari Hindi"
          >
            {transliterateHindi ? (
              <ToggleRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            )}
            <span>Hinglish → Hindi (क)</span>
          </button>

          {/* Hindi Full-Stop Conversion Choice (. vs ।) */}
          {(transliterateHindi || language === 'Hindi') && (
            <button
              type="button"
              onClick={() => {
                setUsePurnaViram(!usePurnaViram);
                toast(`Auto '.' to Purna Viram (।) ${!usePurnaViram ? 'ENABLED' : 'DISABLED'}`);
              }}
              className={cn(
                'px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1',
                usePurnaViram
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-card text-muted-foreground border-glass-border'
              )}
              title="Automatically replace '.' with Hindi Purna Viram '।'"
            >
              <span className="font-serif font-extrabold text-sm">{usePurnaViram ? '।' : '.'}</span>
              <span className="text-[10px] hidden sm:inline">{usePurnaViram ? 'Purna Viram' : 'Dot .'}</span>
            </button>
          )}

          {/* Direct Purna Viram Insert Button */}
          <button
            type="button"
            onClick={insertPurnaViram}
            className="px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary text-foreground text-xs font-serif font-extrabold border border-glass-border cursor-pointer"
            title="Insert Hindi Purna Viram (।)"
          >
            + ।
          </button>
        </div>

        {/* Right: Rich Preview Toggle & Smart Selection Formatting */}
        <div className="flex items-center gap-2">
          {/* Edit vs Rich Render Live Preview Mode Switch */}
          <button
            type="button"
            onClick={() => {
              const nextMode = editorCanvasMode === 'EDIT' ? 'PREVIEW' : 'EDIT';
              setEditorCanvasMode(nextMode);
              toast(`Switched to ${nextMode === 'PREVIEW' ? 'Rich Live Preview' : 'Raw Edit'} mode`);
            }}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm',
              editorCanvasMode === 'PREVIEW'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-glass-border hover:text-foreground'
            )}
            title="Toggle between raw markdown editor and instant styled rich text preview"
          >
            {editorCanvasMode === 'PREVIEW' ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{editorCanvasMode === 'PREVIEW' ? 'Rich Preview' : 'Edit Mode'}</span>
          </button>

          {/* Smart Selection Formatting Buttons */}
          <div className="flex items-center gap-0.5 bg-secondary/40 p-1 rounded-md border border-glass-border/30">
            <button
              type="button"
              onClick={() => applyFormatting('**', '**')}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer font-bold"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('*', '*')}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('~~', '~~')}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('### ')}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Heading 3 (### Heading)"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('> ')}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Quote Block (> Quote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('`', '`')}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MANUSCRIPT PAPER CANVAS & CHAPTER TABS ── */}
      <main className="max-w-4xl mx-auto px-2 sm:px-6 pt-3 space-y-3">
        {/* MULTI-CHAPTER NAVIGATION TABS BAR */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-glass-border/40">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1 shrink-0 pr-2">
            <Layers className="w-3.5 h-3.5 text-primary" /> Chapters:
          </span>

          {chaptersList.map((ch, index) => {
            const isActive = index === activeChapterIndex;
            const isDraft = ch.status === 'DRAFT';

            return (
              <div
                key={ch.id || index}
                onClick={() => setActiveChapterIndex(index)}
                className={cn(
                  'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border shrink-0',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-glass-border'
                )}
                title={`Switch to ${ch.title}`}
              >
                <span className="truncate max-w-[110px]">{ch.title || `Chapter ${index + 1}`}</span>

                {isDraft && (
                  <span className={cn(
                    "text-[9px] font-extrabold px-1 py-0.5 rounded uppercase tracking-wider",
                    isActive ? "bg-black/20 text-amber-200" : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  )}>
                    Draft
                  </span>
                )}

                {/* Kebab Icon Menu on Every Chapter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'p-1 rounded hover:bg-black/20 transition-colors ml-0.5 cursor-pointer',
                        isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                      )}
                      title="Chapter options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-50">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChapterIndex(index);
                      }}
                      className="gap-2 cursor-pointer text-xs font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" />
                      Edit Chapter
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => toggleChapterStatus(index, e)}
                      className="gap-2 cursor-pointer text-xs font-medium"
                    >
                      {isDraft ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          Publish Chapter
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                          Unpublish (Save to Drafts)
                        </>
                      )}
                    </DropdownMenuItem>

                    {index > 0 && (
                      <DropdownMenuItem
                        onClick={(e) => moveChapter(index, -1, e)}
                        className="gap-2 cursor-pointer text-xs font-medium"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Move Left (Earlier)
                      </DropdownMenuItem>
                    )}

                    {index < chaptersList.length - 1 && (
                      <DropdownMenuItem
                        onClick={(e) => moveChapter(index, 1, e)}
                        className="gap-2 cursor-pointer text-xs font-medium"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Move Right (Later)
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={(e) => handleDeleteChapter(index, e)}
                      className="gap-2 cursor-pointer text-xs font-medium text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Chapter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {/* Add New Chapter Button */}
          <button
            type="button"
            onClick={handleAddChapter}
            className="px-3 py-1.5 rounded-md text-xs font-extrabold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            title="Add a new chapter to this post"
          >
            <Plus className="w-3.5 h-3.5" /> Add Chapter
          </button>
        </div>

        {/* EDITORIAL PAPER CANVAS CARD */}
        <Card className="border border-glass-border bg-card shadow-2xl rounded-xl p-6 sm:p-12 space-y-6 relative min-h-[600px]">
          {/* CHAPTER TITLE (BALANCED 24PX/26PX TYPOGRAPHY) */}
          <div className="border-b border-glass-border/40 pb-4 mb-4">
            <input
              id="chapter-title-input"
              value={activeChapter.title || ''}
              onChange={(e) => handleGenericChange(e, true)}
              placeholder="Title your chapter..."
              className="w-full bg-transparent text-xl sm:text-2xl font-black font-display text-foreground tracking-tight border-none focus:outline-none focus:ring-0 p-0 shadow-none placeholder:text-muted-foreground/35 placeholder:font-normal"
            />
          </div>

          {/* TEXT CANVAS: 17PX TYPOGRAPHY IN EDIT MODE */}
          <div className="relative min-h-[460px]">
            {editorCanvasMode === 'EDIT' ? (
              <textarea
                id="full-page-writing-editor"
                value={activeChapter.content || ''}
                onChange={(e) => handleGenericChange(e, false)}
                placeholder={
                  transliterateHindi
                    ? 'Type in Hinglish (e.g. "beta"). Press space to convert to Hindi automatically...'
                    : 'Tell your story... Markdown formatting is supported.'
                }
                className="w-full min-h-[460px] bg-transparent text-base text-foreground leading-relaxed resize-none focus:outline-none font-sans p-0 border-none placeholder:text-muted-foreground/35"
                required
              />
            ) : (
              /* INSTANT WYSIWYG RICH LIVE PREVIEW MODE */
              <div className="w-full min-h-[460px] p-2 prose prose-stone dark:prose-invert max-w-none">
                <h2 className="text-xl sm:text-2xl font-black font-display text-primary pb-3 border-b border-glass-border">
                  {activeChapter.title || 'Untitled Chapter'}
                </h2>
                <div className="pt-4">
                  {renderRichMarkdownText(activeChapter.content)}
                </div>
              </div>
            )}

            {/* FLOATING CANDIDATE POPUP */}
            {transliterateHindi && transliterationCandidates.length > 0 && activeWordInfo && (
              <div
                style={{
                  top: `${getCaretOffset().top}px`,
                  left: `${getCaretOffset().left}px`,
                }}
                className="absolute z-30 p-1.5 bg-card/95 backdrop-blur-xl border border-indigo-500/30 rounded-md shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none animate-in fade-in duration-150 max-w-[90vw]"
              >
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider shrink-0 px-1">
                  <Sparkles className="w-3 h-3 inline text-indigo-500" />
                </span>
                {transliterationCandidates.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent losing field focus
                      selectTransliterationCandidate(cand);
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs sm:text-sm font-bold transition-all cursor-pointer border shrink-0',
                      idx === 0
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-secondary/70 text-foreground border-glass-border hover:border-indigo-500 hover:text-indigo-500'
                    )}
                    title={`Insert '${cand}'`}
                  >
                    {cand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas Footer Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-medium pt-4 border-t border-glass-border/40">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-secondary/50 text-foreground px-3 py-1 rounded-md font-bold">
                {activeChapterWordCount} Words in Chapter
              </span>
              <span>Total Work: {totalWordCount} Words</span>
              <span>~{readingTimeMinutes} min read</span>

              {/* Live Auto-Save Status Pill (Bottom Footer) */}
              <span className="text-[11px] font-semibold flex items-center gap-1 border-l border-glass-border/60 pl-3">
                {autoSaveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-primary animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving draft...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-success font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Draft Saved
                  </span>
                )}
              </span>
            </div>
          </div>
        </Card>
      </main>

      {/* ── METADATA & COVER SETUP MODAL ── */}
      <Modal
        open={isMetadataModalOpen}
        onClose={() => setIsMetadataModalOpen(false)}
        title="Manuscript Details & Cover Image"
        description="Setup cover image, summary, categories, or append chapter to an existing book"
        className="max-w-3xl w-[95vw] sm:w-full"
      >
        <div className="flex flex-col max-h-[75vh] sm:max-h-[78vh]">
          {/* Scrollable Form Content Body */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 scrollbar-none pb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1">
              {/* LEFT COLUMN: 3:4 Cover Dropzone & Full Preview Trigger */}
              <div className="md:col-span-1 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Book Cover (Device Upload)</Label>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverFileUpload}
                />

                {!coverImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[2/3] max-h-[220px] sm:max-h-none border-2 border-dashed border-glass-border hover:border-primary/60 bg-secondary/20 hover:bg-secondary/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                    title="Click to select cover file from your device"
                  >
                    {isUploadingCover ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground">Upload Cover File</div>
                        <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP from device</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative group rounded-xl overflow-hidden aspect-[2/3] max-h-[220px] sm:max-h-none border border-glass-border shadow-md bg-secondary/40 flex items-center justify-center">
                    <img
                      src={coverImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none select-none"
                    />
                    <img
                      src={coverImage}
                      alt="Book cover preview"
                      className="relative z-10 w-full h-full object-contain"
                    />

                    {/* Click to Full Preview Lightbox Button */}
                    <div
                      onClick={() => setIsImagePreviewModalOpen(true)}
                      className="absolute inset-0 z-20 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1"
                    >
                      <Eye className="w-6 h-6" />
                      <span className="text-xs font-bold">Preview Cover</span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-1 z-30">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg bg-card/90 backdrop-blur-md text-foreground hover:text-primary shadow-md cursor-pointer"
                        title="Change cover file"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="p-1.5 rounded-lg bg-card/90 backdrop-blur-md text-destructive hover:bg-destructive hover:text-white shadow-md cursor-pointer"
                        title="Remove cover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {coverImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImagePreviewModalOpen(true)}
                    className="w-full rounded-xl text-xs font-bold gap-1 mt-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" /> Full Cover Preview
                  </Button>
                )}
              </div>

              {/* RIGHT COLUMN: Mode Choice, Title, Summary, Format Selection, Categories */}
              <div className="md:col-span-2 space-y-3.5">
                {/* POST DESTINATION CHOICE */}
                <div className="p-3 bg-secondary/30 rounded-xl border border-glass-border space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-primary block">
                    Publishing Destination / Mode
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPublishMode('NEW_POST')}
                      className={cn(
                        'p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center gap-2',
                        publishMode === 'NEW_POST'
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-glass-border hover:text-foreground'
                      )}
                    >
                      <FolderPlus className="w-4 h-4 shrink-0" />
                      <span>Create New Book</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPublishMode('EXISTING_POST')}
                      className={cn(
                        'p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center gap-2',
                        publishMode === 'EXISTING_POST'
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-glass-border hover:text-foreground'
                      )}
                    >
                      <BookMarked className="w-4 h-4 shrink-0" />
                      <span>Append to Existing Book</span>
                    </button>
                  </div>

                  {/* Existing Book Dropdown Selector */}
                  {publishMode === 'EXISTING_POST' && (
                    <div className="pt-2 space-y-1">
                      <Label className="text-[11px] font-bold text-muted-foreground">Select Existing Book from Your Studio:</Label>
                      <select
                        value={selectedExistingWorkId}
                        onChange={(e) => handleSelectExistingWork(e.target.value)}
                        className="w-full border border-glass-border bg-card text-foreground text-xs rounded-xl h-9 px-2.5 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choose Existing Book --</option>
                        {existingWorks.map((work) => (
                          <option key={work._id} value={work._id}>
                            {work.title} ({work.chapters?.length || 0} chapters)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manuscript Title *</Label>
                  <Input
                    value={title || ''}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Title Here..."
                    className="border-glass-border rounded-xl h-10 font-extrabold text-sm"
                    required
                  />
                </div>

                {/* Summary */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Summary (Synopsis)</Label>
                  <textarea
                    value={summary || ''}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Add summary (you can edit it later)..."
                    className="w-full h-18 p-3 border border-glass-border rounded-xl bg-card text-xs text-foreground resize-none focus:outline-none font-sans"
                  />
                </div>

                {/* Select Format & Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manuscript Format *</Label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full border border-glass-border bg-card text-foreground text-xs rounded-xl h-9 px-2.5 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="STORY">Fiction / Story</option>
                      <option value="BLOG">Non-Fiction / Blog</option>
                      <option value="POEM">Poetry</option>
                      <option value="DIARY">Diary</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language *</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-glass-border bg-card text-foreground text-xs rounded-xl h-9 px-2.5 font-bold focus:outline-none cursor-pointer"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Categories Tag Pills */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Categories & Genres</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-secondary/15 rounded-xl border border-glass-border/40 scrollbar-none">
                    {WORK_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategoryTag(cat)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                              : 'bg-card/70 border-glass-border text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Category Tag */}
                  <form onSubmit={handleAddCustomCategory} className="flex gap-2 pt-1">
                    <Input
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Add custom category tag..."
                      className="border-glass-border rounded-xl h-8 text-xs flex-1"
                    />
                    <Button type="submit" variant="outline" size="sm" className="h-8 rounded-xl text-xs gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </form>
                </div>

                {/* Copyright Agreement */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="copyright-check"
                    checked={copyrightAccepted}
                    onChange={(e) => setCopyrightAccepted(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="copyright-check" className="text-xs text-muted-foreground cursor-pointer select-none">
                    I accept Copyright Policy and Terms of Service
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY BOTTOM ACTION FOOTER BAR */}
          <div className="sticky bottom-0 bg-card py-3 border-t border-glass-border flex flex-wrap items-center justify-between gap-2.5 z-30 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteWork}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold h-9 px-3 border-destructive/40 text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer gap-1"
              title="Delete Manuscript"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Manuscript</span>
              <span className="sm:hidden">Delete</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-bold h-9 px-4 border-glass-border cursor-pointer hover:bg-secondary/50"
              >
                SAVE DRAFT
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-extrabold h-9 px-6 gap-1.5 shadow-md cursor-pointer border-none"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'PUBLISH NOW'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── COVER IMAGE FULL SCREEN PREVIEW MODAL ── */}
      <Modal
        open={isImagePreviewModalOpen}
        onClose={() => setIsImagePreviewModalOpen(false)}
        title="Cover Image Full Preview"
        className="max-w-xl"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Full Cover Preview"
              className="max-h-[70vh] w-auto object-contain rounded-md border border-glass-border shadow-2xl"
            />
          ) : (
            <p className="text-xs text-muted-foreground">No cover image uploaded yet.</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsImagePreviewModalOpen(false)}
            className="rounded-md text-xs font-bold px-6"
          >
            Close Preview
          </Button>
        </div>
      </Modal>
    </div>
  );
}
