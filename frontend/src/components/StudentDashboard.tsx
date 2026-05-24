// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  Plus,
  GraduationCap,
  Shield,
  X,
  Zap,
  ShieldCheck,
  Activity,
  History,
  TrendingUp,
  LayoutDashboard,
  MapPin,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { studentService } from '@/lib/student.service';

const BentoStatCard = ({ title, value, icon: Icon, color, onClick, description }: { title: string; value: any; icon: any; color: string; onClick?: () => void; description?: string }) => (
  <button 
    className={`
      flex flex-col justify-between p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-foreground/5 shadow-soft overflow-hidden group relative transition-all duration-700
      ${onClick ? 'cursor-pointer hover:shadow-strong hover:bg-card hover:-translate-y-1.5' : ''}
    `}
    onClick={onClick}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${color} opacity-[0.05] group-hover:opacity-[0.1] transition-opacity blur-3xl`} />
    <div className="flex items-center justify-between relative z-10 w-full mb-4">
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-soft shadow-inner`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      {onClick && <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />}
    </div>
    <div className="space-y-1 text-left relative z-10">
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none opacity-60">{title}</p>
      <h3 className="text-lg font-black text-foreground mt-1.5 tracking-tighter uppercase leading-none">{value}</h3>
      {description && <p className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1.5">{description}</p>}
    </div>
  </button>
);

const PhaseAccordion = ({
  phase,
  label,
  cleared,
  count,
  clearedCount,
  defaultOpen,
  children,
}: {
  phase: string;
  label: string;
  cleared: boolean;
  count: number;
  clearedCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-500 ${cleared ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-foreground/8 bg-background/30'}`}>
      {/* Accordion Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 gap-4 hover:bg-foreground/5 transition-colors duration-200"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cleared ? 'bg-emerald-500/20' : 'bg-primary/10'}`}>
            {cleared
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              : <Activity className="w-4 h-4 text-primary animate-pulse" />
            }
          </div>
          <div className="text-left">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] leading-none mb-0.5">{phase}</p>
            <h4 className={`text-sm font-black uppercase tracking-tight leading-none ${cleared ? 'text-emerald-500' : 'text-foreground'}`}>{label}</h4>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${cleared ? 'bg-emerald-500/15 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
            {cleared ? `✓ Completed` : `${clearedCount}/${count} cleared`}
          </span>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Collapsible Content */}
      {open && (
        <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

export const StudentDashboard = ({ onNavigate, mode = 'full', onRefresh }: { onNavigate?: (tab: string) => void, mode?: 'full' | 'fulfillment', onRefresh?: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState('graduation');
  const [reason, setReason] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [degreePref, setDegreePref] = useState<{ method: 'dispatch' | 'manual' | '', address: string }>({ method: '', address: '' });
  const [prefSubmitting, setPrefSubmitting] = useState(false);

  const [chatOpenDept, setChatOpenDept] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const handleSendChat = async () => {
    if (!messageInput.trim() || !data?.activeRequest?.id || !chatOpenDept) return;
    
    const textToSend = messageInput.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: textToSend,
      author_model: 'Student',
      department_id: chatOpenDept.department_id,
      created_at: new Date().toISOString(),
      authorName: 'You'
    };

    // Optimistic Update: Add message immediately
    setData((prev: any) => ({
      ...prev,
      activeRequest: {
        ...prev.activeRequest,
        comments: [...(prev.activeRequest.comments || []), tempMessage]
      }
    }));

    setMessageInput('');
    setSendingChat(true);

    try {
      const res = await studentService.sendDepartmentChat(data.activeRequest.id, {
        departmentId: chatOpenDept.department_id,
        message: textToSend
      });
      if (res.success) {
        fetchDashboard();
      }
    } catch {
      toast.error('Failed to send message');
      fetchDashboard(); // Revert/Sync on error
    } finally {
      setSendingChat(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setData(res.data);
        if (onRefresh) onRefresh();
      }
    } catch {
      toast.error('Failed to synchronize clearance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh student dashboard every 15 seconds to pull new staff updates
    const interval = setInterval(() => {
      studentService.getDashboard()
        .then(res => {
          if (res.success) {
            setData(res.data);
            if (onRefresh) onRefresh();
          }
        })
        .catch(err => console.error('Dashboard auto-refresh failed', err));
    }, 15000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    try {
      const res = await studentService.submitRequest({ 
        requestType: 'graduation', 
        reason: 'Initiated by student' 
      });
      if (res.success) {
        toast.success('Clearance request successfully initiated across all departments');
        fetchDashboard();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Clearance request failed');
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdatePreference = async (method: 'dispatch' | 'manual') => {
    if (method === 'dispatch' && !degreePref.address.trim()) {
      toast.error('Shipping address required for dispatch');
      return;
    }

    try {
      setPrefSubmitting(true);
      const res = await studentService.updateDegreePreference(activeRequest.id, {
        method,
        address: method === 'dispatch' ? degreePref.address : undefined
      });

      if (res.success) {
        toast.success('Delivery preference saved');
        fetchDashboard();
      }
    } catch {
      toast.error('Failed to update delivery preference');
    } finally {
      setPrefSubmitting(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!activeRequest?.id) return;
    if (!window.confirm('By confirming receipt, you acknowledge that you have physically received your degree and your clearance process will be completed. Continue?')) return;

    try {
      setSubmitting(true);
      const res = await studentService.confirmDegreeReceipt(activeRequest.id);
      if (res.success) {
        toast.success('Congratulations! Your clearance is fully finalized.');
        fetchDashboard();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Confirmation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-8">
        <div className="relative group">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-[2rem] animate-spin transition-all duration-700 group-hover:scale-110" />
          <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
           <p className="text-[11px] font-black text-foreground uppercase tracking-[0.4em] animate-pulse">Syncing Dashboard</p>
           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Establishing secure session...</p>
        </div>
      </div>
    );
  }

  const student = data?.student || {};
  const activeRequest = data?.activeRequest || null;
  const canSubmitNewRequest = data?.canSubmitNewRequest ?? true;

  const getDeptDisplayName = (deptId: string, deptName: string) => {
    if (deptId === student.department_id && student.discipline) {
      return student.discipline;
    }
    return deptName;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {mode === 'fulfillment' ? (
        <div className="space-y-8">
           <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 shadow-strong group">
              <div className="absolute top-0 right-0 w-[45%] h-full bg-primary/20 rounded-full -mr-[20%] -mt-[10%] blur-[100px]" />
              <div className="relative z-10 space-y-2">
                 <Badge className="bg-primary/20 text-primary border-none font-black text-[8px] uppercase tracking-[0.4em] px-4 py-1 rounded-full backdrop-blur-md mb-2">Phase 3: Degree Allotment</Badge>
                 <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">Degree Fulfillment Portal</h2>
                 <p className="text-sm text-muted-foreground font-medium leading-relaxed italic max-w-2xl">Finalize your degree collection strategy and confirm receipt of your official credentials.</p>
              </div>
           </div>
           
           {!activeRequest?.degree_fulfillment || Object.keys(activeRequest.degree_fulfillment).length === 0 ? (
              <div className="animate-in zoom-in-95 slide-in-from-top-12 duration-1000 ease-out">
                {/* Re-use the existing selection phase UI but without the condition check since it's forced in this mode */}
                <Card className="border-none shadow-strong rounded-[2.5rem] bg-card/60 backdrop-blur-2xl overflow-hidden relative group">
                  <div className="flex flex-col lg:flex-row items-center gap-10 p-12 relative z-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl shadow-soft shrink-0">
                      <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                    <div className="flex-1 text-center lg:text-left space-y-4">
                      <h3 className="text-3xl font-black tracking-tighter uppercase text-foreground leading-none">Select Fulfillment Strategy</h3>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest max-w-xl">
                        Your departmental clearance is 100% complete. Please choose how you wish to receive your degree.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="h-20 px-10 rounded-[1.75rem] bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 min-w-[240px] shadow-lg shadow-primary/20">
                            <Truck className="w-6 h-6" />
                            <div className="text-left">
                              <span className="block font-black">Dispatch Degree</span>
                              <span className="block text-[7px] text-white/60 mt-0.5 font-bold">Secure Home Delivery</span>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background max-h-[90vh] overflow-y-auto custom-scrollbar">
                          {/* ... existing Dialog content for dispatch ... */}
                          <div className="bg-card border-b border-border/50 p-10 text-foreground relative">
                             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-[100px]" />
                             <div className="relative z-10 space-y-4">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                   <MapPin className="w-7 h-7 text-primary" />
                                </div>
                                <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Shipping Logistics</DialogTitle>
                             </div>
                          </div>
                          <div className="p-10 space-y-8">
                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Mailing Address</label>
                                <Textarea 
                                  placeholder="Enter full shipping address..." 
                                  className="min-h-[160px] rounded-[2rem] border-none bg-secondary/50 font-bold px-8 py-6 text-base shadow-inner"
                                  value={degreePref.address}
                                  onChange={(e) => setDegreePref(prev => ({ ...prev, address: e.target.value }))}
                                />
                             </div>
                             <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-[11px] uppercase tracking-[0.4em]" onClick={() => handleUpdatePreference('dispatch')}>
                                Confirm Dispatch Location
                             </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button className="h-20 px-10 rounded-[1.75rem] bg-secondary border border-border text-foreground hover:bg-secondary/80 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 min-w-[240px]" onClick={() => handleUpdatePreference('manual')}>
                        <History className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <span className="block font-black">Manual Pickup</span>
                          <span className="block text-[7px] text-muted-foreground/60 mt-0.5 font-bold">Collect from Registrar</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
           ) : (
              /* Already selected, show current status in fulfillment portal */
              <div className="animate-in zoom-in-95 slide-in-from-top-12 duration-1000 ease-out">
                 {/* Re-use existing status section */}
                 {activeRequest?.degree_fulfillment && (
                   <Card className={`border-none shadow-strong rounded-[2.5rem] ${activeRequest.status === 'fully_cleared' ? 'bg-card border border-border/50 text-foreground' : 'bg-emerald-950 text-white'} overflow-hidden relative group p-8 sm:p-12`}>
                      <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 ${activeRequest.status === 'fully_cleared' ? 'bg-primary/10' : 'bg-emerald-500/20'} rounded-[2rem] flex items-center justify-center backdrop-blur-xl`}>
                          {activeRequest.status === 'fully_cleared' ? <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-primary" /> : <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />}
                        </div>
                        <div className="flex-1 text-center lg:text-left space-y-4">
                           <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">
                              {activeRequest.status === 'fully_cleared' ? 'Clearance Fully Finalized' : 'Fulfillment in Progress'}
                           </h3>
                           <p className={`text-sm font-bold ${activeRequest.status === 'fully_cleared' ? 'text-muted-foreground' : 'text-white/60'} uppercase tracking-widest max-w-xl`}>
                              {activeRequest.status === 'fully_cleared' 
                                ? 'Clearance process completed. Degree successfully received.' 
                                : activeRequest.degree_fulfillment.method === 'dispatch' ? `Preparing dispatch to: ${activeRequest.degree_fulfillment.address}` : 'Degree ready for manual pickup.'}
                           </p>
                        </div>
                        {activeRequest.degree_fulfillment.notification_sent && !activeRequest.degree_fulfillment.received_by_student && (
                          <Button onClick={handleConfirmReceipt} className="h-16 px-10 rounded-[1.75rem] bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
                             Confirm Receipt
                          </Button>
                        )}
                      </div>
                   </Card>
                 )}
              </div>
           )}
        </div>
      ) : (
        <>
          {/* Premium Hero Section - Bento Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4 sm:p-6 lg:p-8 shadow-strong group">
        {/* Dynamic Effects */}
        <div className="absolute top-0 right-0 w-[45%] h-full bg-primary/20 rounded-full -mr-[20%] -mt-[10%] blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-[25%] h-[60%] bg-primary/10 rounded-full -ml-[12%] -mb-[12%] blur-[60px]" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
          <div className="space-y-5 max-w-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Badge className="bg-primary/20 text-primary border-none font-black text-[8px] uppercase tracking-[0.4em] px-4 py-1 rounded-full backdrop-blur-md shadow-sm">
                   Student Dashboard
                </Badge>
                <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-foreground tracking-tighter leading-none uppercase">
                {activeRequest?.status === 'fully_cleared' ? (
                  <>Clearance Complete,<br /><span className="text-primary italic">Clearance Finalized</span></>
                ) : (
                  <>Ready for Delivery,<br /><span className="text-primary italic">Select Option Below</span></>
                )}
              </h2>
            </div>
            
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl opacity-80 italic">
              {activeRequest?.status === 'fully_cleared' 
                ? 'Your clearance process is 100% complete. Your degree has been officially allotted and the process is closed.'
                : 'Easily manage and track your university clearance status in one place.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { label: 'Program', value: student.program, icon: GraduationCap },
                { label: 'ID', value: student.registration_number, icon: Shield },
                { label: 'Batch', value: student.batch, icon: History }
              ].map((tag, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary border border-border px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <tag.icon className="w-3.5 h-3.5 text-primary" />
                  <div className="flex flex-col">
                     <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-widest leading-none mb-1">{tag.label}</span>
                     <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{tag.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {canSubmitNewRequest && (
            <Button 
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 h-10 px-6 rounded-lg font-black text-[9px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 group shrink-0 active:scale-95 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <div className="flex items-center gap-3 relative z-10">
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                )}
                <span>{submitting ? 'Initiating...' : 'Start Clearance'}</span>
              </div>
            </Button>
          )}
        </div>
      </div>

      {/* Degree Fulfillment Section - Selection Phase */}
      {(activeRequest?.status === 'cleared' || activeRequest?.progress?.percentage === 100) && 
       (!activeRequest?.degree_fulfillment || Object.keys(activeRequest.degree_fulfillment).length === 0) && (
        <div className="animate-in zoom-in-95 slide-in-from-top-12 duration-1000 ease-out">
          <Card className="border-none shadow-strong rounded-[2.5rem] bg-card border border-border/50 text-foreground overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full -mr-[15%] -mt-[10%] blur-[120px]" />
            <div className="flex flex-col lg:flex-row items-center gap-8 p-6 sm:p-8 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-soft shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
              </div>
              
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="space-y-1">
                  <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-lg mb-2">Final Fulfillment</Badge>
                  <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Your Degree is Ready</h3>
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest max-w-xl">
                  Congratulations! All clearance requirements have been satisfied. Select your preferred method of degree collection.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-14 sm:h-16 px-8 rounded-2xl bg-primary text-white hover:bg-primary/95 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 group/btn min-w-[220px] shadow-lg shadow-primary/10">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block">Dispatch Degree</span>
                        <span className="block text-[7px] text-white/70 mt-0.5">Secure Home Delivery</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="bg-card border-b border-border/50 p-10 text-foreground relative">
                       <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-[100px]" />
                       <div className="relative z-10 space-y-4">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                             <MapPin className="w-7 h-7 text-primary" />
                          </div>
                          <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Shipping Logistics</DialogTitle>
                          <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Provide your official residence address for secure degree dispatch.</DialogDescription>
                       </div>
                    </div>
                    <div className="p-10 space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Mailing Address</label>
                          <Textarea 
                            placeholder="Enter full shipping address with postal code..." 
                            className="min-h-[160px] rounded-[2rem] border-none bg-secondary/50 font-bold text-foreground px-8 py-6 focus-visible:ring-2 focus-visible:ring-primary/20 resize-none text-base shadow-inner"
                            value={degreePref.address}
                            onChange={(e) => setDegreePref(prev => ({ ...prev, address: e.target.value }))}
                          />
                       </div>
                       <Button 
                         className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 transition-all active:scale-95"
                         disabled={prefSubmitting}
                         onClick={() => handleUpdatePreference('dispatch')}
                       >
                         {prefSubmitting ? 'Securing Transit...' : 'Confirm Dispatch Location'}
                       </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  className="h-14 sm:h-16 px-8 rounded-2xl bg-secondary border border-border text-foreground hover:bg-secondary/80 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 min-w-[220px]"
                  disabled={prefSubmitting}
                  onClick={() => handleUpdatePreference('manual')}
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="block text-foreground">Manual Pickup</span>
                    <span className="block text-[7px] text-muted-foreground mt-0.5">Collect from Registrar</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fulfillment Status Section - Phase 3 */}
      {activeRequest?.degree_fulfillment && Object.keys(activeRequest.degree_fulfillment).length > 0 && (
        <div className="animate-in zoom-in-95 slide-in-from-top-12 duration-1000 ease-out">
          <Card className={`border-none shadow-strong rounded-[2.5rem] ${activeRequest.status === 'fully_cleared' ? 'bg-card border border-border/50 text-foreground' : 'bg-emerald-950 text-white'} overflow-hidden relative group transition-colors duration-700`}>
            <div className="absolute top-0 right-0 w-[40%] h-full bg-emerald-500/20 rounded-full -mr-[15%] -mt-[10%] blur-[120px]" />
            
            <div className="flex flex-col lg:flex-row items-center gap-10 p-8 sm:p-12 relative z-10">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 ${activeRequest.status === 'fully_cleared' ? 'bg-primary/10 border border-primary/20' : 'bg-emerald-500/20 border border-emerald-500/30'} rounded-[2rem] flex items-center justify-center backdrop-blur-xl`}>
                {activeRequest.status === 'fully_cleared' ? <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-primary" /> : <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />}
              </div>
              
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="space-y-1">
                  <Badge className={`${activeRequest.status === 'fully_cleared' ? 'bg-primary text-white' : 'bg-emerald-500 text-white'} border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-lg mb-2`}>
                    {activeRequest.status === 'fully_cleared' ? 'CLEARANCE COMPLETE' : 'Phase 3: Degree Delivery'}
                  </Badge>
                  <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">
                    {activeRequest.status === 'fully_cleared' 
                      ? 'Clearance Fully Finalized' 
                      : activeRequest.degree_fulfillment.method === 'dispatch' ? 'Dispatch Process Active' : 'Manual Pickup Available'}
                  </h3>
                </div>
                <p className={`text-sm font-bold ${activeRequest.status === 'fully_cleared' ? 'text-muted-foreground' : 'text-emerald-100/60'} uppercase tracking-widest max-w-xl`}>
                  {activeRequest.status === 'fully_cleared'
                    ? `Clearance process completed. Degree successfully allotted and received on ${new Date(activeRequest.degree_fulfillment.received_at || Date.now()).toLocaleDateString()}.`
                    : activeRequest.degree_fulfillment.method === 'dispatch' 
                      ? `Your degree is being prepared for dispatch to: ${activeRequest.degree_fulfillment.address}`
                      : 'Your degree is available for pickup at the Registrar Office. Please confirm once you receive it.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {activeRequest.degree_fulfillment.notification_sent && !activeRequest.degree_fulfillment.received_by_student && (
                  <Button 
                    className="h-16 sm:h-20 px-10 rounded-[1.75rem] bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 min-w-[240px] shadow-lg shadow-primary/20 animate-pulse"
                    onClick={handleConfirmReceipt}
                    disabled={submitting}
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black">Yes, I've Received It</span>
                      <span className="block text-[7px] text-white/60 mt-0.5 font-bold">Finalize Clearance Now</span>
                    </div>
                  </Button>
                )}
                
                <Button 
                  className={`h-16 sm:h-20 px-10 rounded-[1.75rem] ${activeRequest.status === 'fully_cleared' ? 'bg-primary/10 text-primary' : 'bg-white text-emerald-950'} hover:opacity-90 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 min-w-[240px] shadow-lg`}
                  onClick={() => window.location.href = 'mailto:registrar@university.edu?subject=Clearance Fulfillment Inquiry'}
                >
                  <div className={`w-10 h-10 ${activeRequest.status === 'fully_cleared' ? 'bg-primary/20' : 'bg-emerald-100'} rounded-xl flex items-center justify-center`}>
                    <MessageSquare className={`w-5 h-5 ${activeRequest.status === 'fully_cleared' ? 'text-primary' : 'text-emerald-600'}`} />
                  </div>
                  <div className="text-left">
                    <span className="block font-black">Institutional Support</span>
                    <span className="block text-[7px] opacity-40 mt-0.5 font-bold">Support ID: {activeRequest.id.slice(0, 8)}</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 sm:gap-6">
        <BentoStatCard 
          title="Overall Status" 
          value={student.clearance_status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'} 
          icon={ShieldCheck} 
          color="bg-primary" 
          description="Your current clearance state"
          onClick={() => onNavigate?.('my-clearance')}
        />
        <BentoStatCard 
          title="Cleared Departments" 
          value={activeRequest?.progress?.clearedDepartments || 0} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          description={`${activeRequest?.progress?.clearedDepartments || 0}/${activeRequest?.progress?.totalDepartments || 0} Departments Cleared`}
          onClick={() => onNavigate?.('my-clearance')}
        />
        <BentoStatCard 
          title="Total Departments" 
          value={activeRequest?.progress?.totalDepartments || (data?.departments?.length || 0)} 
          icon={LayoutDashboard} 
          color="bg-slate-900 dark:bg-slate-200" 
          description="Departments involved in clearance"
          onClick={() => onNavigate?.('my-clearance')}
        />
        <BentoStatCard 
          title="Previous Requests" 
          value={data?.clearanceHistory?.length || 0} 
          icon={History} 
          color="bg-indigo-600" 
          description="View your clearance history"
          onClick={() => onNavigate?.('my-clearance')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 sm:gap-10">
        {/* Active Clearance Status - Main Bento Piece */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-5 sm:space-y-8">
          {activeRequest ? (
            <Card className="border-none shadow-strong rounded-3xl overflow-hidden bg-card/60 backdrop-blur-2xl">
              <CardHeader className="p-4 sm:p-5 pb-4">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Current Status</h3>
                      <div className="relative flex items-center justify-center">
                         <div className="absolute w-full h-full bg-emerald-500/20 rounded-full animate-ping" />
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-full font-black text-[7px] uppercase tracking-[0.3em] px-2 py-0.5 relative">Updating</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">ID: <span className="text-primary">{activeRequest.request_id}</span></CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none opacity-50">Progress</p>
                    <h4 className="text-2xl font-black text-primary tracking-tighter mt-1.5 leading-none">{activeRequest.progress?.percentage || 0}%</h4>
                  </div>
                </div>
                <div className="mt-6 relative h-3 bg-secondary/50 rounded-full overflow-hidden border border-foreground/5 p-0.5">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out relative ${activeRequest.status === 'fully_cleared' ? 'bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]' : 'bg-primary'}`} 
                      style={{ width: `${activeRequest.status === 'fully_cleared' ? 100 : (activeRequest.progress?.percentage || 0)}%` }}
                     >
                      <div className="absolute inset-0 bg-white/20 shimmer" />
                    </div>
                </div>
              </CardHeader>
                {/* Phase-grouped accordion layout */}
                {(() => {
                  const allStatuses = Array.isArray(activeRequest.clearance_status)
                    ? activeRequest.clearance_status.filter((ds: any) => ds.department?.code !== 'EXD')
                    : [];

                  const adminDepts = allStatuses
                    .filter((ds: any) => ds.department?.type !== 'academic')
                    .sort((a: any, b: any) => {
                      const p: any = { cleared: 1, rejected: 2, in_review: 3, pending: 4 };
                      return p[a.status] - p[b.status];
                    });

                  const academicDepts = allStatuses
                    .filter((ds: any) => ds.department?.type === 'academic')
                    .sort((a: any, b: any) => {
                      const p: any = { cleared: 1, rejected: 2, in_review: 3, pending: 4 };
                      return p[a.status] - p[b.status];
                    });

                  const phase1Cleared = adminDepts.length > 0 && adminDepts.every((s: any) => s.status === 'cleared');
                  const phase2Cleared = phase1Cleared && academicDepts.length > 0 && academicDepts.every((s: any) => s.status === 'cleared');

                  const renderCard = (ds: any) => {
                    const isAcademic = ds.department?.type === 'academic';
                    const cardPhase1Cleared = (activeRequest.clearance_status || [])
                      .filter((s: any) => s.department != null && s.department?.type !== 'academic' && s.department?.code !== 'EXD')
                      .every((s: any) => s.status === 'cleared');
                    const isLocked = isAcademic && !cardPhase1Cleared && ds.status === 'pending';

                    const deptComments = (activeRequest.comments || []).filter((c: any) => c.department_id === ds.department_id);
                    const unreadCount = deptComments.filter((c: any) => c.author_model === 'Staff' && !c.read_by_student).length;

                    return (
                      <div key={ds.id} className={`group relative p-4 lg:p-4 sm:p-5 rounded-2xl border-2 transition-all duration-700 flex flex-col lg:min-h-[145px] min-h-[180px] ${isLocked ? 'bg-muted/5 border-muted/50 grayscale opacity-40' : 'bg-background/40 border-foreground/5 hover:bg-background hover:shadow-strong hover:border-primary/20'}`}>
                        <div className="flex items-start justify-between mb-3 lg:mb-3 sm:mb-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-soft ${isLocked ? 'bg-muted/20' : 'bg-secondary/50'}`}>
                               <Zap className={`w-5 h-5 ${isLocked ? 'text-muted-foreground' : 'text-primary'} ${ds.status === 'in_review' ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
                                {getDeptDisplayName(ds.department_id, ds.department?.name || 'Department')}
                              </h4>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-50">{ds.department?.code || 'DEPT'}</p>
                            </div>
                          </div>
                          <div className="absolute top-6 right-6">
                            {isLocked ? <StatusBadge status="locked" size="sm" /> : <StatusBadge status={ds.status} size="sm" />}
                          </div>
                        </div>

                        {isLocked ? (
                          <div className="flex-1 flex flex-col justify-center bg-muted/10 rounded-[2rem] p-6 border border-dashed border-muted/50">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center leading-relaxed">
                              Wait for administrative<br />phase 1 authorization
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col">
                            {(ds.remarks || ds.due_amount > 0) && (
                              <div className={`p-3 lg:p-3 sm:p-5 rounded-[1.75rem] border-none mb-3 lg:mb-3 sm:mb-6 ${ds.status === 'rejected' ? 'bg-destructive/5' : 'bg-secondary/30'}`}>
                                {ds.due_amount > 0 && (
                                  <p className="text-[11px] font-black text-destructive uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Obligation: Rs. {ds.due_amount.toLocaleString()}
                                  </p>
                                )}
                                {ds.remarks && (
                                  <p className="text-xs text-muted-foreground font-bold italic leading-relaxed opacity-70">"{ds.remarks}"</p>
                                )}
                              </div>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-3 lg:pt-3 sm:pt-6 border-t border-foreground/5">
                              <div className="flex gap-3">
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-90"
                                  onClick={() => { const wa = ds.department?.contact_info?.whatsapp_number; if (wa) window.open(`https://wa.me/${wa.replace(/\D/g, '')}`, '_blank'); else toast.error('WhatsApp not available'); }}>
                                  <Phone className="w-4.5 h-4.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl text-primary hover:bg-primary/10 transition-all active:scale-90"
                                  onClick={() => { const em = ds.department?.contact_info?.email || ds.department?.email; if (em) window.location.href = `mailto:${em}`; else toast.error('Email address not configured'); }}>
                                  <Mail className="w-4.5 h-4.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl text-indigo-500 hover:bg-indigo-500/10 transition-all active:scale-90 relative"
                                  onClick={() => { setChatOpenDept(ds); if (unreadCount > 0 && activeRequest.id) { studentService.markDepartmentChatRead(activeRequest.id, ds.department_id).then(() => fetchDashboard()); } }}>
                                  <MessageSquare className="w-4.5 h-4.5" />
                                  {unreadCount > 0 && (
                                    <Badge className="absolute -top-2 -right-2 bg-destructive text-white border-none rounded-full px-1.5 py-0 text-[8px] font-black animate-pulse shadow-strong min-w-[16px] flex items-center justify-center">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </Button>
                              </div>
                              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
                                {ds.department?.type} Department
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-3 lg:space-y-3 sm:space-y-6 pt-2 lg:pt-2 sm:pt-4 pb-3 lg:pb-3 sm:pb-6">
                      {/* ── Phase 1: Administrative ── */}
                      <PhaseAccordion
                        phase="Phase 1"
                        label="Administrative Clearance"
                        cleared={phase1Cleared}
                        count={adminDepts.length}
                        clearedCount={adminDepts.filter((d: any) => d.status === 'cleared').length}
                        defaultOpen={!phase1Cleared}
                      >
                        <div className="grid grid-cols-1 gap-6">
                          {adminDepts.map(renderCard)}
                        </div>
                      </PhaseAccordion>

                      {/* ── Phase 2: Academic ── */}
                      {phase1Cleared && (
                        <PhaseAccordion
                          phase="Phase 2"
                          label="Academic Clearance"
                          cleared={phase2Cleared}
                          count={academicDepts.length}
                          clearedCount={academicDepts.filter((d: any) => d.status === 'cleared').length}
                          defaultOpen={!phase2Cleared}
                        >
                          <div className="grid grid-cols-1 gap-6">
                            {academicDepts.map(renderCard)}
                          </div>
                        </PhaseAccordion>
                      )}

                      {/* ── Inline Degree Option when Phase 2 complete ── */}
                      {phase2Cleared && (!activeRequest?.degree_fulfillment || Object.keys(activeRequest.degree_fulfillment).length === 0) && (
                        <div className="animate-in zoom-in-95 fade-in duration-700">
                          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-[0.4em] px-3 py-1 rounded-full mb-2">Final Step</Badge>
                              <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Your Degree is Ready — Choose Collection Method</h4>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">All clearance requirements satisfied. Select below or visit the Degree Allotment section.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                    <Truck className="w-4 h-4" /> Dispatch
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background max-h-[90vh] overflow-y-auto custom-scrollbar">
                                  <div className="bg-card border-b border-border/50 p-10 text-foreground relative">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-[100px]" />
                                    <div className="relative z-10 space-y-4">
                                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <MapPin className="w-7 h-7 text-primary" />
                                      </div>
                                      <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Shipping Logistics</DialogTitle>
                                      <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[9px]">Provide your official residence address for secure degree dispatch.</DialogDescription>
                                    </div>
                                  </div>
                                  <div className="p-10 space-y-8">
                                    <div className="space-y-4">
                                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Mailing Address</label>
                                      <Textarea
                                        placeholder="Enter full shipping address with postal code..."
                                        className="min-h-[160px] rounded-[2rem] border-none bg-secondary/50 font-bold text-foreground px-8 py-6 focus-visible:ring-2 focus-visible:ring-primary/20 resize-none text-base shadow-inner"
                                        value={degreePref.address}
                                        onChange={(e) => setDegreePref(prev => ({ ...prev, address: e.target.value }))}
                                      />
                                    </div>
                                    <Button
                                      className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 transition-all active:scale-95"
                                      disabled={prefSubmitting}
                                      onClick={() => handleUpdatePreference('dispatch')}
                                    >
                                      {prefSubmitting ? 'Securing Transit...' : 'Confirm Dispatch Location'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                className="h-11 px-6 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2 active:scale-95 transition-all"
                                disabled={prefSubmitting}
                                onClick={() => handleUpdatePreference('manual')}
                              >
                                <History className="w-4 h-4 text-primary" /> Manual Pickup
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

            </Card>
          ) : (
            <div className="space-y-10">
              <Card className="border-none shadow-strong rounded-3xl p-8 sm:p-12 text-center bg-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 shadow-soft">
                  <FileText className="w-10 h-10 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">No Active Request</h3>
                <p className="text-muted-foreground mt-4 font-medium max-w-sm mx-auto text-lg leading-relaxed opacity-60">
                  You can now start your clearance process. Click the button below to begin.
                </p>
                {canSubmitNewRequest && (
                  <Button 
                    disabled={submitting}
                    className="mt-10 bg-primary text-white rounded-2xl px-12 h-16 font-black uppercase tracking-[0.4em] text-[10px] shadow-strong shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                    onClick={handleSubmitRequest}
                  >
                    {submitting ? 'Initiating...' : 'Start Clearance'}
                  </Button>
                )}
              </Card>

              {/* Department Directory Bento Section */}
              <div className="space-y-4 lg:space-y-4 sm:space-y-8">
                <div className="flex items-center justify-between px-6">
                   <div className="flex items-center gap-5">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
                      <h4 className="text-xl lg:text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">Departments</h4>
                   </div>
                   <Badge variant="outline" className="rounded-full border-foreground/10 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 opacity-60">{data?.departments?.length || 0} Units Detected</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-4 sm:gap-8">
                   {(data?.departments || []).map((dept: any) => (
                       <div key={dept.id} className="p-4 lg:p-4 sm:p-8 rounded-[2rem] lg:rounded-[2rem] sm:rounded-[3rem] bg-card/40 backdrop-blur-md border border-foreground/5 hover:bg-card hover:shadow-strong transition-all duration-700 flex items-center gap-4 lg:gap-4 sm:gap-6 group">
                          <div className={`w-12 h-12 lg:w-12 lg:h-12 sm:w-16 sm:h-16 rounded-[1.25rem] lg:rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center text-xs font-black transition-all duration-700 group-hover:rotate-12 ${dept.type === 'academic' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white'} shadow-soft`}>
                             {dept.code}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1 lg:space-y-1 sm:space-y-2">
                             <h5 className="text-sm lg:text-sm sm:text-base font-black text-foreground leading-none truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                               {getDeptDisplayName(dept.id, dept.name)}
                             </h5>
                             <p className="text-[9px] lg:text-[9px] sm:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
                               Department • {dept.type}
                             </p>
                          </div>
                       </div>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Bento Column */}
        <div className="space-y-6 lg:space-y-6 sm:space-y-12">
          {/* Portal Support Card */}
          <Card className="border-none shadow-strong rounded-[2rem] bg-card border border-border/50 text-foreground overflow-hidden group">
            <CardContent className="p-5 lg:p-5 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full -mr-32 -mt-32 blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
              <div className="space-y-3 lg:space-y-3 sm:space-y-5 relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 backdrop-blur-md">
                   <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-foreground text-xl font-black tracking-tighter uppercase leading-none">Support</CardTitle>
                  <CardDescription className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[9px] leading-relaxed italic">
                    Need help? Contact the IT help desk for any technical issues.
                  </CardDescription>
                 </div>
                 <div className="space-y-3 pt-2">
                   <Button 
                    className="w-full bg-primary text-white hover:bg-primary/95 rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.3em] shadow-strong transition-all active:scale-95"
                    onClick={() => window.open('mailto:it.support@comsats.edu.pk')}
                   >
                      <Mail className="w-4 h-4 mr-3" />
                      Contact Desk
                   </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                         variant="ghost" 
                         className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] transition-all"
                        >
                           <ExternalLink className="w-4 h-4 mr-3" />
                           View Instructions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="relative">
                          {/* Banner background decor */}
                          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
                            <div className="space-y-1 relative z-10">
                              <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Clearance Process</DialogTitle>
                              <DialogDescription className="text-white/70 font-bold uppercase tracking-widest text-[9px]">
                                Step-by-Step Instructions for Students
                              </DialogDescription>
                            </div>
                          </div>

                          <div className="p-8 space-y-6">
                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">1</div>
                                <div className="space-y-1">
                                  <h4 className="font-black text-sm uppercase tracking-tight text-foreground">Initiate Request</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    Click the "Apply for Clearance" button in the Dashboard status card (if not yet submitted) to initiate your clearance request.
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">2</div>
                                <div className="space-y-1">
                                  <h4 className="font-black text-sm uppercase tracking-tight text-foreground">Department-wise Approvals</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your request will progress through 7 verified clearances (Administrative and Academic units). Keep track of each status on your dashboard.
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">3</div>
                                <div className="space-y-1">
                                  <h4 className="font-black text-sm uppercase tracking-tight text-foreground">Resolve Pending Dues</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    If a department flags your request as "Pending Dues", click on the Live Chat icon next to that department to contact the officer and resolve the issue.
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">4</div>
                                <div className="space-y-1">
                                  <h4 className="font-black text-sm uppercase tracking-tight text-foreground">Logistic Details</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    Once fully cleared, submit your dispatch preference (Courier Address or Manual Pickup) to the Degree Allotment (Exam) department.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-secondary/40 rounded-2xl p-4 border border-foreground/5 text-center">
                              <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight">
                                For further support, contact the IT help desk using the support button.
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact Bento List */}
          <Card className="border-none shadow-strong rounded-[2rem] bg-card/60 backdrop-blur-2xl border border-foreground/5 overflow-hidden">
            <CardHeader className="p-4 lg:p-4 sm:p-6 pb-2 lg:pb-2 sm:pb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                <CardTitle className="text-base font-black text-foreground tracking-tighter uppercase">Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-4 sm:p-6 pt-0 space-y-2 lg:space-y-2.5 sm:space-y-4">
              {(data?.departments || []).slice(0, 5).map((dept: any) => (
                <div key={dept.id} className="flex items-center justify-between group cursor-pointer hover:bg-background/50 p-2 lg:p-1.5 sm:p-2.5 -mx-2.5 rounded-xl transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 lg:w-8 lg:h-8 sm:w-9 sm:h-9 rounded-xl bg-secondary flex items-center justify-center text-[8px] font-black text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-soft">
                      {dept.code}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-black text-foreground truncate w-24 group-hover:text-primary transition-colors uppercase tracking-tight">{dept.name}</h5>
                      <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest mt-0.5">Contact</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-7 h-7 rounded-lg text-emerald-500 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
                      onClick={() => {
                         const wa = dept.contact_info?.whatsapp_number;
                         if (wa) window.open(`https://wa.me/${wa.replace(/\D/g, '')}`, '_blank');
                         else toast.error('WhatsApp unavailable');
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-7 h-7 rounded-lg text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
                      onClick={() => {
                        const activeDept = data?.activeRequest?.clearance_status?.find((s: any) => s.department_id === dept.id);
                        if (activeDept) {
                          setChatOpenDept(activeDept);
                        } else {
                          toast.error('This department is not part of your current clearance sequence.');
                        }
                      }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-[8px] font-black uppercase tracking-[0.4em] text-primary mt-4 hover:no-underline group hover:opacity-70 transition-all" onClick={() => onNavigate?.('my-clearance')}>
                 View All <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )}

  {/* Chat Dialog */}
      <Dialog open={!!chatOpenDept} onOpenChange={(open) => {
        if (!open) {
          setChatOpenDept(null);
          setMessageInput('');
        }
      }}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border border-primary/20 bg-background shadow-strong max-h-[90vh] overflow-y-auto custom-scrollbar">
          {chatOpenDept && (() => {
            const currentComments = (data?.activeRequest?.comments || []).filter((c: any) => c.department_id === chatOpenDept.department_id || !c.department_id);
            return (
              <div className="flex flex-col h-[500px]">
                {/* Header */}
                <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">
                      {chatOpenDept.department?.name || 'Department'}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                    Support Channel
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar bg-background/30">
                  {currentComments.length === 0 ? (
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic text-center py-8">
                      No previous messages. Send a message below.
                    </p>
                  ) : (
                    currentComments.map((msg: any, idx: number) => {
                      const isStudent = msg.author_model === 'Student';
                      return (
                        <div key={msg.id || idx} className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                              {msg.authorName || (isStudent ? 'You' : 'Officer')}
                            </span>
                          </div>
                          <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${isStudent ? 'bg-primary text-white rounded-br-sm shadow-soft shadow-primary/20' : 'bg-secondary text-foreground rounded-bl-sm border border-foreground/5'}`}>
                            {msg.message}
                          </div>
                          <span className="text-[7px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Form */}
                <div className="p-4 bg-card border-t border-foreground/5 flex gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Transmit inquiry to department..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                    className="flex-1 h-12 bg-secondary/40 border-none rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    disabled={sendingChat || !messageInput.trim()}
                    onClick={handleSendChat}
                    className="h-12 w-12 rounded-xl bg-primary text-white shadow-strong shadow-primary/20 shrink-0 hover:scale-105 active:scale-95 transition-all p-0 flex items-center justify-center"
                  >
                    {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};
