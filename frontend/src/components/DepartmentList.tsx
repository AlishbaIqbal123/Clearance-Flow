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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export const DepartmentList = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [formData, setFormData] = useState({
     name: '',
     code: '',
     type: 'academic',
     email: '',
     phone: ''
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDepartments();
      if (res.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this department? All associated staff will lose their department association.')) return;
    try {
      const res = await adminService.deleteDepartment(id);
      if (res.success) {
        toast.success('Department deleted successfully');
        setDepartments(prev => prev.filter(d => d.id !== id));
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Departmental Hub</h2>
           <p className="text-slate-500 font-medium italic">Configure university departments and clearance requirements.</p>
        </div>
        <Button 
          className="rounded-xl bg-purple-600 text-white h-11 px-6 font-bold shadow-lg shadow-purple-100"
          onClick={() => {
            setFormData({ name: '', code: '', type: 'academic', email: '', phone: '' });
            setIsAddOpen(true);
          }}
        >
           <Plus className="w-4 h-4 mr-2" />
           New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full h-48 flex items-center justify-center bg-white rounded-[2rem]">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
           </div>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id} className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <CardHeader className="p-8 pb-4">
                 <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center font-black text-purple-600 text-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-sm">
                       {dept.code}
                    </div>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm transition-all border border-transparent hover:border-slate-100">
                             <MoreVertical className="w-5 h-5 text-slate-400" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2 shadow-2xl">
                           <DropdownMenuItem 
                             className="rounded-xl font-bold py-3"
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
                             <Edit className="w-4 h-4 mr-2" /> 
                             Edit Config
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             className="rounded-xl font-bold py-3 text-red-600"
                             onClick={() => handleDelete(dept.id)}
                           >
                             <Trash2 className="w-4 h-4 mr-2" /> 
                             Remove
                           </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mt-4 tracking-tight">{dept.name}</h3>
                 <Badge variant="outline" className="mt-2 bg-slate-50 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 py-1 px-3 italic">
                    {dept.type?.toUpperCase()}
                 </Badge>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-4">
                 <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-medium group/mail">
                       <Mail className="w-4 h-4 text-slate-300 group-hover/mail:text-purple-500 transition-colors" />
                       <span className="truncate">{dept.contact_info?.email || 'no-email@univ.edu'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium group/phone">
                       <Phone className="w-4 h-4 text-slate-300 group-hover/phone:text-purple-500 transition-colors" />
                       <span>{dept.contact_info?.phone || 'N/A'}</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                       <Shield className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                          {dept.clearance_config?.isRequired ? 'Mandatory' : 'Optional'}
                       </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                       <CheckCircle2 className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                          Seq: {dept.clearance_config?.order || 0}
                       </span>
                    </div>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className={`${isEditOpen ? 'bg-amber-500' : 'bg-purple-600'} p-8 text-white relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {isEditOpen ? 'Edit Department' : 'New Department'}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium mt-1">
              {isEditOpen ? 'Update administrative unit details and clearance settings.' : 'Create a new administrative unit for clearance processing.'}
            </DialogDescription>
          </div>
          <form className="p-8 space-y-4" onSubmit={isEditOpen ? handleUpdate : async (e) => {
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
                  order: departments.length + 1
                }
              };
              const res = await adminService.createDepartment(data);
              if (res.success) {
                toast.success('Department created');
                setIsAddOpen(false);
                fetchDepartments();
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to create department');
            }
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Department Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Library Services" 
                  className="rounded-xl" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Short Code</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="LIB" 
                  className="rounded-xl" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-md mb-1">Academic Programs</div>
                    <SelectItem value="academic">Academic Department</SelectItem>
                    
                    <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-md my-1">Administrative & Services</div>
                    <SelectItem value="financial">Finance Office</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="transport">Transport Office</SelectItem>
                    <SelectItem value="hostel">Hostel / Housing</SelectItem>
                    <SelectItem value="administrative">General Administration</SelectItem>
                    <SelectItem value="security">Security / Proctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Email</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  type="email" 
                  placeholder="dept@univ.edu" 
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Phone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+92..." 
                  className="rounded-xl" 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" className="rounded-xl h-12" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
              <Button type="submit" className={`w-full h-12 rounded-xl font-bold ${isEditOpen ? 'bg-amber-600' : 'bg-slate-900'}`}>
                {isEditOpen ? 'Save Changes' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
