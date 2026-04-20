import { useState, useMemo } from 'react';
import { Lock, ShieldCheck, ArrowRight, MessageSquare, Eye, EyeOff, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
    { label: 'Minimum 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number (0-9)', met: /\d/.test(newPassword) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(newPassword) },
  ], [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
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
        toast.success('Password changed successfully');
        onSuccess();
      }
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        toast.error(data.errors[0].msg);
      } else {
        toast.error(data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-50">
            <ShieldCheck className="text-amber-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Security Update</h2>
          <p className="mt-2 text-slate-500">Please change your temporary password to continue</p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a strong password with at least 8 characters</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="Current temporary password" 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showNew ? "text" : "password"} 
                    placeholder="Choose a new password" 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Confirm your new password" 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 mt-4">
                <div className="flex items-center gap-2 mb-1">
                   <MessageSquare className="w-4 h-4 text-blue-600" />
                   <span className="text-xs font-black uppercase tracking-widest text-slate-500">Security Check</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 transition-all duration-300">
                      {req.met ? (
                        <div className="bg-emerald-100 p-0.5 rounded-full">
                           <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="bg-red-50 p-0.5 rounded-full">
                           <XCircle className="w-3 h-3 text-red-400" />
                        </div>
                      )}
                      <span className={`text-[11px] font-bold ${req.met ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-11 bg-amber-600 hover:bg-amber-700 transition-all font-semibold" disabled={loading}>
                {loading ? 'Changing Password...' : 'Update Password'}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
