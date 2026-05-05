// UI ONLY — NO LOGIC CHANGED
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Loader2,
  MoreVertical,
  ArrowRight,
  TrendingDown,
  UserPlus,
  Plus,
  GraduationCap,
  Sparkles,
  Zap,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Building,
  ChevronRight,
  LayoutGrid,
  Search,
  Download,
  CalendarDays,
  History,
  ShieldAlert,
  Globe,
  Database,
  Lock,
  Layers,
  Truck,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { adminService } from '@/lib/admin.service';
import { StatusBadge } from './StatusBadge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AdminBentoCard = ({ title, value, icon: Icon, color, trend, trendUp, onClick, description }: { title: string; value: any; icon: any; color: string; trend?: string; trendUp?: boolean; onClick?: () => void; description?: string }) => (
  <button 
    className={`
      flex flex-col justify-between p-5 rounded-2xl bg-card/40 backdrop-blur-3xl border border-foreground/5 shadow-soft overflow-hidden group relative transition-all duration-700 text-left
      ${onClick ? 'cursor-pointer hover:shadow-strong hover:bg-card hover:-translate-y-1' : ''}
    `}
    onClick={onClick}
  >
    <div className={`absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full ${color} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity blur-3xl`} />
    <div className="flex items-center justify-between relative z-10 w-full mb-4">
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-soft shadow-inner`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      {onClick && <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />}
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-50">{title}</p>
      <h3 className="text-lg font-black text-foreground mt-1.5 tracking-tighter uppercase leading-none">{value}</h3>
      <div className="flex items-center justify-between mt-3">
        <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">{description || 'Total Count'}</p>
        {trend && (
           <Badge variant="outline" className={`border-none rounded-lg px-2 py-0.5 font-black text-[8px] uppercase tracking-widest ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
              {trend}
           </Badge>
        )}
      </div>
    </div>
  </button>
);

export const AdminDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to load institutional telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-10">
        <div className="relative group">
           <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-[2.5rem] animate-spin transition-all duration-700" />
           <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground animate-pulse">Syncing Global Command</p>
           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Verifying administrative authorization layers...</p>
        </div>
      </div>
    );
  }

  const counts = data?.counts || { totalStudents: 0, totalDepartments: 0, totalStaff: 0, totalClearanceRequests: 0 };
  const clearanceStats = data?.clearanceStats || {};
  const recentRequests = data?.recentRequests || [];
  const departmentPendingStats = data?.departmentPendingStats || [];
  const departmentStudentStats = data?.departmentStudentStats || [];

  const chartData = [
    { name: 'Cleared', value: clearanceStats?.cleared || 0, color: '#10b981' },
    { name: 'Pending', value: clearanceStats?.pending || 0, color: '#f59e0b' },
    { name: 'In Review', value: clearanceStats?.in_review || 0, color: '#3b82f6' },
    { name: 'Rejected', value: clearanceStats?.rejected || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden p-5 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-foreground group">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full -mr-[20%] -mt-[10%] blur-[120px] group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12 blur-[60px]" />
        
        <div className="space-y-6 relative z-10 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
             <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary backdrop-blur-xl border border-white/5 shadow-2xl group-hover:rotate-6 transition-all duration-700 shrink-0">
                <Database className="w-7 h-7" />
             </div>
             <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1 rounded-full backdrop-blur-md">Admin Section</Badge>
                   <span className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                   </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-background tracking-tighter uppercase leading-[0.9]">Admin Dashboard</h1>
             </div>
          </div>
          <p className="text-sm lg:text-base text-background/40 font-medium leading-relaxed max-w-2xl italic">
             Central management for student clearance, department records, and staff access across the university.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
           <Button 
            variant="ghost" 
            className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest text-background/60 hover:text-background hover:bg-white/5 transition-all duration-700 active:scale-95 border border-white/5 backdrop-blur-sm"
            onClick={() => {
              if (!data) {
                toast.error('No telemetry data available for export');
                return;
              }
              const promise = new Promise((resolve) => {
                setTimeout(() => {
                  import('@/lib/report.utils').then(module => {
                    module.exportAdminReport(data);
                    resolve(true);
                  });
                }, 1000);
              });
              toast.promise(promise, {
                loading: 'Generating institutional analytics report...',
                success: 'Institutional report exported successfully!',
                error: 'Failed to generate report'
              });
            }}
           >
             <Download className="w-4 h-4 mr-3" />
             Export Report
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 h-12 px-8 font-black text-[10px] uppercase tracking-widest shadow-strong shadow-primary/30 flex items-center gap-3 active:scale-95 transition-all group/btn overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-700" />
                  <span className="hidden sm:inline">Add New</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-[3rem] border-none shadow-strong p-5 bg-background/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                <DropdownMenuItem className="rounded-[1.5rem] h-16 font-black text-[10px] uppercase tracking-[0.2em] focus:bg-primary focus:text-white px-8 cursor-pointer transition-all" onClick={() => onNavigate('students')}>
                  <Users className="w-5 h-5 mr-5 opacity-50" />
                  Enroll New Student
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-[1.5rem] h-16 font-black text-[10px] uppercase tracking-[0.2em] focus:bg-primary focus:text-white px-8 cursor-pointer mt-3 transition-all" onClick={() => onNavigate('departments')}>
                  <Building2 className="w-5 h-5 mr-5 opacity-50" />
                  Add New Department
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-[1.5rem] h-16 font-black text-[10px] uppercase tracking-[0.2em] focus:bg-primary focus:text-white px-8 cursor-pointer mt-3 transition-all" onClick={() => onNavigate('users')}>
                  <UserPlus className="w-5 h-5 mr-5 opacity-50" />
                  Authorize Official Access
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminBentoCard 
          title="Total Students" 
          value={counts.totalStudents.toLocaleString()} 
          icon={Users} 
          color="bg-primary" 
          trend="+12%" 
          trendUp={true} 
          description="Total Students"
          onClick={() => onNavigate('students')}
        />
        <AdminBentoCard 
          title="Departments" 
          value={counts.totalDepartments} 
          icon={Layers} 
          color="bg-indigo-600" 
          description="All Units"
          onClick={() => onNavigate('departments')}
        />
        <AdminBentoCard 
          title="Requests" 
          value={counts.totalClearanceRequests} 
          icon={Zap} 
          color="bg-amber-600" 
          trend="84%" 
          trendUp={true} 
          description="Total Requests"
          onClick={() => onNavigate('requests')}
        />
        <AdminBentoCard 
          title="Staff" 
          value={counts.totalStaff} 
          icon={ShieldCheck} 
          color="bg-emerald-600" 
          description="Verified Staff"
          onClick={() => onNavigate('users')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Analytics Throughput Card */}
        <Card className="lg:col-span-2 border-none shadow-strong rounded-[2rem] sm:rounded-[4rem] bg-card/60 backdrop-blur-3xl overflow-hidden group">
          <CardHeader className="p-5 sm:p-8 pb-5 border-b border-foreground/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
               <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-primary/10 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Clearance Overview</CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Distribution of all clearance statuses.</CardDescription>
              </div>
              <div className="flex items-center gap-3 bg-background/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-foreground/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Live Status</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-8">
            <div className="h-[250px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="hsl(var(--foreground) / 0.03)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900, opacity: 0.4 }} 
                    dy={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900, opacity: 0.4 }} 
                  />
                  <Tooltip 
                  cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 20 }} 
                  contentStyle={{ 
                     borderRadius: '1.5rem', 
                     border: 'none', 
                     boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', 
                     background: 'hsl(var(--card))',
                     padding: '1rem',
                     fontFamily: 'Plus Jakarta Sans'
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                  <Bar dataKey="value" radius={[30, 30, 0, 0]} barSize={70}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-700 hover:opacity-80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-foreground/5">
               {chartData.map((item) => (
                 <div key={item.name} className="space-y-2 group cursor-pointer p-4 rounded-2xl hover:bg-muted/10 transition-all duration-500">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{item.name}</p>
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-6 rounded-full shadow-md" style={{ backgroundColor: item.color }} />
                       <h4 className="text-2xl font-black text-foreground tracking-tighter leading-none">{item.value}</h4>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottleneck Command Sidebar */}
        <Card className="border-none shadow-strong rounded-[2rem] bg-card overflow-hidden group">
          <CardHeader className="p-6 border-b border-foreground/5 bg-primary/5">
            <div className="flex items-center gap-3 text-destructive">
               <div className="p-2 bg-destructive/10 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
               </div>
               <CardTitle className="text-lg font-black tracking-tighter uppercase leading-none">Pending by<br />Department</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {(Array.isArray(departmentPendingStats) ? departmentPendingStats : []).slice(0, 6).map((dept: any, index: number) => (
                <div key={index} className="space-y-4 group cursor-pointer relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <span className="text-[11px] font-black text-muted-foreground/20 w-8 group-hover:text-primary transition-colors duration-500">0{index + 1}</span>
                       <div className="space-y-1">
                          <span className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{dept.department?.name || dept.departmentName}</span>
                          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">{dept.department?.code || 'NODE'}</p>
                       </div>
                    </div>
                    <Badge className="bg-secondary text-foreground rounded-xl font-black text-[11px] px-4 py-1.5 shadow-soft border border-foreground/5">{dept.count}</Badge>
                  </div>
                  <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                     <div 
                      className="absolute inset-y-0.5 left-0.5 bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                      style={{ width: `${Math.min(((dept.count || 0) / 50) * 100, 100)}%` }}
                     >
                        <div className="absolute inset-0 bg-white/20 shimmer" />
                     </div>
                  </div>
                </div>
              ))}
              
              {departmentPendingStats.length === 0 && (
                <div className="py-24 text-center space-y-8">
                   <div className="w-28 h-28 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner relative group/icon">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-[3rem] blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                      <ShieldCheck className="w-14 h-14 text-emerald-500 relative z-10" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-2xl font-black text-foreground uppercase tracking-tight">Latency Zero</p>
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50 italic">Peak operational velocity detected.</p>
                   </div>
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-8 bg-muted/20 border-t border-foreground/5 text-center">
             <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:bg-primary/10 rounded-[1.5rem] px-10 h-14 w-full transition-all duration-500 active:scale-95">
                Extended Analytics <ChevronRight className="w-4 h-4 ml-3" />
             </Button>
          </div>
        </Card>
      </div>

      {/* Registry Density & Institutional Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="border-none shadow-strong rounded-[2rem] bg-card/60 backdrop-blur-3xl overflow-hidden">
          <CardHeader className="p-8 border-b border-foreground/5 bg-primary/5">
            <div className="flex items-center gap-4 text-primary">
               <div className="p-2.5 bg-primary/10 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
               </div>
               <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none">Students per Dept</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStudentStats} layout="vertical" margin={{ left: 10, right: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--foreground) / 0.03)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 900, opacity: 0.4 }} 
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 8 }}
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', padding: '1rem' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 10, 10, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Global Registry Management Master Card */}
        <Card className="border-none shadow-strong rounded-[2rem] bg-foreground text-background overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-primary/30 transition-colors duration-1000" />
           
           <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center space-y-6 relative z-10">
              <div className="w-20 h-20 bg-background/5 rounded-2xl backdrop-blur-3xl flex items-center justify-center border border-white/10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 shadow-2xl relative">
                 <Globe className="w-10 h-10 text-primary relative z-10" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">Student<br /><span className="text-primary italic">List</span></h3>
                 <p className="text-background/40 text-[10px] font-medium max-w-[200px] mx-auto leading-relaxed italic">
                   Manage all student records and clearance progress.
                 </p>
              </div>
              <Button 
               className="rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest px-8 shadow-strong group/cta active:scale-95 transition-all relative overflow-hidden"
               onClick={() => onNavigate('students')}
              >
                 <span>View Students</span>
                 <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover/cta:translate-x-2 transition-transform" />
              </Button>
           </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-none shadow-strong rounded-[2rem] bg-card/60 backdrop-blur-3xl overflow-hidden">
        <CardHeader className="p-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between border-b border-foreground/5 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-primary">
               <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Activity className="w-4 h-4" />
               </div>
               <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none">Recent Activity</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Latest clearance requests across campus.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-500" />
                <Input placeholder="Search student..." className="pl-12 h-12 w-full lg:w-64 rounded-xl bg-secondary/50 border-none font-black text-[10px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner" />
             </div>
             <Button variant="outline" className="rounded-xl border-foreground/10 font-black text-[10px] uppercase tracking-widest px-6 h-12 shadow-soft hover:bg-card hover:border-primary/20 transition-all active:scale-95">
               View History
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-muted/10">
                <TableRow className="border-none">
                  <TableHead className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Request ID</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Type</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Date</TableHead>
                  <TableHead className="py-5 text-right px-8 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(recentRequests) ? recentRequests : []).map((request: any) => (
                  <TableRow 
                    key={request.id} 
                    className="group hover:bg-muted/10 transition-all duration-500 border-foreground/5 cursor-pointer"
                    onClick={() => { setSelectedRequest(request); setIsDetailsOpen(true); }}
                  >
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card shadow-soft border border-foreground/5 flex items-center justify-center font-black text-primary text-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <span className="relative z-10">{request.student?.first_name?.[0]}{request.student?.last_name?.[0]}</span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{request.student?.first_name} {request.student?.last_name}</p>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">{request.student?.registration_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-3 bg-secondary/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-foreground/5 group-hover:border-primary/20 transition-all">
                         <Lock className="w-3.5 h-3.5 text-primary opacity-40" />
                         <code className="text-[10px] font-black text-primary tracking-[0.2em]">
                           {request.request_id}
                         </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-primary shadow-lg" />
                         <span className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{request.request_type?.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3 text-foreground font-black text-[10px] uppercase tracking-widest">
                            <CalendarDays className="w-4 h-4 text-primary opacity-40" />
                            {new Date(request.created_at).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-3 text-muted-foreground font-black text-[9px] uppercase tracking-widest pl-7 opacity-40">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-card hover:shadow-strong transition-all duration-500 active:scale-90 border border-transparent hover:border-foreground/5">
                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl w-56 border-none shadow-strong p-2 bg-background/95 backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                           <DropdownMenuItem 
                            className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer"
                            onClick={() => { setSelectedRequest(request); setIsDetailsOpen(true); }}
                           >
                              <FileText className="w-4 h-4 mr-3 opacity-40" /> View Details
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                            className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-primary focus:text-white px-4 cursor-pointer mt-1"
                            onClick={() => { setSelectedRequest(request); setIsDetailsOpen(true); }}
                           >
                              <History className="w-4 h-4 mr-3 opacity-40" /> Request History
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                            className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest focus:bg-destructive focus:text-white px-4 cursor-pointer mt-1 text-destructive"
                            onClick={() => toast.info('Revoke functionality coming soon')}
                           >
                              <ShieldAlert className="w-4 h-4 mr-3" /> Revoke
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {recentRequests.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={6} className="h-96 text-center px-12">
                        <div className="flex flex-col items-center justify-center gap-10">
                           <div className="w-32 h-32 bg-muted/10 rounded-[3.5rem] flex items-center justify-center shadow-inner relative overflow-hidden group/empty">
                              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/empty:opacity-100 transition-opacity" />
                              <Activity className="w-16 h-16 text-muted-foreground/10 group-hover:text-primary/20 transition-all duration-700" />
                           </div>
                           <div className="space-y-3">
                              <p className="text-2xl font-black text-foreground uppercase tracking-tight">Stream Idle</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-40 italic">Waiting for institutional sequence initiation...</p>
                           </div>
                        </div>
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Premium Audit Master Console Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[90vh] rounded-[2rem] p-0 overflow-y-auto overflow-x-hidden border-none shadow-strong bg-background animate-in zoom-in-95 duration-500 custom-scrollbar">
          <div className="bg-foreground p-5 sm:p-8 text-background relative overflow-hidden border-b border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary backdrop-blur-xl border border-white/5">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                       <Badge className="bg-primary text-white border-none rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-[0.4em]">Audit Request</Badge>
                       <p className="text-[9px] font-black text-background/30 uppercase tracking-[0.5em]">{selectedRequest?.request_type?.replace('_', ' ')}</p>
                    </div>
                 </div>
                 <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">{selectedRequest?.request_id}</DialogTitle>
              </div>
              <div className="text-left sm:text-right space-y-2">
                 <p className="text-[8px] sm:text-[10px] font-black text-background/30 uppercase tracking-[0.5em]">Overall Status</p>
                 {selectedRequest && <StatusBadge status={selectedRequest.status} size="lg" />}
              </div>
            </div>
          </div>
          
          <div className="p-5 sm:p-8 space-y-6 bg-card/40 backdrop-blur-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 p-5 sm:p-6 bg-secondary/50 rounded-2xl sm:rounded-3xl border border-foreground/5 group hover:bg-secondary transition-all duration-700">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-primary/10 rounded-xl group-hover:rotate-12 transition-transform duration-700">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Primary Identity</p>
                   </div>
                </div>
                <div className="space-y-2.5 pl-4 border-l-4 border-primary/20">
                   <p className="text-lg sm:text-xl font-black text-foreground leading-none tracking-tight uppercase">{selectedRequest?.student?.first_name} {selectedRequest?.student?.last_name}</p>
                   <p className="text-[9px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">{selectedRequest?.student?.registration_number}</p>
                </div>
              </div>
              
              <div className="space-y-4 p-6 bg-secondary/50 rounded-3xl border border-foreground/5 group hover:bg-secondary transition-all duration-700">
                <div className="flex items-center gap-4">
                   <div className="p-3.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-700">
                      <Activity className="w-6 h-6 text-primary" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Timeline</p>
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-foreground/5 shadow-soft">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Initialized</span>
                   <span className="text-xs font-black uppercase">{selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Intelligence */}
            {selectedRequest?.degree_fulfillment && (
              <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 space-y-5 animate-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-strong shadow-primary/20">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <Badge className="bg-primary/20 text-primary border-none rounded-full px-3 py-0.5 text-[7px] font-black uppercase tracking-widest">Fulfillment Strategy</Badge>
                      <h4 className="text-xl font-black tracking-tighter uppercase leading-none">
                        {selectedRequest.degree_fulfillment.method === 'dispatch' ? 'Secure Dispatch' : 'Manual Collection'}
                      </h4>
                    </div>
                  </div>
                </div>
                
                {selectedRequest.degree_fulfillment.method === 'dispatch' && (
                  <div className="p-6 bg-card rounded-2xl border border-foreground/5 shadow-soft space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                      <MapPin className="w-3.5 h-3.5" />
                      Dispatch Coordinates
                    </div>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      {selectedRequest.degree_fulfillment.address}
                    </p>
                  </div>
                )}
                
                {selectedRequest.degree_fulfillment.method === 'manual' && (
                  <div className="flex items-center gap-3 p-5 bg-card rounded-2xl border border-foreground/5 shadow-soft">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Student will collect physically from Registrar
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2">
               <h4 className="text-lg font-black text-foreground tracking-tight uppercase">Department Pulse</h4>
               <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                 {(selectedRequest?.clearance_status || []).map((cs: any) => (
                   <div key={cs.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-foreground/5">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-card border border-foreground/5 flex items-center justify-center text-primary font-black text-[10px]">
                         {cs.department?.code}
                       </div>
                       <p className="text-xs font-black text-foreground uppercase">{cs.department?.name}</p>
                     </div>
                     <StatusBadge status={cs.status} />
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="pt-4">
               <Button variant="ghost" className="h-10 rounded-xl px-8 font-black text-[9px] uppercase tracking-[0.4em] text-muted-foreground hover:bg-secondary/80 w-full border border-foreground/5" onClick={() => setIsDetailsOpen(false)}>
                 Close Protocol
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
