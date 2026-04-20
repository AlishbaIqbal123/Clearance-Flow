import { useState, useEffect } from 'react';
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
  Mail
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

const StatCardShort = ({ title, value, icon: Icon, color, onClick }: { title: string; value: any; icon: any; color: string; onClick?: () => void }) => (
  <Card 
    className={`border-none shadow-xl shadow-slate-200/30 rounded-3xl bg-white overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-2xl hover:bg-slate-50 hover:-translate-y-1' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.replace('bg-', '')} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
          </div>
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />}
      </div>
    </CardContent>
  </Card>
);

export const DepartmentDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
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
      toast.error('Failed to load department dashboard');
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
        toast.success(`Request marked as ${status}`);
        setShowActionDialog(false);
        fetchDashboard();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || { pending: 0, inReview: 0, cleared: 0, total: 0 };
  const recentRequests = data?.recentRequests || [];
  const department = data?.department || {};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-white shadow-xl shadow-slate-200 rounded-[1.5rem] flex items-center justify-center border border-slate-50">
              <span className="text-2xl font-black text-blue-600">{department.code}</span>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{department.name}</h2>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                Official Clearance Portal <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl border-slate-200 h-12 px-6 font-bold text-slate-600 hover:bg-slate-50"
            onClick={() => onNavigate('requests')}
          >
             <History className="w-5 h-5 mr-2" />
             History
          </Button>
          <Button 
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 font-bold shadow-xl shadow-blue-100"
            onClick={() => toast.info('Batch approval successfully enabled for current view.')}
          >
             <Filter className="w-5 h-5 mr-2" />
             Batch Mode
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardShort title="Pending" value={stats.pending} icon={Clock} color="bg-amber-600" onClick={() => setStatusFilter('pending')} />
        <StatCardShort title="In Review" value={stats.inReview} icon={Search} color="bg-blue-600" onClick={() => setStatusFilter('in_review')} />
        <StatCardShort title="Cleared" value={stats.cleared} icon={CheckCircle2} color="bg-emerald-600" onClick={() => setStatusFilter('cleared')} />
        <StatCardShort title="Total Requests" value={stats.total} icon={FileText} color="bg-slate-600" onClick={() => onNavigate('requests')} />
      </div>

      {/* Main Content: Tasks List */}
      <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase">Incoming Requests</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">Review student applications and update their clearance status.</CardDescription>
             </div>
             <div className="flex flex-row gap-3">
                <div className="relative w-full md:w-64 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                   <Input 
                    placeholder="Search Registration #..." 
                    className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="h-12 w-40 rounded-2xl border-slate-200 bg-white font-bold text-slate-600">
                      <SelectValue placeholder="Status" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl p-2 border-slate-100">
                      <SelectItem value="all" className="rounded-xl font-medium">All Status</SelectItem>
                      <SelectItem value="pending" className="rounded-xl font-medium">Pending</SelectItem>
                      <SelectItem value="in_review" className="rounded-xl font-medium">In Review</SelectItem>
                      <SelectItem value="cleared" className="rounded-xl font-medium">Cleared</SelectItem>
                      <SelectItem value="rejected" className="rounded-xl font-medium">Rejected</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
               <TableRow className="border-none">
                 <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</TableHead>
                 <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campus / Program</TableHead>
                 <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                 <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested At</TableHead>
                 <TableHead className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {(Array.isArray(recentRequests) ? recentRequests : []).map((request: any) => {
                 const currentDeptStatus = (request.clearance_status || []).find((ds: any) => ds.department_id === department.id);
                 return (
                  <TableRow key={request.id} className="group hover:bg-slate-50/30 transition-colors border-slate-50">
                    <TableCell className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                             {request.student?.first_name?.[0]}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 tracking-tight">{request.student?.first_name} {request.student?.last_name}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.student?.registration_number}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-700">{request.student?.program}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.student?.department?.code}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                        <StatusBadge status={currentDeptStatus?.status || 'pending'} />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                           <Clock className="w-3.5 h-3.5" />
                           <span className="text-xs">{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                    </TableCell>
                    <TableCell className="px-10 py-6 text-right">
                       <Button 
                        className="rounded-xl h-10 px-6 font-bold bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-all"
                        onClick={() => {
                          setSelectedRequest(request);
                          setRemarks(currentDeptStatus?.remarks || '');
                          setDueAmount(currentDeptStatus?.due_amount || 0);
                          setShowActionDialog(true);
                        }}
                       >
                         Manage <ChevronRight className="w-4 h-4 ml-1" />
                       </Button>
                    </TableCell>
                  </TableRow>
                 );
               })}

               {recentRequests.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="h-64 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No Pending Clearances Found</p>
                   </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
          {selectedRequest && (
            <>
              <div className="p-8 bg-slate-900 text-white relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                 <h3 className="text-2xl font-black tracking-tight">{selectedRequest.student.first_name}'s Clearance</h3>
                 <p className="text-blue-200 mt-1 font-medium text-sm">Reg #: {selectedRequest.student.registration_number}</p>
                 <div className="flex gap-4 mt-6">
                    <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                       <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Program</p>
                       <p className="text-xs font-bold whitespace-nowrap">{selectedRequest.student.program}</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                       <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Department</p>
                       <p className="text-xs font-bold text-center">CS</p>
                    </div>
                 </div>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Update Remarks / Instructions</label>
                  <Textarea 
                    placeholder="Enter notes or rejection reasons here..." 
                    className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-medium"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">These remarks will be visible to the student.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Outstanding Dues</label>
                        <p className="text-[10px] text-slate-400 font-medium italic">Leave 0 if no outstanding dues</p>
                     </div>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rs.</span>
                        <Input 
                          type="number" 
                          className="w-32 pl-10 h-10 rounded-xl bg-slate-50 border-slate-100 font-black text-right pr-4"
                          value={dueAmount}
                          onChange={(e) => setDueAmount(Number(e.target.value))}
                        />
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-4">
                  <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group transition-all"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={submittingAction}
                  >
                    <X className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    Reject Clearance
                  </Button>
                  <Button 
                    className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group shadow-xl shadow-emerald-50 transition-all"
                    onClick={() => handleUpdateStatus('cleared')}
                    disabled={submittingAction}
                  >
                    <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    Approve Clearance
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full h-11 rounded-2xl font-bold bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => handleUpdateStatus('in_review')}
                  disabled={submittingAction}
                >
                  Mark as In-Review
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
