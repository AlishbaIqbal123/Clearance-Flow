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
    toast.info('Generating encrypted registry archive...');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-6">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-primary/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/10 group-hover:scale-110 transition-transform duration-700" />
                 <History className="w-7 h-7 sm:w-9 sm:h-9 relative z-10" />
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em]">Master Audit Stream</Badge>
                    <span className="hidden sm:inline text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Live Sync</span>
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Clearance Requests</h2>
              </div>
           </div>
           <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed italic">
             Review and manage university clearance requests and departmental approvals.
           </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-2 sm:p-3 rounded-[2rem] sm:rounded-[2.5rem] border border-foreground/5 backdrop-blur-md shadow-soft w-full lg:w-auto">
          <div className="flex items-center gap-2 px-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl transition-all duration-500 ${viewMode === 'table' ? 'bg-card shadow-strong text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl transition-all duration-500 ${viewMode === 'grid' ? 'bg-card shadow-strong text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
          <div className="w-px h-10 bg-foreground/10 mx-1 sm:mx-2" />
          <Button 
            className="flex-1 lg:flex-none rounded-[1.5rem] sm:rounded-[1.75rem] bg-foreground text-background hover:bg-foreground/90 h-14 sm:h-16 px-6 sm:px-10 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] shadow-strong flex items-center gap-4 active:scale-95 transition-all group overflow-hidden relative"
            onClick={handleExport}
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
            <Download className="w-4 h-4 sm:w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span>Archive Registry</span>
          </Button>
        </div>
      </div>

      {/* Verification Control Console */}
       <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 p-4 sm:p-6 bg-card/60 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] border border-foreground/5 shadow-strong">
        <div className="relative group flex-1">
          <Search className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
          <Input 
            placeholder="Query Registry Sequence..." 
            className="pl-14 sm:pl-18 h-16 sm:h-20 border-none bg-secondary/50 rounded-[1.5rem] sm:rounded-[2rem] text-lg sm:text-xl font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-[1.5rem] sm:rounded-[2rem] h-16 sm:h-20 w-full lg:w-[320px] border-none bg-secondary/50 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.3em] px-8 sm:px-10 shadow-inner focus:ring-4 focus:ring-primary/10 transition-all">
            <div className="flex items-center gap-4">
               <Filter className="w-4 h-4 sm:w-5 h-5 text-primary opacity-40" />
               <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-[2.5rem] border-none shadow-strong p-4 bg-background/95 backdrop-blur-2xl">
            <SelectItem value="all" className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest focus:bg-primary focus:text-white px-6">All Requests</SelectItem>
            {['pending', 'submitted', 'in_progress', 'cleared', 'rejected'].map(s => (
               <SelectItem key={s} value={s} className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest focus:bg-primary focus:text-white px-6">
                  {s.replace('_', ' ').toUpperCase()}
               </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'table' ? (
         <Card className="border-none shadow-strong rounded-[2rem] sm:rounded-[4rem] overflow-hidden bg-card/60 backdrop-blur-3xl group">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
              <TableHeader className="bg-muted/10">
                <TableRow className="border-none">
                  <TableHead className="px-12 py-10 font-black text-muted-foreground uppercase text-[10px] tracking-[0.4em]">Identity & Sequence</TableHead>
                  <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.4em]">Student Profile</TableHead>
                  <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.4em]">Protocol Status</TableHead>
                  <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.4em]">Node Authorization</TableHead>
                  <TableHead className="px-12 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Directives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <TableRow key={i} className="h-32 border-foreground/5">
                      <TableCell colSpan={5} className="px-12">
                        <div className="flex items-center gap-8 animate-pulse">
                          <div className="w-16 h-16 bg-muted rounded-[1.5rem]" />
                          <div className="space-y-3">
                            <div className="w-48 h-4 bg-muted rounded-full" />
                            <div className="w-32 h-3 bg-muted rounded-full" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[500px] text-center px-12">
                      <div className="flex flex-col items-center justify-center gap-10">
                        <div className="w-36 h-36 bg-muted/10 rounded-[4rem] flex items-center justify-center shadow-inner group/empty relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/empty:opacity-100 transition-opacity" />
                           <FileSearch className="w-16 h-16 text-muted-foreground/10 group-hover:text-primary/20 transition-all duration-1000" />
                        </div>
                        <div className="space-y-3">
                           <p className="text-3xl font-black text-foreground uppercase tracking-tight leading-none">Sequence Null</p>
                           <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">No protocols matched the current authorization filter.</p>
                        </div>
                        <Button variant="outline" onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] px-12 h-16 border-foreground/10 hover:border-primary/40 hover:text-primary transition-all active:scale-95">Reset Protocol Filter</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer" onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}>
                      <TableCell className="px-12 py-10">
                        <div className="flex items-center gap-8">
                          <div className={`w-18 h-18 rounded-[1.75rem] bg-card shadow-soft border border-foreground/5 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${
                            req.status === 'cleared' ? 'text-emerald-500' : 'text-primary'
                          }`}>
                            <FileText className="w-9 h-9" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{req.request_type?.replace('_', ' ')}</p>
                               <span className="w-1 h-1 rounded-full bg-foreground/10" />
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors duration-500 uppercase">{req.request_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <p className="text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
                            <UserCircle className="w-5 h-5 text-primary opacity-40" />
                            {req.student?.first_name} {req.student?.last_name}
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-8 opacity-40">{req.student?.registration_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-4">
                          {(req.clearance_status || []).slice(0, 5).map((cs: any, idx: number) => (
                            <div 
                              key={cs.id} 
                              className={`w-12 h-12 rounded-[1.25rem] border-[6px] border-card flex items-center justify-center text-[9px] font-black shadow-strong relative z-[${10-idx}] transition-transform hover:-translate-y-2 hover:z-[20] cursor-pointer ${
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
                            <div className="w-12 h-12 rounded-[1.25rem] border-[6px] border-card bg-foreground text-background flex items-center justify-center text-[9px] font-black shadow-strong relative z-0">
                              +{(req.clearance_status || []).length - 5}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-12 text-right">
                        <Button 
                         variant="ghost" 
                         size="icon" 
                         className="w-14 h-14 rounded-[1.5rem] bg-secondary/50 hover:bg-primary hover:text-white transition-all duration-700 active:scale-90 group/btn"
                        >
                           <ArrowUpRight className="w-7 h-7 group-hover:scale-125 transition-transform" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                 )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
             Array(6).fill(0).map((_, i) => (
               <div key={i} className="h-96 bg-card/60 rounded-[4rem] animate-pulse"></div>
             ))
          ) : filteredRequests.map(req => (
            <Card key={req.id} className="border-none shadow-strong rounded-[4rem] hover:-translate-y-4 transition-all duration-700 group overflow-hidden bg-card/60 backdrop-blur-3xl border border-foreground/5 cursor-pointer" onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}>
               <CardContent className="p-12 relative flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-primary/10 transition-colors duration-700" />
                  
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-18 h-18 bg-secondary/80 rounded-[1.75rem] flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:rotate-12 shadow-inner">
                      <FileText className="w-9 h-9" />
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  
                  <div className="space-y-4 mb-12">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{req.request_id}</p>
                    <h3 className="text-3xl font-black text-foreground leading-none tracking-tighter uppercase">{req.student?.first_name} {req.student?.last_name}</h3>
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">{req.student?.registration_number}</p>
                  </div>

                  <div className="mt-auto space-y-8 pt-10 border-t border-foreground/5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                         <span className="flex items-center gap-3"><Layers className="w-4 h-4 text-primary" /> Verification Depth</span>
                         <span className="text-foreground text-base">{(req.clearance_status || []).filter((cs: any) => cs.status === 'cleared').length} / {(req.clearance_status || []).length}</span>
                      </div>
                      
                      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden p-0.5">
                         <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                          style={{ width: `${((req.clearance_status || []).filter((cs: any) => cs.status === 'cleared').length / ((req.clearance_status || []).length || 1)) * 100}%` }}
                         >
                            <div className="absolute inset-0 bg-white/20 shimmer" />
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3 text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em] bg-secondary/50 px-5 py-2.5 rounded-2xl border border-foreground/5">
                          <Calendar className="w-4 h-4 text-primary opacity-40" />
                          {new Date(req.created_at).toLocaleDateString()}
                       </div>
                       <Button variant="ghost" size="sm" className="rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] text-primary hover:bg-primary/10 px-6 h-12 transition-all group/cta">
                          Full Audit <ArrowRight className="ml-3 w-4 h-4 group-hover/cta:translate-x-2 transition-transform" />
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
        <DialogContent className="sm:max-w-[750px] w-[95vw] max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-y-auto overflow-x-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500 custom-scrollbar">
          <div className="bg-foreground p-6 sm:p-10 text-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-[60px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/20 rounded-[1.75rem] flex items-center justify-center text-primary backdrop-blur-xl border border-white/5">
                       <ShieldCheck className="w-9 h-9" />
                    </div>
                    <div className="space-y-1">
                       <Badge className="bg-primary text-white border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.4em]">Request Type</Badge>
                       <p className="text-[10px] font-black text-background/30 uppercase tracking-[0.5em]">{selectedRequest?.request_type?.replace('_', ' ')}</p>
                    </div>
                 </div>
                 <DialogTitle className="text-3xl lg:text-4xl font-black tracking-tighter uppercase leading-none">{selectedRequest?.request_id}</DialogTitle>
              </div>
              <div className="text-left sm:text-right space-y-2 sm:space-y-4">
                 <p className="text-[9px] sm:text-[11px] font-black text-background/30 uppercase tracking-[0.5em]">Overall Status</p>
                 {selectedRequest && <StatusBadge status={selectedRequest.status} size="lg" />}
              </div>
              <Button variant="ghost" size="icon" className="absolute top-0 right-0 -mt-4 sm:-mt-8 -mr-4 sm:-mr-8 text-background/40 hover:text-background hover:bg-white/5 rounded-2xl sm:rounded-3xl w-12 h-12 sm:w-16 sm:h-16 transition-all" onClick={() => setIsDetailsOpen(false)}>
                 <X className="w-6 h-6 sm:w-9 sm:h-9" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 sm:p-10 space-y-8 sm:space-y-12 bg-card/40 backdrop-blur-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6 p-5 sm:p-8 bg-secondary/50 rounded-[2rem] sm:rounded-[2.5rem] border border-foreground/5 group hover:bg-secondary transition-all duration-700">
                <div className="flex items-center gap-4 sm:gap-5">
                   <div className="p-3 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl group-hover:rotate-12 transition-transform duration-700">
                      <UserCircle className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] sm:text-[11px] font-black uppercase text-muted-foreground tracking-[0.4em]">Primary Identity</p>
                      <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Verified Student Record</p>
                   </div>
                </div>
                <div className="space-y-3 sm:space-y-4 pl-4 border-l-4 border-primary/20">
                   <p className="text-xl sm:text-2xl font-black text-foreground leading-none tracking-tight uppercase">{selectedRequest?.student?.first_name} {selectedRequest?.student?.last_name}</p>
                   <p className="text-[10px] sm:text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">{selectedRequest?.student?.registration_number}</p>
                   <div className="flex flex-wrap gap-2 sm:gap-4 pt-2 sm:pt-4">
                      <Badge className="bg-foreground text-background border-none rounded-lg sm:rounded-xl px-3 sm:px-5 py-1 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{selectedRequest?.student?.program}</Badge>
                      <Badge variant="outline" className="rounded-lg sm:rounded-xl px-3 sm:px-5 py-1 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border-foreground/10">{selectedRequest?.student?.batch}</Badge>
                   </div>
                </div>
              </div>
              
              <div className="space-y-6 p-8 bg-secondary/50 rounded-[2.5rem] border border-foreground/5 group hover:bg-secondary transition-all duration-700">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-700">
                      <Activity className="w-7 h-7 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.4em]">Request Timeline</p>
                      <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Progress History</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-card rounded-2xl border border-foreground/5 shadow-soft">
                      <div className="flex items-center gap-4">
                         <Zap className="w-5 h-5 text-amber-500" />
                         <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Initialization</span>
                      </div>
                      <span className="text-sm font-black uppercase">{selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center justify-between p-6 bg-card rounded-2xl border border-foreground/5 shadow-soft">
                      <div className="flex items-center gap-4">
                         <RefreshCw className="w-5 h-5 text-blue-500" />
                         <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Last Auth Cycle</span>
                      </div>
                      <span className="text-sm font-black uppercase">{selectedRequest && new Date(selectedRequest.updated_at || selectedRequest.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-10 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-primary/10 rounded-[1.75rem]">
                       <Layers className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-xl font-black text-foreground tracking-tight uppercase">Department Verifications</h4>
                       <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">Distributed authorization matrix.</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-secondary/80 px-8 py-4 rounded-[1.5rem] border border-foreground/5">
                    <Database className="w-5 h-5 text-primary opacity-40" />
                    <span className="text-xl font-black text-foreground tracking-tight">{selectedRequest?.clearance_status?.length || 0}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Nodes</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 max-h-[450px] overflow-y-auto pr-6 custom-scrollbar">
                {(selectedRequest?.clearance_status || []).map((cs: any) => (
                  <div key={cs.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 bg-secondary/50 hover:bg-card transition-all duration-700 rounded-[2rem] border border-foreground/5 hover:shadow-strong relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -mr-16 skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-18 h-18 rounded-[1.75rem] bg-card shadow-soft border border-foreground/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                        <span className="text-sm font-black uppercase tracking-tighter">{cs.department?.code}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-black text-foreground tracking-tight uppercase leading-none">{cs.department?.name}</p>
                        <div className="flex items-center gap-3">
                           <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase px-3 py-1 border-foreground/10 opacity-50 group-hover:opacity-100 transition-opacity">{cs.department?.type}</Badge>
                           {cs.remarks && (
                             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground italic truncate max-w-[200px]">
                                <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
                                "{cs.remarks}"
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 relative z-10 mt-6 sm:mt-0">
                       <div className="flex flex-col items-end gap-2 pr-6 border-r border-foreground/5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Financial Auth</p>
                          <p className="text-lg font-black text-foreground tracking-tight uppercase leading-none">PKR {cs.due_amount || 0}</p>
                       </div>
                       <StatusBadge status={cs.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-8">
               <div className="flex flex-col sm:flex-row gap-6">
                  <Button variant="ghost" className="h-16 rounded-[1.75rem] px-8 font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:bg-secondary/80 flex-1 border border-foreground/5 transition-all active:scale-95" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button className="h-16 bg-primary text-white hover:bg-primary/90 rounded-[1.75rem] px-8 font-black text-[10px] uppercase tracking-[0.4em] flex-[2] shadow-strong shadow-primary/20 group active:scale-95 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                    <span>Download Clearance Slip</span>
                    <ArrowUpRight className="ml-5 w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                  </Button>
               </div>
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
