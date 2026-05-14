// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react'; // Force Vercel redeploy
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
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff
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
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onRegisterClick, onBack }) => {
  const [activePortal, setActivePortal] = useState<'student' | 'staff'>('student');
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryReg, setRecoveryReg] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receivedToken, setReceivedToken] = useState<string | null>(null);
  const [beautifiedEmailData, setBeautifiedEmailData] = useState<any>(null);
  const [showSimulatedInbox, setShowSimulatedInbox] = useState(false);
  const [revealToken, setRevealToken] = useState(false);

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

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePortal === 'staff' && !recoveryEmail) return toast.error('Please enter your email address');
    if (activePortal === 'student' && !recoveryReg) return toast.error('Please enter your registration number');
    
    setRecoveryLoading(true);
    try {
      const response = await authService.forgotPassword({ 
        email: activePortal === 'staff' ? recoveryEmail : undefined,
        registrationNumber: activePortal === 'student' ? recoveryReg : undefined,
        type: activePortal 
      });
      
      if (response.success) {
        if (response.data?.maskedEmail) {
          setMaskedEmail(response.data.maskedEmail);
          if (response.data.resetToken) setReceivedToken(response.data.resetToken);
          if (response.data.previewUrl) setPreviewUrl(response.data.previewUrl);
          if (response.data.beautifiedEmail) setBeautifiedEmailData(response.data.beautifiedEmail);
          setResetSuccess(true);
        } else {
          toast.success(response.message);
          setShowForgotDialog(false);
        }
        setRecoveryEmail('');
        setRecoveryReg('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Reset request failed. Please contact support.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return toast.error('Please fill in all fields');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setIsResetting(true);
    try {
      const response = await authService.resetPassword({
        token: resetToken,
        newPassword,
        type: activePortal
      });

      if (response.success) {
        toast.success(response.message || 'Password reset successfully!');
        setShowForgotDialog(false);
        setResetSuccess(false);
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setPreviewUrl(null);
        setReceivedToken(null);
        setBeautifiedEmailData(null);
        setShowSimulatedInbox(false);
        setRevealToken(false);
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('admin@university.edu.pk');
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[100] w-12 h-12 rounded-xl bg-card/60 backdrop-blur-3xl border border-foreground/5 text-foreground hover:bg-primary hover:text-white transition-all duration-500 active:scale-90 shadow-strong flex items-center justify-center group"
      >
        {isDark ? <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />}
      </button>

      {/* Back to Landing */}
      <button 
        onClick={onBack}
        className="fixed top-6 left-6 z-[100] px-6 h-12 rounded-xl bg-card/60 backdrop-blur-3xl border border-foreground/5 text-foreground hover:bg-primary hover:text-white transition-all duration-500 active:scale-90 shadow-strong flex items-center justify-center gap-3 group"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Home</span>
      </button>

      <div className="h-full w-full flex">
        {activePortal === 'student' ? (
          <div className="h-full w-full flex animate-in fade-in duration-700">
            {/* Left: Design Area (for Student) */}
            <div className="hidden lg:flex w-[45%] h-full bg-[#006633] relative overflow-hidden flex-col justify-center p-12 xl:p-20">
               <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-black/20" />
               <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
               <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px]" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-white/20 p-2 shadow-strong">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                     </div>
                     <div className="space-y-0.5 text-white">
                        <h2 className="text-xl font-black tracking-tighter uppercase leading-none">CUI Vehari</h2>
                        <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-60 italic">Clearance System</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-5xl xl:text-6xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                       Student<br />
                       <span className="italic opacity-40">Portal</span>
                    </h2>
                    <p className="text-white/70 text-base xl:text-lg font-medium leading-relaxed max-w-sm border-l-2 border-white/20 pl-6">
                      A centralized digital environment for student clearance and academic tracking.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                     <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Secure</span>
                     </div>
                     <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 flex items-center gap-2">
                        <Globe className="w-3 h-3 text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Live</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Form Area (for Student) */}
            <div className="flex-1 h-full bg-background relative overflow-hidden flex flex-col justify-center">
               <div className="w-full max-w-md mx-auto p-8 space-y-8 animate-in slide-in-from-right-10 duration-1000">
                  <div className="space-y-6">
                    <div className="inline-flex p-1 bg-secondary/30 backdrop-blur-3xl rounded-2xl gap-1 border border-foreground/5 w-fit">
                      <button 
                        onClick={() => setActivePortal('student')}
                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 bg-primary text-white shadow-strong"
                      >
                        Student
                      </button>
                      <button 
                        onClick={() => setActivePortal('staff')}
                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 text-muted-foreground hover:text-primary hover:bg-background/80"
                      >
                        Head
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                       <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">Welcome<br /><span className="text-primary italic">Back</span></h1>
                       <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-40">System Access Protocol Required</p>
                    </div>
                  </div>

                  <form onSubmit={handleStudentLogin} className="space-y-6">
                    <div className="space-y-2 group">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Registration ID</label>
                      <div className="relative">
                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          placeholder="FA21-BCS-000" 
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="h-14 pl-14 bg-secondary/30 border-none rounded-xl font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 group">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] group-focus-within:text-primary transition-colors">Secret Key</label>
                        <button 
                          type="button"
                          onClick={() => setShowForgotDialog(true)}
                          className="text-[9px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-all italic underline underline-offset-4"
                        >
                          Recover
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          type={showStudentPassword ? "text" : "password"}
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="h-14 pl-14 pr-12 bg-secondary/30 border-none rounded-xl font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                        >
                          {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 transition-all active:scale-95 group/btn overflow-hidden relative">
                      {loading ? (
                         <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Authenticating...</span>
                         </div>
                      ) : (
                         <div className="flex items-center gap-3">
                            <span>Authorize</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                         </div>
                      )}
                    </Button>
                  </form>

                  <div className="pt-6 border-t border-foreground/5 text-center space-y-4">
                    <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.3em]">
                      New student? <button onClick={onRegisterClick} className="text-primary hover:underline ml-2 underline-offset-4">Registry</button>
                    </p>
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                      SYS: V2.0.4 - ENCRYPTED
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex animate-in fade-in duration-700 bg-background">
            {/* Left: Form Area (for Faculty) */}
            <div className="flex-1 h-full bg-background relative overflow-hidden flex flex-col justify-center">
               <div className="w-full max-w-md mx-auto p-8 space-y-8 animate-in slide-in-from-left-10 duration-1000">
                  <div className="space-y-6">
                    <div className="inline-flex p-1 bg-secondary/30 backdrop-blur-3xl rounded-2xl gap-1 border border-foreground/5 w-fit">
                      <button 
                        onClick={() => setActivePortal('student')}
                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 text-muted-foreground hover:text-primary hover:bg-background/80"
                      >
                        Student
                      </button>
                      <button 
                        onClick={() => setActivePortal('staff')}
                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 bg-foreground text-background shadow-strong"
                      >
                        Head
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                       <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">Authority<br /><span className="text-primary italic">Terminal</span></h1>
                       <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-40">Administrative Clearance Hub</p>
                    </div>
                  </div>

                  <form onSubmit={handleStaffLogin} className="space-y-6">
                    <div className="space-y-2 group">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary transition-colors">Official Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          type="email" 
                          placeholder="name@university.edu.pk" 
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          className="h-14 pl-14 bg-secondary/30 border-none rounded-xl font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 group">
                      <div className="flex justify-between items-center px-2">
                         <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] group-focus-within:text-primary transition-colors">Access Key</label>
                         <button 
                           type="button"
                           onClick={() => setShowForgotDialog(true)}
                           className="text-[9px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-all italic underline underline-offset-4"
                         >
                           Reset
                         </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                        <Input 
                          type={showStaffPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          className="h-14 pl-14 pr-12 bg-secondary/30 border-none rounded-xl font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffPassword(!showStaffPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                        >
                          {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button disabled={loading} className="w-full h-14 bg-foreground hover:opacity-90 text-background rounded-xl font-black text-[11px] uppercase tracking-[0.5em] shadow-strong transition-all active:scale-95 group/btn overflow-hidden relative">
                       {loading ? "Syncing..." : "Establish Link"}
                    </Button>
                  </form>
                  
                  <div className="flex items-center justify-center gap-8 pt-6 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
                     <Globe className="w-5 h-5" />
                     <ShieldCheck className="w-5 h-5" />
                     <Activity className="w-5 h-5" />
                  </div>
               </div>
            </div>

            {/* Right: Design Area (for Faculty) */}
            <div className="hidden lg:flex w-[45%] h-full bg-[#1e293b] relative overflow-hidden flex-col justify-center p-12 xl:p-20 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                
                <div className="relative z-10 space-y-10">
                   <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-primary/30 shadow-2xl">
                      <Building2 className="w-8 h-8 text-primary" />
                   </div>
                   <div className="space-y-6">
                     <h2 className="text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] uppercase">Clearance Head<br /><span className="italic opacity-20">Portal</span></h2>
                     <p className="text-slate-400 text-lg xl:text-xl font-medium leading-relaxed max-w-xs italic border-l-2 border-primary/20 pl-6">
                       Secure administrative oversight for university clearance nodes.
                     </p>
                   </div>
                </div>

                <div className="relative z-10 space-y-6 mt-16">
                   <div className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] italic">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                      Matrix Node Active
                   </div>
                   <div className="flex gap-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary/40 animate-progress" style={{ animationDelay: `${i * 0.4}s` }} />
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
        )}
      </div>

      <Dialog open={showForgotDialog} onOpenChange={(open) => {
        setShowForgotDialog(open);
        if (!open) {
          setResetSuccess(false);
          setMaskedEmail('');
          setBeautifiedEmailData(null);
          setShowSimulatedInbox(false);
          setRevealToken(false);
        }
      }}>
        <DialogContent className="sm:max-w-xl rounded-3xl border-none shadow-strong p-0 bg-background text-foreground overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="bg-primary/5 p-8 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
             <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center relative shadow-inner">
                {resetSuccess ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <Lock className="w-10 h-10 text-primary" />}
             </div>
             <div className="space-y-2">
                <DialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none text-foreground">
                  {resetSuccess ? "Check Your Email" : "Account Recovery"}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                  {resetSuccess 
                    ? `Password reset instructions have been dispatched.`
                    : activePortal === 'student' 
                      ? "Enter your registration number to receive a reset link on your registered email."
                      : "Enter your official email to receive a secure password reset link."
                  }
                </DialogDescription>
             </div>
          </div>
          
          <div className="p-8">
            {resetSuccess ? (
              <form onSubmit={handleCompleteReset} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 space-y-3">
                  <p className="text-xs font-medium text-foreground leading-relaxed italic">
                    We've dispatched a recovery secret to your registered email:
                  </p>
                  <div className="flex items-center justify-between gap-4 bg-white/50 dark:bg-black/20 p-3 rounded-2xl border border-foreground/5 shadow-inner flex-wrap">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-emerald-500 opacity-60" />
                      <span className="font-black text-emerald-600 tracking-tight text-xs">{maskedEmail}</span>
                    </div>
                    {previewUrl && (
                      <a 
                        href={previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        Preview Email
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-muted-foreground/40 font-black text-[9px] uppercase tracking-[0.3em]">
                    <div className="flex-1 h-px bg-foreground/5" />
                    Enter Recovery Secret
                    <div className="flex-1 h-px bg-foreground/5" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-2">Secret Token</label>
                      <div className="relative">
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          value={resetToken} 
                          onChange={(e) => setResetToken(e.target.value)}
                          placeholder="A8F3E2"
                          className="pl-11 h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm uppercase tracking-widest" 
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="password"
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-11 h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm" 
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="password"
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-11 h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm" 
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    type="submit"
                    disabled={isResetting}
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-strong active:scale-95 transition-all"
                  >
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Define New Access Secret"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-secondary"
                    onClick={() => {
                      setResetSuccess(false);
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Back to Request
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-10">
                <div className="space-y-8">
                  {activePortal === 'student' ? (
                    <div className="space-y-3 group">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.4em] ml-2">Registration Number</label>
                      <div className="relative">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          value={recoveryReg} 
                          onChange={(e) => setRecoveryReg(e.target.value)}
                          placeholder="FA20-BCS-000"
                          className="pl-14 h-14 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm uppercase" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 group">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.4em] ml-2">Institutional Email</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="email"
                          value={recoveryEmail} 
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="admin@university.edu.pk"
                          className="pl-14 h-14 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-secondary/30 rounded-3xl border border-foreground/5 flex items-center gap-4">
                    <ShieldAlert className="w-6 h-6 text-primary opacity-40" />
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-relaxed">
                      A reset link will be dispatched only to the account registered within the institutional matrix.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    disabled={recoveryLoading}
                    className="w-full bg-primary hover:bg-primary/90 h-12 rounded-2xl font-black text-[9px] uppercase tracking-[0.4em] shadow-strong shadow-primary/20 active:scale-95 transition-all"
                  >
                    {recoveryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dispatch Reset Link"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="h-14 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground px-8 hover:bg-secondary" 
                    onClick={() => setShowForgotDialog(false)}
                  >
                    Abort Recovery
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>  
  );
};
