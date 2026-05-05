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

export const OfficialList = () => {
  const [officials, setOfficials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
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

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
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

  const handleResetPassword = async (id: string) => {
    try {
      const res = await adminService.resetOfficialPassword(id);
      if (res.success) {
        toast.success('Access key reset successful');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset key');
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
       {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-soft group">
                 <ShieldCheck className="w-5 h-5 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-lg font-black text-foreground tracking-tighter uppercase leading-none">Manage Staff</h2>
              </div>
           </div>
        </div>
        
        <Button 
          className="rounded-xl bg-primary text-white hover:bg-primary/90 h-12 px-6 font-black text-[9px] uppercase tracking-widest shadow-strong shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all group/btn shrink-0"
          onClick={() => {
            setFormData({ firstName: '', lastName: '', email: '', role: '', departmentId: '' });
            setIsAddOpen(true);
          }}
        >
          <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-500" />
          <span>Add Official</span>
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col lg:flex-row gap-3 p-3 bg-card/60 backdrop-blur-3xl rounded-xl border border-foreground/5 shadow-strong">
        <div className="relative group flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
          <Input 
            placeholder="Search staff..." 
            className="pl-12 h-10 border-none bg-secondary/50 rounded-lg text-sm font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="rounded-lg h-10 w-[140px] border-none bg-secondary/50 font-black text-[9px] uppercase tracking-widest px-4 shadow-inner focus:ring-2 focus:ring-primary/10 transition-all">
               <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary opacity-40" />
                  <SelectValue placeholder="Role" />
               </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-strong p-1 bg-background/95 backdrop-blur-2xl">
              <SelectItem value="all" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">All Roles</SelectItem>
              <SelectItem value="hod" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">HOD</SelectItem>
              <SelectItem value="finance_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Finance</SelectItem>
              <SelectItem value="library_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Library</SelectItem>
              <SelectItem value="transport_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Transport</SelectItem>
              <SelectItem value="department_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Staff</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="rounded-lg h-10 w-[160px] border-none bg-secondary/50 font-black text-[9px] uppercase tracking-widest px-4 shadow-inner focus:ring-2 focus:ring-primary/10 transition-all">
               <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-primary opacity-40" />
                  <SelectValue placeholder="Unit" />
               </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-strong p-1 bg-background/95 backdrop-blur-2xl">
              <SelectItem value="all" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">All Units</SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id} className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

       <Card className="border-none shadow-strong rounded-2xl overflow-hidden bg-card/60 backdrop-blur-3xl group">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="border-none">
                <TableHead className="px-6 py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Official Name</TableHead>
                <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Department</TableHead>
                <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Role</TableHead>
                <TableHead className="py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest">Status</TableHead>
                <TableHead className="px-6 py-4 font-black text-muted-foreground uppercase text-[8px] tracking-widest text-right">Actions</TableHead>
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
              ) : filteredOfficials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[200px] text-center px-6">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center shadow-inner group/empty">
                         <Users className="w-8 h-8 text-muted-foreground/10" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-lg font-black text-foreground uppercase tracking-tight">No Results</p>
                      </div>
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedRole('all'); setSelectedDept('all'); }} className="rounded-lg font-black text-[9px] uppercase tracking-widest px-6 h-10 border-foreground/10 hover:border-primary/40 transition-all">Reset Filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOfficials.map((off) => (
                  <TableRow key={off.id} className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card shadow-soft border border-foreground/5 flex items-center justify-center font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all duration-700 relative overflow-hidden">
                          <span className="relative z-10">{off.first_name?.[0]}{off.last_name?.[0]}</span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{off.first_name} {off.last_name}</p>
                          <p className="text-[8px] font-black text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest opacity-40">
                            <Mail className="w-2.5 h-2.5 text-primary" />
                            {off.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground font-black text-[8px] uppercase tracking-widest bg-secondary/50 w-fit px-3 py-1.5 rounded-lg border border-foreground/5">
                        <Building2 className="w-3 h-3 text-primary opacity-40" />
                        <span className="truncate max-w-[120px]">{off.department?.name || 'Admin'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg px-2.5 py-1 border-none font-black uppercase text-[7px] tracking-widest ${
                        off.role === 'admin' ? 'bg-foreground text-background' :
                        off.role === 'hod' ? 'bg-primary/10 text-primary' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {off.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${off.is_active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/20'}`}></div>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${off.is_active !== false ? 'text-emerald-600' : 'text-muted-foreground'}`}>{off.is_active !== false ? 'Active' : 'Suspended'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-primary hover:text-white transition-all duration-700 active:scale-90 group/btn">
                                <MoreVertical className="w-4 h-4" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-48 p-1.5 shadow-strong bg-background/95 backdrop-blur-2xl border-none">
                             <DropdownMenuItem 
                                className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3 cursor-pointer"
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
                                <Edit className="w-3.5 h-3.5 mr-2 opacity-40" />
                                Edit Official
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-amber-600 focus:text-white px-3 cursor-pointer mt-0.5"
                                onClick={() => setConfirmResetId(off.id)}
                              >
                                <Key className="w-3.5 h-3.5 mr-2 opacity-40" />
                                Reset Password
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="my-1 bg-foreground/5" />
                             <DropdownMenuItem 
                                className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-destructive focus:text-white px-3 cursor-pointer text-destructive"
                                onClick={() => setConfirmDeleteId(off.id)}
                              >
                                <ShieldAlert className="w-3.5 h-3.5 mr-2" />
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

      {/* Confirmation Dialogs */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-strong bg-background/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">Revoke Access?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-muted-foreground">
              This will immediately suspend the official's system access. This action can be reversed by administrators later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { if(confirmDeleteId) handleDelete(confirmDeleteId); }}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black text-[9px] uppercase tracking-widest h-10"
            >
              Confirm Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmResetId} onOpenChange={(open) => !open && setConfirmResetId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-strong bg-background/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">Reset Access Key?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-muted-foreground">
              The official's password will be reset to the default: <span className="font-black text-primary">official123</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { if(confirmResetId) handleResetPassword(confirmResetId); }}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-widest h-10"
            >
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl p-0 overflow-hidden border-none shadow-strong bg-background">
          <div className={`${isEditOpen ? 'bg-amber-600' : 'bg-primary'} p-6 text-white relative`}>
            <div className="relative z-10 space-y-2">
               <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md">
                  {isEditOpen ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
               </div>
               <div className="space-y-0.5">
                  <DialogTitle className="text-lg font-black tracking-tighter uppercase leading-none">
                    {isEditOpen ? 'Update Staff' : 'Add New Staff'}
                  </DialogTitle>
                  <DialogDescription className="text-white/60 font-black text-[8px] uppercase tracking-widest mt-0.5 italic">
                    Fill in the staff details and assign roles.
                  </DialogDescription>
               </div>
            </div>
          </div>
          
          <form className="p-6 space-y-4" onSubmit={isEditOpen ? handleUpdate : async (e) => {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="First Name" 
                  className="h-10 rounded-lg bg-secondary/50 border-none font-bold text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="Last Name" 
                  className="h-10 rounded-lg bg-secondary/50 border-none font-bold text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>               
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  type="email" 
                  placeholder="name@university.edu" 
                  className="h-10 rounded-lg bg-secondary/50 border-none font-bold text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Staff Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-secondary/50 border-none font-black text-[9px] uppercase tracking-widest px-4 shadow-inner">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-strong p-1 bg-background/95 backdrop-blur-2xl">
                    <SelectItem value="hod" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">HOD</SelectItem>
                    <SelectItem value="department_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Dept Staff</SelectItem>
                    <SelectItem value="finance_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Finance</SelectItem>
                    <SelectItem value="library_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Library</SelectItem>
                    <SelectItem value="transport_officer" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Transport</SelectItem>
                    <SelectItem value="admin" className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({...formData, departmentId: val})}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-secondary/50 border-none font-black text-[9px] uppercase tracking-widest px-4 shadow-inner">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-strong p-1 bg-background/95 backdrop-blur-2xl max-h-[250px]">
                    <div className="px-3 py-1.5 text-[7px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 rounded-lg mb-1">Academic</div>
                    {departments.filter(d => d.type === 'academic').map((d: any) => (
                      <SelectItem key={d.id} value={d.id} className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">{d.name}</SelectItem>
                    ))}
                    <div className="px-3 py-1.5 text-[7px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 rounded-lg my-1">Operational</div>
                    {departments.filter(d => d.type !== 'academic').map((d: any) => (
                      <SelectItem key={d.id} value={d.id} className="rounded-lg h-10 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-3">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" className="h-10 rounded-lg font-black text-[9px] uppercase tracking-widest text-muted-foreground px-6 hover:bg-secondary transition-all" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className={`flex-1 rounded-xl h-11 font-black text-[9px] uppercase tracking-widest shadow-strong transition-all active:scale-95 ${isEditOpen ? 'bg-amber-600 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}>
                {isEditOpen ? 'Update Staff' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
