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
  AlertCircle
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
import { adminService } from '@/lib/admin.service';
import { toast } from 'sonner';

export const DispatchList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRequests = requests.filter(req => 
    req.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student?.registration_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                          {req.student?.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-base tracking-tight uppercase leading-none">{req.student?.full_name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">{req.student?.registration_no}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      <div className="flex items-start gap-4 max-w-md">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                        <p className="font-bold text-sm text-foreground/80 leading-relaxed uppercase italic">
                          {req.degree_fulfillment?.address || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          {new Date(req.degree_fulfillment?.selected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 px-6">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-full flex items-center gap-2 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready for Dispatch
                      </Badge>
                    </TableCell>
                    <TableCell className="py-8 px-10 text-right">
                      <Button className="h-12 w-12 rounded-xl bg-foreground text-white hover:bg-primary transition-all shadow-soft group/action">
                        <PackageCheck className="w-5 h-5 group-hover/action:scale-110 transition-transform" />
                      </Button>
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
    </div>
  );
};
