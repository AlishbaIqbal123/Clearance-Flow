import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone,
  GraduationCap,
  Download,
  Loader2,
  Trash2,
  Edit,
  Key,
  History,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
import { toast } from 'sonner';
import { adminService } from '@/lib/admin.service';

export const StudentList = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    registrationNumber: '',
    program: '',
    batch: '',
    departmentId: ''
  });
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStudents();
      if (res.success) {
        setStudents(res.data.students);
      }
      
      const deptRes = await adminService.getDepartments();
      if (deptRes.success) {
        setDepartments(deptRes.data.departments || []);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesDept = selectedDeptFilter === 'all' || s.department_id === selectedDeptFilter;
    
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student? This will remove all their clearance records.')) return;
    try {
      const res = await adminService.deleteStudent(id);
      if (res.success) {
        toast.success('Student deleted successfully');
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Reset student password to default (university123)?')) return;
    try {
      const res = await adminService.resetStudentPassword(id);
      if (res.success) {
        toast.success('Password reset successfully');
      }
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleResetAccount = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely reset this student's clearance account? This will delete all their current clearance progress and allow them to start fresh with their current department.")) return;
    try {
      const res = await adminService.resetStudent(id);
      if (res.success) {
        toast.success('Student account reset successfully');
        fetchStudents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset student account');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportStudents();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_registry.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Student registry exported successfully');
    } catch (error) {
      toast.error('Failed to export students');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminService.createStudent(formData);
      if (res.success) {
        toast.success('Student created successfully');
        setIsAddOpen(false);
        fetchStudents();
        setFormData({ firstName: '', lastName: '', email: '', registrationNumber: '', program: '', batch: '', departmentId: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create student');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminService.updateStudent(selectedStudent.id, formData);
      if (res.success) {
        toast.success('Student updated successfully');
        setIsEditOpen(false);
        fetchStudents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Student Registry</h2>
           <p className="text-slate-500 font-medium italic">Database of all university students and their clearance eligibility.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             variant="outline" 
             className="rounded-xl border-slate-200 h-11 px-6 font-bold text-slate-600"
             onClick={handleExport}
           >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
           </Button>
            <Button 
               className="rounded-xl bg-blue-600 text-white h-11 px-6 font-bold shadow-lg shadow-blue-100"
               onClick={() => setIsAddOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
           <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                 <Input 
                   placeholder="Search by registration number or name..." 
                   className="pl-12 h-12 rounded-2xl border-slate-200 bg-white font-medium"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <Select value={selectedDeptFilter} onValueChange={setSelectedDeptFilter}>
                <SelectTrigger className="rounded-xl h-12 w-[200px] font-bold text-slate-500 bg-white border border-slate-100 shadow-sm">
                   <Filter className="w-4 h-4 mr-2" />
                   <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                   <SelectItem value="all">All Departments</SelectItem>
                   {departments.filter(d => d.type === 'academic').map(dept => (
                     <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="p-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</TableHead>
                  <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Info</TableHead>
                  <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</TableHead>
                  <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance Status</TableHead>
                  <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</TableHead>
                  <TableHead className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight">{student.first_name} {student.last_name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.registration_number}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-700">{student.program}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch: {student.batch}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{student.department?.name || 'Unassigned'}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                         student.clearance_status === 'cleared' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                         student.clearance_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                         'bg-amber-50 text-amber-700 border-amber-100'
                       }`}>
                          {student.clearance_status || 'not_started'}
                       </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                             title={student.email}
                             onClick={() => student.email && window.open(`mailto:${student.email}?subject=Clearance%20Update%20-%20${student.registration_number}`)}
                           >
                              <Mail className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                             title={student.phone || 'No phone number'}
                             onClick={() => {
                               if (student.phone) {
                                 const clean = student.phone.replace(/\D/g, '');
                                 window.open(`https://wa.me/${clean}?text=Hello%20${encodeURIComponent(student.first_name)}%2C%20this%20is%20regarding%20your%20clearance%20application.`);
                               } else {
                                 toast.info(`${student.first_name} has not added a phone number yet.`);
                               }
                             }}
                           >
                              <Phone className="w-4 h-4" />
                           </Button>
                        </div>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm transition-all border border-transparent hover:border-slate-100">
                                <MoreVertical className="w-5 h-5 text-slate-400" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-2xl">
                             <DropdownMenuItem 
                                className="rounded-xl font-bold py-3"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setFormData({
                                    firstName: student.first_name,
                                    lastName: student.last_name,
                                    email: student.email,
                                    registrationNumber: student.registration_number,
                                    program: student.program,
                                    batch: student.batch,
                                    departmentId: student.department_id
                                  });
                                  setIsEditOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2 text-slate-400" />
                                Edit Student Profile
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                 className="rounded-xl font-bold py-3"
                                 onClick={() => {
                                   setSelectedStudent(student);
                                   setIsViewOpen(true);
                                 }}
                               >
                                 <History className="w-4 h-4 mr-2 text-slate-400" />
                                 View Full Details
                              </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem 
                                className="rounded-xl font-bold py-3 text-amber-600"
                                onClick={() => handleResetPassword(student.id)}
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Reset Password
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="rounded-xl font-bold py-3 text-orange-600"
                                onClick={() => handleResetAccount(student.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset Account
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="rounded-xl font-bold py-3 text-red-600"
                                onClick={() => handleDelete(student.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Student
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredStudents.length === 0 && !loading && (
                  <TableRow>
                     <TableCell colSpan={5} className="h-64 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No Students Found</p>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className={`${isEditOpen ? 'bg-amber-500' : 'bg-blue-600'} p-10 text-white relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {isEditOpen ? 'Edit Student' : 'Onboard Student'}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium mt-2 text-lg">
              {isEditOpen ? 'Modify existing student credentials and information.' : 'Register a new student into the clearance system.'}
            </DialogDescription>
          </div>
          
          <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">First Name</Label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="John"
                  className="rounded-2xl h-12 border-slate-200 focus:ring-blue-600"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Last Name</Label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="Doe"
                  className="rounded-2xl h-12 border-slate-200 focus:ring-blue-600"
                  required 
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">University Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="john.doe@university.edu"
                    className="pl-12 rounded-2xl h-12 border-slate-200 focus:ring-blue-600"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registration No.</Label>
                <Input 
                  value={formData.registrationNumber} 
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} 
                  placeholder="FA20-BCS-050"
                  className="rounded-2xl h-12 border-slate-200 focus:ring-blue-600 uppercase"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Department</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({...formData, departmentId: val})}
                >
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200">
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {departments
                      .filter(dept => dept.type === 'academic')
                      .map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Program</Label>
                <Input 
                  value={formData.program} 
                  onChange={(e) => setFormData({...formData, program: e.target.value})} 
                  placeholder="BS Computer Science"
                  className="rounded-2xl h-12 border-slate-200 focus:ring-blue-600"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Batch Year</Label>
                <Input 
                  value={formData.batch} 
                  onChange={(e) => setFormData({...formData, batch: e.target.value})} 
                  placeholder="2020"
                  className="rounded-2xl h-12 border-slate-200 focus:ring-blue-600"
                  required 
                />
              </div>
            </div>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" className="rounded-2xl h-14 font-black text-slate-400 px-8" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className={`rounded-2xl h-14 font-black px-10 shadow-xl ${isEditOpen ? 'bg-amber-600 shadow-amber-100' : 'bg-slate-900 shadow-slate-200'}`}>
                {isEditOpen ? 'Save Changes' : 'Register Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* View Student Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full -mr-24 -mt-24 blur-3xl" />
            <DialogTitle className="text-3xl font-black tracking-tighter">Student Profile</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-2">
              Full academic and clearance information.
            </DialogDescription>
          </div>
          {selectedStudent && (
            <div className="p-10 space-y-5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600">
                  {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedStudent.registration_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Email', selectedStudent.email], ['Phone', selectedStudent.phone || 'Not provided'], ['Program', selectedStudent.program], ['Batch', selectedStudent.batch], ['Status', selectedStudent.clearance_status || 'not_started']].map(([label, value]) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-bold text-slate-800 break-words">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-11 font-bold gap-2"
                  onClick={() => selectedStudent.email && window.open(`mailto:${selectedStudent.email}?subject=Clearance%20Update`)}
                >
                  <Mail className="w-4 h-4" /> Email Student
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl h-11 font-bold gap-2 text-white"
                  onClick={() => {
                    if (selectedStudent.phone) {
                      const clean = selectedStudent.phone.replace(/\D/g, '');
                      window.open(`https://wa.me/${clean}`);
                    } else {
                      alert('No phone number on file for this student.');
                    }
                  }}
                >
                  <Phone className="w-4 h-4" /> WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
