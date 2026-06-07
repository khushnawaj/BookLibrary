import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
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
      toast.success('Comment added');
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
      toast.success('Comment deleted');
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
      <div className="py-5 flex justify-center">
        <Loader2 className="animate-spin text-[#8B4513] w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Comment list */}
      <div className={cn(
        'space-y-2.5',
        comments.length > 3 && 'max-h-64 overflow-y-auto scrollbar-none pr-1',
      )}>
        {comments.length === 0 ? (
          <p className="text-center text-[#8A7F74] py-3 text-xs">
            No comments yet — be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-2.5 group items-start">
              <Link to={`/profile/${comment.user?.username}`} className="shrink-0 mt-0.5 hover:opacity-90 transition-opacity">
                <Avatar
                  src={comment.user?.avatar}
                  name={comment.user?.name}
                  size="sm"
                  className="ring-1 ring-[#EDE6D8]"
                />
              </Link>
              <div className="flex-1 min-w-0">
                {/* Bubble */}
                <div className="bg-[#F5F0E8] rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block max-w-full">
                  <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                    <Link
                      to={`/profile/${comment.user?.username}`}
                      className="font-semibold text-[12px] text-[#1C1A17] hover:text-[#8B4513] transition-colors"
                    >
                      {comment.user?.name}
                    </Link>
                    <span className="text-[10px] text-[#B5A898]">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#3D3530] leading-snug break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Owner delete action */}
                {user?._id === comment.user?._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="ml-2 text-[10px] text-[#B5A898] hover:text-red-500 font-medium
                               transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <Avatar
          src={user?.avatar}
          name={user?.name}
          size="sm"
          className="shrink-0 hidden sm:flex ring-1 ring-[#EDE6D8]"
        />
        <div className="relative flex-1">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment…"
            className="w-full h-9 text-[13px] bg-[#F5F0E8] border border-[#DDD4C4]
                       rounded-xl pl-4 pr-10 text-[#1C1A17] placeholder:text-[#B5A898]
                       focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20
                       focus:border-[#8B4513]/40 transition-all"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7
                       flex items-center justify-center rounded-lg
                       text-[#8B4513] hover:bg-[#8B4513]/10
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
