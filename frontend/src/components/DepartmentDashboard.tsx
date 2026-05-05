// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  MessageSquare,
  History,
  Info,
  ChevronRight,
  TrendingUp,
  Loader2,
  Phone,
  Mail,
  Zap,
  ShieldCheck,
  LayoutGrid,
  FileCheck,
  Building2,
  CalendarDays,
  ArrowUpRight,
  Database,
  ArrowRight,
  Activity,
  Layers,
  Lock,
  User,
  ExternalLink,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { departmentService } from '@/lib/department.service';
import { StatusBadge } from './StatusBadge';

const StatCard = ({ title, value, icon: Icon, color, onClick, description }: { title: string; value: any; icon: any; color: string; onClick?: () => void; description?: string }) => (
  <button 
    className={`
      flex flex-col justify-between p-8 rounded-3xl bg-card/40 backdrop-blur-3xl border border-foreground/5 shadow-soft overflow-hidden group relative transition-all duration-700 text-left
      ${onClick ? 'cursor-pointer hover:shadow-strong hover:bg-card hover:-translate-y-1' : ''}
    `}
    onClick={onClick}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${color} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity blur-3xl`} />
    <div className="flex items-center justify-between relative z-10 w-full mb-6">
      <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-soft shadow-inner`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {onClick && <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />}
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-50">{title}</p>
      <h3 className="text-2xl font-black text-foreground mt-2 tracking-tighter uppercase leading-none">{value}</h3>
      <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-3">{description || 'Total Count'}</p>
    </div>
  </button>
);

export const DepartmentDashboard = ({ onNavigate, user }: { onNavigate: (tab: string) => void; user: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [dueAmount, setDueAmount] = useState(0);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    
    setSubmittingAction(true);
    try {
      const res = await departmentService.updateRequestStatus(selectedRequest.id, {
        status,
        remarks,
        dueAmount
      });
      if (res.success) {
        toast.success(`Request marked as ${status.toUpperCase()}`);
        setShowActionDialog(false);
        fetchDashboard();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-8">
        <div className="relative group">
           <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-2xl animate-spin transition-all duration-700" />
           <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-foreground animate-pulse">Loading Department Dashboard</p>
           <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Fetching latest clearance data...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { pending: 0, inReview: 0, cleared: 0, total: 0 };
  const recentRequests = data?.recentRequests || [];
  const department = data?.department || user?.department || {};
  const currentDeptId = department.id || user?.department_id;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Department Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden p-6 sm:p-10 lg:p-12 rounded-[3rem] bg-foreground group">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full -mr-[15%] -mt-[5%] blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10 flex-1">
           <div className="w-20 h-20 bg-card shadow-strong rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden shrink-0">
              <span className="text-3xl lg:text-4xl font-black text-primary relative z-10 tracking-tighter">{department.code || '??'}</span>
           </div>
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <Badge className="bg-primary/20 text-primary border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">Active Dashboard</Badge>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-background tracking-tighter leading-none uppercase">{department.name || 'Department'}</h2>
              <p className="text-base text-background/40 font-medium leading-relaxed max-w-lg italic">
                Manage clearance requests and verify student records.
              </p>
           </div>
        </div>
        
         <div className="flex flex-wrap items-center gap-4 relative z-10 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            className="flex-1 sm:flex-none rounded-xl h-14 px-6 font-black text-[9px] uppercase tracking-widest text-background/60 hover:text-background hover:bg-white/5 transition-all duration-700 border border-white/5 active:scale-95 backdrop-blur-sm"
            onClick={() => onNavigate('requests')}
          >
             <History className="w-4 h-4 mr-3 opacity-50" />
             View Requests
          </Button>
          <Button 
            className="flex-1 sm:flex-none rounded-xl bg-primary text-white hover:bg-primary/90 h-14 px-8 font-black text-[10px] uppercase tracking-widest shadow-strong shadow-primary/30 flex items-center gap-4 active:scale-95 transition-all group/btn overflow-hidden relative"
            onClick={() => toast.info('Batch approval started.')}
          >
             <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-700" />
             <span>Approve All</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-amber-500" description="Awaiting Review" onClick={() => setStatusFilter('pending')} />
        <StatCard title="In Review" value={stats.inReview} icon={FileText} color="bg-blue-600" description="Under Investigation" onClick={() => setStatusFilter('in_review')} />
        <StatCard title="Cleared" value={stats.cleared} icon={ShieldCheck} color="bg-emerald-600" description="Approved" onClick={() => setStatusFilter('cleared')} />
        <StatCard title="Total" value={stats.total} icon={Activity} color="bg-primary" description="All Requests" onClick={() => onNavigate('requests')} />
      </div>

      <Card className="border-none shadow-strong rounded-3xl bg-card/60 backdrop-blur-3xl overflow-hidden group">
        <CardHeader className="p-6 sm:p-8 pb-6 border-b border-foreground/5 relative overflow-hidden">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                 <div className="flex items-center gap-3 text-primary">
                    <Layers className="w-6 h-6" />
                    <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none">Student Requests</CardTitle>
                 </div>
                 <CardDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60 italic">Manage student clearance requests.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                    <Input 
                     placeholder="Search Registration #..." 
                     className="pl-12 h-12 w-full sm:w-[250px] border-none bg-secondary/50 rounded-xl text-sm font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 w-full sm:w-44 rounded-xl border-none bg-secondary/50 font-black text-[9px] uppercase tracking-widest px-6 shadow-inner focus:ring-2 focus:ring-primary/20">
                       <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl">
                       <SelectItem value="all" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">All Statuses</SelectItem>
                       <SelectItem value="pending" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Pending</SelectItem>
                       <SelectItem value="in_review" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">In Review</SelectItem>
                       <SelectItem value="cleared" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Cleared</SelectItem>
                       <SelectItem value="rejected" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Rejected</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/10">
               <TableRow className="border-none">
                 <TableHead className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student</TableHead>
                 <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Academic Info</TableHead>
                 <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</TableHead>
                 <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Date</TableHead>
                 <TableHead className="px-8 py-5 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest">Action</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>                {(Array.isArray(recentRequests) ? recentRequests : [])
                  .filter((request: any) => {
                    const searchLower = searchQuery.toLowerCase();
                    const matchesSearch = 
                      (request.student?.registration_number?.toLowerCase() || '').includes(searchLower) ||
                      (request.student?.first_name?.toLowerCase() || '').includes(searchLower) ||
                      (request.student?.last_name?.toLowerCase() || '').includes(searchLower);

                    const currentDeptStatus = (request.clearance_status || []).find((ds: any) => 
                      ds.department_id === currentDeptId || ds.department?.id === currentDeptId
                    );
                    const matchesStatus = statusFilter === 'all' || (currentDeptStatus?.status || 'pending') === statusFilter;

                    return matchesSearch && matchesStatus;
                  })
                  .map((request: any) => {
                    const currentDeptStatus = (request.clearance_status || []).find((ds: any) => 
                      ds.department_id === currentDeptId || ds.department?.id === currentDeptId
                    );
                    
                    return (
                      <TableRow key={request.id} className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer" onClick={() => {
                        setSelectedRequest(request);
                        setRemarks(currentDeptStatus?.remarks || '');
                        setDueAmount(currentDeptStatus?.due_amount || 0);
                        setShowActionDialog(true);
                      }}>
                        <TableCell className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-card shadow-soft border border-foreground/5 flex items-center justify-center font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all duration-700 relative overflow-hidden">
                                 <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                 <span className="relative z-10">{request.student?.first_name?.[0]}</span>
                              </div>
                              <div className="space-y-0.5">
                                 <h4 className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{request.student?.first_name} {request.student?.last_name}</h4>
                                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">{request.student?.registration_number}</p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1">
                              <p className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                                 <GraduationCap className="w-4 h-4 text-primary opacity-40" />
                                 {request.student?.program || 'N/A'}
                              </p>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest pl-6 opacity-40">{request.student?.department?.code || 'DEPT'}</p>
                           </div>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={currentDeptStatus?.status || 'pending'} />
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3 text-muted-foreground font-black text-[9px] uppercase tracking-widest bg-secondary/50 w-fit px-4 py-2 rounded-xl border border-foreground/5 group-hover:border-primary/20 transition-all">
                               <CalendarDays className="w-4 h-4 text-primary opacity-40" />
                               <span>{new Date(request.created_at).toLocaleDateString()}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-right">
                           <Button 
                            className="rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-widest bg-secondary/80 text-foreground hover:bg-primary hover:text-white transition-all duration-700 active:scale-95 border border-foreground/5 hover:border-transparent"
                           >
                             <span>Manage</span>
                             <ArrowUpRight className="w-4 h-4 ml-3" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    );
                 })}
              

               {recentRequests.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="h-[300px] text-center px-8">
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="w-24 h-24 bg-muted/10 rounded-3xl flex items-center justify-center shadow-inner group/empty relative overflow-hidden">
                           <Activity className="w-10 h-10 text-muted-foreground/10" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-xl font-black text-foreground uppercase tracking-tight leading-none">List Empty</p>
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">No clearance requests found.</p>
                        </div>
                        <Button 
                         variant="outline" 
                         className="rounded-xl font-black text-[9px] uppercase tracking-widest px-8 h-12 border-foreground/10 hover:border-primary/40 hover:text-primary transition-all active:scale-95" 
                         onClick={() => fetchDashboard()}
                        >
                          Refresh
                        </Button>
                      </div>
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
           </Table>
          </div>
        </CardContent>
      </Card>

      {/* Request Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500">
          {selectedRequest && (
            <>
              <div className="bg-foreground p-6 sm:p-10 text-background relative">
                 <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
                 
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-primary/20 text-primary border-none rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest backdrop-blur-xl">Request Review</Badge>
                          <span className="text-[9px] font-black text-background/30 uppercase tracking-widest">ID: {selectedRequest.id.substring(0, 8)}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="text-background/40 hover:text-background hover:bg-white/5 rounded-xl w-10 h-10 transition-all" onClick={() => setShowActionDialog(false)}>
                          <X className="w-5 h-5" />
                       </Button>
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">{selectedRequest.student.first_name} {selectedRequest.student.last_name}</h3>
                       <div className="flex items-center gap-3 text-background/40">
                          <p className="font-black text-[10px] uppercase tracking-widest">Reg #: {selectedRequest.student.registration_number}</p>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                       <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-2xl flex flex-col items-start gap-1 min-w-[150px]">
                          <p className="text-[8px] font-black text-background/30 uppercase tracking-widest leading-none mb-1">Program</p>
                          <p className="text-base font-black tracking-tight">{selectedRequest.student.program}</p>
                       </div>
                       <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-2xl flex flex-col items-center justify-center gap-1 min-w-[100px]">
                          <p className="text-[8px] font-black text-background/30 uppercase tracking-widest leading-none mb-1">Dept</p>
                          <p className="text-base font-black text-primary uppercase tracking-tighter">{department.code || 'SYS'}</p>
                       </div>
                    </div>
                 </div>
               </div>
              <div className="p-6 sm:p-8 space-y-6 bg-background">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-5">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                           <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Remarks & Notes</label>
                           <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">Stored in official records.</p>
                        </div>
                     </div>
                     <Badge variant="outline" className="rounded-lg border-destructive/20 text-destructive text-[8px] font-black uppercase px-3 py-1 bg-destructive/5">Required for Denials</Badge>
                  </div>
                  <Textarea 
                    placeholder="Enter remarks or reasons for decision..." 
                    className="min-h-[100px] rounded-xl border-none bg-secondary/50 p-6 text-sm font-medium placeholder:text-muted-foreground/20 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner leading-relaxed resize-none"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-6 bg-secondary/80 rounded-[2rem] border border-foreground/5 shadow-inner group/dues transition-all duration-700 hover:bg-secondary">
                     <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary/10 rounded-2xl group-hover/dues:rotate-12 transition-transform duration-700">
                              <TrendingUp className="w-5 h-5 text-primary" />
                           </div>
                           <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Due Amount</label>
                        </div>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest pl-7 opacity-50">Pending fees for clearance.</p>
                     </div>
                     <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-primary text-sm uppercase tracking-[0.4em] opacity-40">PKR</span>
                        <Input 
                          type="number" 
                          className="w-40 pl-16 h-12 rounded-xl bg-card border-none font-black text-xl text-right pr-6 shadow-soft focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                          value={dueAmount}
                          onChange={(e) => setDueAmount(Number(e.target.value))}
                        />
                     </div>
                  </div>
                </div>

                   <div className="grid grid-cols-2 gap-4 pt-4">
                     <Button 
                       variant="outline" 
                       className="h-20 rounded-2xl border-destructive/10 text-destructive hover:bg-destructive hover:text-white font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-2 group transition-all duration-700 relative overflow-hidden"
                       onClick={() => handleUpdateStatus('rejected')}
                       disabled={submittingAction}
                     >
                       <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform duration-700" />
                       <span>Reject Request</span>
                     </Button>
                     <Button 
                       className="h-20 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-2 group shadow-strong transition-all duration-700 relative overflow-hidden"
                       onClick={() => handleUpdateStatus('cleared')}
                       disabled={submittingAction}
                     >
                       <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform duration-700" />
                       <span>Approve Clearance</span>
                     </Button>
                   </div>
                   
                   <Button 
                     variant="ghost" 
                     className="w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-widest bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-700 border border-foreground/5 mt-4"
                     onClick={() => handleUpdateStatus('in_review')}
                     disabled={submittingAction}
                   >
                     Mark Under Review
                   </Button>
                </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
