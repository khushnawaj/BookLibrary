import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { postService } from '@/services';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';

export function CommentSection({ postId }) {
  const [comments, setComments]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [content, setContent]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => { fetchComments(); }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await postService.getComments(postId);
      setComments(res.data.data);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await postService.addComment(postId, { content });
      setComments([res.data.data, ...comments]);
      setContent('');
      toast.success('Comment added', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
        }
      });
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await postService.deleteComment(postId, commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
        }
      });
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="animate-spin text-primary w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className={cn(
        'space-y-3.5 pr-0.5',
        comments.length > 4 && 'max-h-72 overflow-y-auto scrollbar-none',
      )}>
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground/60 py-4 text-xs">
            No comments yet — be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 group items-start relative pl-6">
              {/* Reddit-style Vertical Thread Line */}
              <div className="absolute left-2.5 top-8 bottom-0 w-[1.5px] bg-glass-border/30 rounded-full group-hover:bg-primary/30 transition-colors" />

              {/* Commenter Avatar */}
              <Link to={`/profile/${comment.user?.username}`} className="shrink-0 mt-0.5 hover:opacity-90 transition-opacity z-10">
                <Avatar
                  src={comment.user?.avatar}
                  name={comment.user?.name}
                  size="sm"
                  className="ring-1 ring-glass-border"
                />
              </Link>

              {/* Comment Bubble & Metadata */}
              <div className="flex-1 min-w-0">
                <div className="bg-secondary/25 hover:bg-secondary/40 border border-glass-border/40 rounded-2xl rounded-tl-none px-3.5 py-2 inline-block max-w-full transition-colors duration-150">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <Link
                      to={`/profile/${comment.user?.username}`}
                      className="font-bold text-[12px] text-foreground hover:text-primary transition-colors"
                    >
                      {comment.user?.name}
                    </Link>
                    <span className="text-[10px] text-muted-foreground/50">
                      @{comment.user?.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-[13px] text-foreground/90 leading-relaxed break-words font-medium">
                    {comment.content}
                  </p>
                </div>

                {/* Comment Actions (Delete) */}
                {((user?.id || user?._id) && (comment.user?.id || comment.user?._id) && String(user?.id || user?._id) === String(comment.user?.id || comment.user?._id)) && (
                  <div className="mt-1 pl-1 flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-red-500 font-bold
                                 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 pt-2 border-t border-glass-border/20">
        <Avatar
          src={user?.avatar}
          name={user?.name}
          size="sm"
          className="shrink-0 hidden sm:flex ring-1 ring-glass-border"
        />
        
        <div className="relative flex-1">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What are your thoughts on this?"
            style={{ color: 'var(--color-foreground)' }}
            className="w-full h-9 text-[13px] bg-secondary/15 border border-glass-border
                       rounded-xl pl-4 pr-10 text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-2 focus:ring-primary/20
                       focus:border-primary/40 transition-all"
          />
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7
                       flex items-center justify-center rounded-lg
                       text-primary hover:bg-primary/10
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all"
          >
            {isSubmitting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Send className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </form>
    </div>
  );
}
