// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Hash, 
  GraduationCap, 
  Check, 
  Copy, 
  MessageSquare, 
  Sparkles, 
  Building2, 
  Zap, 
  ShieldCheck,
  Moon,
  Sun,
  Shield,
  ArrowRight,
  Globe,
  Activity,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { authService } from '@/lib/auth.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
  onRegisterClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onRegisterClick }) => {
  const [activePortal, setActivePortal] = useState<'student' | 'staff'>('student');
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !studentPassword) return toast.error('Please fill in all fields');
    const normalizedId = studentId.trim().toUpperCase();
    setLoading(true);
    try {
      const response = await authService.studentLogin({ 
        registrationNumber: normalizedId, 
        password: studentPassword 
      });
      if (response.success) {
        toast.success(`Welcome, ${response.data.user.first_name || 'Student'}`);
        onLoginSuccess(response.data.user);
      } else {
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const response = await authService.login({ email: staffEmail, password: staffPassword });
      if (response.success) {
        toast.success(`Welcome, ${response.data.user.first_name || 'Official'}`);
        onLoginSuccess(response.data.user);
      } else {
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('admin@university.edu.pk');
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background transition-colors duration-1000">
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-[100] w-14 h-14 rounded-2xl bg-card/60 backdrop-blur-3xl border border-foreground/5 text-foreground hover:bg-primary hover:text-white transition-all duration-500 active:scale-90 shadow-strong flex items-center justify-center group"
      >
        {isDark ? <Sun className="w-6 h-6 group-hover:rotate-90 transition-transform duration-700" /> : <Moon className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-700" />}
      </button>

      <div className="h-full w-full flex">
        {activePortal === 'student' ? (
          <div className="h-full w-full flex animate-in fade-in duration-700">
            {/* Left: Design Area (for Student) */}
            <div className="hidden lg:flex w-[50%] h-full bg-[#006633] relative overflow-hidden flex-col justify-center p-20 xl:p-32">
               <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-black/20" />
               <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
               <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px]" />
               
               <div className="relative z-10 space-y-12">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20">
                        <GraduationCap className="w-10 h-10 text-white" />
                     </div>
                     <div className="space-y-0.5 text-white">
                        <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">COMSATS</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60 italic">University Islamabad</p>
                     </div>
                  </div>

                  <div className="space-y-8">
                    <h2 className="text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                       Student<br />
                       <span className="italic opacity-40">Portal</span>
                    </h2>
                    <p className="text-white/70 text-xl xl:text-2xl font-medium leading-relaxed max-w-lg border-l-4 border-white/20 pl-8">
                      A centralized digital environment for student clearance, academic tracking, and department approval.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                     <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Secure Login</span>
                     </div>
                     <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3">
                        <Globe className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Online System</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Form Area (for Student) */}
            <div className="flex-1 h-full bg-background overflow-y-auto custom-scrollbar relative">
               <div className="min-h-full w-full flex flex-col justify-center p-8 md:p-12 lg:p-24 xl:p-32">
                  <div className="max-w-md w-full mx-auto space-y-12 py-12">
                  <div className="space-y-8">
                    <div className="inline-flex p-1.5 bg-secondary/30 backdrop-blur-3xl rounded-[2rem] gap-1 border border-foreground/5 w-fit">
                      <button 
                        onClick={() => setActivePortal('student')}
                        className="px-10 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 bg-primary text-white shadow-strong"
                      >
                        Student
                      </button>
                      <button 
                        onClick={() => setActivePortal('staff')}
                        className="px-10 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 text-muted-foreground hover:text-primary hover:bg-background/80"
                      >
                        Faculty
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                       <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase leading-[1]">Welcome<br /><span className="text-primary italic">Back</span></h1>
                       <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">Please log in to your account.</p>
                    </div>
                  </div>

                  <form onSubmit={handleStudentLogin} className="space-y-8">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Registration Number</label>
                      <div className="relative">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          placeholder="FA21-BCS-000" 
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="h-16 pl-16 bg-secondary/30 border-none rounded-[1.25rem] font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base placeholder:text-muted-foreground/10 uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] group-focus-within:text-primary transition-colors">Password</label>
                        <button 
                          type="button"
                          onClick={() => setShowForgotDialog(true)}
                          className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-all italic underline underline-offset-4"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          type="password"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="h-16 pl-16 bg-secondary/30 border-none rounded-[1.25rem] font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base placeholder:text-muted-foreground/10"
                        />
                      </div>
                    </div>
                    
                    <Button disabled={loading} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] shadow-strong shadow-primary/20 transition-all active:scale-95 group/btn overflow-hidden relative">
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                      {loading ? (
                         <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Signing In...</span>
                         </div>
                      ) : (
                         <div className="flex items-center gap-3">
                            <span>Sign In</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                         </div>
                      )}
                    </Button>
                  </form>

                  <div className="pt-8 border-t border-foreground/5 text-center space-y-4">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
                      New student? <button onClick={onRegisterClick} className="text-primary hover:underline ml-2 underline-offset-4">Create account</button>
                    </p>
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em]">
                      System Build: V2.0.4 - LIVE
                    </div>
                  </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex animate-in fade-in duration-700 bg-background">
            {/* Left: Form Area (for Faculty) */}
            <div className="flex-1 h-full bg-background overflow-y-auto custom-scrollbar relative">
               <div className="min-h-full w-full flex flex-col justify-center p-8 md:p-12 lg:p-24 xl:p-32">
                  <div className="max-w-md w-full mx-auto space-y-12 py-12">
                  <div className="space-y-8">
                    <div className="inline-flex p-1.5 bg-secondary/30 backdrop-blur-3xl rounded-[2rem] gap-1 border border-foreground/5 w-fit">
                      <button 
                        onClick={() => setActivePortal('student')}
                        className="px-10 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 text-muted-foreground hover:text-primary hover:bg-background/80"
                      >
                        Student
                      </button>
                      <button 
                        onClick={() => setActivePortal('staff')}
                        className="px-10 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 bg-foreground text-background shadow-strong"
                      >
                        Faculty
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                       <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase leading-[1]">Faculty<br /><span className="text-primary italic">Login</span></h1>
                       <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">Administrative access required.</p>
                    </div>
                  </div>

                  <form onSubmit={handleStaffLogin} className="space-y-8">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">University Email</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          type="email" 
                          placeholder="name@university.edu.pk" 
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          className="h-16 pl-16 bg-secondary/30 border-none rounded-[1.25rem] font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base placeholder:text-muted-foreground/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 group">
                      <div className="flex justify-between items-center px-2">
                         <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] group-focus-within:text-primary transition-colors">Password</label>
                         <ShieldAlert className="w-4 h-4 text-primary opacity-40" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          className="h-16 pl-16 bg-secondary/30 border-none rounded-[1.25rem] font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base placeholder:text-muted-foreground/10"
                        />
                      </div>
                    </div>
                    <Button disabled={loading} className="w-full h-20 bg-foreground hover:opacity-90 text-background rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] shadow-strong transition-all active:scale-95 group/btn overflow-hidden relative">
                       <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                       {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                  
                  <div className="flex items-center justify-center gap-10 pt-8 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
                     <Globe className="w-6 h-6" />
                     <ShieldCheck className="w-6 h-6" />
                     <Activity className="w-6 h-6" />
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Design Area (for Faculty) */}
            <div className="hidden lg:flex w-[50%] h-full bg-[#1e293b] relative overflow-hidden flex-col justify-center p-20 xl:p-32 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                
                <div className="relative z-10 space-y-12">
                   <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-primary/30 shadow-2xl">
                      <Building2 className="w-9 h-9 text-primary" />
                   </div>
                   <div className="space-y-8">
                     <h2 className="text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">Faculty<br /><span className="italic opacity-20">Portal</span></h2>
                     <p className="text-slate-400 text-xl xl:text-2xl font-medium leading-relaxed max-w-sm italic border-l-4 border-primary/20 pl-8">
                       Manage student clearance requests and department records from a central dashboard.
                     </p>
                   </div>
                </div>

                <div className="relative z-10 space-y-8 mt-20">
                   <div className="flex items-center gap-4 text-slate-500 font-black text-[11px] uppercase tracking-[0.5em] italic">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-pulse" />
                      Secured Login System
                   </div>
                   <div className="flex gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-14 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary/40 animate-progress" style={{ animationDelay: `${i * 0.4}s` }} />
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
        )}
      </div>

      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] border-none shadow-strong p-0 bg-background text-foreground overflow-hidden">
          <div className="bg-primary/5 p-12 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
             <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center relative shadow-inner">
                <Lock className="w-10 h-10 text-primary" />
             </div>
             <div className="space-y-2">
                <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none text-foreground">Password Recovery</DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                  Contact the institutional administrator to verify your identity and reset your account access.
                </DialogDescription>
             </div>
          </div>
          <div className="p-12 space-y-8">
            <div className="p-8 bg-secondary/30 rounded-[2rem] border border-foreground/5 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Official Email</p>
                <Mail className="w-5 h-5 text-primary opacity-40" />
              </div>
              <p className="text-xl font-black tracking-tight text-foreground">admin@university.edu.pk</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Button className="h-16 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest bg-primary shadow-strong" onClick={handleCopyEmail}>
                {copied ? <Check className="w-5 h-5 mr-3" /> : <Copy className="w-5 h-5 mr-3" />}
                {copied ? 'Copied' : 'Copy Email'}
              </Button>
              <Button variant="outline" className="h-16 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest border-foreground/5 bg-secondary/50 hover:bg-emerald-500 hover:text-white transition-all" onClick={() => window.open(`https://wa.me/923001234567`, '_blank')}>
                <MessageSquare className="w-5 h-5 mr-3" />
                Support
              </Button>
            </div>
          </div>
          <DialogFooter className="px-12 pb-12">
            <Button type="button" variant="ghost" onClick={() => setShowForgotDialog(false)} className="w-full h-14 font-black text-[11px] uppercase tracking-[0.4em] text-muted-foreground hover:bg-secondary rounded-2xl transition-all">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>  
  );
};
