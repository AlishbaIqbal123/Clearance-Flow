// UI ONLY — NO LOGIC CHANGED
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
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Activity,
  Globe,
  Database,
  UserPlus,
  Trash,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  UserCircle
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { studentService } from '@/lib/student.service';
import { departmentService } from '@/lib/department.service';
import { adminService } from '@/lib/admin.service';
import { StatusBadge } from './StatusBadge';

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
      toast.error('Failed to load student list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (s.registration_number?.toLowerCase() || '').includes(searchLower) ||
      (s.first_name?.toLowerCase() || '').includes(searchLower) ||
      (s.last_name?.toLowerCase() || '').includes(searchLower) ||
      (s.email?.toLowerCase() || '').includes(searchLower) ||
      (s.program?.toLowerCase() || '').includes(searchLower) ||
      (s.batch?.toString() || '').includes(searchLower);
    
    const matchesDept = selectedDeptFilter === 'all' || s.department_id === selectedDeptFilter;
    
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student? This will remove all their clearance records.')) return;
    try {
      const res = await adminService.deleteStudent(id);
      if (res.success) {
        toast.success('Identity removed from registry');
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete student identity');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Reset student password to default (university123)?')) return;
    try {
      const res = await adminService.resetStudentPassword(id);
      if (res.success) {
        toast.success('Access key reset successful');
      }
    } catch (error) {
      toast.error('Failed to reset access key');
    }
  };

  const handleResetAccount = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely reset this student's clearance account? This will delete all their current clearance progress and allow them to start fresh with their current department.")) return;
    try {
      const res = await adminService.resetStudent(id);
      if (res.success) {
        toast.success('Identity cycle reset successful');
        fetchStudents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset student sequence');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportStudents();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_list.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Registry archive exported successfully');
    } catch (error) {
      toast.error('Failed to export registry archive');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminService.createStudent(formData);
      if (res.success) {
        toast.success('Identity enrolled successfully');
        setIsAddOpen(false);
        fetchStudents();
        setFormData({ firstName: '', lastName: '', email: '', registrationNumber: '', program: '', batch: '', departmentId: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminService.updateStudent(selectedStudent.id, formData);
      if (res.success) {
        toast.success('Identity profile updated successfully');
        setIsEditOpen(false);
        fetchStudents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
       {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <Users className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">Student List</Badge>
                 </div>
                 <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none">Manage Students</h2>
              </div>
           </div>
           <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl leading-relaxed italic">
             View and manage all student profiles, registration details, and clearance progress.
           </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-2 rounded-2xl border border-foreground/5 backdrop-blur-md shadow-soft w-full lg:w-auto">
           <Button 
             variant="ghost" 
             className="flex-1 lg:flex-none rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-card hover:text-primary transition-all duration-500 active:scale-95"
             onClick={handleExport}
           >
              <Download className="w-4 h-4 mr-2 opacity-50" />
              Export
           </Button>
            <Button 
               className="flex-1 lg:flex-none rounded-xl bg-primary text-white hover:bg-primary/90 h-14 px-8 font-black text-[10px] uppercase tracking-widest shadow-strong shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all group/btn relative overflow-hidden"
               onClick={() => setIsAddOpen(true)}
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
              <span>Add Student</span>
            </Button>
        </div>
      </div>

      {/* Student List Section */}
       <Card className="border-none shadow-strong rounded-[2rem] bg-card/60 backdrop-blur-3xl overflow-hidden group">
        <CardHeader className="p-6 sm:p-8 pb-6 border-b border-foreground/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-[60px]" />
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="relative group flex-1">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                 <Input 
                   placeholder="Search students..." 
                   className="pl-12 h-14 w-full border-none bg-secondary/50 rounded-xl text-base font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <Select value={selectedDeptFilter} onValueChange={setSelectedDeptFilter}>
                <SelectTrigger className="rounded-xl h-14 w-full lg:w-[280px] font-black text-[9px] uppercase tracking-widest px-6 bg-secondary/50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all">
                   <div className="flex items-center gap-3">
                      <Filter className="w-4 h-4 text-primary opacity-40" />
                      <SelectValue placeholder="All Departments" />
                   </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl">
                   <SelectItem value="all" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">All Departments</SelectItem>
                   {departments.filter(d => d.type === 'academic').map(dept => (
                     <SelectItem key={dept.id} value={dept.id} className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">{dept.name}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
           </div>
         </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-muted/10">
                <TableRow className="border-none">
                  <TableHead className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student Info</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Program</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Department</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Contact</TableHead>
                  <TableHead className="px-8 py-5 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center gap-8">
                        <div className="relative">
                           <Loader2 className="w-16 h-16 text-primary animate-spin" />
                           <div className="absolute inset-0 w-16 h-16 border-4 border-primary/10 rounded-full" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Synchronizing Registry...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer">
                      <TableCell className="px-8 py-5" onClick={() => { setSelectedStudent(student); setIsViewOpen(true); }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-card shadow-soft border border-foreground/5 flex items-center justify-center font-black text-primary text-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10">{student.first_name[0]}{student.last_name[0]}</span>
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{student.first_name} {student.last_name}</h4>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{student.registration_number}</p>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-primary opacity-40" />
                              {student.program}
                            </p>
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest pl-5.5 opacity-40">Batch: {student.batch}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground font-black text-[9px] uppercase tracking-widest bg-secondary/50 w-fit px-3 py-1.5 rounded-xl border border-foreground/5 group-hover:border-primary/20 transition-all">
                            <Building2 className="w-3 h-3 text-primary opacity-40" />
                            <span className="truncate max-w-[120px]">{student.department?.name || 'Pending'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.clearance_status || 'not_started'} />
                      </TableCell>
                      <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-10 h-10 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-90"
                              onClick={() => student.email && window.open(`mailto:${student.email}`)}
                            >
                                <Mail className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-10 h-10 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-90"
                              onClick={() => {
                                if (student.phone) {
                                  const clean = student.phone.replace(/\D/g, '');
                                  window.open(`https://wa.me/${clean}`);
                                } else {
                                  toast.info('No phone number');
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
                              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-card hover:shadow-strong transition-all duration-500 active:scale-90 border border-transparent hover:border-foreground/5">
                                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-strong bg-background/95 backdrop-blur-2xl border-none animate-in zoom-in-95 duration-300">
                              <DropdownMenuItem 
                                className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer"
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
                                <Edit className="w-4 h-4 mr-3 opacity-40" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                  className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer mt-1"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setIsViewOpen(true);
                                  }}
                                >
                                  <History className="w-4 h-4 mr-3 opacity-40" />
                                  View History
                                </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-foreground/5" />
                              <DropdownMenuItem 
                                className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer text-amber-600"
                                onClick={() => handleResetPassword(student.id)}
                              >
                                <Key className="w-4 h-4 mr-3 opacity-40" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-destructive focus:text-white px-4 cursor-pointer text-destructive"
                                onClick={() => handleDelete(student.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-96 text-center">
                          <div className="flex flex-col items-center justify-center gap-10">
                            <div className="w-36 h-36 bg-muted/10 rounded-[4rem] flex items-center justify-center shadow-inner group/empty relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/empty:opacity-100 transition-opacity" />
                                <Users className="w-16 h-16 text-muted-foreground/10 group-hover:text-primary/20 transition-all duration-1000" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-3xl font-black text-foreground uppercase tracking-tight leading-none">Registry Null</p>
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">No identities matched the current filter sequence.</p>
                            </div>
                            <Button 
                              variant="outline" 
                              className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] px-12 h-16 border-foreground/10 hover:border-primary/40 hover:text-primary transition-all active:scale-95" 
                              onClick={() => { setSearch(''); setSelectedDeptFilter('all'); }}
                            >
                              Reset Registry Filter
                            </Button>
                          </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enroll/Edit Identity Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => !open && (setIsAddOpen(false), setIsEditOpen(false))}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500">
          <div className={`${isEditOpen ? 'bg-amber-600' : 'bg-primary'} p-6 sm:p-10 text-white relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-[80px]" />
            <div className="relative z-10 space-y-4">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  {isEditOpen ? <Edit className="w-5 h-5 sm:w-6 sm:h-6" /> : <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />}
               </div>
               <div className="space-y-1">
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">
                    {isEditOpen ? 'Update Student' : 'Add New Student'}
                  </DialogTitle>
                  <DialogDescription className="text-white/60 font-black text-[8px] sm:text-[9px] uppercase tracking-widest mt-1 italic">
                    Fill in the student details to create or update a profile.
                  </DialogDescription>
               </div>
            </div>
          </div>
          <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="p-6 sm:p-10 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="e.g., Alishba"
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="e.g., Iqbal"
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="name@university.edu"
                    className="pl-14 h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registration #</Label>
                <Input 
                  value={formData.registrationNumber} 
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} 
                  placeholder="e.g., BCS-XXX"
                  className="h-12 rounded-xl bg-secondary/50 border-none font-black text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner uppercase tracking-wider"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({...formData, departmentId: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-black text-[9px] uppercase tracking-widest px-6 shadow-inner focus:ring-4 focus:ring-primary/10 transition-all">
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl">
                    {departments
                      .filter(dept => dept.type === 'academic')
                      .map(dept => (
                        <SelectItem key={dept.id} value={dept.id} className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4">{dept.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Program</Label>
                <Input 
                  value={formData.program} 
                  onChange={(e) => setFormData({...formData, program: e.target.value})} 
                  placeholder="e.g., Computer Science"
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Batch</Label>
                <Input 
                  value={formData.batch} 
                  onChange={(e) => setFormData({...formData, batch: e.target.value})} 
                  placeholder="e.g., 2024"
                  className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-base px-6 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                  required 
                />
              </div>
            </div>
            
            <DialogFooter className="pt-6 gap-4">
              <Button type="button" variant="ghost" className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground px-8 hover:bg-secondary transition-all" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className={`flex-1 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest shadow-strong transition-all active:scale-95 relative overflow-hidden ${isEditOpen ? 'bg-amber-600 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}>
                {isEditOpen ? 'Update Student' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Student Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500">
          <div className="bg-foreground p-8 sm:p-10 text-background relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
            
            <div className="relative z-10 space-y-6 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-white/5 rounded-[2rem] backdrop-blur-3xl flex items-center justify-center border border-white/10 shadow-2xl relative">
                  <span className="text-4xl font-black text-primary relative z-10 tracking-tighter">{selectedStudent?.first_name?.[0]}{selectedStudent?.last_name?.[0]}</span>
               </div>
               <div className="space-y-2">
                  <DialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">{selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
                  <p className="text-background/40 font-black text-[10px] uppercase tracking-widest">ID: {selectedStudent?.registration_number}</p>
               </div>
               <div className="flex items-center gap-3">
                  <StatusBadge status={selectedStudent?.clearance_status || 'not_started'} size="lg" />
               </div>
            </div>
          </div>
          {selectedStudent && (
             <div className="p-6 sm:p-10 space-y-8 bg-card/40 backdrop-blur-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Email Address', value: selectedStudent.email, icon: Mail },
                  { label: 'Contact Number', value: selectedStudent.phone || 'N/A', icon: Phone },
                  { label: 'Academic Program', value: selectedStudent.program, icon: GraduationCap },
                  { label: 'Batch', value: selectedStudent.batch, icon: History },
                  { label: 'Department', value: selectedStudent.department?.name || 'Unassigned', icon: Building2, full: true }
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 bg-secondary/50 rounded-2xl border border-foreground/5 space-y-2 group hover:bg-secondary transition-all duration-500 ${item.full ? 'col-span-2' : ''}`}>
                    <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                       <item.icon className="w-3.5 h-3.5" />
                       <p className="text-[8px] font-black uppercase tracking-widest">{item.label}</p>
                    </div>
                    <p className="text-sm font-black text-foreground tracking-tight break-all uppercase">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest shadow-strong shadow-primary/20 transition-all active:scale-95 gap-3 group/btn overflow-hidden relative"
                  onClick={() => selectedStudent.email && window.open(`mailto:${selectedStudent.email}`)}
                >
                  <Mail className="w-4 h-4" /> 
                  Email Student
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest border-foreground/10 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all active:scale-95 gap-3 group/btn"
                  onClick={() => {
                    if (selectedStudent.phone) {
                      const clean = selectedStudent.phone.replace(/\D/g, '');
                      window.open(`https://wa.me/${clean}`);
                    } else {
                      toast.error('No phone number available');
                    }
                  }}
                >
                  <Phone className="w-4 h-4" /> 
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
