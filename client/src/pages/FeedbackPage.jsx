import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, HelpCircle, Lightbulb, LifeBuoy, Send, CheckCircle,
  Inbox, Clock, Check, User, Mail, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/features/auth/authHooks';
import { feedbackService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TYPES = [
  {
    value: 'SUGGESTION',
    label: 'Suggestion',
    icon: Lightbulb,
    badgeColor: 'text-[#D4931A] bg-[#D4931A]/10 border-[#D4931A]/20',
    hoverGlow: 'hover:shadow-[0_8px_30px_rgb(212,147,26,0.1)]',
    ringColor: 'peer-checked:ring-[#D4931A] peer-checked:border-[#D4931A]',
    desc: 'Share ideas to improve ShelfForge features.'
  },
  {
    value: 'FEEDBACK',
    label: 'General Feedback',
    icon: MessageSquare,
    badgeColor: 'text-[#8B4513] bg-[#8B4513]/10 border-[#8B4513]/20',
    hoverGlow: 'hover:shadow-[0_8px_30px_rgb(139,69,19,0.1)]',
    ringColor: 'peer-checked:ring-[#8B4513] peer-checked:border-[#8B4513]',
    desc: 'Tell us about your overall experience.'
  },
  {
    value: 'HELP',
    label: 'Ask for Help',
    icon: HelpCircle,
    badgeColor: 'text-[#5C7A3E] bg-[#5C7A3E]/10 border-[#5C7A3E]/20',
    hoverGlow: 'hover:shadow-[0_8px_30px_rgb(92,122,62,0.1)]',
    ringColor: 'peer-checked:ring-[#5C7A3E] peer-checked:border-[#5C7A3E]',
    desc: 'Get assistance with features.'
  },
  {
    value: 'SUPPORT',
    label: 'Technical Support',
    icon: LifeBuoy,
    badgeColor: 'text-[#C0392B] bg-[#C0392B]/10 border-[#C0392B]/20',
    hoverGlow: 'hover:shadow-[0_8px_30px_rgb(192,57,43,0.1)]',
    ringColor: 'peer-checked:ring-[#C0392B] peer-checked:border-[#C0392B]',
    desc: 'Report bugs or technical issues.'
  },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'inbox' (admin-only)
  const [form, setForm] = useState({
    type: 'SUGGESTION',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Inbox state (Admin only)
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'RESOLVED'

  useEffect(() => {
    if (isAdmin && activeTab === 'inbox') {
      fetchFeedbacks();
    }
  }, [isAdmin, activeTab]);

  const fetchFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const response = await feedbackService.getAllFeedback();
      if (response.data?.success) {
        setFeedbacks(response.data.data.feedbacks);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load feedback inbox.');
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await feedbackService.submitFeedback(form);
      if (response.data?.success) {
        setIsSuccess(true);
        toast.success(response.data.message || 'Feedback submitted successfully!');
        setForm({ type: 'SUGGESTION', subject: '', message: '' });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PENDING' ? 'RESOLVED' : 'PENDING';
    const toastId = toast.loading('Updating status...');
    try {
      const response = await feedbackService.updateFeedbackStatus(id, newStatus);
      if (response.data?.success) {
        toast.success('Status updated successfully.', { id: toastId });
        setFeedbacks((prev) =>
          prev.map((fb) => (fb._id === id ? { ...fb, status: newStatus } : fb))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.', { id: toastId });
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (statusFilter === 'ALL') return true;
    return fb.status === statusFilter;
  });

  return (
    <div className="space-y-8 relative overflow-hidden">
      {/* Decorative Blur Spheres for Creative depth */}
      <div className="absolute top-20 right-[-100px] w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-100px] w-96 h-96 bg-mint/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container with custom gradient decoration */}
      <div className="relative p-6 sm:p-8 rounded-3xl border border-glass-border bg-gradient-to-br from-card/85 via-card/70 to-secondary/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden">
        {/* Subtle top color bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-mint" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Support Center</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Feedback & Support
          </h1>
          <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">
            Have a suggestion, found a bug, or need help? Send us a ticket. Only system administrators will see and respond to your request.
          </p>
        </div>

        {/* Tab Selection (Admin Inbox Access) */}
        {isAdmin && (
          <div className="flex bg-secondary/80 p-1 rounded-2xl border border-glass-border self-start shrink-0">
            <button
              onClick={() => setActiveTab('submit')}
              className={cn(
                "px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer",
                activeTab === 'submit'
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              Submit Ticket
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={cn(
                "px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1.5",
                activeTab === 'inbox'
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Inbox className="w-3.5 h-3.5" />
              Admin Inbox
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* SUBMIT FEEDBACK FORM VIEW */}
        {activeTab === 'submit' && (
          <motion.div
            key="submit-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid gap-8 lg:grid-cols-12"
          >
            {/* LEFT SIDE: CREATIVE STEP PROGRESSION & PRIVACY LOCK */}
            <div className="lg:col-span-4 space-y-6">
              {/* Privacy Shield Box */}
              <div className="glass-card p-6 border-l-4 border-l-primary space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Strictly Confidential</h3>
                    <p className="text-[10px] text-muted-foreground">Admin-Only Access</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your requests are private. Other community members cannot view, search, or access what you submit.
                </p>
              </div>

              {/* Step progression */}
              <div className="glass-card p-6 space-y-6 relative overflow-hidden">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Submission Steps</h4>
                
                <div className="space-y-6 relative">
                  {/* Step 1 */}
                  <div className="flex gap-3.5 relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-primary/20" />
                    
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all shrink-0 z-10 bg-card",
                      form.type ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                    )}>
                      1
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold leading-tight">Select Request Type</h5>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">Choose suggestion, bug, help, or feedback.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3.5 relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-primary/20" />

                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all shrink-0 z-10 bg-card",
                      form.subject && form.message ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                    )}>
                      2
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold leading-tight">Compose Content</h5>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">Describe your suggestion or technical bug details.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3.5 relative">
                    <div className="w-6 h-6 rounded-full border-2 bg-card border-muted-foreground text-muted-foreground flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                      3
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold leading-tight">Submit Ticket</h5>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">Confirm and send. Administrators review entries daily.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: INTERACTIVE FORM CONTAINER */}
            <div className="lg:col-span-8">
              <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12 space-y-6"
                  >
                    <div className="p-5 rounded-full bg-success/10 border border-success/20 text-success relative">
                      <CheckCircle className="w-16 h-16" />
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full text-xs">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight">Response Submitted!</h2>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        We have recorded your ticket in the database. System administrators will look into it shortly.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                      className="rounded-xl border-glass-border hover:bg-secondary/40 font-semibold cursor-pointer"
                    >
                      Submit Another Response
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Types Selector Card Grid */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">1. Select request intent</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {TYPES.map((t) => {
                          const IconComponent = t.icon;
                          const isSelected = form.type === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                              className={cn(
                                "relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden group",
                                t.hoverGlow,
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                                  : "border-glass-border bg-card/45 hover:bg-card/90"
                              )}
                            >
                              <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", t.badgeColor)}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 pr-4">
                                <p className="text-xs font-bold text-foreground">{t.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                              </div>

                              {/* Tiny selection corner notch */}
                              {isSelected && (
                                <div className="absolute top-0 right-0 w-6 h-6 bg-primary flex items-center justify-center rounded-bl-xl">
                                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subject field */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="subject" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">2. Subject</Label>
                        <span className="text-[10px] text-muted-foreground">{form.subject.length}/100</span>
                      </div>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g., Export book data functionality requests"
                        maxLength={100}
                        required
                        className="rounded-xl border border-glass-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all bg-background/30 shadow-inner px-4 py-3"
                      />
                    </div>

                    {/* Message body */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="message" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">3. Write your Message</Label>
                        <span className="text-[10px] text-muted-foreground">{form.message.length}/2000</span>
                      </div>
                      <textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us what you need in detail. Be as specific as possible..."
                        maxLength={2000}
                        required
                        rows={7}
                        className="w-full rounded-xl border border-glass-border bg-background/30 shadow-inner px-4 py-3 text-xs leading-relaxed ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                      />
                    </div>

                    {/* Submit Section */}
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl px-7 py-3 font-bold cursor-pointer flex items-center gap-2 group shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                      >
                        {isSubmitting ? (
                          <>Sending ticket...</>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            Submit Support Ticket
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ADMIN VIEW INBOX VIEW */}
        {activeTab === 'inbox' && isAdmin && (
          <motion.div
            key="inbox-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filter controls */}
            <div className="flex gap-2 items-center border-b border-glass-border pb-4">
              {['ALL', 'PENDING', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border border-transparent",
                    statusFilter === filter
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-glass-border"
                  )}
                >
                  {filter}
                </button>
              ))}
              <div className="ml-auto text-[10px] text-muted-foreground font-semibold">
                Total: {filteredFeedbacks.length} messages
              </div>
            </div>

            {/* List */}
            {isLoadingFeedbacks ? (
              <div className="flex justify-center py-16">
                <Clock className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="glass-card p-16 text-center text-muted-foreground space-y-4">
                <Inbox className="w-12 h-12 mx-auto opacity-30 text-primary" />
                <div>
                  <p className="text-sm font-bold">No feedback entries found</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">There are no records matching this status type.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((fb) => {
                  const typeObj = TYPES.find((t) => t.value === fb.type) || TYPES[0];
                  const Icon = typeObj.icon;
                  return (
                    <motion.div
                      key={fb._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card p-6 space-y-4 flex flex-col md:flex-row md:items-start justify-between gap-6 border-l-4 border-l-primary hover:border-l-accent transition-all duration-200"
                    >
                      <div className="space-y-4 max-w-4xl flex-1">
                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 border shadow-sm", typeObj.badgeColor)}>
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {typeObj.label}
                          </span>
                          
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 bg-secondary/35 px-2.5 py-1 rounded-lg border border-glass-border">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            {fb.user?.name} (@{fb.user?.username})
                          </span>

                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 bg-secondary/35 px-2.5 py-1 rounded-lg border border-glass-border">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {fb.user?.email}
                          </span>

                          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 ml-auto">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {new Date(fb.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Text Message */}
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-base text-foreground leading-snug">{fb.subject}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-secondary/25 p-4 rounded-2xl border border-glass-border/40 shadow-inner">
                            {fb.message}
                          </p>
                        </div>
                      </div>

                      {/* Status & Resolve controls */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 md:border-l border-glass-border/40 md:pl-6">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right md:block hidden">Status</span>
                          <Badge
                            className={cn(
                              "text-[10px] font-extrabold tracking-wider px-2.5 py-1 border shadow-inner",
                              fb.status === 'RESOLVED'
                                ? "bg-success/15 text-success border-success/25"
                                : "bg-warning/15 text-warning border-warning/25"
                            )}
                            variant="outline"
                          >
                            {fb.status}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(fb._id, fb.status)}
                          className={cn(
                            "rounded-xl border text-[11px] font-bold px-3 py-2 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm",
                            fb.status === 'PENDING'
                              ? "bg-success text-success-foreground hover:opacity-90 border-success/30"
                              : "bg-secondary text-foreground hover:bg-secondary/70 border-glass-border"
                          )}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark {fb.status === 'PENDING' ? 'Resolved' : 'Pending'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
