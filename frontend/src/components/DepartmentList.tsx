// UI ONLY — NO LOGIC CHANGED
import { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  Shield,
  Loader2,
  Building2,
  Zap,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Globe,
  Lock,
  ChevronRight,
  Info,
  X,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { adminService } from '@/lib/admin.service';

export const DepartmentList = ({ filterType }: { filterType?: 'academic' | 'administrative' }) => {
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [formData, setFormData] = useState({
     name: '',
     code: '',
     type: filterType === 'administrative' ? 'administrative' : 'academic',
     email: '',
     phone: ''
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDepartments();
      if (res.success) {
        setAllDepartments(res.data.departments || []);
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const departments = allDepartments.filter(dept => {
    if (!filterType) return true;
    if (filterType === 'academic') return dept.type === 'academic';
    return dept.type !== 'academic'; // administrative/others
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
    try {
      const res = await adminService.deleteDepartment(id);
      if (res.success) {
        toast.success('Department deleted successfully');
        setAllDepartments(prev => prev.filter(d => d.id !== id));
      }
    } catch (e) {
      toast.error('Failed to delete department');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        contactInfo: {
          email: formData.email,
          phone: formData.phone
        }
      };
      const res = await adminService.updateDepartment(selectedDept.id, data);
      if (res.success) {
        toast.success('Department updated successfully');
        setIsEditOpen(false);
        fetchDepartments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update department');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const pageTitle = filterType === 'academic' ? 'Academic Departments' : filterType === 'administrative' ? 'Administrative Units' : 'Department List';
  const pageDescription = filterType === 'academic' 
    ? 'Manage faculties and academic departments.' 
    : filterType === 'administrative' 
    ? 'Manage administrative units like Finance, Library, and Transport.'
    : 'View and manage all university departments and units.';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
       {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <Layers className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">{filterType ? filterType.toUpperCase() : 'ALL'}</Badge>
                 </div>
                 <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none">{pageTitle}</h2>
              </div>
           </div>
           <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl leading-relaxed italic">
             {pageDescription}
           </p>
        </div>
        
        <Button 
          className="w-full lg:w-auto rounded-xl bg-primary text-white hover:bg-primary/90 h-14 px-8 font-black text-[10px] uppercase tracking-widest shadow-strong shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all group/btn relative overflow-hidden shrink-0"
          onClick={() => {
            setFormData({ name: '', code: '', type: filterType === 'administrative' ? 'administrative' : 'academic', email: '', phone: '' });
            setIsAddOpen(true);
          }}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span>Add Department</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array(6).fill(0).map((_, i) => (
             <div key={i} className="h-64 bg-card/60 rounded-[2rem] animate-pulse"></div>
           ))
        ) : departments.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 bg-card/40 rounded-[2rem] border-2 border-dashed border-foreground/5 group">
             <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center text-muted-foreground/20 group-hover:text-primary/20 transition-colors duration-700">
                <Building2 className="w-8 h-8" />
             </div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">No Departments Found</p>
          </div>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id} className="border-none shadow-strong rounded-[2rem] bg-card/60 backdrop-blur-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-700 cursor-pointer border border-foreground/5">
              <CardHeader className="p-6 pb-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />
                 
                 <div className="flex items-start justify-between relative z-10 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center font-black text-lg text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:rotate-6 shadow-inner">
                       {dept.code}
                    </div>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-secondary/30 hover:bg-card hover:shadow-soft transition-all duration-500">
                             <MoreVertical className="w-5 h-5 text-muted-foreground" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-strong bg-background/95 backdrop-blur-2xl border-none animate-in zoom-in-95 duration-300">
                           <DropdownMenuItem 
                             className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer"
                             onClick={() => {
                               setSelectedDept(dept);
                               setFormData({
                                 name: dept.name,
                                 code: dept.code,
                                 type: dept.type || 'academic',
                                 email: dept.contact_info?.email || '',
                                 phone: dept.contact_info?.phone || ''
                               });
                               setIsEditOpen(true);
                             }}
                           >
                             <Edit className="w-4 h-4 mr-3 opacity-40" /> 
                             Edit Details
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-destructive focus:text-white px-4 cursor-pointer text-destructive mt-1"
                             onClick={() => handleDelete(dept.id)}
                           >
                             <Trash2 className="w-4 h-4 mr-3" /> 
                             Delete
                           </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                 
                 <div className="space-y-1 relative z-10">
                    <h3 className="text-lg font-black text-foreground tracking-tight uppercase leading-none group-hover:text-primary transition-colors duration-500">{dept.name}</h3>
                    <Badge variant="outline" className="border-foreground/5 bg-secondary/30 text-[8px] font-black uppercase tracking-widest text-muted-foreground py-0.5 px-3 rounded-full italic">
                       {dept.type?.replace('_', ' ')}
                    </Badge>
                 </div>
              </CardHeader>
              
              <CardContent className="p-6 pt-2 space-y-6 relative z-10">
                 <div className="space-y-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-3 group/item">
                       <div className="p-2 bg-secondary/50 rounded-xl group-hover/item:text-primary transition-all">
                          <Mail className="w-3.5 h-3.5" />
                       </div>
                       <span className="truncate group-hover/item:text-foreground transition-all">{dept.contact_info?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 group/item">
                       <div className="p-2 bg-secondary/50 rounded-xl group-hover/item:text-primary transition-all">
                          <Phone className="w-3.5 h-3.5" />
                       </div>
                       <span className="group-hover/item:text-foreground transition-all">{dept.contact_info?.phone || 'N/A'}</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-foreground/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 text-emerald-600 rounded-xl border border-emerald-500/10 transition-all duration-700">
                       <ShieldCheck className="w-3.5 h-3.5" />
                       <span className="text-[8px] font-black uppercase tracking-widest">
                          {dept.clearance_config?.isRequired ? 'Mandatory' : 'Optional'}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl border border-primary/10 transition-all duration-700">
                       <Zap className="w-3.5 h-3.5" />
                       <span className="text-[8px] font-black uppercase tracking-widest">
                          Order: {dept.clearance_config?.order || 0}
                       </span>
                    </div>
                 </div>
              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                 <Button variant="ghost" className="w-full h-12 rounded-xl bg-secondary/30 hover:bg-primary hover:text-white font-black text-[9px] uppercase tracking-widest transition-all duration-700 group/cta">
                    View Details <ArrowUpRight className="ml-2 w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                 </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Department Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500">
          <div className={`${isEditOpen ? 'bg-amber-600' : 'bg-primary'} p-6 sm:p-10 text-white relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-[80px]" />
            <div className="relative z-10 space-y-4">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  {isEditOpen ? <Edit className="w-5 h-5 sm:w-6 sm:h-6" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6" />}
               </div>
               <div className="space-y-1">
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">
                    {isEditOpen ? 'Update Department' : 'Add New Department'}
                  </DialogTitle>
                  <DialogDescription className="text-white/60 font-black text-[8px] sm:text-[9px] uppercase tracking-widest mt-1 italic">
                    Configure department details and contact info.
                  </DialogDescription>
               </div>
            </div>
          </div>
                    <form className="p-6 sm:p-10 space-y-6 sm:space-y-8" onSubmit={isEditOpen ? handleUpdate : async (e) => {
            e.preventDefault();
            try {
              const data = {
                name: formData.name,
                code: formData.code,
                type: formData.type,
                contactInfo: {
                  email: formData.email,
                  phone: formData.phone
                },
                clearanceConfig: {
                  isRequired: true,
                  order: allDepartments.length + 1
                }
              };
              const res = await adminService.createDepartment(data);
              if (res.success) {
                toast.success('Department added successfully');
                setIsAddOpen(false);
                fetchDepartments();
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to add department');
            }
          }}>
            <div className="grid grid-cols-1 gap-4">
               <div className="sm:col-span-2 space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder={filterType === 'academic' ? 'e.g., Faculty of Engineering' : 'e.g., Library Services'}
                  className="h-11 rounded-xl bg-secondary/50 border-none text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Code</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="e.g., ENG"
                  className="h-12 rounded-xl bg-secondary/50 border-none font-black text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner uppercase tracking-widest"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-black text-[9px] uppercase tracking-widest px-6 shadow-inner focus:ring-4 focus:ring-primary/10 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl">
                    {filterType === 'academic' ? (
                      <SelectItem value="academic" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Academic Dept</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="financial" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Financial</SelectItem>
                        <SelectItem value="library" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Library</SelectItem>
                        <SelectItem value="transport" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Transport</SelectItem>
                        <SelectItem value="hostel" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Hostel</SelectItem>
                        <SelectItem value="administrative" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Administrative</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  type="email" 
                  placeholder="dept@university.edu" 
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+92..." 
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-6 gap-4">
              <Button type="button" variant="ghost" className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground px-8 hover:bg-secondary transition-all" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className={`flex-1 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest shadow-strong transition-all active:scale-95 relative overflow-hidden ${isEditOpen ? 'bg-amber-600 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}>
                {isEditOpen ? 'Update Department' : 'Save Department'}
              </Button>
            </DialogFooter>
          </form>
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
