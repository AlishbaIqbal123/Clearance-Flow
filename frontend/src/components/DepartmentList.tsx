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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DepartmentList = ({ filterType }: { filterType?: 'academic' | 'administrative' | 'exam' }) => {
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [formData, setFormData] = useState({
     name: '',
     code: '',
     type: filterType === 'exam' ? 'exam' : filterType === 'administrative' ? 'administrative' : 'academic',
     customType: '',
     email: '',
     phone: ''
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    if (filterType === 'exam') return dept.type === 'exam';
    return dept.type !== 'academic' && dept.type !== 'exam';
  });

  const handleDelete = async (id: string) => {
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
        type: formData.type === 'custom' ? 'administrative' : formData.type,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          ...(formData.type === 'custom' && { custom_type: formData.customType })
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

  const pageTitle = filterType === 'exam' ? 'Exam Department' : filterType === 'academic' ? 'Academic Departments' : filterType === 'administrative' ? 'Administrative Units' : 'Department List';
  const pageDescription = filterType === 'exam' 
    ? 'Manage high-privilege Exam Department unit responsible for final degree clearance and dispatch handling.' 
    : filterType === 'academic' 
    ? 'Manage faculties and academic departments.' 
    : filterType === 'administrative' 
    ? 'Manage administrative units like Finance, Library, Transport, and custom named units.'
    : 'View and manage all university departments and units.';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
       {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-soft group">
                 <Layers className="w-5 h-5 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-lg font-black text-foreground tracking-tighter uppercase leading-none">{pageTitle}</h2>
              </div>
           </div>
        </div>
        
        <Button 
          className="w-full lg:w-auto rounded-lg bg-primary text-white hover:bg-primary/90 h-10 px-5 font-black text-[9px] uppercase tracking-widest shadow-strong shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all group/btn shrink-0"
          onClick={() => {
            setFormData({ name: '', code: '', type: filterType === 'exam' ? 'exam' : filterType === 'administrative' ? 'administrative' : 'academic', customType: '', email: '', phone: '' });
            setIsAddOpen(true);
          }}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          <span>Add Department</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array(6).fill(0).map((_, i) => (
             <div key={i} className="h-64 bg-card/60 rounded-2xl animate-pulse"></div>
           ))
        ) : departments.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 bg-card/40 rounded-2xl border-2 border-dashed border-foreground/5 group">
             <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center text-muted-foreground/20 group-hover:text-primary/20 transition-colors duration-700">
                <Building2 className="w-8 h-8" />
             </div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">No Departments Found</p>
          </div>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id} className="border-none shadow-strong rounded-2xl bg-card/60 backdrop-blur-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-700 cursor-pointer border border-foreground/5">
              <CardHeader className="p-4 pb-2 relative overflow-hidden">
                 <div className="flex items-start justify-between relative z-10 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center font-black text-sm text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                       {dept.code}
                    </div>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-secondary/30 hover:bg-card hover:shadow-soft transition-all duration-500">
                             <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-xl w-48 p-1.5 shadow-strong bg-background/95 backdrop-blur-2xl border-none">
                            <DropdownMenuItem 
                             className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3 cursor-pointer"
                             onClick={() => {
                               const isCustomType = !!dept.contact_info?.custom_type;
                               setSelectedDept(dept);
                               setFormData({
                                 name: dept.name,
                                 code: dept.code,
                                 type: isCustomType ? 'custom' : (dept.type || 'academic'),
                                 customType: dept.contact_info?.custom_type || '',
                                 email: dept.contact_info?.email || '',
                                 phone: dept.contact_info?.phone || ''
                               });
                               setIsEditOpen(true);
                             }}
                           >
                             <Edit className="w-3.5 h-3.5 mr-2 opacity-40" /> 
                             Edit Details
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-destructive focus:text-white px-3 cursor-pointer text-destructive mt-0.5"
                             onClick={() => setConfirmDeleteId(dept.id)}
                           >
                             <Trash2 className="w-3.5 h-3.5 mr-2" /> 
                             Delete
                           </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                 
                 <div className="space-y-0.5 relative z-10">
                    <h3 className="text-sm font-black text-foreground tracking-tight uppercase leading-none group-hover:text-primary transition-colors duration-500">{dept.name}</h3>
                    <Badge variant="outline" className="border-foreground/5 bg-secondary/30 text-[7px] font-black uppercase tracking-widest text-muted-foreground py-0.5 px-2 rounded-full italic">
                       {dept.contact_info?.custom_type || dept.type?.replace('_', ' ')}
                    </Badge>
                 </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-1 space-y-4 relative z-10">
                 <div className="space-y-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-2 group/item">
                       <div className="p-1.5 bg-secondary/50 rounded-lg group-hover/item:text-primary transition-all">
                          <Mail className="w-3 h-3" />
                       </div>
                       <span className="truncate group-hover/item:text-foreground transition-all">{dept.contact_info?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 group/item">
                       <div className="p-1.5 bg-secondary/50 rounded-lg group-hover/item:text-primary transition-all">
                          <Phone className="w-3 h-3" />
                       </div>
                       <span className="group-hover/item:text-foreground transition-all">{dept.contact_info?.phone || 'N/A'}</span>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-foreground/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/5 text-emerald-600 rounded-lg border border-emerald-500/10">
                       <ShieldCheck className="w-3 h-3" />
                       <span className="text-[7px] font-black uppercase tracking-widest">
                          {dept.clearance_config?.isRequired ? 'Mandatory' : 'Optional'}
                       </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10">
                       <Zap className="w-3 h-3" />
                       <span className="text-[7px] font-black uppercase tracking-widest">
                          Order: {dept.clearance_config?.order || 0}
                       </span>
                    </div>
                 </div>
              </CardContent>
              <div className="px-4 pb-4 mt-auto">
                 <Button 
                    variant="ghost" 
                    className="w-full h-10 rounded-lg bg-secondary/30 hover:bg-primary hover:text-white font-black text-[8px] uppercase tracking-widest transition-all duration-500 group/cta"
                    onClick={() => {
                      const isCustomType = !!dept.contact_info?.custom_type;
                      setSelectedDept(dept);
                      setFormData({
                        name: dept.name,
                        code: dept.code,
                        type: isCustomType ? 'custom' : (dept.type || 'academic'),
                        customType: dept.contact_info?.custom_type || '',
                        email: dept.contact_info?.email || '',
                        phone: dept.contact_info?.phone || ''
                      });
                      setIsEditOpen(true);
                    }}
                 >
                    View Details <ArrowUpRight className="ml-1.5 w-3 h-3 group-hover:scale-110 transition-transform" />
                 </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[480px] w-[95vw] rounded-2xl p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className={`${isEditOpen ? 'bg-amber-600' : 'bg-primary'} p-6 text-white relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-[60px]" />
            <div className="relative z-10 space-y-3">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  {isEditOpen ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
               </div>
               <div className="space-y-0.5">
                  <DialogTitle className="text-lg font-black tracking-tighter uppercase leading-none">
                    {isEditOpen ? 'Update Department' : 'Add New Department'}
                  </DialogTitle>
                  <DialogDescription className="text-white/60 font-black text-[8px] uppercase tracking-widest mt-1 italic">
                    Configure department details and contact info.
                  </DialogDescription>
               </div>
            </div>
          </div>
          <form className="p-6 space-y-4" onSubmit={isEditOpen ? handleUpdate : async (e) => {
            e.preventDefault();
            try {
              const data = {
                name: formData.name,
                code: formData.code,
                type: formData.type === 'custom' ? 'administrative' : formData.type,
                contactInfo: {
                  email: formData.email,
                  phone: formData.phone,
                  ...(formData.type === 'custom' && { custom_type: formData.customType })
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
               <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder={filterType === 'academic' ? 'e.g., Faculty of Engineering' : 'e.g., Library Services'}
                  className="h-10 rounded-lg bg-secondary/50 border-none text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 shadow-inner"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Code</Label>
                  <Input 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                    placeholder="e.g., ENG"
                    className="h-10 rounded-lg bg-secondary/50 border-none font-black text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner uppercase tracking-widest"
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => {
                      const updates: any = { type: val };
                      if (val !== 'custom' && val !== 'administrative' && !formData.name) {
                        updates.name = val.charAt(0).toUpperCase() + val.slice(1);
                      }
                      setFormData({...formData, ...updates});
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-lg bg-secondary/50 border-none font-black text-[8px] uppercase tracking-widest px-4 shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-strong p-1 bg-background/95 backdrop-blur-2xl">
                      {filterType === 'exam' ? (
                        <SelectItem value="exam" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Exam Department</SelectItem>
                      ) : filterType === 'academic' ? (
                        <SelectItem value="academic" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Academic Dept</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="finance" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Finance</SelectItem>
                          <SelectItem value="library" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Library</SelectItem>
                          <SelectItem value="transport" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Transport</SelectItem>
                          <SelectItem value="hostel" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Hostel</SelectItem>
                          <SelectItem value="sports" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Sports</SelectItem>
                          <SelectItem value="medical" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Medical</SelectItem>
                          <SelectItem value="security" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Security</SelectItem>
                          <SelectItem value="administrative" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Administrative</SelectItem>
                          <SelectItem value="custom" className="rounded-lg h-10 font-black text-[8px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Other (Custom Name)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.type === 'custom' && (
                <div className="space-y-1 animate-in fade-in zoom-in-95 duration-300">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Name of Department Type</Label>
                  <Input 
                    value={formData.customType} 
                    onChange={(e) => setFormData({...formData, customType: e.target.value})} 
                    placeholder="e.g., Quality Assurance"
                    className="h-10 rounded-lg bg-secondary/50 border-none text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 shadow-inner"
                    required 
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  type="email" 
                  placeholder="dept@university.edu" 
                  className="h-10 rounded-lg bg-secondary/50 border-none font-bold text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+92..." 
                  className="h-10 rounded-lg bg-secondary/50 border-none font-bold text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" className="h-10 rounded-lg font-black text-[9px] uppercase tracking-widest text-muted-foreground px-6 hover:bg-secondary transition-all" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className={`flex-1 rounded-xl h-11 font-black text-[9px] uppercase tracking-widest shadow-strong transition-all active:scale-95 ${isEditOpen ? 'bg-amber-600 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}>
                {isEditOpen ? 'Update Department' : 'Save Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-strong bg-background/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">Delete Department?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-muted-foreground">
              This will permanently remove the department and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { if(confirmDeleteId) handleDelete(confirmDeleteId); }}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black text-[9px] uppercase tracking-widest h-10"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
  </svg>
);
