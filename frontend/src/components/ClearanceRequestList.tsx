import { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, MoreHorizontal, 
  CheckCircle2, Clock, AlertCircle, FileStack, ArrowRight,
  LayoutGrid, List, User, Building, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/api';

export const ClearanceRequestList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/clearance-requests');
      if (res.data.success) {
        setRequests(res.data.data.requests || []);
      }
    } catch (error) {
      toast.error('Failed to load clearance requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      cleared: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-700 border-rose-200',
      partially_cleared: 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };

    const icons: Record<string, any> = {
      pending: Clock,
      submitted: FileText,
      in_progress: Clock,
      cleared: CheckCircle2,
      rejected: AlertCircle,
      partially_cleared: FileStack
    };

    const Icon = icons[status] || Clock;
    return (
      <Badge variant="outline" className={`rounded-xl px-3 py-1 font-bold border ${styles[status] || styles.pending} flex items-center gap-1.5`}>
        <Icon className="w-3.5 h-3.5" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(req => 
    req.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clearance Logs</h2>
          <p className="text-slate-500 font-medium italic">Audit-ready system request history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            onClick={() => setViewMode('table')}
          >
            <List className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm font-bold ml-2">
            <Download className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by Request ID, Student Name or Reg #..." 
            className="pl-10 h-10 tracking-tight font-medium bg-white/50 backdrop-blur-sm border-slate-200 rounded-xl focus:bg-white transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-xl h-10 border-slate-200 bg-white">
          <Filter className="w-4 h-4 mr-2 " />
          Advanced Filters
        </Button>
      </div>

      {viewMode === 'table' ? (
        <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Request Details</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Student Information</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Overall Status</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Departments</TableHead>
                  <TableHead className="px-8 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse h-24">
                      <TableCell colSpan={5} className="bg-slate-50/20"></TableCell>
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                          <FileStack className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Audit logs are empty</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                            req.status === 'cleared' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-tighter mb-1">{req.request_type}</p>
                            <p className="font-black text-slate-900 tracking-tight leading-none mb-1.5">{req.request_id}</p>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 opacity-50">
                                <Calendar className="w-3 h-3" />
                                <span className="text-[10px] font-bold">Requested: {new Date(req.created_at).toLocaleDateString()}</span>
                              </div>
                              {req.status === 'cleared' && req.completed_at && (
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span className="text-[10px] font-black uppercase tracking-tighter">Cleared: {new Date(req.completed_at).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {req.student?.first_name} {req.student?.last_name}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{req.student?.registration_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(req.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {(req.clearance_status || []).slice(0, 5).map((cs: any, idx: number) => (
                            <div 
                              key={cs.id} 
                              className={`w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center text-[9px] font-black shadow-sm ring-1 ring-slate-100 ${
                                cs.status === 'cleared' ? 'bg-emerald-500 text-white' : 
                                cs.status === 'rejected' ? 'bg-rose-500 text-white' :
                                'bg-slate-100 text-slate-500'
                              }`}
                              title={`${cs.department?.name}: ${cs.status}`}
                            >
                              {cs.department?.code?.substring(0, 2)}
                            </div>
                          ))}
                          {(req.clearance_status || []).length > 5 && (
                            <div className="w-8 h-8 rounded-lg border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 ring-1 ring-slate-100">
                              +{(req.clearance_status || []).length - 5}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <Button variant="ghost" size="icon" className="group-hover:bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                           <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             Array(6).fill(0).map((_, i) => (
               <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
             ))
          ) : filteredRequests.map(req => (
            <Card key={req.id} className="border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] hover:ring-2 ring-blue-500/20 transition-all group overflow-hidden bg-white">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:rotate-12 shadow-inner">
                      <FileText className="w-7 h-7" />
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{req.request_id}</p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{req.student?.first_name} {req.student?.last_name}</h3>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                       <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Dept. Coverage</span>
                       <span className="text-slate-900">{(req.clearance_status || []).filter((cs: any) => cs.status === 'cleared').length} / {(req.clearance_status || []).length}</span>
                    </div>
                    {req.status === 'cleared' && req.completed_at && (
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-emerald-600 bg-emerald-50/50 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Data Cleared</span>
                        <span>{new Date(req.completed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                        style={{ width: `${((req.clearance_status || []).filter((cs: any) => cs.status === 'cleared').length / ((req.clearance_status || []).length || 1)) * 100}%` }}
                       ></div>
                    </div>
                  </div>

                  <Button className="w-full mt-8 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl h-12 font-bold transition-all group-hover:shadow-lg shadow-blue-200">
                    Detailed Audit
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
