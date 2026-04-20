import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Mail, Shield, Building, Filter, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
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
    if (!window.confirm('Are you sure you want to delete this official?')) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        toast.success('Official deleted successfully');
        setOfficials(prev => prev.filter(o => o.id !== id));
      }
    } catch (e) {
      toast.error('Failed to delete official');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminService.updateUser(selectedOfficial.id, formData);
      if (res.success) {
        toast.success('Official updated successfully');
        setIsEditOpen(false);
        fetchOfficials();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update official');
    }
  };

  const filteredOfficials = officials.filter(off => 
    off.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">University Officials</h2>
          <p className="text-slate-500 font-medium">Manage faculty, staff, and administrative roles</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl shadow-lg shadow-blue-100 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => {
            setFormData({ firstName: '', lastName: '', email: '', role: 'staff', departmentId: '' });
            setIsAddOpen(true);
          }}
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Official
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, email or department..." 
                className="pl-10 h-11 bg-slate-50 border-slate-100 rounded-xl focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl h-11 border-slate-200">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="px-8 py-4 font-bold text-slate-600">Official</TableHead>
                <TableHead className="font-bold text-slate-600">Department</TableHead>
                <TableHead className="font-bold text-slate-600">Role</TableHead>
                <TableHead className="font-bold text-slate-600">Status</TableHead>
                <TableHead className="px-8 font-bold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={5} className="h-16 bg-slate-50/20"></TableCell>
                  </TableRow>
                ))
              ) : filteredOfficials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No officials found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOfficials.map((off) => (
                  <TableRow key={off.id} className="group hover:bg-blue-50/30 transition-colors border-slate-50">
                    <TableCell className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-100">
                          {off.first_name?.[0]}{off.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 transition-colors group-hover:text-blue-600">{off.first_name} {off.last_name}</p>
                          <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-300" />
                            {off.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">{off.department?.name || 'Administrative'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg px-2.5 py-0.5 border-none font-bold uppercase text-[10px] tracking-wider ${
                        off.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                        off.role === 'hod' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {off.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {off.is_active !== false ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">Active</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Inactive</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
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
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm hover:text-red-600"
                          onClick={() => handleDelete(off.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className={`${isEditOpen ? 'bg-amber-500' : 'bg-blue-600'} p-8 text-white relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <DialogTitle className="text-2xl font-black tracking-tight">
              {isEditOpen ? 'Edit Official' : 'Add Official'}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium mt-1">
              {isEditOpen ? 'Update official details and role permissions.' : 'Onboard a new faculty or staff member with system access.'}
            </DialogDescription>
          </div>
          <form className="p-8 space-y-4" onSubmit={isEditOpen ? handleUpdate : async (e) => {
            e.preventDefault();
            try {
              const res = await adminService.createUser({ ...formData, password: 'official123' });
              if (res.success) {
                toast.success('Official added successfully');
                setIsAddOpen(false);
                fetchOfficials();
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to add official');
            }
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">First Name</Label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="Jane" 
                  className="rounded-xl" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Last Name</Label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="Smith" 
                  className="rounded-xl" 
                  required 
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Official Email</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  type="email" 
                  placeholder="jane.smith@univ.edu" 
                  className="rounded-xl" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">System Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="hod">HOD / Head</SelectItem>
                    <SelectItem value="department_officer">Department Staff</SelectItem>
                    <SelectItem value="finance_officer">Finance Officer</SelectItem>
                    <SelectItem value="library_officer">Library Officer</SelectItem>
                    <SelectItem value="transport_officer">Transport Officer</SelectItem>
                    <SelectItem value="admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Department</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({...formData, departmentId: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-md mb-1">Academic Departments</div>
                    {departments.filter(d => d.type === 'academic').map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-md my-1">Administrative & Services</div>
                    {departments.filter(d => d.type !== 'academic').map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" className="rounded-xl h-12" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
              <Button type="submit" className={`w-full h-12 rounded-xl font-bold ${isEditOpen ? 'bg-amber-600' : 'bg-slate-900'}`}>
                {isEditOpen ? 'Save Changes' : 'Onboard Official'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
