// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import { 
  Loader2, User, Mail, Lock, BookOpen, Hash, 
  GraduationCap, Phone, ArrowLeft, ChevronLeft, 
  CheckCircle2, Sparkles, Building2, Zap, ArrowRight, 
  ShieldCheck, Fingerprint, Database, Globe, Layers,
  Activity, ShieldAlert, X, UserCircle, Search, Filter,
  ChevronRight,
  Monitor,
  Terminal,
  Cpu
} from 'lucide-react';
import { authService } from '@/lib/auth.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface RegisterProps {
  onBackToLogin: () => void;
  onBackToHome: () => void;
  onRegisterSuccess: (userData: any) => void;
}

export const Register: React.FC<RegisterProps> = ({ onBackToLogin, onBackToHome, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [fetchingDepts, setFetchingDepts] = useState(true);

  const PROGRAM_DISCIPLINE_MAP = {
    'Undergraduate Programs (BS)': [
      'BS Computer Science',
      'BS Software Engineering',
      'BS Business Administration (BBA)',
      'BS Accounting and Finance',
      'BS Environmental Sciences',
      'BS Biotechnology',
      'BS Economics',
      'BS English',
      'BS Media and Communication Studies',
      'BS Mathematics'
    ],
    'Graduate Programs (MS/MBA)': [
      'MS Computer Science',
      'MS Management Sciences',
      'MBA (2 Years)',
      'MS Environmental Sciences',
      'MS Economics',
      'MS English (Linguistics)',
      'MS Mathematics'
    ],
    'Doctoral Programs (PhD)': [
      'PhD Management Sciences',
      'PhD Environmental Sciences',
      'PhD Economics',
      'PhD English (Linguistics)',
      'PhD Mathematics'
    ]
  };

  const DISCIPLINE_DEPT_MAP: Record<string, string> = {
    'BS Computer Science': 'Computer Science',
    'BS Software Engineering': 'Software Engineering',
    'MS Computer Science': 'Computer Science',
    'BS Business Administration (BBA)': 'Management Sciences',
    'BS Accounting and Finance': 'Management Sciences',
    'MS Management Sciences': 'Management Sciences',
    'MBA (2 Years)': 'Management Sciences',
    'PhD Management Sciences': 'Management Sciences',
    'BS Environmental Sciences': 'Environmental Sciences',
    'BS Biotechnology': 'Biotechnology',
    'MS Environmental Sciences': 'Environmental Sciences',
    'PhD Environmental Sciences': 'Environmental Sciences',
    'BS Economics': 'Economics',
    'MS Economics': 'Economics',
    'PhD Economics': 'Economics',
    'BS English': 'Humanities',
    'BS Media and Communication Studies': 'Humanities',
    'MS English (Linguistics)': 'Humanities',
    'PhD English (Linguistics)': 'Humanities',
    'BS Mathematics': 'Mathematics',
    'MS Mathematics': 'Mathematics',
    'PhD Mathematics': 'Mathematics'
  };

  const getAvailableDisciplines = () => {
    if (!formData.program) return [];
    return PROGRAM_DISCIPLINE_MAP[formData.program as keyof typeof PROGRAM_DISCIPLINE_MAP] || [];
  };
  
  const [formData, setFormData] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    program: '',
    discipline: '',
    batch: '',
    phone: ''
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        if (data.success) {
          setDepartments(data.data.filter((d: any) => d.type === 'academic'));
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setFetchingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, discipline: '' }));
  }, [formData.program]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const deptName = DISCIPLINE_DEPT_MAP[formData.discipline];
    const dept = departments.find(d => d.name === deptName);
    if (!dept) {
      return toast.error('Could not map department for selected discipline');
    }
    const submissionData = { ...formData, departmentId: dept.id };
    setLoading(true);
    try {
      const res = await authService.studentSignup(submissionData);
      if (res.success) {
        toast.success('Registration successful!');
        onRegisterSuccess(res.user);
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background font-sans selection:bg-primary/20">
      
      {/* Editorial Left Architecture (Fixed) */}
      <div className="hidden lg:flex w-[30%] xl:w-[35%] h-full bg-[#006633] relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-black/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[160px] -mr-80 -mt-80 animate-pulse" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBackToHome}
              className="flex items-center gap-3 text-white/40 hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.4em] group w-fit"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Home
            </button>
            <button 
              onClick={onBackToLogin}
              className="flex items-center gap-3 text-white/60 hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.4em] group w-fit"
            >
              Portal
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20">
                  <GraduationCap className="w-7 h-7 text-white" />
               </div>
               <div className="space-y-0.5">
                  <h2 className="text-lg font-black tracking-tighter uppercase leading-none">CUI Vehari</h2>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-60 italic">Clearance System</p>
               </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.8] uppercase opacity-90">
                Student<br />
                <span className="text-white/20 italic">Registry</span>
              </h2>
              <p className="text-white/70 text-sm xl:text-base font-medium leading-relaxed max-w-xs italic border-l-2 border-white/20 pl-6">
                Official enrollment node for the Clearance Hub.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/5">
           <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 transition-all duration-700 group-hover:bg-primary shadow-2xl">
                 <ShieldCheck className="w-5 h-5 text-white/40 group-hover:text-white" />
              </div>
              <div className="space-y-0.5">
                 <h4 className="text-white font-bold text-xs uppercase tracking-tight leading-none">Secured Matrix</h4>
                 <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em] mt-0.5">V2.0.4</p>
              </div>
           </div>
        </div>
      </div>

      {/* Dynamic Right Interface (Scrollable Form) */}
      <div className="flex-1 h-full overflow-y-auto bg-background custom-scrollbar">
        <div className="min-h-full w-full flex flex-col p-8 md:p-12 xl:p-20">
          <div className="max-w-3xl w-full mx-auto space-y-8 py-8">
            <div className="space-y-4">
               <h1 className="text-4xl xl:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">Account<br /><span className="text-primary italic">Registration</span></h1>
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.3em] opacity-40">System Enrollment Protocol Active</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-5 duration-1000">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 
                 {/* Personal Info */}
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">First Name</label>
                    <Input required name="firstName" value={formData.firstName} onChange={handleChange} className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
                 </div>
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Last Name</label>
                    <Input required name="lastName" value={formData.lastName} onChange={handleChange} className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
                 </div>

                 {/* Contact Info */}
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Email Address</label>
                    <Input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
                 </div>
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Phone Number</label>
                    <Input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 ..." className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
                 </div>

                 {/* Academic Info */}
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Registration ID</label>
                    <Input required name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="FA21-BCS-001" className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 uppercase" />
                 </div>
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Batch</label>
                    <Input required name="batch" value={formData.batch} onChange={handleChange} placeholder="FA21" className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 uppercase" />
                 </div>

                 {/* Program Selection */}
                 <div className="space-y-1.5 relative group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Track</label>
                    <select required name="program" value={formData.program} onChange={handleChange} className="h-11 w-full bg-secondary/30 border-none rounded-lg font-bold px-5 appearance-none text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
                      <option value="" className="bg-background">Select Track</option>
                      {Object.keys(PROGRAM_DISCIPLINE_MAP).map(prog => (
                        <option key={prog} value={prog} className="bg-background">{prog}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-1.5 relative group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Discipline</label>
                    <select required name="discipline" value={formData.discipline} onChange={handleChange} disabled={!formData.program} className="h-11 w-full bg-secondary/30 border-none rounded-lg font-bold px-5 appearance-none text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer disabled:opacity-40">
                      <option value="" className="bg-background">Select Discipline</option>
                      {getAvailableDisciplines().map(disc => (
                        <option key={disc} value={disc} className="bg-background">{disc}</option>
                      ))}
                    </select>
                 </div>

                 {/* Password Stack */}
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Password</label>
                    <Input required type="password" name="password" value={formData.password} onChange={handleChange} className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
                 </div>
                 <div className="space-y-1.5 group">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Verify</label>
                    <Input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="h-11 bg-secondary/30 border-none rounded-lg font-bold px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
                 </div>
              </div>

              {/* Action Stack */}
              <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                <Button 
                  disabled={loading}
                  type="submit"
                  className="w-full sm:w-fit h-14 px-12 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-xl shadow-strong shadow-primary/20 active:scale-95 transition-all group overflow-hidden relative"
                >
                  {loading ? (
                     <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Syncing...</span>
                     </div>
                  ) : (
                     <span className="flex items-center gap-4">
                        Establish Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-700" />
                     </span>
                  )}
                </Button>
                <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic text-center sm:text-left leading-relaxed">
                  Institutional data protection protocol active.<br />All transactions encrypted.
                </p>
              </div>
            </form>

            <div className="pt-8 border-t border-foreground/5 text-center sm:text-left">
               <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.3em]">
                  Already registered? <button onClick={onBackToLogin} className="text-primary hover:underline ml-2 underline-offset-4">Sign In</button>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
