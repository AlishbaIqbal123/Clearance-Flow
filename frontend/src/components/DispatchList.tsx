import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  User, 
  Search, 
  Download,
  Calendar,
  ChevronRight,
  ExternalLink,
  Loader2,
  PackageCheck,
  Package,
  CheckCircle2,
  AlertCircle,
  Eye,
  BellRing,
  Send,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/lib/admin.service';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';


export const DispatchList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editForm, setEditForm] = useState({
    method: 'manual',
    address: '',
    tracking_number: '',
    courier_service: ''
  });


  const fetchDispatchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDispatchRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error) {
      toast.error('Failed to load dispatch logistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatchRequests();
  }, []);

  const handleUpdateDispatch = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      const res = await adminService.updateDispatchRequest(selectedRequest.id, editForm);
      if (res.success) {
        toast.success('Dispatch details updated successfully');
        setIsEditOpen(false);
        fetchDispatchRequests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update dispatch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotify = async (type: 'ready_for_pickup' | 'dispatched', requestOverride?: any) => {
    const target = requestOverride || selectedRequest;
    if (!target) return;
    
    try {
      const res = await adminService.notifyDispatchRequest(target.id, { type });
      if (res.success) {
        toast.success(`Student notified: ${type === 'dispatched' ? 'Degree Dispatched' : 'Ready for Pickup'}`);
        setIsViewOpen(false);
        fetchDispatchRequests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    }
  };

  const handleCompleteDispatch = async (req: any) => {
    if (!req.degree_fulfillment) {
      toast.error('Student has not selected a fulfillment method yet');
      return;
    }

    const action = req.degree_fulfillment.method === 'manual' ? 'pickup' : 'dispatch';
    if (!window.confirm(`Are you sure you want to confirm the ${action} for ${req.student?.first_name}?`)) {
      return;
    }

    try {
      const res = await adminService.completeDispatch(req.id);
      if (res.success) {
        toast.success(`Degree ${action} confirmed successfully`);
        fetchDispatchRequests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete dispatch');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.degree_fulfillment?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = req.status === 'fully_cleared' || req.status === 'completed' ? 'done' : (!req.degree_fulfillment ? 'pending' : 'ready');
    return matchesSearch && status === statusFilter;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Mapping Shipping Logistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-10 rounded-[2.5rem] bg-foreground text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full -mr-[15%] -mt-[10%] blur-[120px]" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-700">
              <Award className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1 rounded-full shadow-lg">Official Portal</Badge>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">
                Degree <span className="text-primary italic">Allotment & Logistics</span>
              </h2>
            </div>
          </div>
          <p className="text-sm text-white/40 font-medium max-w-xl leading-relaxed italic uppercase tracking-widest text-[10px]">
            Formal management for student fulfillment preferences and institutional logistics notifications.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
            {['all', 'pending', 'ready', 'done'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${
                  statusFilter === status 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative group/search">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/search:text-primary transition-colors" />
            <Input 
              placeholder="Search logistics..." 
              className="h-16 w-[280px] pl-16 rounded-2xl border-none bg-white/10 text-white font-bold placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-primary/40 backdrop-blur-md shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-strong rounded-[2.5rem] bg-white/40 backdrop-blur-3xl overflow-hidden">
        <div className="p-10 border-b border-foreground/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase leading-none">Pending Shipments</h2>
          </div>
          <Badge className="bg-secondary text-foreground border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-lg">{filteredRequests.length} Packages Detected</Badge>
        </div>
        
        {/* Desktop View */}
        <div className="hidden lg:block overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-[28%]">Student Identity</TableHead>
                <TableHead className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-[12%] text-center">Method</TableHead>
                <TableHead className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-[25%]">Mailing/Pickup Detail</TableHead>
                <TableHead className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-[15%]">Status Alert</TableHead>
                <TableHead className="py-6 px-10 text-right text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-[20%]">Control Gateway</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} className="group border-b border-foreground/5 hover:bg-white/50 transition-colors">
                    <TableCell className="py-8 px-10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-sm shadow-soft group-hover:scale-110 transition-transform">
                          {req.student?.first_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-base tracking-tight uppercase leading-none">
                            {req.student?.first_name} {req.student?.last_name}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                            {req.student?.registration_number}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {req.degree_fulfillment?.method === 'dispatch' ? (
                          <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1">Dispatch</Badge>
                        ) : req.degree_fulfillment?.method === 'manual' ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1">Manual</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-30">TBD</Badge>
                        )}
                        
                        {req.status === 'fully_cleared' || req.status === 'completed' ? (
                          <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase">
                            <PackageCheck className="w-3 h-3" />
                            Done
                          </div>
                        ) : req.degree_fulfillment ? (
                          <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase">
                            <AlertCircle className="w-3 h-3" />
                            Wait
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className={`font-bold text-[11px] leading-tight uppercase italic ${!req.degree_fulfillment ? 'text-muted-foreground opacity-50' : 'text-foreground/80'}`}>
                          {!req.degree_fulfillment 
                            ? 'Awaiting Selection' 
                            : req.degree_fulfillment.method === 'manual' 
                              ? 'Registrar Office' 
                              : (req.degree_fulfillment.address || 'Missing Address')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      {req.degree_fulfillment?.notification_sent ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-primary font-black text-[8px] uppercase tracking-widest">
                            <BellRing className="w-2.5 h-2.5" />
                            Notified
                          </div>
                          <p className="text-[7px] font-bold text-muted-foreground uppercase opacity-60">
                            {req.degree_fulfillment.notification_type === 'dispatched' ? 'Dispatch' : 'Pickup'} Alert
                          </p>
                        </div>
                      ) : (
                        <div className="text-[7px] font-black uppercase tracking-widest opacity-20 border border-dashed border-foreground/20 rounded px-2 py-1 w-fit">No Alert</div>
                      )}
                    </TableCell>
                    <TableCell className="py-8 px-10 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-soft"
                          title="View Details"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-all shadow-soft"
                          title={req.degree_fulfillment?.method === 'dispatch' ? "Notify: Degree Dispatched" : "Notify: Ready for Pickup"}
                          onClick={() => {
                            if (!req.degree_fulfillment?.method) {
                                setSelectedRequest(req);
                                setIsViewOpen(true);
                                return;
                            }
                            handleNotify(req.degree_fulfillment.method === 'dispatch' ? 'dispatched' : 'ready_for_pickup', req);
                          }}
                        >
                          <BellRing className={`w-5 h-5 ${req.degree_fulfillment?.notification_sent ? 'text-amber-500' : ''}`} />
                        </Button>
                        <Button 
                          className={`h-12 w-12 rounded-xl transition-all shadow-soft group/action ${
                            req.status === 'fully_cleared' || req.status === 'completed' 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-foreground text-white hover:bg-primary'
                          }`}
                          title="Complete Protocol"
                          onClick={() => handleCompleteDispatch(req)}
                          disabled={!req.degree_fulfillment || req.status === 'fully_cleared' || req.status === 'completed'}
                        >
                          <PackageCheck className="w-5 h-5 group-hover/action:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <Truck className="w-16 h-16" />
                      <p className="text-xl font-black uppercase tracking-[0.4em]">No pending dispatches detected</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div 
                key={req.id} 
                className="bg-card/50 rounded-[2rem] p-6 border border-foreground/5 space-y-6 hover:border-primary/20 transition-all shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-sm">
                      {req.student?.first_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-foreground text-sm uppercase tracking-tight">{req.student?.first_name} {req.student?.last_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{req.student?.registration_number}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 py-4 border-y border-foreground/5">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">Mailing Address</p>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold uppercase italic leading-relaxed">
                        {!req.degree_fulfillment 
                          ? 'Awaiting Selection' 
                          : req.degree_fulfillment.method === 'manual' 
                            ? 'Manual Pickup' 
                            : (req.degree_fulfillment.address || 'N/A')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">Status</p>
                      {req.status === 'completed' ? (
                        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] uppercase px-3 py-1.5 rounded-full">Complete</Badge>
                      ) : !req.degree_fulfillment ? (
                        <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[8px] uppercase px-3 py-1.5 rounded-full">Pending</Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase px-3 py-1.5 rounded-full">Ready</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">Date</p>
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        {req.degree_fulfillment?.selected_at 
                          ? new Date(req.degree_fulfillment.selected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    className="flex-1 h-12 rounded-2xl bg-foreground text-white hover:bg-primary transition-all font-black text-[10px] uppercase tracking-widest"
                    onClick={() => handleCompleteDispatch(req)}
                    disabled={!req.degree_fulfillment}
                  >
                    Complete Fulfillment
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl bg-secondary/50 text-foreground"
                    onClick={() => {
                      setSelectedRequest(req);
                      setIsViewOpen(true);
                    }}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center opacity-20">
              <Truck className="w-16 h-16 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-[0.4em]">Empty Queue</p>
            </div>
          )}
        </div>
      </Card>

      {/* Manage Details Dialog (CRUD) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background">
          <div className="bg-foreground p-8 text-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary backdrop-blur-xl border border-white/5">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <Badge className="bg-primary text-white border-none rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-[0.4em] mb-2">Manage Logistics</Badge>
                <DialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">Edit Fulfillment Data</DialogTitle>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8 bg-card/40 backdrop-blur-3xl">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-4">Collection Method</label>
                  <select 
                    className="w-full h-14 bg-secondary/50 border-none rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                    value={editForm.method}
                    onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                  >
                    <option value="manual">Manual Pickup</option>
                    <option value="dispatch">Home Dispatch</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-4">Courier Service</label>
                  <Input 
                    className="h-14 bg-secondary/50 border-none rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-primary/20 uppercase"
                    placeholder="e.g. TCS, Leopard, FedEx"
                    value={editForm.courier_service}
                    onChange={(e) => setEditForm({ ...editForm, courier_service: e.target.value })}
                    disabled={editForm.method === 'manual'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-4">Dispatch Address</label>
                <textarea 
                  className="w-full min-h-[100px] bg-secondary/50 border-none rounded-[2rem] p-6 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase resize-none"
                  placeholder="Enter full mailing address..."
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  disabled={editForm.method === 'manual'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-4">Tracking Number</label>
                <div className="relative">
                  <Input 
                    className="h-14 bg-secondary/50 border-none rounded-2xl pl-14 font-bold text-sm focus:ring-2 focus:ring-primary/20 uppercase tracking-[0.2em]"
                    placeholder="TRK-XXXX-XXXX"
                    value={editForm.tracking_number}
                    onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                    disabled={editForm.method === 'manual'}
                  />
                  <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-secondary/80" 
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="h-14 flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-strong shadow-primary/20"
                onClick={handleUpdateDispatch}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] h-[85vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background flex flex-col">
          <div className="bg-foreground p-8 text-background relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary backdrop-blur-xl border border-white/5">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <Badge className="bg-primary text-white border-none rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-[0.4em] mb-2">Dispatch Detail</Badge>
                <DialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">Shipping Information</DialogTitle>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8 bg-card/40 backdrop-blur-3xl">
            {/* Student Info */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Recipient Identity</h4>
              <div className="flex items-center gap-5 p-6 bg-secondary/50 rounded-[2rem] border border-foreground/5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl">
                  {selectedRequest?.student?.first_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-black text-foreground uppercase tracking-tight">
                    {selectedRequest?.student?.first_name} {selectedRequest?.student?.last_name}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {selectedRequest?.student?.registration_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Address & Tracking Info */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Fulfillment Status</h4>
              <div className="p-8 bg-white rounded-[2.5rem] border border-foreground/5 shadow-soft space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold text-foreground leading-relaxed uppercase italic">
                      {selectedRequest?.degree_fulfillment?.method === 'manual' ? 'Manual Collection (Registrar Pickup)' : (selectedRequest?.degree_fulfillment?.address || 'Awaiting Selection')}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                      <Package className="w-3.5 h-3.5" />
                      {selectedRequest?.degree_fulfillment?.method === 'manual' ? 'In-Person Authentication Required' : 'Standard Institutional Delivery'}
                    </div>
                  </div>
                </div>

                {selectedRequest?.degree_fulfillment?.tracking_number && (
                  <div className="flex items-start gap-4 pt-6 border-t border-foreground/5">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">Tracking: {selectedRequest.degree_fulfillment.courier_service || 'Standard'}</p>
                      <p className="text-base font-black text-emerald-600 tracking-[0.2em] uppercase">{selectedRequest.degree_fulfillment.tracking_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-secondary/30 rounded-2xl border border-foreground/5 space-y-1">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Selection Date</p>
                <div className="flex items-center gap-2 text-sm font-black uppercase">
                  <Calendar className="w-4 h-4 text-primary" />
                  {selectedRequest?.degree_fulfillment?.selected_at 
                    ? new Date(selectedRequest.degree_fulfillment.selected_at).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
              <div className="p-5 bg-secondary/30 rounded-2xl border border-foreground/5 space-y-1">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Fulfillment Type</p>
                <div className="flex items-center gap-2 text-sm font-black uppercase">
                  <PackageCheck className="w-4 h-4 text-primary" />
                  {selectedRequest?.degree_fulfillment?.method === 'manual' ? 'Manual Pickup' : 'Courier Dispatch'}
                </div>
              </div>
            </div>

            {/* Notification Actions */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Student Alert System</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Send official portal notification</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {selectedRequest?.degree_fulfillment?.method === 'dispatch' ? (
                  <Button 
                    className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
                    onClick={() => handleNotify('dispatched')}
                    disabled={!selectedRequest?.degree_fulfillment?.tracking_number}
                  >
                    <Send className="w-4 h-4" />
                    Notify: Degree Dispatched
                  </Button>
                ) : (
                  <Button 
                    className="h-14 flex-1 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
                    onClick={() => handleNotify('ready_for_pickup')}
                  >
                    <Send className="w-4 h-4" />
                    Notify: Ready for Pickup
                  </Button>
                )}
              </div>
            </div>

            {/* Protocol Controls */}
            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Protocol Controls</h4>
              <div className="grid grid-cols-1 gap-4">
                  <Button 
                    className={`h-20 rounded-[2rem] transition-all font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-6 group shadow-xl ${
                      selectedRequest?.status === 'fully_cleared' || selectedRequest?.status === 'completed'
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-foreground text-background hover:bg-primary hover:text-white'
                    }`}
                    onClick={() => handleCompleteDispatch(selectedRequest)}
                    disabled={!selectedRequest?.degree_fulfillment || selectedRequest?.status === 'fully_cleared' || selectedRequest?.status === 'completed'}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                       selectedRequest?.status === 'fully_cleared' || selectedRequest?.status === 'completed'
                         ? 'bg-white/20'
                         : 'bg-background/10 group-hover:scale-110'
                    }`}>
                       <PackageCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span>{selectedRequest?.status === 'fully_cleared' || selectedRequest?.status === 'completed' ? 'Degree Received & Clear' : 'Student Received Degree'}</span>
                      <span className="text-[8px] opacity-40 font-bold tracking-widest uppercase">Institutional Final Clearance Protocol</span>
                    </div>
                  </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-secondary/80" 
                onClick={() => setIsViewOpen(false)}
              >
                Close View
              </Button>
              <Button 
                className="h-14 flex-1 rounded-2xl bg-secondary/50 hover:bg-primary hover:text-white transition-all text-foreground font-black text-[10px] uppercase tracking-[0.2em]"
                onClick={() => {
                  setEditForm({
                    method: selectedRequest?.degree_fulfillment?.method || 'manual',
                    address: selectedRequest?.degree_fulfillment?.address || '',
                    tracking_number: selectedRequest?.degree_fulfillment?.tracking_number || '',
                    courier_service: selectedRequest?.degree_fulfillment?.courier_service || ''
                  });
                  setIsViewOpen(false);
                  setIsEditOpen(true);
                }}
              >
                Modify Data
              </Button>
            </div>
          </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>

  );
};
