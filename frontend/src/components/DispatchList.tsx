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
  Eye
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


export const DispatchList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);


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

  const filteredRequests = requests.filter(req => 
    req.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.degree_fulfillment?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Truck className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1 rounded-full shadow-lg">Logistics Center</Badge>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Degree Dispatch Management</h1>
            </div>
          </div>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest max-w-xl">
            Monitor and manage physical degree distributions. Verify student mailing addresses and track fulfillment status across the campus network.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="relative group/search">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/search:text-primary transition-colors" />
            <Input 
              placeholder="Search address or student..." 
              className="h-16 w-[320px] pl-16 rounded-2xl border-none bg-white/10 text-white font-bold placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-primary/40 backdrop-blur-md shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 transition-all active:scale-95 flex items-center gap-4">
            <Download className="w-5 h-5" />
            Export Labels
          </Button>
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
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Student & ID</TableHead>
                <TableHead className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Mailing Address</TableHead>
                <TableHead className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Selection Date</TableHead>
                <TableHead className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">System Status</TableHead>
                <TableHead className="py-6 px-10 text-right text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Actions</TableHead>
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
                    <TableCell className="py-8 px-6">
                      <div className="flex items-start gap-4 max-w-md">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                        <p className={`font-bold text-sm leading-relaxed uppercase italic ${!req.degree_fulfillment ? 'text-muted-foreground opacity-50' : 'text-foreground/80'}`}>
                          {!req.degree_fulfillment 
                            ? 'Awaiting Student Selection' 
                            : req.degree_fulfillment.method === 'manual' 
                              ? 'Manual Collection (In-Person Pickup)' 
                              : (req.degree_fulfillment.address || 'Address Not Provided')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          {req.degree_fulfillment?.selected_at 
                            ? new Date(req.degree_fulfillment.selected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'PENDING'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      {!req.degree_fulfillment ? (
                        <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-full flex items-center gap-2 w-fit">
                          <AlertCircle className="w-3 h-3" />
                          Awaiting Selection
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-full flex items-center gap-2 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          {req.degree_fulfillment.method === 'manual' ? 'Ready for Pickup' : 'Ready for Dispatch'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-8 px-10 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-soft"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button 
                          className="h-12 w-12 rounded-xl bg-foreground text-white hover:bg-primary transition-all shadow-soft group/action"
                          onClick={() => handleCompleteDispatch(req)}
                          disabled={!req.degree_fulfillment}
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
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background">
          <div className="bg-foreground p-8 text-background relative overflow-hidden">
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

            {/* Address Info */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Dispatch Coordinates</h4>
              <div className="p-8 bg-white rounded-[2.5rem] border border-foreground/5 shadow-soft space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold text-foreground leading-relaxed uppercase italic">
                      {selectedRequest?.degree_fulfillment?.method === 'manual' ? 'Manual Collection (Registrar Pickup)' : (selectedRequest?.degree_fulfillment?.address || 'N/A')}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                      <Package className="w-3.5 h-3.5" />
                      {selectedRequest?.degree_fulfillment?.method === 'manual' ? 'In-Person Authentication Required' : 'Standard Institutional Delivery'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-secondary/30 rounded-2xl border border-foreground/5 space-y-1">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Selection Date</p>
                <div className="flex items-center gap-2 text-sm font-black uppercase">
                  <Calendar className="w-4 h-4 text-primary" />
                  {selectedRequest && new Date(selectedRequest.degree_fulfillment?.selected_at).toLocaleDateString()}
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

            <DialogFooter className="pt-4">
              <Button 
                variant="ghost" 
                className="h-12 rounded-xl px-10 font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:bg-secondary/80 w-full" 
                onClick={() => setIsViewOpen(false)}
              >
                Close View
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
};
