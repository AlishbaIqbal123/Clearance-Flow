// UI ONLY — NO LOGIC CHANGED
import { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, MoreHorizontal, 
  CheckCircle2, Clock, AlertCircle, FileStack, ArrowRight,
  LayoutGrid, List, User, Building, Calendar, 
  Sparkles,
  ChevronRight,
  FileSearch,
  History,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Activity,
  Layers,
  Zap,
  Globe,
  Database,
  Lock,
  UserCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { StatusBadge } from './StatusBadge';

export const ClearanceRequestList = ({ user }: { user: any }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const isAdmin = user.role === 'admin';
      const endpoint = isAdmin ? '/admin/clearance-requests' : '/departments/requests';
      
      const { data: res } = await api.get(endpoint);
      
      if (res.success) {
        const requestData = res.data.requests || res.data;
        setRequests(Array.isArray(requestData) ? requestData : []);
      }
    } catch (error: any) {
      console.error('Fetch requests error:', error.response?.data || error.message);
      toast.error('Failed to load clearance data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (req.request_id?.toLowerCase() || '').includes(searchLower) ||
      (req.student?.first_name?.toLowerCase() || '').includes(searchLower) ||
      (req.student?.last_name?.toLowerCase() || '').includes(searchLower) ||
      (req.student?.registration_number?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (requests.length === 0) {
      toast.error('No registry data available for export');
      return;
    }
    
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        import('@/lib/report.utils').then(module => {
          module.exportAdminReport({ recentRequests: requests });
          resolve(true);
        });
      }, 1000);
    });

    toast.promise(promise, {
      loading: 'Compiling encrypted registry archive...',
      success: 'Registry archive generated successfully!',
      error: 'Failed to generate archive'
    });
  };

  const handleDownloadSlip = (request: any) => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        import('@/lib/report.utils').then(module => {
          module.exportStudentReport(request);
          resolve(true);
        });
      }, 1000);
    });

    toast.promise(promise, {
      loading: 'Generating official clearance protocol...',
      success: 'Clearance slip downloaded successfully!',
      error: 'Failed to generate slip'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <History className="w-5 h-5 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">Master Audit Stream</Badge>
                 </div>
                  <h2 className="text-base font-black text-foreground tracking-tighter uppercase leading-none">Clearance Requests</h2>
              </div>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-muted/20 p-1.5 rounded-xl border border-foreground/5 backdrop-blur-md shadow-soft w-full lg:w-auto">
          <div className="flex items-center gap-1.5 px-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`w-9 h-9 rounded-lg transition-all duration-500 ${viewMode === 'table' ? 'bg-card shadow-strong text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`w-9 h-9 rounded-lg transition-all duration-500 ${viewMode === 'grid' ? 'bg-card shadow-strong text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <div className="w-px h-6 bg-foreground/10 mx-1" />
          <Button 
            className="rounded-lg bg-primary text-white hover:bg-primary/90 h-9 px-6 font-black text-[9px] uppercase tracking-widest shadow-strong shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all group shrink-0"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Archive Registry</span>
          </Button>
        </div>
      </div>

      {/* Verification Control Console */}
       <div className="flex flex-col lg:flex-row gap-4 p-3 bg-card/60 backdrop-blur-3xl rounded-xl border border-foreground/5 shadow-strong">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
          <Input 
            placeholder="Query Registry Sequence..." 
            className="pl-10 h-10 border-none bg-secondary/50 rounded-lg text-sm font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-lg h-10 w-full lg:w-[200px] border-none bg-secondary/50 font-black text-[9px] uppercase tracking-widest px-4 shadow-inner focus:ring-2 focus:ring-primary/10 transition-all">
            <div className="flex items-center gap-2">
               <Filter className="w-3.5 h-3.5 text-primary opacity-40" />
               <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-strong p-1 bg-background/95 backdrop-blur-2xl">
            <SelectItem value="all" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">All Requests</SelectItem>
            {['not_started', 'pending', 'submitted', 'in_progress', 'partially_cleared', 'cleared', 'rejected'].map(s => (
               <SelectItem key={s} value={s} className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">
                  {s.replace('_', ' ').toUpperCase()}
               </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'table' ? (
         <Card className="border-none shadow-strong rounded-xl overflow-hidden bg-card/60 backdrop-blur-3xl group">
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden">
              <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-none">
                  <TableHead className="px-6 py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Identity & Sequence</TableHead>
                  <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Student Profile</TableHead>
                  <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Protocol Status</TableHead>
                  <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Fulfillment</TableHead>
                  <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Node Authorization</TableHead>
                  <TableHead className="px-6 text-right text-[8px] font-black text-muted-foreground uppercase tracking-widest">Directives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <TableRow key={i} className="h-20 border-foreground/5 animate-pulse">
                      <TableCell colSpan={5} className="px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-lg" />
                          <div className="space-y-2">
                            <div className="w-32 h-2 bg-muted rounded-full" />
                            <div className="w-20 h-2 bg-muted rounded-full" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[300px] text-center px-6">
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 bg-muted/10 rounded-2xl flex items-center justify-center shadow-inner group/empty">
                           <FileSearch className="w-10 h-10 text-muted-foreground/10 group-hover:text-primary/20 transition-all duration-1000" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-lg font-black text-foreground uppercase tracking-tight">No Requests</p>
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Adjust filter to see protocols.</p>
                        </div>
                        <Button variant="outline" onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="rounded-lg font-black text-[9px] uppercase tracking-widest px-6 h-10 border-foreground/10 hover:border-primary/40 transition-all">Reset Filter</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer" onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-card shadow-soft border border-foreground/5 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 ${
                            req.status === 'cleared' ? 'text-emerald-500' : 'text-primary'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                               <p className="text-[8px] font-black text-primary uppercase tracking-widest">{req.request_type?.replace('_', ' ')}</p>
                               <span className="w-0.5 h-0.5 rounded-full bg-foreground/10" />
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors duration-500 uppercase">{req.request_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                            <UserCircle className="w-3.5 h-3.5 text-primary opacity-40" />
                            {req.student?.first_name} {req.student?.last_name}
                          </p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest pl-5.5 opacity-40">{req.student?.registration_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell>
                        {req.degree_fulfillment ? (
                          <div className="flex items-center gap-2">
                            <Badge className={`${req.degree_fulfillment.method === 'dispatch' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'} border-none font-black text-[7px] uppercase px-2 py-1 rounded-md`}>
                              {req.degree_fulfillment.method}
                            </Badge>
                            {req.degree_fulfillment.method === 'dispatch' && (
                              <span className="text-[7px] font-black text-muted-foreground uppercase truncate max-w-[100px]" title={req.degree_fulfillment.address}>
                                {req.degree_fulfillment.address?.substring(0, 15)}...
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest italic">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-3">
                          {(req.clearance_status || []).slice(0, 5).map((cs: any, idx: number) => (
                            <div 
                              key={cs.id} 
                              className={`w-8 h-8 rounded-lg border-[3px] border-card flex items-center justify-center text-[7px] font-black shadow-soft relative z-[${10-idx}] transition-transform hover:-translate-y-1 hover:z-[20] cursor-pointer ${
                                cs.status === 'cleared' ? 'bg-emerald-500 text-white' : 
                                cs.status === 'rejected' ? 'bg-destructive text-white' :
                                'bg-secondary text-muted-foreground'
                              }`}
                              title={`${cs.department?.name}: ${cs.status}`}
                            >
                              {cs.department?.code?.substring(0, 2)}
                            </div>
                          ))}
                          {(req.clearance_status || []).length > 5 && (
                            <div className="w-8 h-8 rounded-lg border-[3px] border-card bg-foreground text-background flex items-center justify-center text-[7px] font-black shadow-soft relative z-0">
                              +{(req.clearance_status || []).length - 5}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button 
                         variant="ghost" 
                         size="icon" 
                         className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-primary hover:text-white transition-all duration-500 active:scale-90 group/btn"
                        >
                           <ArrowUpRight className="w-4 h-4 group-hover:scale-110" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                 )}
              </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-card/40 rounded-2xl p-5 border border-foreground/5 h-40 animate-pulse" />
                ))
              ) : filteredRequests.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <FileSearch className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Empty Registry</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="bg-card/40 rounded-2xl p-5 border border-foreground/5 space-y-5 hover:border-primary/20 transition-all shadow-soft"
                    onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{req.request_id}</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="space-y-4 py-4 border-y border-foreground/5">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-4 h-4 text-primary opacity-40" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight leading-none">{req.student?.first_name} {req.student?.last_name}</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">{req.student?.registration_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(req.clearance_status || []).slice(0, 8).map((cs: any) => (
                          <div 
                            key={cs.id}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[6px] font-black ${
                              cs.status === 'cleared' ? 'bg-emerald-500/10 text-emerald-600' : 
                              cs.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                              'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {cs.department?.code?.substring(0, 2)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full h-11 rounded-xl bg-foreground text-white font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-strong"
                    >
                      Audit Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             Array(6).fill(0).map((_, i) => (
               <div key={i} className="h-64 bg-card/60 rounded-2xl animate-pulse"></div>
             ))
          ) : filteredRequests.map(req => (
            <Card key={req.id} className="border-none shadow-strong rounded-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden bg-card/60 backdrop-blur-3xl border border-foreground/5 cursor-pointer" onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}>
               <CardContent className="p-6 relative flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-[60px] group-hover:bg-primary/10 transition-colors duration-500" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-secondary/80 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  
                  <div className="space-y-1.5 mb-8">
                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">{req.request_id}</p>
                    <h3 className="text-lg font-black text-foreground leading-none tracking-tight uppercase group-hover:text-primary transition-colors">{req.student?.first_name} {req.student?.last_name}</h3>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{req.student?.registration_number}</p>
                  </div>

                  <div className="mt-auto space-y-6 pt-6 border-t border-foreground/5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Layers className="w-3 h-3 text-primary" /> Progress</span>
                         <span className="text-foreground">{(req.clearance_status || []).filter((cs: any) => cs.status === 'cleared').length} / {(req.clearance_status || []).length}</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                         <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${((req.clearance_status || []).filter((cs: any) => cs.status === 'cleared').length / ((req.clearance_status || []).length || 1)) * 100}%` }}
                         />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-muted-foreground font-black text-[8px] uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-lg border border-foreground/5">
                          <Calendar className="w-3 h-3 text-primary opacity-40" />
                          {new Date(req.created_at).toLocaleDateString()}
                       </div>
                       <Button variant="ghost" size="sm" className="rounded-lg font-black text-[8px] uppercase tracking-widest text-primary hover:bg-primary/10 px-4 h-8 transition-all group/cta">
                          Full Audit <ArrowRight className="ml-2 w-3 h-3 group-hover/cta:translate-x-1" />
                       </Button>
                    </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Premium Audit Master Console Dialog */}
       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[90vh] rounded-2xl p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500 overflow-y-auto custom-scrollbar">
          <div className="bg-card p-4 sm:p-6 text-foreground relative overflow-hidden border-b border-foreground/5">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary backdrop-blur-xl border border-white/5">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                       <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest">Protocol ID</Badge>
                       <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest mt-0.5">{selectedRequest?.request_type?.replace('_', ' ')}</p>
                    </div>
                 </div>
                 <DialogTitle className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none">{selectedRequest?.request_id}</DialogTitle>
              </div>
              <div className="text-left sm:text-right space-y-1">
                 <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Protocol Status</p>
                 {selectedRequest && <StatusBadge status={selectedRequest.status} size="lg" />}
              </div>
              <Button variant="ghost" size="icon" className="absolute top-0 right-0 -mt-2 -mr-2 text-muted-foreground/40 hover:text-foreground hover:bg-muted rounded-xl w-10 h-10 transition-all" onClick={() => setIsDetailsOpen(false)}>
                 <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 bg-card/40 backdrop-blur-3xl overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 p-3 sm:p-4 bg-secondary/50 rounded-xl border border-foreground/5 group hover:bg-secondary transition-all duration-500">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-primary/10 rounded-lg group-hover:rotate-6 transition-transform">
                      <UserCircle className="w-5 h-5 text-primary" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Identity Profile</p>
                   </div>
                </div>
                <div className="space-y-1.5 pl-3 border-l-2 border-primary/20">
                   <p className="text-lg font-black text-foreground leading-none tracking-tight uppercase">{selectedRequest?.student?.first_name} {selectedRequest?.student?.last_name}</p>
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{selectedRequest?.student?.registration_number}</p>
                   <div className="flex flex-wrap gap-2 pt-2">
                      <Badge className="bg-foreground text-background border-none rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest">{selectedRequest?.student?.program}</Badge>
                      <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border-foreground/10">{selectedRequest?.student?.batch}</Badge>
                   </div>
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-secondary/50 rounded-xl border border-foreground/5 group hover:bg-secondary transition-all">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-primary/10 rounded-lg group-hover:scale-105 transition-transform">
                      <Activity className="w-5 h-5 text-primary" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Audit Timeline</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-foreground/5 shadow-soft">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Initiated</span>
                      <span className="text-xs font-black uppercase">{selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-foreground/5 shadow-soft">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Updated</span>
                      <span className="text-xs font-black uppercase">{selectedRequest && new Date(selectedRequest.updated_at || selectedRequest.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                       <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                       <h4 className="text-base font-black text-foreground tracking-tight uppercase">Node Verifications</h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-xl border border-foreground/5">
                    <span className="text-sm font-black text-foreground tracking-tight">{selectedRequest?.clearance_status?.length || 0}</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nodes</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {(selectedRequest?.clearance_status || []).map((cs: any) => (
                  <div key={cs.id} className="group flex items-center justify-between p-4 bg-secondary/50 hover:bg-card transition-all duration-500 rounded-xl border border-foreground/5 hover:shadow-soft">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-card shadow-soft border border-foreground/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <span className="text-xs font-black uppercase tracking-tighter">{cs.department?.code}</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-foreground tracking-tight uppercase leading-none">{cs.department?.name}</p>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="rounded-lg text-[7px] font-black uppercase px-2 py-0.5 border-foreground/10 opacity-50">{cs.department?.type}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                       <div className="flex flex-col items-end gap-1 pr-4 border-r border-foreground/5 hidden sm:flex">
                          <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Fees</p>
                          <p className="text-xs font-black text-foreground uppercase leading-none">PKR {cs.due_amount || 0}</p>
                       </div>
                       <StatusBadge status={cs.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-card border-t border-foreground/5">
             <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="ghost" className="h-9 rounded-xl px-6 font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-secondary flex-1 transition-all" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  className="h-9 bg-primary text-white hover:bg-primary/90 rounded-xl px-6 font-black text-[9px] uppercase tracking-widest flex-[2] shadow-strong shadow-primary/20 group transition-all relative overflow-hidden"
                  onClick={() => selectedRequest && handleDownloadSlip(selectedRequest)}
                >
                  <span>Download Protocol Slip</span>
                  <ArrowUpRight className="ml-2 w-4 h-4 group-hover:scale-110" />
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
  </svg>
);
