import { useState, useEffect } from 'react';
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
  Key
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
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
    // Session timeout monitoring (30 minutes)
    let timeoutId: NodeJS.Timeout;
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.error('Session expired due to inactivity');
        onLogout();
      }, 1800000); // 30 minutes
    };

    // Activity listeners
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activities.forEach(event => document.addEventListener(event, resetTimeout));
    
    resetTimeout();

    // Poll notifications every 5 minutes to avoid 429 rate limit errors
    const notificationInterval = setInterval(fetchNotifications, 300000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(notificationInterval);
      activities.forEach(event => document.removeEventListener(event, resetTimeout));
    };
  }, [user, onLogout]);

  const fetchNotifications = async () => {
    try {
      // Check authentication periodically
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }
    } catch (e) {
      console.error('Session check failed');
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      if (user.role === 'student') {
        await studentService.updateProfile({ phone: profileData.phone });
      } else {
        await api.put('/users/profile', { phone: profileData.phone });
      }
      toast.success('Phone number saved! Departments will use this to contact you.');
      setIsProfileOpen(false);
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'student', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'hod'] },
    { id: 'departments', label: 'Departments', icon: Building2, roles: ['admin'] },
    { id: 'requests', label: 'Clearance Requests', icon: FileText, roles: ['admin', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'] },
    { id: 'my-clearance', label: 'My Clearance', icon: FileText, roles: ['student'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'hod'] },
    { id: 'users', label: 'Staff Management', icon: Users, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">UniClearance</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 py-2">
            <nav className="space-y-1">
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
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                      ${active 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 transition-colors'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Bottom Area */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-blue-600 text-white font-black text-xs">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user.fullName || `${user.firstName} ${user.lastName}` || 'User'}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout System
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900">
                {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
                SYSTEM OPERATIONAL <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-slate-50 text-slate-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl border-none shadow-2xl shadow-slate-200 mt-2" align="end">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 rounded-t-2xl">
                   <h3 className="text-sm font-black text-slate-900 tracking-tight">System Alerts</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                         <Bell className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No new alerts</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                              <FileText className="w-4 h-4" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900 leading-tight mb-0.5">{n.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mb-1">{n.description}</p>
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{n.time}</p>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-slate-50/50 text-center rounded-b-2xl">
                   <Button variant="link" className="text-[10px] font-black uppercase text-blue-600 tracking-widest p-0 h-auto">
                      View Audit Logs
                   </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full shadow-sm bg-white border border-slate-100 flex items-center gap-2 pr-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px] font-bold">
                       {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="rounded-xl mt-1 focus:bg-blue-50 focus:text-blue-600 cursor-pointer"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="rounded-xl mt-1 focus:bg-blue-50 focus:text-blue-600 cursor-pointer"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl mt-1 text-red-500 font-medium" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-blue-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <DialogTitle className="text-2xl font-black tracking-tight">User Profile</DialogTitle>
            <DialogDescription className="text-blue-100 font-medium mt-1">
              View and manage your personal identification details.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-black">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-blue-600 hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">{user.fullName}</h3>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-3 font-bold uppercase tracking-widest text-[9px]">
                  {user.role?.replace('_', ' ')}
                </Badge>
                {user.registrationNumber && (
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user.registrationNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</Label>
                <Input value={profileData.firstName} readOnly className="rounded-xl bg-slate-50 border-none font-bold text-slate-700" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</Label>
                <Input value={profileData.lastName} readOnly className="rounded-xl bg-slate-50 border-none font-bold text-slate-700" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input value={profileData.email} readOnly className="pl-10 rounded-xl bg-slate-50 border-none font-bold text-slate-700" />
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Phone Number <span className="text-blue-500 normal-case font-medium">— Departments use this to contact you</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +92 300 1234567"
                    className="pl-10 rounded-xl border-slate-200 font-bold text-slate-700"
                  />
                </div>
              </div>
              {user.department && (
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</Label>
                  <Input value={user.department.name} readOnly className="rounded-xl bg-slate-50 border-none font-bold text-slate-700" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-2">
             <Button variant="ghost" className="rounded-xl font-bold text-slate-400" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
             <Button 
               className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold"
               onClick={saveProfile}
               disabled={savingProfile}
             >
               {savingProfile ? 'Saving...' : 'Save Changes'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-500" />
              System Settings
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-1">
              Configure your account preferences and security.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-4">
            <button 
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 group transition-all"
              onClick={() => { setIsPrivacyOpen(true); setIsSettingsOpen(false); }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-white group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Privacy & Visibility</p>
                  <p className="text-xs text-slate-500">Manage who can see your progress</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90" />
            </button>
            <button 
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 group transition-all"
              onClick={() => { setIsPasswordOpen(true); setIsSettingsOpen(false); }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-white group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Key className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Security & Password</p>
                  <p className="text-xs text-slate-500">Update your account credentials</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90" />
            </button>
          </div>
          <DialogFooter className="p-8 pt-0">
             <Button variant="ghost" className="w-full text-slate-400 font-bold h-12 rounded-xl" onClick={() => setIsSettingsOpen(false)}>
               Back to Portal
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-emerald-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-300" />
              Privacy & Visibility
            </DialogTitle>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900">Show Progress</Label>
                <p className="text-xs text-slate-500">Allow advisors to track your clearance status</p>
              </div>
              <Button 
                variant={privacySettings.showProgress ? "default" : "outline"}
                className="rounded-full h-8 px-4 font-bold active:scale-95 transition-all outline-none"
                onClick={() => setPrivacySettings({...privacySettings, showProgress: !privacySettings.showProgress})}
              >
                {privacySettings.showProgress ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900">Public Profile</Label>
                <p className="text-xs text-slate-500">Visible to fellow students in search</p>
              </div>
              <Button 
                variant={privacySettings.publicProfile ? "default" : "outline"}
                className="rounded-full h-8 px-4 font-bold active:scale-95 transition-all outline-none"
                onClick={() => setPrivacySettings({...privacySettings, publicProfile: !privacySettings.publicProfile})}
              >
                 {privacySettings.publicProfile ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0">
             <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-bold" onClick={() => {
               toast.success('Privacy settings updated');
               setIsPrivacyOpen(false);
               setIsSettingsOpen(true);
             }}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Key className="w-6 h-6 text-blue-500" />
              Change Password
            </DialogTitle>
          </div>
          <form onSubmit={handlePasswordChange} className="p-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Current Password</Label>
              <Input 
                type="password" 
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">New Password</Label>
              <Input 
                type="password" 
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Confirm New Password</Label>
              <Input 
                type="password" 
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                className="rounded-xl"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" className="rounded-xl h-12" onClick={() => { setIsPasswordOpen(false); setIsSettingsOpen(true); }}>Cancel</Button>
              <Button type="submit" disabled={savingPassword} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
