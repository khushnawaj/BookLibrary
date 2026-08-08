import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Bold, Italic, Strikethrough, Code, Quote, Heading3,
  Sparkles, Loader2, BookOpen, Feather, Lock, Globe, FileText,
  Image as ImageIcon, Upload, Languages, Users, Send, PenTool, Book
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workService, uploadService } from '@/services';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'Hindi (हिंदी)' },
  { id: 'Hinglish', label: 'Hinglish' },
  { id: 'Marathi', label: 'Marathi (मराठी)' },
  { id: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { id: 'Bengali', label: 'Bengali (বাংলা)' },
  { id: 'Tamil', label: 'Tamil (தமிழ்)' },
  { id: 'Spanish', label: 'Spanish (Español)' },
  { id: 'French', label: 'French (Français)' },
  { id: 'Other', label: 'Other' },
];

export function WritingEditorModal({ open, onClose, workToEdit = null, onSuccess }) {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('STORY'); // STORY | POEM | BLOG | DIARY
  const [language, setLanguage] = useState('English');
  const [genre, setGenre] = useState('General');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('PUBLISHED'); // PUBLISHED | DRAFT
  const [visibility, setVisibility] = useState('PUBLIC'); // PUBLIC | FOLLOWERS | PRIVATE
  const [chapterTitle, setChapterTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (workToEdit) {
      setTitle(workToEdit.title || '');
      setContentType(workToEdit.contentType || 'STORY');
      setLanguage(workToEdit.language || 'English');
      setGenre(workToEdit.genre || 'General');
      setSummary(workToEdit.summary || '');
      setCoverImage(workToEdit.coverImage || '');
      setStatus(workToEdit.status || 'PUBLISHED');
      setVisibility(workToEdit.visibility || 'PUBLIC');
      if (workToEdit.chapters && workToEdit.chapters.length > 0) {
        setChapterTitle(workToEdit.chapters[0].title || '');
        setContent(workToEdit.chapters[0].content || '');
      } else {
        setChapterTitle('');
        setContent('');
      }
    } else {
      setTitle('');
      setContentType('STORY');
      setLanguage('English');
      setGenre('General');
      setSummary('');
      setCoverImage('');
      setStatus('PUBLISHED');
      setVisibility('PUBLIC');
      setChapterTitle('Chapter 1');
      setContent('');
    }
  }, [workToEdit, open]);

  // Live statistics calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('writing-editor-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleCoverFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const res = await uploadService.uploadBookCover(file);
      setCoverImage(res.data.data.url || res.data.data.path || res.data.url);
      toast.success('Cover image uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (workToEdit) {
        // Update existing work
        await workService.updateWork(workToEdit._id, {
          title,
          contentType,
          language,
          genre,
          summary,
          coverImage,
          status,
          visibility,
        });
        if (workToEdit.chapters && workToEdit.chapters.length > 0) {
          await workService.updateChapter(workToEdit._id, workToEdit.chapters[0]._id, {
            title: chapterTitle || 'Chapter 1',
            content,
          });
        } else {
          await workService.addChapter(workToEdit._id, {
            title: chapterTitle || 'Chapter 1',
            content,
          });
        }
        toast.success('Work updated successfully!');
      } else {
        // Create new work
        await workService.createWork({
          title,
          contentType,
          language,
          genre,
          summary,
          coverImage,
          status,
          visibility,
          initialChapterTitle: chapterTitle || (contentType === 'POEM' ? 'Stanza 1' : 'Chapter 1'),
          initialChapterContent: content,
        });
        toast.success(`${contentType} published successfully!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save work');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={workToEdit ? 'Edit Work & Chapter' : 'Creative Writing Studio'}
      description="Write blogs, poems, personal diaries, and multi-chapter stories"
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {/* Top Type Selector, Language & Visibility */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/15 p-3 rounded-2xl border border-glass-border/40">
          {/* Content Type Selector */}
          <div className="flex items-center gap-1.5 bg-card/80 p-1 rounded-xl border border-glass-border">
            {[
              { id: 'STORY', label: 'Story', icon: BookOpen },
              { id: 'POEM', label: 'Poem', icon: Feather },
              { id: 'BLOG', label: 'Blog', icon: PenTool },
              { id: 'DIARY', label: 'Diary', icon: Book },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  contentType === type.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <type.icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Language & Visibility Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-card border border-glass-border text-foreground text-xs rounded-xl px-2.5 py-1 font-semibold">
              <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-card border border-glass-border text-foreground text-xs rounded-xl px-3 py-1.5 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers Only</option>
              <option value="PRIVATE">Private</option>
            </select>

            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-card border border-glass-border text-foreground text-xs rounded-xl px-3 py-1.5 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="PUBLISHED">Publish</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Title & Genre Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={contentType === 'POEM' ? 'Title of Poem...' : contentType === 'BLOG' ? 'Blog Post Title...' : 'Story / Diary Title...'}
              className="border-glass-border rounded-xl h-10 font-bold font-display"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Genre / Tag</Label>
            <Input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Romance, Fantasy, Life"
              className="border-glass-border rounded-xl h-10 text-xs"
            />
          </div>
        </div>

        {/* Cover Image Upload (Device File / URL) & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary" /> Cover Image (Device / URL)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Paste URL or upload file →"
                className="border-glass-border rounded-xl h-9 text-xs flex-1"
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCoverFileUpload}
              />

              <Button
                type="button"
                variant="outline"
                disabled={isUploadingCover}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-3 text-xs font-bold rounded-xl gap-1 shrink-0 border-glass-border cursor-pointer"
                title="Upload from Device"
              >
                {isUploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-primary" /> Device
                  </>
                )}
              </Button>
            </div>
            {coverImage && (
              <div className="mt-1.5 flex items-center gap-2">
                <img src={coverImage} alt="Cover preview" className="w-12 h-12 object-cover rounded-lg border border-glass-border" />
                <span className="text-[10px] text-muted-foreground">Cover preview loaded</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Short Synopsis / Summary</Label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of your work..."
              className="border-glass-border rounded-xl h-9 text-xs"
            />
          </div>
        </div>

        {/* Chapter Title & Markdown Toolbar */}
        <div className="space-y-2 pt-2 border-t border-glass-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="w-full sm:w-1/2">
              <Input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Chapter / Entry Title (e.g. Chapter 1: The Beginning)"
                className="border-glass-border rounded-xl h-9 text-xs font-semibold"
              />
            </div>

            {/* Editor Formatting Toolbar */}
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-glass-border/30">
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*')}
                className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('~~', '~~')}
                className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('### ')}
                className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                title="Heading"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('> ')}
                className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                title="Quote block"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('`', '`')}
                className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                title="Inline Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Area Content */}
          <textarea
            id="writing-editor-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              contentType === 'POEM'
                ? 'Write your poem stanzas here...'
                : contentType === 'DIARY'
                ? 'Dear Diary, today I wrote...'
                : 'Write your story content here. Markdown formatting is supported...'
            }
            className="w-full min-h-[220px] max-h-[400px] p-4 rounded-2xl border border-glass-border bg-card/60 focus:bg-card text-sm text-foreground leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary font-sans"
            required
          />
        </div>

        {/* Bottom Bar: Live Metrics & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-glass-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg font-bold">
              {wordCount} Words
            </span>
            <span>{charCount} Characters</span>
            <span>~{readingTimeMinutes} min read</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold gap-1.5 h-9 px-5 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {workToEdit ? 'Save Changes' : `Publish ${contentType}`}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
