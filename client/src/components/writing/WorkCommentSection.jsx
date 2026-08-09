import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/authHooks';
import { workService } from '@/services';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, Heart, Trash2, Reply, Send, Loader2, Shield, CornerDownRight 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';

export function WorkCommentSection({ workId, chapterId = null, workOwnerId }) {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const currentUserId = (user?._id || user?.id || '').toString();
  const isOwner = workOwnerId && currentUserId === workOwnerId.toString();

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await workService.getComments(workId, { chapterId });
      setComments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workId) {
      fetchComments();
    }
  }, [workId, chapterId]);

  const handleAddComment = async (e, parentCommentId = null) => {
    if (e) e.preventDefault();
    const text = parentCommentId ? replyText.trim() : newComment.trim();

    if (!text) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (!user) {
      toast.error('Please log in to leave a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await workService.addComment(workId, {
        content: text,
        parentComment: parentCommentId,
        chapterId: chapterId || null,
      });

      const added = res.data.data;
      setComments((prev) => [added, ...prev]);

      if (parentCommentId) {
        setReplyText('');
        setReplyingToId(null);
        toast.success('Reply posted!');
      } else {
        setNewComment('');
        toast.success('Comment posted!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Please log in to like comments');
      return;
    }

    try {
      const res = await workService.toggleLikeComment(workId, commentId);
      const { isLiked, likesCount } = res.data.data;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, isLiked, likesCount } : c
        )
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle like');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const isConfirmed = await confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment? Replies will also be removed.',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!isConfirmed) return;

    try {
      await workService.deleteComment(workId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId && c.parentComment !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  // Separate top-level comments and replies
  const rootComments = comments.filter((c) => !c.parentComment);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentComment && c.parentComment.toString() === parentId.toString());

  return (
    <div className="space-y-6 pt-6 border-t border-glass-border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          {chapterId ? 'Chapter Reader Discussion' : 'Book Discussion & Reviews'} ({comments.length})
        </h3>
      </div>

      {/* Main Comment Box */}
      <form onSubmit={(e) => handleAddComment(e)} className="space-y-3">
        <div className="flex gap-3 items-start">
          <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" className="mt-1 shrink-0" />
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Write a polite comment or feedback..." : "Log in to post a comment..."}
              disabled={!user || isSubmitting}
              className="w-full min-h-[75px] rounded-2xl border-glass-border bg-secondary/15 p-3 text-xs sm:text-sm focus:ring-primary resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!user || !newComment.trim() || isSubmitting}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/70 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-primary" />
            <p className="text-xs font-bold">No comments yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Be the first to share your thoughts!</p>
          </div>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment._id);
            const isCommentAuthor = currentUserId === (comment.user?._id || comment.user?.id || '').toString();
            const canDelete = isCommentAuthor || isOwner;

            return (
              <div key={comment._id} className="space-y-3 p-4 rounded-2xl bg-card/60 border border-glass-border shadow-sm">
                {/* Main Root Comment */}
                <div className="flex items-start gap-3">
                  <Avatar src={comment.user?.avatar} name={comment.user?.name} size="sm" className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{comment.user?.name}</span>
                        {comment.user?.penName && (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                            ✍️ {comment.user.penName}
                          </span>
                        )}
                        {(comment.user?._id || comment.user?.id)?.toString() === workOwnerId?.toString() && (
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5" /> Author
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap pt-0.5">
                      {comment.content}
                    </p>

                    {/* Action Bar: Like & Reply */}
                    <div className="flex items-center gap-4 pt-1.5">
                      <button
                        onClick={() => handleToggleLikeComment(comment._id)}
                        className={cn(
                          "flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer",
                          comment.isLiked ? "text-red-500 font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Heart className={cn("w-3.5 h-3.5", comment.isLiked && "fill-red-500 text-red-500")} />
                        <span>{comment.likesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => {
                          setReplyingToId(replyingToId === comment._id ? null : comment._id);
                          setReplyText('');
                        }}
                        className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingToId === comment._id && (
                  <form onSubmit={(e) => handleAddComment(e, comment._id)} className="pl-8 pt-2 space-y-2">
                    <div className="flex gap-2 items-start">
                      <CornerDownRight className="w-4 h-4 text-primary shrink-0 mt-2" />
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.user?.name}...`}
                        className="flex-1 min-h-[60px] rounded-xl border-glass-border bg-secondary/15 p-2.5 text-xs focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pl-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingToId(null)}
                        className="h-7 text-xs rounded-lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!replyText.trim() || isSubmitting}
                        size="sm"
                        className="h-7 text-xs font-bold rounded-lg bg-primary text-primary-foreground"
                      >
                        Send Reply
                      </Button>
                    </div>
                  </form>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="pl-6 sm:pl-8 space-y-2.5 border-l-2 border-primary/20 pt-1">
                    {replies.map((reply) => {
                      const isReplyAuthor = currentUserId === (reply.user?._id || reply.user?.id || '').toString();
                      const canDeleteReply = isReplyAuthor || isOwner;

                      return (
                        <div key={reply._id} className="p-3 rounded-xl bg-secondary/15 border border-glass-border/40 space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Avatar src={reply.user?.avatar} name={reply.user?.name} size="xs" />
                              <span className="text-xs font-bold text-foreground">{reply.user?.name}</span>
                              {(reply.user?._id || reply.user?.id)?.toString() === workOwnerId?.toString() && (
                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-full border border-primary/20">
                                  Author
                                </span>
                              )}
                              <span className="text-[9.5px] text-muted-foreground">
                                • {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            {canDeleteReply && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap pl-6">
                            {reply.content}
                          </p>

                          <div className="pl-6 pt-1">
                            <button
                              onClick={() => handleToggleLikeComment(reply._id)}
                              className={cn(
                                "flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer",
                                reply.isLiked ? "text-red-500 font-bold" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Heart className={cn("w-3 h-3", reply.isLiked && "fill-red-500 text-red-500")} />
                              <span>{reply.likesCount || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
