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

export const StudentDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState('graduation');
  const [reason, setReason] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [degreePref, setDegreePref] = useState<{ method: 'dispatch' | 'manual' | '', address: string }>({ method: '', address: '' });
  const [prefSubmitting, setPrefSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to synchronize terminal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSubmitRequest = async () => {
    if (!reason) {
      toast.error('Reason for clearance protocol initiation is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await studentService.submitRequest({ requestType, reason });
      if (res.success) {
        if (selectedFiles.length > 0) {
          const formData = new FormData();
          selectedFiles.forEach(file => formData.append('files', file));
          await studentService.uploadDocuments(res.data.request.id, formData);
        }
        
        toast.success('Clearance protocol successfully initiated across all nodes');
        setReason('');
        setSelectedFiles([]);
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
        toast.success('Fulfillment strategy recorded');
        fetchDashboard();
      }
    } catch (error) {
      toast.error('Sync failed with fulfillment server');
    } finally {
      setPrefSubmitting(false);
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
      {/* Premium Hero Section - Bento Hero */}
      <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-5 sm:p-8 lg:p-10 shadow-strong group">
        {/* Dynamic Effects */}
        <div className="absolute top-0 right-0 w-[45%] h-full bg-primary/20 rounded-full -mr-[20%] -mt-[10%] blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-[25%] h-[60%] bg-primary/10 rounded-full -ml-[12%] -mb-[12%] blur-[80px]" />
        
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-background tracking-tighter leading-none uppercase">
                Welcome back,<br /><span className="text-primary italic">{student.first_name || 'Scholar'}</span>
              </h2>
            </div>
            
            <p className="text-sm text-background/50 font-medium leading-relaxed max-w-xl opacity-80 italic">
              Easily manage and track your university clearance status in one place.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { label: 'Program', value: student.program, icon: GraduationCap },
                { label: 'ID', value: student.registration_number, icon: Shield },
                { label: 'Batch', value: student.batch, icon: History }
              ].map((tag, i) => (
                <div key={i} className="flex items-center gap-3 bg-background/5 backdrop-blur-2xl border border-background/10 px-4 py-2 rounded-xl hover:bg-background/10 transition-colors">
                  <tag.icon className="w-3.5 h-3.5 text-primary" />
                  <div className="flex flex-col">
                     <span className="text-[7px] font-black text-background/30 uppercase tracking-widest leading-none mb-1">{tag.label}</span>
                     <span className="text-[10px] font-black text-background uppercase tracking-tight">{tag.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {canSubmitNewRequest && (
            <Dialog>
              <DialogTrigger asChild>
                 <Button className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 h-12 px-8 rounded-xl font-black text-[9px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 group shrink-0 active:scale-95 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span>Start Clearance</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-strong bg-background">
                <div className="bg-primary p-10 text-white relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-[100px]" />
                  <div className="space-y-3 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                       <Zap className="w-7 h-7 text-white" />
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none">New Clearance Request</DialogTitle>
                    <DialogDescription className="text-white/60 font-bold uppercase tracking-widest text-[10px] mt-2">
                       Start your clearance process across all departments.
                    </DialogDescription>
                  </div>
                </div>
                <div className="p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Clearance Type</label>
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger className="h-14 border-none rounded-2xl bg-secondary/50 font-black text-foreground px-6 focus:ring-2 focus:ring-primary/20 text-xs uppercase tracking-widest">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[2rem] border-none shadow-strong p-3">
                        {[
                          { val: 'graduation', label: 'Academic Graduation Clearance' },
                          { val: 'withdrawal', label: 'University Withdrawal' },
                          { val: 'transfer', label: 'Campus Transfer' },
                          { val: 'semester_end', label: 'Semester End Clearance' }
                        ].map(opt => (
                          <SelectItem key={opt.val} value={opt.val} className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest focus:bg-primary focus:text-white px-6">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Reason for Request</label>
                    <Textarea 
                      placeholder="Enter reason for starting clearance..." 
                      className="min-h-[160px] rounded-[2rem] border-none bg-secondary/50 font-bold text-foreground px-8 py-6 focus-visible:ring-2 focus-visible:ring-primary/20 resize-none text-base"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Supporting Artifacts</label>
                    <div className="flex flex-col gap-6">
                      <input 
                        type="file" 
                        id="file-upload" 
                        multiple 
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedFiles(prev => [...prev, ...files]);
                        }}
                      />
                      <Button 
                        variant="ghost" 
                        className="w-full border-2 border-dashed border-foreground/10 rounded-[2.5rem] h-36 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 transition-all group shadow-inner"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                          <FileText className="w-7 h-7 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Drop PDF/JPG Artifacts</span>
                      </Button>
                      
                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {selectedFiles.map((file, idx) => (
                            <Badge key={idx} className="pl-6 pr-3 py-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 flex items-center gap-4 font-black text-[10px] uppercase tracking-widest">
                              <span className="max-w-[180px] truncate">{file.name}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-7 h-7 rounded-xl hover:bg-destructive hover:text-white transition-all active:scale-90"
                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-amber-500/5 rounded-[2rem] flex gap-5 items-start border border-amber-500/10">
                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                      <Info className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase tracking-tight">
                      Note: This action will notify all departments. Please make sure your information is correct before starting.
                    </p>
                  </div>
                </div>
                <DialogFooter className="p-6 sm:p-12 pt-0 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <Button variant="ghost" className="h-16 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest text-muted-foreground px-10 hover:bg-secondary w-full sm:w-auto" onClick={() => {}}>Abort</Button>
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 active:scale-95 transition-all"
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing Request...' : 'Start Clearance'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Degree Fulfillment Section - Appears at 100% Clearance */}
      {activeRequest?.progress?.percentage === 100 && !activeRequest.degree_fulfillment && (
        <div className="animate-in zoom-in-95 slide-in-from-top-12 duration-1000 ease-out">
          <Card className="border-none shadow-strong rounded-[2.5rem] bg-foreground text-background overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full -mr-[15%] -mt-[10%] blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-[80px]" />
            
            <div className="flex flex-col lg:flex-row items-center gap-10 p-8 sm:p-12 relative z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl shadow-soft shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse" />
              </div>
              
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="space-y-1">
                  <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-lg mb-2">Final Fulfillment</Badge>
                  <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Your Degree is Ready</h3>
                </div>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest max-w-xl">
                  Congratulations! All clearance protocols have been satisfied. Select your preferred method of degree collection.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-16 sm:h-20 px-10 rounded-[1.75rem] bg-white text-foreground hover:bg-white/90 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 group/btn min-w-[240px]">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="block">Dispatch Degree</span>
                        <span className="block text-[7px] opacity-40 mt-0.5">Secure Home Delivery</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background">
                    <div className="bg-foreground p-10 text-white relative">
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
                  variant="outline" 
                  className="h-16 sm:h-20 px-10 rounded-[1.75rem] border-2 border-white/20 text-white hover:bg-white hover:text-foreground font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-4 min-w-[240px]"
                  disabled={prefSubmitting}
                  onClick={() => handleUpdatePreference('manual')}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block">Manual Pickup</span>
                    <span className="block text-[7px] opacity-40 mt-0.5">Collect from Registrar</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <BentoStatCard 
          title="Overall Status" 
          value={student.clearance_status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'} 
          icon={ShieldCheck} 
          color="bg-primary" 
          description="Your current clearance state"
          onClick={() => onNavigate('my-clearance')}
        />
        <BentoStatCard 
          title="Cleared Departments" 
          value={activeRequest?.progress?.clearedDepartments || 0} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          description={`${activeRequest?.progress?.clearedDepartments || 0}/${activeRequest?.progress?.totalDepartments || 0} Departments Cleared`}
          onClick={() => onNavigate('my-clearance')}
        />
        <BentoStatCard 
          title="Total Departments" 
          value={activeRequest?.progress?.totalDepartments || (data?.departments?.length || 0)} 
          icon={LayoutDashboard} 
          color="bg-slate-900 dark:bg-slate-200" 
          description="Departments involved in clearance"
          onClick={() => onNavigate('my-clearance')}
        />
        <BentoStatCard 
          title="Previous Requests" 
          value={data?.clearanceHistory?.length || 0} 
          icon={History} 
          color="bg-indigo-600" 
          description="View your clearance history"
          onClick={() => onNavigate('my-clearance')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Clearance Status - Main Bento Piece */}
        <div className="lg:col-span-2 space-y-10">
          {activeRequest ? (
            <Card className="border-none shadow-strong rounded-3xl overflow-hidden bg-card/60 backdrop-blur-2xl">
              <CardHeader className="p-5 sm:p-8 pb-5">
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
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--primary),0.4)] relative"
                    style={{ width: `${activeRequest.progress?.percentage || 0}%` }}
                   >
                     <div className="absolute inset-0 bg-white/20 shimmer" />
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] sm:h-[600px] px-6 sm:px-10 pb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {(Array.isArray(activeRequest.clearance_status) 
                      ? [...activeRequest.clearance_status].sort((a, b) => {
                          const priority: any = { 'cleared': 1, 'rejected': 2, 'in_review': 3, 'pending': 4 };
                          return priority[a.status] - priority[b.status];
                        })
                      : []
                    ).map((ds: any) => {
                      const isAcademic = ds.department?.type === 'academic';
                      const phase1Cleared = activeRequest.clearance_status.every((s: any) => 
                        s.department?.type === 'academic' || s.status === 'cleared'
                      );
                      const isLocked = isAcademic && !phase1Cleared && ds.status === 'pending';

                      return (
                        <div key={ds.id} className={`group relative p-5 rounded-2xl border-2 transition-all duration-700 flex flex-col min-h-[180px] ${isLocked ? 'bg-muted/5 border-muted/50 grayscale opacity-40' : 'bg-background/40 border-foreground/5 hover:bg-background hover:shadow-strong hover:border-primary/20'}`}>
                          <div className="flex items-start justify-between mb-5">
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
                                {isLocked ? (
                                   <StatusBadge status="locked" size="sm" />
                                ) : (
                                   <StatusBadge status={ds.status} size="sm" />
                                 )}
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
                                <div className={`p-5 rounded-[1.75rem] border-none mb-6 ${ds.status === 'rejected' ? 'bg-destructive/5' : 'bg-secondary/30'}`}>
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
                              
                              <div className="mt-auto flex items-center justify-between pt-6 border-t border-foreground/5">
                                 <div className="flex gap-3">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="w-10 h-10 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-90"
                                      onClick={() => {
                                         const wa = ds.department?.contact_info?.whatsapp_number;
                                         if (wa) window.open(`https://wa.me/${wa.replace(/\D/g, '')}`, '_blank');
                                         else toast.error('WhatsApp not available');
                                      }}
                                    >
                                      <Phone className="w-4.5 h-4.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="w-10 h-10 rounded-2xl text-primary hover:bg-primary/10 transition-all active:scale-90"
                                      onClick={() => {
                                         const em = ds.department?.contact_info?.email || ds.department?.email;
                                         if (em) window.location.href = `mailto:${em}`;
                                         else toast.error('Email endpoint not configured');
                                      }}
                                    >
                                      <Mail className="w-4.5 h-4.5" />
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
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
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
                    className="mt-10 bg-primary text-white rounded-2xl px-12 h-16 font-black uppercase tracking-[0.4em] text-[10px] shadow-strong shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                    onClick={() => {
                       (document.querySelector('button.shrink-0') as HTMLButtonElement)?.click();
                    }}
                  >
                    Start Clearance
                  </Button>
                )}
              </Card>

              {/* Department Directory Bento Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-6">
                   <div className="flex items-center gap-5">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
                      <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">Departments</h4>
                   </div>
                   <Badge variant="outline" className="rounded-full border-foreground/10 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 opacity-60">{data?.departments?.length || 0} Units Detected</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   {(data?.departments || []).map((dept: any) => (
                       <div key={dept.id} className="p-8 rounded-[3rem] bg-card/40 backdrop-blur-md border border-foreground/5 hover:bg-card hover:shadow-strong transition-all duration-700 flex items-center gap-6 group">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xs font-black transition-all duration-700 group-hover:rotate-12 ${dept.type === 'academic' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white'} shadow-soft`}>
                             {dept.code}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                             <h5 className="text-base font-black text-foreground leading-none truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                               {getDeptDisplayName(dept.id, dept.name)}
                             </h5>
                             <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
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
        <div className="space-y-12">
          {/* Terminal Support Card */}
          <Card className="border-none shadow-strong rounded-[2rem] bg-foreground overflow-hidden group">
            <CardContent className="p-6 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full -mr-32 -mt-32 blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
              <div className="space-y-5 relative z-10">
                <div className="w-12 h-12 bg-background/5 rounded-xl flex items-center justify-center border border-background/10 backdrop-blur-md">
                   <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-background text-xl font-black tracking-tighter uppercase leading-none">Support</CardTitle>
                  <CardDescription className="text-background/40 font-bold uppercase tracking-[0.2em] text-[9px] leading-relaxed italic">
                    Need help? Contact the IT help desk for any technical issues.
                  </CardDescription>
                 </div>
                 <div className="space-y-3 pt-2">
                   <Button 
                    className="w-full bg-background text-foreground border-none hover:bg-background/90 rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.3em] shadow-strong transition-all active:scale-95"
                    onClick={() => window.open('mailto:it.support@comsats.edu.pk')}
                   >
                      <Mail className="w-4 h-4 mr-3" />
                      Contact Desk
                   </Button>
                   <Button 
                    variant="ghost" 
                    className="w-full text-background/40 hover:text-background hover:bg-background/5 rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] transition-all"
                    onClick={() => toast.info('Loading Instructions...')}
                   >
                      <ExternalLink className="w-4 h-4 mr-3" />
                      View Instructions
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact Bento List */}
          <Card className="border-none shadow-strong rounded-[2rem] bg-card/60 backdrop-blur-2xl border border-foreground/5 overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                <CardTitle className="text-base font-black text-foreground tracking-tighter uppercase">Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {(data?.departments || []).slice(0, 5).map((dept: any) => (
                <div key={dept.id} className="flex items-center justify-between group cursor-pointer hover:bg-background/50 p-2.5 -mx-2.5 rounded-xl transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-[8px] font-black text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-soft">
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
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-[8px] font-black uppercase tracking-[0.4em] text-primary mt-4 hover:no-underline group hover:opacity-70 transition-all" onClick={() => onNavigate('my-clearance')}>
                 View All <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
