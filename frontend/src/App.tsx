import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Login } from '@/components/Login';
import { Register } from '@/components/Register';
import { ChangePassword } from '@/components/ChangePassword';
import { StudentDashboard } from '@/components/StudentDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { DepartmentDashboard } from '@/components/DepartmentDashboard';
import { StudentList } from '@/components/StudentList';
import { DepartmentList } from '@/components/DepartmentList';
import { OfficialList } from '@/components/OfficialList';
import { DepartmentProfile } from '@/components/DepartmentProfile';
import { ClearanceRequestList } from '@/components/ClearanceRequestList';
import { Analytics } from '@/components/Analytics';
import { MyClearance } from '@/components/MyClearance';
import { authService } from '@/lib/auth.service';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data.user);
          } else {
            authService.logout();
          }
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    toast.info('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20 animate-pulse">
           <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Establishing Secure Session</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        {showRegister ? (
          <Register 
            onBackToLogin={() => setShowRegister(false)} 
            onRegisterSuccess={handleLoginSuccess}
          />
        ) : (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterClick={() => setShowRegister(true)}
          />
        )}
        <Toaster position="top-right" expand={true} richColors />
      </>
    );
  }

  // First time login - Force password change
  if (user.is_first_login || user.requiresPasswordChange) {
    return (
      <>
        <ChangePassword onSuccess={() => {
          toast.success('Security update complete. Please login again.');
          handleLogout();
        }} />
        <Toaster position="top-right" expand={true} richColors />
      </>
    );
  }

  const renderView = () => {
    if (activeTab === 'dashboard') {
      if (user.role === 'admin') return <AdminDashboard onNavigate={setActiveTab} />;
      if (user.role === 'student') return <StudentDashboard onNavigate={setActiveTab} />;
      return <DepartmentDashboard onNavigate={setActiveTab} user={user} />;
    }

    // Role-specific views
    switch (activeTab) {
      case 'students':
        if (user.role === 'admin' || user.role === 'hod') return <StudentList />;
        return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Access Denied</div>;

      case 'academic-depts':
        if (user.role === 'admin') return <DepartmentList filterType="academic" />;
        return <div className="p-8 text-center text-slate-400 font-bold">ACCESS DENIED</div>;
      case 'admin-depts':
        if (user.role === 'admin') return <DepartmentList filterType="administrative" />;
        return <div className="p-8 text-center text-slate-400 font-bold">ACCESS DENIED</div>;
      case 'departments':
        if (user.role === 'admin') return <DepartmentList />;
        return <div className="p-8 text-center text-slate-400 font-bold">ACCESS DENIED</div>;
      case 'requests':
        return <ClearanceRequestList user={user} />;
      case 'users':
        return <OfficialList />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <DepartmentProfile user={user} />;
      case 'admin-clearance':
        return <MyClearance filterType="administrative" />;
      case 'academic-clearance':
        return <MyClearance filterType="academic" />;
      case 'my-clearance':
        return <MyClearance />;
      default:
        return <div className="p-8 text-center text-slate-400 font-bold">VIEW NOT FOUND</div>;
    }
  };

  return (
    <>
      <DashboardLayout 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
      >
        {renderView()}
      </DashboardLayout>
      <Toaster position="top-right" expand={true} richColors toastOptions={{
        style: { borderRadius: '1.25rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.05)' },
      }} />
    </>
  );
}

export default App;