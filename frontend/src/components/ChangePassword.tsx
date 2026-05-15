// UI ONLY — NO LOGIC CHANGED
import { useState, useMemo } from 'react';
import { 
  Lock, ShieldCheck, ArrowRight, MessageSquare, 
  Eye, EyeOff, Check, XCircle, ShieldAlert,
  Fingerprint, Key, Zap, Shield, ChevronRight,
  Info, Activity, Database, Globe, Layers,
  X, CheckCircle2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { authService } from '@/lib/auth.service';

interface ChangePasswordProps {
  onSuccess: () => void;
}

export const ChangePassword = ({ onSuccess }: ChangePasswordProps) => {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requirements = useMemo(() => [
    { label: '8+ Characters', met: newPassword.length >= 8 },
    { label: 'Uppercase Letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Lowercase Letter', met: /[a-z]/.test(newPassword) },
    { label: 'Number [0-9]', met: /\d/.test(newPassword) },
    { label: 'Special Character', met: /[@$!%*?&]/.test(newPassword) },
  ], [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Identity verification mismatch');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (response.success) {
        toast.success('Security matrix updated successfully');
        onSuccess();
      }
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        toast.error(data.errors[0].msg);
      } else {
        toast.error(data?.message || 'Failed to update security credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary/20 relative overflow-hidden">
      {/* Editorial Background Geometry */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -ml-48 -mb-48" />
      
      <div className="max-w-2xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-6">
          <div className="relative group mx-auto w-24 h-24">
             <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10 bg-card w-full h-full rounded-[2.5rem] flex items-center justify-center border border-foreground/5 shadow-strong transition-all duration-700 group-hover:rotate-6">
                <ShieldCheck className="text-primary w-12 h-12" />
             </div>
          </div>
          <div className="space-y-2">
             <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Security Protocol</h2>
             <div className="flex items-center justify-center gap-4">
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.4em]">Credentials Update</Badge>
                <p className="text-muted-foreground/40 font-black text-[10px] uppercase tracking-[0.4em]">Matrix v4.2</p>
             </div>
          </div>
          <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto leading-relaxed italic">
            Your current password is temporary. Please set a new secure password to continue.
          </p>
        </div>

        <Card className="border-none shadow-strong rounded-3xl bg-card/60 backdrop-blur-3xl border border-foreground/5 overflow-hidden animate-in zoom-in-95 duration-1000">
          <CardHeader className="p-8 pb-0">
             <div className="flex items-center gap-4 text-primary mb-2">
                <Fingerprint className="w-6 h-6" />
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Identity Matrix</CardTitle>
             </div>
             <CardDescription className="text-sm font-black uppercase tracking-widest opacity-40">Choose a high-entropy key with at least 8 unique identifiers.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 gap-8">
                {/* Current Key Input */}
                <div className="space-y-3 group/input">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within/input:text-primary transition-colors">Current Access Key</label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                       <Lock className="w-full h-full" />
                    </div>
                    <Input 
                      type={showCurrent ? "text" : "password"} 
                      placeholder="Temporary Key" 
                      className="pl-16 pr-16 h-14 bg-background/50 border-none rounded-xl font-black px-8 text-lg shadow-inner focus-visible:ring-primary/20 transition-all"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                    >
                      {showCurrent ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* New Key & Confirm Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within/input:text-primary transition-colors">New Matrix Key</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                         <Key className="w-full h-full" />
                      </div>
                      <Input 
                        type={showNew ? "text" : "password"} 
                        placeholder="Secure Key" 
                        className="pl-16 pr-16 h-14 bg-background/50 border-none rounded-xl font-black px-8 text-lg shadow-inner focus-visible:ring-primary/20 transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                      >
                        {showNew ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 group-focus-within/input:text-primary transition-colors">Verify Key</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                         <Shield className="w-full h-full" />
                      </div>
                      <Input 
                        type={showConfirm ? "text" : "password"} 
                        placeholder="Confirm Key" 
                        className="pl-16 pr-16 h-14 bg-background/50 border-none rounded-xl font-black px-8 text-lg shadow-inner focus-visible:ring-primary/20 transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entropy Validation Matrix */}
              <div className="p-6 bg-secondary/30 rounded-2xl border border-foreground/5 space-y-6">
                <div className="flex items-center gap-4 text-primary">
                   <Activity className="w-5 h-5" />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em]">Entropy Analysis</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                  {requirements.map((req, idx) => (
                    <div key={idx} className={`flex items-center gap-4 transition-all duration-700 ${req.met ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`p-1.5 rounded-lg ${req.met ? 'bg-emerald-500 text-white shadow-soft shadow-emerald-500/20' : 'bg-muted text-muted-foreground/30'}`}>
                         {req.met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex flex-col gap-6">
              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-strong shadow-primary/20 group active:scale-95 transition-all overflow-hidden relative" 
                disabled={loading}
              >
                {loading ? (
                   <span className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                   </span>
                ) : (
                   <span className="flex items-center gap-3">
                      Update Password
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-700" />
                   </span>
                )}
              </Button>
              <div className="flex items-center justify-center gap-3 text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest italic">
                 <ShieldAlert className="w-4 h-4" /> Secure & Encrypted
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Support Link */}
        <p className="text-center text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.4em] pt-8">
          Experiencing identity issues? <span className="text-primary cursor-pointer hover:underline">Contact System Registrar</span>
        </p>
      </div>
    </div>
  );
};
