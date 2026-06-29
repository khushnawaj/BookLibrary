import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Bell, Check, Inbox, MessageSquare, Clock, Share2, 
  HelpCircle, Lightbulb, LifeBuoy, ShieldCheck, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  fetchNotifications, 
  markAllRead,
  addNotification
} from '@/features/notifications/notificationSlice';
import { createPost } from '@/features/feed/feedSlice';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

export function NotificationBell() {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount, status } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [sharingId, setSharingId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());

    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Click outside listener to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllRead()).unwrap();
      toast.success('All notifications marked as read', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
          fontSize: '12px',
        }
      });
    } catch (err) {
      toast.error('Failed to mark notifications read');
    }
  };

  const handleShareResolution = async (notif) => {
    const { metadata } = notif;
    if (!metadata?.subject) return;

    setSharingId(notif._id);
    const postContent = `🛠️ ShelfForge support solved my ticket!\n\nSubject: "${metadata.subject}"\nResolution: "${metadata.adminResponse || 'Issue resolved successfully.'}"\n\n#ShelfForge #CommunitySupport`;

    try {
      await dispatch(createPost({
        content: postContent,
        visibility: 'PUBLIC'
      })).unwrap();

      toast.success('Resolution shared to Community Feed! 🚀', {
        style: {
          borderRadius: '12px',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-glass-border)',
          fontSize: '12px',
        }
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to share to community feed.');
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative h-9 w-9 rounded-xl hover:bg-secondary text-foreground cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[9px] font-extrabold flex items-center justify-center bg-primary text-primary-foreground border-none animate-pulse"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card/95 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-secondary/10">
              <span className="text-xs font-bold text-foreground font-display flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-primary" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-primary hover:text-accent flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List Container */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-glass-border">
              {status === 'loading' && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground/60 space-y-2">
                  <Inbox className="w-10 h-10 mx-auto opacity-20 text-primary" />
                  <p className="text-xs font-bold">You are all caught up!</p>
                  <p className="text-[10px] text-muted-foreground/80">New activities will display here.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isResolvedType = notif.type === 'FEEDBACK_RESOLVED';
                  return (
                    <div 
                      key={notif._id} 
                      className={`p-4 space-y-3 transition-colors ${
                        notif.isRead ? 'bg-transparent' : 'bg-primary/5 border-l-2 border-l-primary'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg shrink-0 border ${
                          isResolvedType 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {isResolvedType ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground leading-tight">{notif.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-normal whitespace-pre-wrap">{notif.message}</p>
                          
                          <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground/50 font-medium">
                            <Clock className="w-3 h-3 shrink-0" />
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (e.g. Share resolution) */}
                      {isResolvedType && notif.metadata?.subject && (
                        <div className="pl-9">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareResolution(notif)}
                            disabled={sharingId === notif._id}
                            className="h-7 text-[10px] font-bold rounded-lg border-glass-border text-muted-foreground hover:text-foreground hover:bg-secondary/40 gap-1"
                          >
                            {sharingId === notif._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Share2 className="w-3 h-3" />
                            )}
                            Share to Feed
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
