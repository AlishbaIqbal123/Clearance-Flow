// UI ONLY — NO LOGIC CHANGED
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Shield, 
  Building, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  Globe,
  Lock,
  ChevronRight,
  History,
  ShieldAlert,
  Edit,
  Trash,
  X,
  UserCircle,
  Building2,
  Layers,
  Zap,
  Key
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/lib/admin.service';
import api from '@/lib/api';

export const OfficialList = () => {
  const [officials, setOfficials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.success) {
        setOfficials(res.data.users || []);
      }
      
      const deptRes = await adminService.getDepartments();
      if (deptRes.success) {
        setDepartments(deptRes.data.departments || []);
      }
    } catch (error) {
      toast.error('Failed to load officials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this official\'s access?')) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        toast.success('Access revoked successfully');
        setOfficials(prev => prev.filter(o => o.id !== id));
      }
    } catch (e) {
      toast.error('Failed to revoke access');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      ...(formData.departmentId ? { departmentId: formData.departmentId } : {})
    };

    try {
      const res = await adminService.updateUser(selectedOfficial.id, payload);
      if (res.success) {
        toast.success('Authorization profile updated');
        setIsEditOpen(false);
        fetchOfficials();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update authorization');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Reset this official\'s access key to default (official123)?')) return;
    try {
      const res = await adminService.resetOfficialPassword(id);
      if (res.success) {
        toast.success('Access key reset successful');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset key');
    }
  };

  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  const filteredOfficials = officials.filter(off => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (off.first_name?.toLowerCase() || '').includes(searchLower) ||
      (off.last_name?.toLowerCase() || '').includes(searchLower) ||
      (off.email?.toLowerCase() || '').includes(searchLower) ||
      (off.role?.toLowerCase() || '').includes(searchLower) ||
      (off.department?.name?.toLowerCase() || '').includes(searchLower);
    
    const matchesRole = selectedRole === 'all' || off.role === selectedRole;
    const matchesDept = selectedDept === 'all' || off.department_id === selectedDept;

    return matchesSearch && matchesRole && matchesDept;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
       {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">Staff List</Badge>
                 </div>
                 <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none">Manage Staff</h2>
              </div>
           </div>
           <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl leading-relaxed italic">
             Manage university officials, assign roles to departments, and control system access.
           </p>
        </div>
        
        <Button 
          className="w-full lg:w-auto rounded-xl bg-primary text-white hover:bg-primary/90 h-14 px-8 font-black text-[10px] uppercase tracking-widest shadow-strong shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all group/btn relative overflow-hidden shrink-0"
          onClick={() => {
            setFormData({ firstName: '', lastName: '', email: '', role: '', departmentId: '' });
            setIsAddOpen(true);
          }}
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
          <span>Add Official</span>
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card/60 backdrop-blur-3xl rounded-2xl border border-foreground/5 shadow-strong">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
          <Input 
            placeholder="Search staff by name, email or department..." 
            className="pl-14 h-12 border-none bg-secondary/50 rounded-xl text-base font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="rounded-xl h-12 w-full sm:w-[200px] border-none bg-secondary/50 font-black text-[9px] uppercase tracking-widest px-6 shadow-inner focus:ring-2 focus:ring-primary/10 transition-all">
               <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-primary opacity-40" />
                  <SelectValue placeholder="Role" />
               </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl">
              <SelectItem value="all" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">All Roles</SelectItem>
              <SelectItem value="hod" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">HOD</SelectItem>
              <SelectItem value="finance_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Finance</SelectItem>
              <SelectItem value="library_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Library</SelectItem>
              <SelectItem value="transport_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Transport</SelectItem>
              <SelectItem value="department_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

       <Card className="border-none shadow-strong rounded-[2rem] overflow-hidden bg-card/60 backdrop-blur-3xl group">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="border-none">
                <TableHead className="px-8 py-5 font-black text-muted-foreground uppercase text-[9px] tracking-widest">Official Name</TableHead>
                <TableHead className="py-5 font-black text-muted-foreground uppercase text-[9px] tracking-widest">Department</TableHead>
                <TableHead className="py-5 font-black text-muted-foreground uppercase text-[9px] tracking-widest">Role</TableHead>
                <TableHead className="py-5 font-black text-muted-foreground uppercase text-[9px] tracking-widest">Status</TableHead>
                <TableHead className="px-8 py-5 font-black text-muted-foreground uppercase text-[9px] tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <TableRow key={i} className="h-32 border-foreground/5 animate-pulse">
                    <TableCell colSpan={5} className="px-12">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-muted rounded-[1.75rem]" />
                          <div className="space-y-3">
                             <div className="w-48 h-4 bg-muted rounded-full" />
                             <div className="w-32 h-3 bg-muted rounded-full" />
                          </div>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredOfficials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] text-center px-8">
                    <div className="flex flex-col items-center justify-center gap-6">
                      <div className="w-24 h-24 bg-muted/10 rounded-3xl flex items-center justify-center shadow-inner group/empty relative overflow-hidden">
                         <Users className="w-10 h-10 text-muted-foreground/10" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-xl font-black text-foreground uppercase tracking-tight leading-none">No Results</p>
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">No officials matched the current filters.</p>
                      </div>
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedRole('all'); }} className="rounded-xl font-black text-[9px] uppercase tracking-widest px-8 h-12 border-foreground/10 hover:border-primary/40 hover:text-primary transition-all active:scale-95">Reset Filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOfficials.map((off) => (
                  <TableRow key={off.id} className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer">
                    <TableCell className="px-12 py-10">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-card shadow-soft border border-foreground/5 flex items-center justify-center font-black text-primary text-xl group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:rotate-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="relative z-10">{off.first_name?.[0]}{off.last_name?.[0]}</span>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{off.first_name} {off.last_name}</p>
                          <p className="text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-widest opacity-40">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            {off.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground font-black text-[9px] uppercase tracking-widest bg-secondary/50 w-fit px-3 py-1.5 rounded-xl border border-foreground/5 group-hover:border-primary/20 transition-all">
                        <Building2 className="w-3.5 h-3.5 text-primary opacity-40" />
                        <span className="truncate max-w-[150px]">{off.department?.name || 'Admin'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-xl px-4 py-1.5 border-none font-black uppercase text-[8px] tracking-widest shadow-soft ${
                        off.role === 'admin' ? 'bg-foreground text-background' :
                        off.role === 'hod' ? 'bg-primary/10 text-primary' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {off.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {off.is_active !== false ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20"></div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Suspended</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-secondary/50 hover:bg-primary hover:text-white transition-all duration-700 active:scale-90 group/btn">
                                <MoreVertical className="w-5 h-5" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-strong bg-background/95 backdrop-blur-2xl border-none animate-in zoom-in-95 duration-300">
                             <DropdownMenuItem 
                                className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer"
                                onClick={() => {
                                  setSelectedOfficial(off);
                                  setFormData({
                                    firstName: off.first_name,
                                    lastName: off.last_name,
                                    email: off.email,
                                    role: off.role,
                                    departmentId: off.department_id || ''
                                  });
                                  setIsEditOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-3 opacity-40" />
                                Edit Official
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-amber-600 focus:text-white px-4 cursor-pointer mt-1"
                                onClick={() => handleResetPassword(off.id)}
                              >
                                <Key className="w-4 h-4 mr-3 opacity-40" />
                                Reset Password
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="my-1 bg-foreground/5" />
                             <DropdownMenuItem 
                                className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-destructive focus:text-white px-4 cursor-pointer text-destructive"
                                onClick={() => handleDelete(off.id)}
                              >
                                <ShieldAlert className="w-4 h-4 mr-3" />
                                Revoke Access
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                 ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Staff Dialog */}       <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500">
          <div className={`${isEditOpen ? 'bg-amber-600' : 'bg-primary'} p-6 sm:p-10 text-white relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-[80px]" />
            <div className="relative z-10 space-y-4">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  {isEditOpen ? <Edit className="w-5 h-5 sm:w-6 sm:h-6" /> : <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />}
               </div>
               <div className="space-y-1">
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">
                    {isEditOpen ? 'Update Staff' : 'Add New Staff'}
                  </DialogTitle>
                  <DialogDescription className="text-white/60 font-black text-[8px] sm:text-[9px] uppercase tracking-widest mt-1 italic">
                    Fill in the staff details and assign roles.
                  </DialogDescription>
               </div>
            </div>
          </div>

          
          <form className="p-6 sm:p-10 space-y-6 sm:space-y-8" onSubmit={isEditOpen ? handleUpdate : async (e) => {
            e.preventDefault();
            const payload: any = {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              role: formData.role,
              password: 'official123',
              ...(formData.departmentId ? { departmentId: formData.departmentId } : {})
            };
            try {
              const res = await adminService.createUser(payload);
              if (res.success) {
                toast.success('Official onboarded successfully');
                setIsAddOpen(false);
                fetchOfficials();
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Enrollment failed');
            }
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="First Name" 
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="Last Name" 
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>               <div className="sm:col-span-2 space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    type="email" 
                    placeholder="name@university.edu" 
                    className="pl-14 h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Staff Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-black text-[9px] uppercase tracking-widest px-6 shadow-inner focus:ring-2 focus:ring-primary/10 transition-all">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl">
                    <SelectItem value="hod" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">HOD</SelectItem>
                    <SelectItem value="department_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Dept Staff</SelectItem>
                    <SelectItem value="finance_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Finance</SelectItem>
                    <SelectItem value="library_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Library</SelectItem>
                    <SelectItem value="transport_officer" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Transport</SelectItem>
                    <SelectItem value="admin" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({...formData, departmentId: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-black text-[9px] uppercase tracking-widest px-6 shadow-inner focus:ring-2 focus:ring-primary/10 transition-all">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl max-h-[300px]">
                    <div className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 rounded-xl mb-1">Academic</div>
                    {departments.filter(d => d.type === 'academic').map((d: any) => (
                      <SelectItem key={d.id} value={d.id} className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">{d.name}</SelectItem>
                    ))}
                    <div className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 rounded-xl my-1">Operational</div>
                    {departments.filter(d => d.type !== 'academic').map((d: any) => (
                      <SelectItem key={d.id} value={d.id} className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="pt-6 gap-4">
              <Button type="button" variant="ghost" className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground px-8 hover:bg-secondary transition-all" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className={`flex-1 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest shadow-strong transition-all active:scale-95 relative overflow-hidden ${isEditOpen ? 'bg-amber-600 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}>
                {isEditOpen ? 'Update Staff' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
