// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  Mail, MessageCircle, MapPin, Phone, Loader2,
  FileText, ArrowRight, Building2, RefreshCcw,
  Trophy, Info, ExternalLink, Link2, Sparkles,
  Zap, CalendarDays, ArrowUpRight, ShieldCheck,
  Building, GraduationCap, Activity,
  Layers, Globe, Lock, History, ShieldAlert,
  X, UserCircle, Search, Filter, LayoutGrid, List,
  Download, MoreHorizontal, Database, ArrowUp,
  CreditCard, Wallet, Fingerprint, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { studentService } from '@/lib/student.service';
import { StatusBadge } from './StatusBadge';

const DepartmentCard = ({
  dept,
  index,
  isActive,
  isCompleted,
  isFuture,
  student,
  allStatuses,
  requestId,
  onRefresh
}: {
  dept: any;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  student: any;
  allStatuses: any[];
  requestId: string;
  onRefresh: () => void;
}) => {
  const [submittingForms, setSubmittingForms] = useState<Record<string, boolean>>({});
  const isAcademic = dept.department?.type === 'academic';
  const phase1Cleared = (allStatuses || []).every((s: any) => 
    s.department?.type === 'academic' || s.status === 'cleared'
  );

  const handleWhatsApp = () => {
    const phone = dept.department?.contact_info?.phone || dept.department?.phone;
    if (phone) {
      const clean = phone.replace(/[^0-9]/g, '');
      window.open(
        `https://wa.me/${clean}?text=Assalam-o-Alaikum%2C%20I%20am%20inquiring%20about%20my%20clearance%20request%20at%20${encodeURIComponent(dept.department?.name || 'your department')}.`,
        '_blank'
      );
    } else {
      toast.error('WhatsApp number not available for this department');
    }
  };

  const handleEmail = () => {
    const rawEmail = dept.department?.head?.email || dept.department?.contact_info?.email || dept.department?.email;
    const emailMatch = rawEmail?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch ? emailMatch[0] : null;
    if (email) {
      window.location.href = `mailto:${email}?subject=Clearance%20Inquiry%20-%20${encodeURIComponent(dept.department?.name || 'Department')}`;
    } else {
      toast.error('Email not available for this department');
    }
  };

  const handleMarkCompleted = async (formLabel: string) => {
    if (!requestId) return;
    const key = `${dept.department_id}-${formLabel}`;
    setSubmittingForms(prev => ({ ...prev, [key]: true }));
    try {
      const res = await studentService.notifyFormSubmission(requestId, {
        departmentId: dept.department_id,
        formLabel
      });
      if (res.success) {
        toast.success(`Department notified of "${formLabel}" submission!`);
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to notify department');
    } finally {
      setSubmittingForms(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className={`flex gap-3 sm:gap-6 relative group animate-in slide-in-from-left-8 duration-700 delay-[${index * 100}ms]`}>
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`
          relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center border-2 transition-all duration-1000 flex-shrink-0 shadow-strong
          ${isCompleted ? 'bg-emerald-500 border-emerald-500/20 scale-105' : ''}
          ${isActive ? 'bg-primary border-primary/20 scale-110 shadow-primary/40 animate-pulse' : ''}
          ${isFuture ? 'bg-card border-foreground/5 text-muted-foreground' : ''}
        `}>
          <div className="absolute inset-0 bg-white/20 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity" />
          {isCompleted && <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          {isActive && <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          {isFuture && <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-40">{index + 1}</span>}
        </div>
        {/* Connector */}
        <div className={`w-1 flex-1 mt-4 mb-4 rounded-full transition-all duration-1000 bg-gradient-to-b ${isCompleted ? 'from-emerald-500/50 to-emerald-500/20' : 'from-muted/20 to-muted/5'}`} />
      </div>

      {/* Department Card */}
      <div className={`
        flex-1 mb-6 rounded-2xl border transition-all duration-700 overflow-hidden relative group/card
        ${isActive ? 'border-primary/20 shadow-strong scale-[1.01] bg-card/60 backdrop-blur-3xl' : 'border-foreground/5 bg-card/40'}
        ${isCompleted ? 'border-emerald-500/10' : ''}
        ${isFuture ? 'opacity-40' : ''}
      `}>
        {/* Ambient Glow Decoration */}
        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 -mr-24 -mt-24 transition-all duration-1000 group-hover/card:scale-150 ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-primary' : 'bg-muted'}`} />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 shadow-inner relative overflow-hidden group-hover/card:rotate-6 transition-transform duration-700
                ${isActive ? 'bg-primary/10 text-primary' : ''}
                ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' : ''}
                ${isFuture ? 'bg-secondary text-muted-foreground opacity-40' : ''}
              `}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                <span className="relative z-10 text-xs">{dept.department?.code || (index + 1)}</span>
              </div>
              <div className="space-y-0.5">
                <h3 className={`font-black text-lg tracking-tight uppercase leading-none transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {dept.department_id === student.department_id ? student.discipline : (dept.department?.name || `Node ${index + 1}`)}
                </h3>
                <div className="flex items-center gap-3">
                   <Badge variant="outline" className={`rounded-md px-3 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] border-none shadow-soft ${isAcademic ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground opacity-60'}`}>
                      {isAcademic ? 'Academic Unit' : 'Administrative Unit'}
                   </Badge>
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-30 italic">Sequential Node {index + 1}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
               {isAcademic && !phase1Cleared && dept.status === 'pending' ? (
                  <StatusBadge status="hold" size="sm" />
               ) : (
                  <StatusBadge status={dept.status || 'pending'} size="sm" />
               )}
            </div>
          </div>
          
          {isAcademic && !phase1Cleared && dept.status === 'pending' && (
             <div className="mb-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4 animate-in fade-in duration-1000 group/alert">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0 group-hover/alert:scale-110 transition-transform">
                   <Info className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-600/60">Sequence Lock Active</p>
                   <p className="text-xs text-muted-foreground font-medium leading-relaxed italic max-w-xl">
                     Phase 2 verification will engage automatically upon validation of all administrative departments.
                   </p>
                </div>
             </div>
          )}

          {(!isAcademic || phase1Cleared || dept.status !== 'pending') && dept.department?.contact_info?.form_visible && (() => {
            // Support new multi-link array AND old single form_link for backward compat
            const formLinks: { label?: string; url: string }[] = (() => {
              const links = dept.department?.contact_info?.form_links;
              if (Array.isArray(links) && links.length > 0) return links.filter((l: any) => l.url);
              const legacy = dept.department?.contact_info?.form_link;
              if (legacy) return [{ label: 'Required Form', url: legacy }];
              return [];
            })();
            if (formLinks.length === 0) return null;
            return (
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-strong shrink-0">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary block">Pre-requisite Forms</span>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">Complete these forms before your request can be approved.</p>
                  </div>
                </div>
                {formLinks.map((fl, fi) => {
                  const itemLabel = `Form Submission: ${fl.label || `Form ${fi + 1}`}`;
                  const isSubmitted = (dept.checklist_items || []).some(
                    (item: any) => item.item === itemLabel && item.completed
                  );
                  const isSubmitting = submittingForms[`${dept.department_id}-${fl.label || `Form ${fi + 1}`}`];

                  return (
                    <div
                      key={fi}
                      className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group/form transition-all duration-500 hover:bg-primary/10 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -mr-16 skew-x-12 opacity-0 group-hover/form:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-sm shrink-0">
                          {fi + 1}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-sm font-black text-foreground uppercase tracking-tight block">
                            {fl.label || `Form ${fi + 1}`}
                          </span>
                          {isSubmitted && (
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                              <Check className="w-3 h-3" /> Submission Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 relative z-10 shrink-0">
                        <Button
                          className="rounded-xl bg-primary text-white hover:bg-primary/90 font-black text-[9px] uppercase tracking-[0.3em] px-6 h-12 shadow-strong group/cta relative overflow-hidden active:scale-95 transition-all"
                          onClick={() => window.open(fl.url, '_blank')}
                        >
                          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                          <span>Open Form</span>
                          <ArrowUpRight className="w-4 h-4 ml-2 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1 transition-transform" />
                        </Button>
                        
                        {!isSubmitted ? (
                          <Button
                            variant="outline"
                            className="rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white font-black text-[9px] uppercase tracking-[0.3em] px-6 h-12 shadow-soft active:scale-95 transition-all"
                            onClick={() => handleMarkCompleted(fl.label || `Form ${fi + 1}`)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <span>Mark Submitted</span>
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 px-6 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-black text-[9px] uppercase tracking-[0.3em]">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Remarks Section */}
          {dept.remarks && (
            <div className="mb-10 space-y-6">
               <div className="flex items-center gap-4 text-amber-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Feedback</span>
               </div>
               <div className="p-10 bg-secondary/50 rounded-[3rem] border border-foreground/5 relative group/remarks">
                  <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 rounded-full" />
                  <p className="text-lg font-medium leading-relaxed text-muted-foreground italic pl-6">
                    "{dept.remarks}"
                  </p>
               </div>
            </div>
          )}

          {/* Financial Architecture */}
          {dept.due_amount > 0 && (
            <div className="mb-8 p-8 bg-destructive/5 border border-destructive/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 group/finance">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive shadow-soft group-hover/finance:scale-110 transition-transform duration-700">
                     <Wallet className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-destructive/60">Financial Obligation</p>
                     <p className="text-3xl font-black text-destructive tracking-tighter uppercase leading-none">PKR {dept.due_amount?.toLocaleString()}</p>
                  </div>
               </div>
               <Button className="rounded-2xl h-14 px-10 bg-destructive text-white hover:bg-destructive/90 font-black text-[9px] uppercase tracking-[0.3em] shadow-strong active:scale-95 transition-all">
                  Pay Dues
                  <ArrowRight className="ml-4 w-4 h-4 group-hover/finance:translate-x-3 transition-transform" />
               </Button>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 border-t border-foreground/5">
             <div className="flex items-center gap-5 p-4 sm:p-6 bg-secondary/30 rounded-[2rem] border border-foreground/5 group/meta">
                <div className="p-3 bg-card rounded-xl text-primary shadow-soft group-hover/meta:rotate-12 transition-transform">
                   <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1 overflow-hidden">
                   <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Contact Officer</p>
                   <p className="text-[11px] font-bold text-foreground truncate">
                     {dept.department?.head?.email || dept.department?.contact_info?.email || dept.department?.email || 'N/A'}
                   </p>
                   {dept.department?.head && (
                     <p className="text-[9px] font-bold text-primary/60 truncate uppercase tracking-tighter">
                       {dept.department.head.first_name} {dept.department.head.last_name}
                     </p>
                   )}
                </div>
             </div>
             <div className="flex items-center gap-5 p-4 sm:p-6 bg-secondary/30 rounded-[2rem] border border-foreground/5 group/meta">
                <div className="p-3 bg-card rounded-xl text-primary shadow-soft group-hover/meta:scale-110 transition-transform">
                   <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1 overflow-hidden">
                   <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Phone Number</p>
                   <p className="text-[11px] font-bold text-foreground">{dept.department?.contact_info?.phone || dept.department?.phone || 'N/A'}</p>
                </div>
             </div>
             <div className="flex items-center gap-5 p-4 sm:p-6 bg-secondary/30 rounded-[2rem] border border-foreground/5 group/meta">
                <div className="p-3 bg-card rounded-xl text-primary shadow-soft group-hover/meta:-rotate-12 transition-transform">
                   <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1 overflow-hidden">
                   <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Campus Location</p>
                   <p className="text-[11px] font-bold text-foreground truncate">{dept.department?.location || 'General Campus'}</p>
                </div>
             </div>
          </div>

          {/* Verification Audit Trace */}
          {isCompleted && dept.cleared_at && (
            <div className="mt-10 flex items-center gap-4 p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 w-fit">
              <div className="p-2 bg-emerald-500 rounded-lg text-white">
                 <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-emerald-700 font-black uppercase tracking-[0.3em]">
                Authorized and Sealed: <span className="text-foreground ml-2">{new Date(dept.cleared_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
          )}

          {/* Operational Directives */}
          {!isFuture && (
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.3em] flex-1 h-16 shadow-strong shadow-emerald-500/20 transition-all active:scale-95 group/wa relative overflow-hidden"
                onClick={handleWhatsApp}
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/wa:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                <MessageCircle className="w-5 h-5 mr-4 group-hover/wa:rotate-12 transition-transform" />
                Secure WhatsApp Channel
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-foreground/5 bg-card hover:bg-secondary text-foreground font-black text-[10px] uppercase tracking-[0.3em] flex-1 h-16 shadow-soft transition-all active:scale-95 group/mail"
                onClick={handleEmail}
              >
                <Mail className="w-5 h-5 mr-4 group-hover/mail:-translate-y-2 transition-transform duration-500" />
                University Email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MyClearance = ({ filterType }: { filterType?: 'administrative' | 'academic' }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClearanceData = async () => {
    setRefreshing(true);
    try {
      const res = await studentService.getDashboard();
      if (res.success) setData(res.data);
    } catch {
      toast.error('Failed to load clearance data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => { fetchClearanceData(); }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-12 animate-in fade-in duration-1000">
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
           <div className="w-24 h-24 bg-card rounded-[2.5rem] border border-foreground/5 shadow-strong flex items-center justify-center relative z-10">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
           </div>
        </div>
        <div className="space-y-4 text-center">
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Syncing your status...</p>
           <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Verifying Information</p>
        </div>
      </div>
    );
  }

  const activeRequest = data?.activeRequest;
  const allDepartments: any[] = activeRequest?.clearance_status || [];
  const departments = allDepartments.filter(dept => {
    if (!filterType) return true;
    const isAcademic = dept.department?.type === 'academic';
    return filterType === 'academic' ? isAcademic : !isAcademic;
  });

  const progress = activeRequest?.progress || {};
  let activeIndex = -1;
  if (activeRequest && departments.length > 0) {
    activeIndex = departments.findIndex(d => d.status !== 'cleared');
  }

  const pageTitle = filterType === 'academic' ? 'Academic Clearance' : filterType === 'administrative' ? 'Administrative Clearance' : 'Overall Status';
  const pageDescription = filterType === 'academic' 
    ? 'Phase 2: Final approvals from academic departments and HOD.' 
    : filterType === 'administrative' 
    ? 'Phase 1: Initial approvals from administrative departments.'
    : 'Track your university clearance progress in real-time.';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/10 group-hover:scale-110 transition-transform duration-700" />
                   <Fingerprint className="w-7 h-7 relative z-10" />
                </div>
                <div className="space-y-0.5">
                   <div className="flex items-center gap-3">
                      <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.4em]">Audit</Badge>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Identity Verified</span>
                   </div>
                   <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter uppercase leading-none">{pageTitle}</h1>
                </div>
             </div>
             <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed italic">
               {pageDescription}
             </p>
          </div>
          
           <Button 
            variant="ghost" 
            onClick={fetchClearanceData}
            disabled={refreshing}
            className="w-full sm:w-auto rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:bg-card hover:text-primary hover:shadow-strong transition-all duration-700 bg-card/40 backdrop-blur-md shrink-0 border border-foreground/5 group/refresh"
          >
            <RefreshCcw className={`w-5 h-5 mr-3 group-hover/refresh:rotate-180 transition-transform duration-700 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Status
          </Button>
      </div>

      {activeRequest ? (
        <>
          {/* Progress Overview */}
          {(!filterType || filterType === 'administrative') && (
            <Card className="border-none shadow-strong rounded-3xl overflow-hidden bg-foreground text-background relative border border-white/5 group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse" />
              
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary)/1)] animate-ping" />
                      <span className="text-primary text-[9px] font-black uppercase tracking-[0.5em]">Live Status</span>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[8px] font-black text-background/30 uppercase tracking-[0.5em] mb-1">Overall progress</p>
                       <h3 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none flex items-baseline gap-3">
                        {progress.clearedDepartments || 0}<span className="text-base text-background/20 font-black uppercase tracking-widest">/ {progress.totalDepartments || allDepartments.length}</span>
                       </h3>
                      <div className="flex items-center gap-3 pt-1">
                         <Badge className="bg-primary text-white border-none rounded-md px-3 py-1 text-[8px] font-black uppercase tracking-widest shadow-strong shadow-primary/40">ID: {activeRequest.request_id}</Badge>
                         <div className="hidden sm:flex items-center gap-2 text-background/40 font-black text-[8px] uppercase tracking-widest italic">
                            <Database className="w-3 h-3" /> Sync Complete
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-1">
                    <div className="text-5xl sm:text-7xl font-black tracking-tighter leading-none text-primary group-hover:scale-110 transition-transform duration-1000 origin-bottom-right">
                       {progress.percentage || 0}<span className="text-2xl text-background/10 ml-1">%</span>
                    </div>
                    <div className="text-background/20 text-[8px] font-black uppercase tracking-[0.5em] italic mr-1">Progress Percentage</div>
                  </div>
                </div>

                <div className="mt-8 sm:mt-12 space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-background/30 font-black text-[9px] uppercase tracking-[0.4em]">
                         <Activity className="w-3 h-3" /> Start
                      </div>
                      <div className="flex items-center gap-2 text-background/30 font-black text-[9px] uppercase tracking-[0.4em]">
                         Finality <ChevronRight className="w-3 h-3" />
                      </div>
                   </div>
                   <div className="w-full h-4 bg-background/5 rounded-full p-1 overflow-hidden shadow-inner border border-white/5 relative">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-2000 ease-out relative group/shimmer overflow-hidden shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                      style={{ width: `${progress.percentage || 0}%` }}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Active Unit Focus Portal */}
          {activeIndex >= 0 && (
            <div className="flex items-center gap-6 px-6 sm:px-8 py-6 bg-primary/5 border border-primary/10 rounded-3xl shadow-strong animate-in slide-in-from-left-10 duration-1000 group">
              <div className="w-4 h-4 bg-primary rounded-full animate-ping flex-shrink-0" />
              <div className="space-y-0.5">
                 <p className="text-[8px] font-black text-primary uppercase tracking-[0.5em] mb-1">Current Department</p>
                 <p className="text-base sm:text-lg font-black uppercase tracking-tight text-foreground leading-none">
                    Currently At:{' '}
                    <span className="text-primary block sm:inline sm:ml-3 group-hover:tracking-wider transition-all duration-700">
                      {departments[activeIndex]?.department_id === data.student.department_id ? data.student.discipline : (departments[activeIndex]?.department?.name || 'Authorized Unit')}
                    </span>
                 </p>
              </div>
              <ArrowUpRight className="ml-auto w-8 h-8 text-primary opacity-20 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-700" />
            </div>
          )}

          {/* Clearance List */}
          <div className="relative pt-10 px-4 md:px-10">
            <div className="space-y-0">
              {departments.map((dept, index) => {
                const isCompleted = dept.status === 'cleared';
                const isActive = index === activeIndex;
                const isFuture = !isCompleted && !isActive;
                return (
                  <DepartmentCard
                    key={dept.id || index}
                    dept={dept}
                    index={index}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    isFuture={isFuture}
                    student={data.student}
                    allStatuses={allDepartments}
                    requestId={activeRequest.id}
                    onRefresh={fetchClearanceData}
                  />
                );
              })}
            </div>

            {/* Final Approval */}
            {filterType === 'academic' && (
              <div className="flex gap-6 group/terminal">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 transition-all duration-1000 shadow-strong
                    ${progress.percentage === 100
                      ? 'bg-primary border-primary scale-110 shadow-primary/40'
                      : 'bg-card border-dashed border-foreground/5 text-muted-foreground/10'
                    }
                  `}>
                    <Trophy className={`w-6 h-6 transition-all duration-1000 ${progress.percentage === 100 ? 'text-white scale-110' : 'text-muted-foreground/20'}`} />
                  </div>
                </div>
                <div className={`
                  flex-1 mb-6 rounded-2xl border-2 p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000 relative overflow-hidden
                  ${progress.percentage === 100
                    ? 'border-primary/20 bg-primary/5 shadow-strong'
                    : 'border-dashed border-foreground/5 bg-muted/5'
                  }
                `}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24 opacity-0 group-hover/terminal:opacity-100 transition-opacity" />
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${progress.percentage === 100 ? 'bg-primary animate-pulse shadow-primary/40' : 'bg-muted/20'}`} />
                       <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${progress.percentage === 100 ? 'text-primary' : 'text-muted-foreground/30'}`}>Final Clearance</span>
                    </div>
                    <div className="space-y-1">
                       <p className={`font-black text-2xl tracking-tight leading-none uppercase ${progress.percentage === 100 ? 'text-foreground' : 'text-muted-foreground/20'}`}>
                        {progress.percentage === 100 ? 'Clearance Complete' : 'Pending'}
                      </p>
                      <p className={`text-sm font-medium italic leading-relaxed max-w-xl ${progress.percentage === 100 ? 'text-muted-foreground' : 'text-muted-foreground/10'}`}>
                        {progress.percentage === 100
                          ? 'All departments have cleared your request.'
                          : 'Final clearance will be available once all departments have approved.'}
                      </p>
                    </div>
                  </div>
                  {progress.percentage === 100 && (
                     <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-strong shadow-primary/30 animate-bounce relative z-10">
                        <Sparkles className="w-6 h-6" />
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Workflow Initialization Architecture */
        <Card className="border-none shadow-strong rounded-3xl p-16 text-center bg-card/60 backdrop-blur-3xl relative overflow-hidden group border border-foreground/5">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-64 -mt-64" />
          
          <div className="relative z-10 space-y-10">
            <div className="w-24 h-24 bg-secondary/80 rounded-2xl flex items-center justify-center mx-auto transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110 shadow-inner group-hover:bg-primary group-hover:text-white group-hover:shadow-strong group-hover:shadow-primary/20">
              <FileText className="w-10 h-10 opacity-20 group-hover:opacity-100 transition-all duration-1000" />
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-2">
                  <Lock className="w-4 h-4" /> Authorized Session Ready
               </div>
               <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Sequence Inactive</h3>
               <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto leading-relaxed italic opacity-60">
                You haven't started your clearance process yet. Please start it from the dashboard.
              </p>
            </div>
            <div className="flex flex-col items-center gap-8">
               <Button className="rounded-2xl h-16 bg-foreground text-background hover:bg-foreground/90 font-black text-xs uppercase tracking-[0.4em] px-12 shadow-strong group/cta active:scale-95 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                  Initialize Workflow
                  <ArrowRight className="ml-4 w-6 h-6 group-hover/cta:translate-x-4 transition-transform duration-700" />
               </Button>
               <div className="flex items-center justify-center gap-4 text-muted-foreground/30 font-black text-[9px] uppercase tracking-[0.3em] pt-8 border-t border-foreground/5 w-full max-w-sm mx-auto">
                  <ShieldCheck className="w-4 h-4" />
                  Identity Cryptographically Verified
               </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export const AdminClearance = () => <MyClearance filterType="administrative" />;
export const AcademicClearance = () => <MyClearance filterType="academic" />;
