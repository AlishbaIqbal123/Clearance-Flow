// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  GraduationCap,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Info,
  User,
  Settings,
  Mail,
  Phone,
  Camera,
  Shield,
  Key,
  Trophy,
  ArrowRight,
  Zap,
  ShieldCheck,
  Activity,
  Globe,
  Truck,
  MessageSquare,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { authService } from '@/lib/auth.service';
import { studentService } from '@/lib/student.service';
import { departmentService } from '@/lib/department.service';
import api from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const DashboardLayout = ({ children, user, activeTab, setActiveTab, onLogout }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [privacySettings, setPrivacySettings] = useState({
    showProgress: true,
    publicProfile: false
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || user.first_name || '',
    lastName: user.lastName || user.last_name || '',
    email: user.email || '',
    phone: user.phone || user.phone_number || ''
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    React.startTransition(() => {
      setIsDark(prev => !prev);
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.error('Session expired due to inactivity');
        onLogout();
      }, 1800000); // 30 minutes
    };

    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activities.forEach(event => document.addEventListener(event, resetTimeout));
    
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      activities.forEach(event => document.removeEventListener(event, resetTimeout));
    };
  }, [user, onLogout]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await api.get('/users/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }

      // Sync live departmental chat gateways if staff
      if (user?.role && ['hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'].includes(user.role)) {
        try {
          const chatRes = await departmentService.getRequests({ limit: 100 });
          if (chatRes?.success) {
            const reqs = chatRes.data?.requests || chatRes.data || [];
            let count = 0;
            const deptId = user.department_id;
            reqs.forEach((r: any) => {
              const comments = r.comments || [];
              comments.forEach((c: any) => {
                if (c.author_model === 'Student' && (!c.department_id || c.department_id === deptId) && !c.read_by_dept) {
                  count++;
                }
              });
            });
            setUnreadChatCount(count);
          }
        } catch (err) {
          // Silent catch for live status updates
        }
      }
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      let res;
      if (user.role === 'student') {
        res = await studentService.updateProfile(profileData);
      } else {
        res = await api.put('/users/profile', profileData);
      }
      
      if (res?.success) {
        // Update local storage user object to reflect new email/name
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { 
          ...currentUser, 
          email: profileData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          first_name: profileData.firstName,
          last_name: profileData.lastName
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile saved successfully! Your login email and identity have been updated.');
        setIsProfileOpen(false);
        
        // Reload after a short delay to refresh all system contexts with new data
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Failed to save. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      toast.success('Password updated successfully');
      setIsPasswordOpen(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'student', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer', 'exam_officer'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'hod'] },
    { id: 'academic-depts', label: 'Faculties', icon: Building2, roles: ['admin'] },
    { id: 'admin-depts', label: 'Admin Units', icon: Shield, roles: ['admin'] },
    { id: 'exam-dept', label: 'Exam Dept', icon: Award, roles: ['admin'] },
    { id: 'requests', label: 'Requests', icon: FileText, roles: ['admin', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'] },
    { id: 'dept-chats', label: 'Live Chats', icon: MessageSquare, roles: ['hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer', 'exam_officer'] },
    { id: 'admin-clearance', label: 'Phase 1: Admin', icon: Shield, roles: ['student'] },
    { id: 'academic-clearance', label: 'Phase 2: Academic', icon: Trophy, roles: ['student'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'hod'] },
    { id: 'dispatch', label: 'Degree Logistics', icon: Truck, roles: ['admin', 'exam_officer'] },
    { id: 'users', label: 'Staff List', icon: Users, roles: ['admin'] }
  ];

  const filteredItems = menuItems.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans selection:bg-primary/10">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-card/80 backdrop-blur-3xl border-r border-foreground/5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isSidebarOpen ? 'translate-x-0 shadow-strong' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-screen max-h-screen overflow-hidden">
          <div className="p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-strong group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden p-1.5 border border-foreground/5">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
              </div>
              <div className="space-y-0.5">
                <span className="font-black text-base sm:text-lg text-foreground tracking-tighter block uppercase leading-none">CUI Vehari</span>
                <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em] block italic">Clearance System</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground rounded-full hover:bg-muted/50 w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <nav className="space-y-1">
              <p className="px-5 pb-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Navigation</p>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[12px] font-bold transition-all duration-500 group relative
                      ${active 
                        ? 'bg-primary text-white shadow-strong shadow-primary/30 scale-[1.02]' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-500 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'}`} />
                    <span className="tracking-tight flex-1 text-left">{item.label}</span>
                    {item.id === 'dept-chats' && unreadChatCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-destructive text-white text-[9px] font-black animate-pulse shadow-sm">
                        {unreadChatCount}
                      </span>
                    )}
                    {active && item.id !== 'dept-chats' && (
                      <div className="absolute right-4 w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                    )}
                    {!active && (
                       <div className="absolute left-0 w-1 h-0 bg-primary/40 rounded-full transition-all duration-500 group-hover:h-5 group-hover:left-2" />
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Profile Card - Premium Interaction */}
          <div className="p-4 border-t border-foreground/5 space-y-2 bg-secondary/5 shrink-0">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-full bg-secondary/40 hover:bg-secondary/70 rounded-xl p-3 flex items-center gap-3 transition-all duration-700 group border border-foreground/5 shadow-inner"
            >
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-background shadow-soft group-hover:scale-110 transition-transform duration-700">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary text-white font-black text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-[12px] font-black text-foreground truncate tracking-tight uppercase leading-none">{user.fullName || `${user.firstName} ${user.lastName}` || 'User'}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1.5 opacity-60 italic">{user.role?.replace('_', ' ')}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
            </button>
            <Button 
              variant="ghost"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10 hover:text-destructive transition-all group border border-transparent hover:border-destructive/10"
            >
              <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        {/* Dynamic Background elements - Premium Depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Glass Header */}
        <header className="sticky top-0 z-40 glass px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between shadow-soft border-b border-foreground/5">
          <div className="flex items-center gap-4 lg:gap-8">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden rounded-2xl bg-secondary w-10 h-10 shadow-sm border border-foreground/5 active:scale-95">
              <Menu className="w-5 h-5 text-foreground" />
            </Button>
            <div className="hidden sm:block space-y-1">
              <div className="flex items-center gap-3">
                 <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
                    System Connected <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 </p>
              </div>
              <h1 className="text-xl lg:text-2xl font-black text-foreground tracking-tighter uppercase leading-none">
                {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Action Bar */}
            <div className="hidden xl:flex items-center bg-secondary/50 rounded-2xl p-1.5 gap-1 border border-foreground/5 shadow-inner">
               <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-background transition-all shadow-sm">
                  <Activity className="w-4.5 h-4.5 text-muted-foreground" />
               </Button>
               <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-background transition-all shadow-sm">
                  <Globe className="w-4.5 h-4.5 text-muted-foreground" />
               </Button>
            </div>

            {/* Theme & Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-2xl bg-secondary text-foreground w-10 h-10 hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm border border-foreground/5 active:scale-95"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-2xl bg-secondary text-foreground w-10 h-10 hover:bg-primary hover:text-white transition-all duration-700 relative shadow-sm border border-foreground/5 active:scale-95"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-destructive rounded-full border-2 border-background animate-bounce shadow-lg" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-3xl border-none shadow-strong mt-4" align="end">
                <div className="p-6 border-b border-foreground/5 bg-secondary/30 rounded-t-3xl">
                   <h3 className="text-lg font-black text-foreground tracking-tight uppercase">Notifications</h3>
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Updates and alerts</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-16 text-center space-y-6">
                      <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto transition-transform duration-700 hover:rotate-12 group shadow-inner">
                         <Bell className="w-10 h-10 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">No System Alerts</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-5 rounded-3xl hover:bg-secondary transition-all cursor-pointer group border border-transparent hover:border-foreground/5">
                        <div className="flex items-start gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white shadow-soft">
                              <FileText className="w-5.5 h-5.5" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <p className="text-sm font-black text-foreground leading-tight tracking-tight">{n.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">{n.description}</p>
                              <div className="flex items-center gap-2 pt-1.5">
                                 <Activity className="w-3 h-3 text-primary opacity-40" />
                                 <p className="text-[9px] font-black text-primary uppercase tracking-widest">{n.time}</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-5 bg-secondary/20 text-center rounded-b-[2.5rem]">
                   <Button variant="link" className="text-[10px] font-black uppercase text-primary tracking-[0.3em] p-0 h-auto hover:no-underline hover:opacity-70">
                      Access System Archives
                   </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl p-1.5 h-10 bg-secondary hover:bg-secondary/80 border-none flex items-center gap-2 pr-3 transition-all shadow-sm">
                  <Avatar className="w-9 h-9 shadow-soft border border-background">
                    <AvatarFallback className="bg-primary text-white text-[10px] font-black">
                       {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left mr-1">
                     <p className="text-[10px] font-black text-foreground leading-none uppercase tracking-widest">{user.firstName}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 mt-6 rounded-3xl p-4 border-none shadow-strong">
                <div className="px-5 py-4 bg-secondary/50 rounded-3xl mb-3 border border-foreground/5">
                  <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{user.fullName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground truncate mt-1 opacity-70 italic">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-foreground/5 mx-3 mb-2" />
                <DropdownMenuItem 
                  className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest focus:bg-primary focus:text-white cursor-pointer px-6 mb-1"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <User className="w-5 h-5 mr-4 opacity-50" />
                  System Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest focus:bg-primary focus:text-white cursor-pointer px-6 mb-1"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-5 h-5 mr-4 opacity-50" />
                  Terminal Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-foreground/5 mx-3 my-2" />
                <DropdownMenuItem className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest text-destructive focus:bg-destructive focus:text-white cursor-pointer px-6" onClick={onLogout}>
                  <LogOut className="w-5 h-5 mr-4 opacity-50" />
                  Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Main Content Area - Bento Grid Ready */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-[1400px] mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>

        {/* Footer info for Academic Authority */}
        <footer className="p-10 text-center opacity-30">
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground">web CUIvehari Clearance • SECURE CLEARANCE TERMINAL • 2026</p>
        </footer>
      </div>

      {/* Redesigned Dialogs - Premium & Bento Style */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-strong">
          <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 pointer-events-none" />
          <div className="p-6 sm:p-10 pt-10 sm:pt-12 space-y-5 sm:space-y-8 relative">
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="relative group">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-[4px] sm:border-[5px] border-background shadow-strong group-hover:scale-105 transition-all duration-700">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary text-white text-xl sm:text-3xl font-black">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 sm:p-3 bg-white dark:bg-card rounded-full shadow-strong text-primary hover:scale-110 transition-transform active:scale-95 border border-foreground/5">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="space-y-1.5">
                <DialogTitle className="text-lg sm:text-2xl font-black tracking-tighter uppercase">{user.fullName}</DialogTitle>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 sm:px-5 py-1 sm:py-1.5 rounded-full font-black uppercase tracking-[0.3em] text-[7px] sm:text-[9px] shadow-sm">
                   {user.role?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Identity One</Label>
                <Input 
                  value={profileData.firstName} 
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="h-10 sm:h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4 text-sm" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Identity Two</Label>
                <Input 
                  value={profileData.lastName} 
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="h-10 sm:h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4 text-sm" 
                />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5 sm:space-y-2">
                <Label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Secure Endpoint</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="pl-12 h-10 sm:h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm" 
                  />
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5 sm:space-y-2">
                <Label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Contact Trace</Label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+92 000 0000000"
                    className="pl-12 h-10 sm:h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 sm:p-10 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4">
             <Button variant="ghost" className="h-12 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground px-8 hover:bg-secondary" onClick={() => setIsProfileOpen(false)}>Abort</Button>
             <Button 
               className="flex-1 bg-primary hover:bg-primary/90 h-12 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-strong shadow-primary/20 transition-all active:scale-95"
               onClick={saveProfile}
               disabled={savingProfile}
             >
               {savingProfile ? 'Processing...' : 'Authorize Updates'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-strong">
          <div className="bg-foreground p-8 sm:p-10 text-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-[60px]" />
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-4 uppercase">
              <div className="p-3 bg-background/10 rounded-2xl backdrop-blur-md">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              Settings
            </DialogTitle>
          </div>
          <div className="p-6 sm:p-10 space-y-3">
            <button 
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-secondary/50 hover:bg-primary hover:text-white group transition-all duration-700 border border-foreground/5"
              onClick={() => { setIsPrivacyOpen(true); setIsSettingsOpen(false); }}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="p-3 rounded-xl bg-background group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-soft">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="text-left space-y-0.5">
                  <p className="text-sm font-black uppercase tracking-tight">Security Protocol</p>
                  <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Visibility & Cryptography</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center group-hover:border-white/20">
                 <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
            <button 
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-secondary/50 hover:bg-primary hover:text-white group transition-all duration-700 border border-foreground/5"
              onClick={() => { setIsPasswordOpen(true); setIsSettingsOpen(false); }}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="p-3 rounded-xl bg-background group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-soft">
                  <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="text-left space-y-0.5">
                  <p className="text-sm font-black uppercase tracking-tight">Credentials</p>
                  <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Access Keys & Authentication</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center group-hover:border-white/20">
                 <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
          <DialogFooter className="p-6 sm:p-10 pt-0">
             <Button variant="ghost" className="w-full text-muted-foreground font-black text-[9px] uppercase tracking-[0.3em] h-12 rounded-xl hover:bg-secondary" onClick={() => setIsSettingsOpen(false)}>
               Return to Terminal
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-strong">
          <div className="bg-primary p-8 sm:p-12 text-white relative">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24 blur-[80px]" />
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-5 uppercase">
              <Key className="w-7 h-7 sm:w-9 sm:h-9" />
              Update Access
            </DialogTitle>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 sm:p-12 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Current Key</Label>
              <Input 
                type="password" 
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-6"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">New Secret</Label>
              <Input 
                type="password" 
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-6"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Verify Secret</Label>
              <Input 
                type="password" 
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-6"
                required
              />
            </div>
            <DialogFooter className="pt-4 gap-6">
              <Button type="button" variant="ghost" className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => { setIsPasswordOpen(false); setIsSettingsOpen(true); }}>Cancel</Button>
              <Button type="submit" disabled={savingPassword} className="flex-1 bg-primary hover:bg-primary/90 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-strong shadow-primary/20 active:scale-95">
                {savingPassword ? 'Syncing...' : 'Authorize Change'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/40 backdrop-blur-md z-40 lg:hidden transition-opacity duration-700"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

