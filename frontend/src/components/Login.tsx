import { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { authService } from '@/lib/auth.service';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [loading, setLoading] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [studentReg, setStudentReg] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email: staffEmail, password: staffPassword });
      if (response.success) {
        toast.success('Login successful');
        onLoginSuccess(response.data.user);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentReg || !studentPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    const loginPayload: any = { password: studentPassword };
    if (studentReg.includes('@')) {
      loginPayload.email = studentReg;
    } else {
      loginPayload.registrationNumber = studentReg;
    }
    
    setLoading(true);
    try {
      const response = await authService.studentLogin(loginPayload);
      if (response.success) {
        toast.success('Login successful');
        onLoginSuccess(response.data.user);
      }
    } catch (error: any) {
      if (studentReg.includes('@')) {
        toast.error('Invalid credentials. If you are a Staff member, please use the Staff / Admin tab.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">University Clearance</h2>
          <p className="mt-2 text-slate-500">Sign in to manage your clearance process</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="student" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <UserCheck className="w-4 h-4 mr-2" />
              Student
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Lock className="w-4 h-4 mr-2" />
              Staff / Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="border-none shadow-2xl shadow-slate-200">
              <CardHeader>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>Enter your registration number and password</CardDescription>
              </CardHeader>
              <form onSubmit={handleStudentLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Registration Number</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Registration ID or Email (e.g. FA20-BCS-001)" 
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={studentReg}
                        onChange={(e) => setStudentReg(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-700">Password</label>
                      <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-all font-semibold" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                    {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="border-none shadow-2xl shadow-slate-200">
              <CardHeader>
                <CardTitle>Offical Portal</CardTitle>
                <CardDescription>Enter your university email and password</CardDescription>
              </CardHeader>
              <form onSubmit={handleStaffLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="email" 
                        placeholder="name@university.edu" 
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-700">Password</label>
                      <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-all font-semibold" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                    {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-slate-500">
          Trouble signing in? <a href="#" className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4">Contact IT Support</a>
        </p>
      </div>
    </div>
  );
};
