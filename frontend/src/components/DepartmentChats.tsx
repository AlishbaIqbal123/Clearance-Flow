import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageSquare, 
  Send, 
  UserCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight, 
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Info,
  CornerDownRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { departmentService } from '@/lib/department.service';
import { StatusBadge } from './StatusBadge';

interface DepartmentChatsProps {
  user: any;
}

export const DepartmentChats: React.FC<DepartmentChatsProps> = ({ user }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatsData = async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      // Fetch all requests to get comment streams
      const res = await departmentService.getRequests({ limit: 100 });
      if (res?.success) {
        const rawRequests = res.data?.requests || res.data || [];
        setRequests(Array.isArray(rawRequests) ? rawRequests : []);
        setOptimisticMessages([]); // Clear optimistic state after successful fetch
      }
    } catch (err) {
      console.error('Failed to sync live chat feeds', err);
      if (!silent) toast.error('Failed to load active communications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatsData();
    // Smooth polling every 10 seconds to sync new incoming chats
    const interval = setInterval(() => {
      fetchChatsData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Auto scroll to bottom of selected chat stream
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedRequestId, requests]);

  // Handle Mark read automatically when selecting a thread with unread count
  const handleSelectThread = async (req: any) => {
    setSelectedRequestId(req.id);
    setIsMobileThreadOpen(false); // Switch to chat view on mobile
    const comments = req.comments || [];
    const deptId = user?.department_id || user?.department?.id;
    const hasUnread = comments.some((c: any) => 
      c.author_model === 'Student' && 
      (c.department_id === deptId || !c.department_id) && 
      !c.read_by_dept
    );

    if (hasUnread && deptId) {
      try {
        await departmentService.markDepartmentChatRead(req.id, deptId);
        // Optimistically update local requests array
        setRequests(prev => prev.map(item => {
          if (item.id === req.id) {
            return {
              ...item,
              comments: (item.comments || []).map((c: any) => ({
                ...c,
                read_by_dept: true
              }))
            };
          }
          return item;
        }));
      } catch (e) {
        console.error('Failed to mark thread read', e);
      }
    }
  };

  // Compute threads list with metadata
  const threads = requests.map(req => {
    const comments = req.comments || [];
    const deptId = user?.department_id || user?.department?.id;
    // Filter comments addressed to this department or legacy messages with no dept ID
    const deptComments = comments.filter((c: any) => 
      c.department_id === deptId || !c.department_id
    );
    
    const unreadCount = deptComments.filter((c: any) => 
      c.author_model === 'Student' && !c.read_by_dept
    ).length;

    // Synthesize latest remark from status into the chat feed if missing
    const deptStatus = (req.clearance_status || []).find((s: any) => s.department_id === deptId);
    const remarkInComments = deptComments.some(c => c.message === deptStatus?.remarks && c.is_notification);
    
    const combinedComments = [
      ...(deptStatus?.remarks && !remarkInComments ? [{
        id: `remark-${deptStatus.id}`,
        message: deptStatus.remarks,
        author_model: 'Staff',
        authorName: 'Official Remark',
        is_notification: true,
        created_at: deptStatus.updated_at || deptStatus.created_at || new Date().toISOString()
      }] : []),
      ...deptComments
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const lastMessage = combinedComments[combinedComments.length - 1];

    return {
      ...req,
      deptComments: combinedComments,
      unreadCount,
      lastMessage,
      lastTimestamp: lastMessage ? new Date(lastMessage.created_at).getTime() : new Date(req.created_at).getTime()
    };
  });

  // Filter & Sort threads (unread first, then most recent activity)
  const filteredThreads = threads.filter(t => {
    const q = searchTerm.toLowerCase();
    const studentName = `${t.student?.first_name || ''} ${t.student?.last_name || ''}`.toLowerCase();
    const regNum = (t.student?.registration_number || '').toLowerCase();
    return studentName.includes(q) || regNum.includes(q);
  }).sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return b.lastTimestamp - a.lastTimestamp;
  });

  const selectedThread = threads.find(t => t.id === selectedRequestId);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRequestId) return;
    
    const textToSend = messageInput.trim();
    const deptId = user?.department_id || user?.department?.id;
    
    // Inject optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: textToSend,
      author_model: 'Staff',
      department_id: deptId,
      created_at: new Date().toISOString(),
      authorName: 'You (Dept Staff)'
    };

    setOptimisticMessages(prev => [...prev, tempMessage]);
    setMessageInput('');
    scrollToBottom();

    try {
      const res = await departmentService.sendDepartmentChat(selectedRequestId, {
        departmentId: deptId,
        message: textToSend
      });
      if (res?.success) {
        // We could fetch here, but the optimistic message is already there.
        // The next sync loop will replace it with the real one.
        await fetchChatsData(true);
      }
    } catch (err: any) {
      // Remove optimistic message on failure
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      toast.error(err.response?.data?.message || 'Failed to dispatch message');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col h-[calc(100vh-140px)]">
      {/* Premium Integrated Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-soft">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">
                  Live Gateway
                </Badge>
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none mt-1">
                Student Inquiries
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl border border-foreground/5 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            WhatsApp Core UI Active
          </span>
        </div>
      </div>

      {/* Main WhatsApp layout window */}
      <div className="flex-1 min-h-0 rounded-3xl border border-foreground/5 bg-card/60 backdrop-blur-3xl shadow-strong overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Sidebar Pane */}
        <div className={`
          ${isMobileThreadOpen ? 'flex' : 'hidden md:flex'} 
          w-full md:w-[300px] lg:w-[360px] border-b md:border-b-0 md:border-r border-foreground/5 flex flex-col bg-secondary/10 shrink-0 h-full
        `}>
          {/* Search bar header */}
          <div className="p-4 border-b border-foreground/5 bg-secondary/30">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search student or sequence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background/80 border-none rounded-xl text-xs font-bold shadow-inner placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List streams */}
          <ScrollArea className="flex-1 px-3 py-2">
            {loading && threads.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Loading Feeds...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center space-y-2 opacity-50">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 stroke-[1.5]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No corresponding dialogues</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredThreads.map(t => {
                  const isSelected = t.id === selectedRequestId;
                  const studentFullName = `${t.student?.first_name || ''} ${t.student?.last_name || ''}`.trim() || 'Anonymous Student';
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectThread(t)}
                      className={`w-full p-3 rounded-2xl text-left transition-all duration-300 flex items-start gap-3 relative group border ${
                        isSelected 
                          ? 'bg-primary text-white shadow-strong shadow-primary/20 border-primary scale-[1.01]' 
                          : 'hover:bg-secondary/80 bg-card/40 border-foreground/5 hover:border-foreground/10 text-foreground'
                      }`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-soft transition-transform group-hover:scale-105 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-secondary text-primary'
                        }`}>
                          {t.student?.first_name?.[0] || 'S'}{t.student?.last_name?.[0] || ''}
                        </div>
                        {t.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[8px] font-black flex items-center justify-center border-2 border-background animate-bounce shadow-sm">
                            {t.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-black truncate uppercase tracking-tight ${isSelected ? 'text-white' : 'text-foreground'}`}>
                            {studentFullName}
                          </p>
                          <span className={`text-[8px] font-bold uppercase tracking-widest shrink-0 ${isSelected ? 'text-white/70' : 'text-muted-foreground/60'}`}>
                            {t.lastMessage ? new Date(t.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'New'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold tracking-tight truncate max-w-[120px] block ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {t.student?.registration_number || 'N/A'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-foreground/10 shrink-0" />
                          <span className={`text-[8px] font-black uppercase tracking-widest truncate ${isSelected ? 'text-white/60' : 'text-primary/60'}`}>
                            {t.student?.program || 'General'}
                          </span>
                        </div>

                        <p className={`text-[10px] font-medium line-clamp-1 italic pt-0.5 ${
                          t.unreadCount > 0 ? 'text-primary font-bold dark:text-primary-foreground' : isSelected ? 'text-white/70' : 'text-muted-foreground/70'
                        }`}>
                          {t.lastMessage ? t.lastMessage.message : 'No message history yet.'}
                        </p>
                      </div>

                      {!isSelected && t.unreadCount > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Chat Console Pane */}
        <div className={`
          ${!isMobileThreadOpen ? 'flex' : 'hidden md:flex'} 
          flex-1 flex flex-col bg-background/20 relative overflow-hidden h-full
        `}>
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
              <div className="w-24 h-24 bg-secondary/80 rounded-[2.5rem] flex items-center justify-center shadow-inner mb-6 relative group animate-float">
                <MessageSquare className="w-12 h-12 text-muted-foreground/40 group-hover:text-primary transition-colors duration-500" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Select a Chat Feeder</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-2 leading-relaxed">
                Choose a student inquiry stream from the left panel to review securely transmitted communications and provide administrative responses.
              </p>
              <div className="mt-6 flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-foreground/5 shadow-soft">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  Encrypted Peer-to-Department Relay
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Sticky Top Header */}
              <div className="px-6 py-4 glass border-b border-foreground/5 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-soft">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMobileThreadOpen(true)}
                    className="md:hidden rounded-full hover:bg-secondary w-9 h-9"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs shadow-inner">
                    {selectedThread.student?.first_name?.[0] || 'S'}{selectedThread.student?.last_name?.[0] || ''}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-none">
                      {selectedThread.student?.first_name} {selectedThread.student?.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        {selectedThread.student?.registration_number}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-foreground/10" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                        {selectedThread.student?.program}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedThread.status} />
                </div>
              </div>

              {/* Chat Stream Area */}
              <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-background/10 via-background/30 to-background/50">
                <div className="max-w-3xl mx-auto space-y-4">
                  {selectedThread.deptComments?.length === 0 && optimisticMessages.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Badge variant="outline" className="border-foreground/10 rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest opacity-40">
                        Thread Established
                      </Badge>
                      <p className="text-xs text-muted-foreground italic max-w-sm mx-auto">
                        No previous incoming messages found. You can broadcast proactive updates to this candidate below.
                      </p>
                    </div>
                  ) : (
                    [...selectedThread.deptComments, ...optimisticMessages.filter(om => om.department_id === (user?.department_id || user?.department?.id))].map((msg: any, idx: number) => {
                      const isStudent = msg.author_model === 'Student';
                      return (
                        <div 
                          key={msg.id || idx} 
                          className={`flex flex-col ${isStudent ? 'items-start' : 'items-end'} group/msg animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                              {msg.authorName || (isStudent ? `${selectedThread.student?.first_name || 'Student'}` : 'You (Dept Staff)')}
                            </span>
                          </div>
                          <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed shadow-soft relative ${
                            msg.is_notification 
                              ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20 italic' 
                              : isStudent 
                                ? 'bg-secondary text-foreground rounded-bl-sm border border-foreground/5' 
                                : 'bg-primary text-white rounded-br-sm shadow-primary/20'
                          }`}>
                            {msg.is_notification && <Info className="w-3 h-3 inline mr-2 opacity-50" />}
                            {msg.message}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 opacity-60 group-hover/msg:opacity-100 transition-opacity">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.is_notification && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-none text-[7px] font-black uppercase tracking-widest px-1.5 py-0">
                                System Log
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Form Send Footer */}
              <div className="p-4 bg-card border-t border-foreground/5 shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <Input
                    placeholder={`Reply to ${selectedThread.student?.first_name || 'candidate'}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    className="flex-1 h-12 bg-secondary/50 border-none rounded-xl px-4 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner"
                  />
                  <Button
                    disabled={sending || !messageInput.trim()}
                    onClick={handleSendMessage}
                    className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-strong shadow-primary/20 shrink-0 transition-all hover:scale-105 active:scale-95 p-0 flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
