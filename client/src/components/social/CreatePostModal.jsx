import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Image as ImageIcon, Book, Sparkles } from 'lucide-react';
import { createPost } from '@/features/feed/feedSlice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/common/ImageUpload';
import { toast } from 'react-hot-toast';

export function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error('Post cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      // Extract hashtags from content
      const hashtags = content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [];
      
      await dispatch(createPost({
        content,
        images,
        hashtags,
        visibility: 'PUBLIC'
      })).unwrap();
      
      toast.success('Post published!');
      setContent('');
      setImages([]);
      setShowImageUpload(false);
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-[520px] rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Create Post
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-muted-foreground hover:bg-secondary">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your reading journey..."
            className="min-h-[140px] resize-none border-none focus-visible:ring-0 text-base sm:text-lg p-0 bg-transparent placeholder:text-muted-foreground/60"
          />

          {showImageUpload && (
            <div className="mt-4 p-2 border border-border/50 rounded-xl bg-secondary/10 relative">
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
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border/50 flex items-center justify-between bg-secondary/5 rounded-b-2xl">
          <div className="flex gap-1 text-muted-foreground">
            <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-primary/10 h-9 w-9" onClick={() => setShowImageUpload(true)}>
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-primary/10 h-9 w-9" title="Tag a book">
              <Book className="w-5 h-5" />
            </Button>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting || (!content.trim() && images.length === 0)} className="rounded-full px-6">
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}
