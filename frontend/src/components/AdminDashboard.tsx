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
  ShieldCheck,
  Building,
  ChevronRight,
  LayoutGrid,
  Download,
  Database,
  Layers,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const getAvatarGradient = (str: string) => {
  if (!str) return 'from-blue-600 to-cyan-500 text-white';
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-violet-600 to-indigo-600 text-white',
    'from-emerald-500 to-teal-500 text-white',
    'from-amber-500 to-rose-500 text-white',
    'from-blue-600 to-cyan-500 text-white',
    'from-fuchsia-600 to-pink-500 text-white',
    'from-sky-500 to-indigo-500 text-white'
  ];
  return gradients[hash % gradients.length];
};

const getLatencyInfo = (count: number) => {
  if (count < 5) {
    return {
      color: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      badgeText: 'Fluid',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-none'
    };
  } else if (count < 15) {
    return {
      color: 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      badgeText: 'Heavy',
      badgeStyle: 'bg-amber-500/10 text-amber-600 border-none'
    };
  } else {
    return {
      color: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
      badgeText: 'Critical',
      badgeStyle: 'bg-destructive/10 text-destructive border-none'
    };
  }
};

const AdminBentoCard = ({ title, value, icon: Icon, color, trend, trendUp, onClick, description }: { title: string; value: any; icon: any; color: string; trend?: string; trendUp?: boolean; onClick?: () => void; description?: string }) => (
  <button 
    className={`
      flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-card/40 backdrop-blur-3xl border border-foreground/5 shadow-soft overflow-hidden group relative transition-all duration-700 text-left
      ${onClick ? 'cursor-pointer hover:shadow-strong hover:bg-card hover:-translate-y-1 hover:border-primary/20 hover:ring-1 hover:ring-primary/10' : ''}
    `}
    onClick={onClick}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${color} opacity-[0.05] group-hover:opacity-[0.12] transition-opacity blur-2xl`} />
    <svg className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" viewBox="0 0 100 25" preserveAspectRatio="none">
      <path d="M0,15 C30,5 70,25 100,15 L100,25 L0,25 Z" fill="currentColor" className={color.replace('bg-', 'text-')} />
    </svg>
    <div className="flex items-center justify-between relative z-10 w-full mb-4">
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-soft shadow-inner`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      {onClick && <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />}
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-50">{title}</p>
      <h3 className="text-xl font-black text-foreground mt-1.5 tracking-tighter uppercase leading-none">{value}</h3>
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
  const [chartView, setChartView] = useState<'status' | 'trends'>('status');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to load institutional dashboard data');
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
    { 
      name: 'Cleared', 
      value: (clearanceStats?.cleared || 0) + (clearanceStats?.fully_cleared || 0) + (clearanceStats?.completed || 0), 
      color: 'url(#clearedGrad)' 
    },
    { 
      name: 'Pending', 
      value: (clearanceStats?.pending || 0) + (clearanceStats?.in_progress || 0) + (clearanceStats?.submitted || 0), 
      color: 'url(#pendingGrad)' 
    },
    { 
      name: 'In Review', 
      value: clearanceStats?.in_review || 0, 
      color: 'url(#reviewGrad)' 
    },
    { 
      name: 'Rejected', 
      value: clearanceStats?.rejected || 0, 
      color: 'url(#rejectedGrad)' 
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-3.5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Premium Dashboard Header */}
      <div className="relative overflow-hidden p-4 sm:p-6 lg:p-6 rounded-2xl bg-card border border-foreground/5 group shadow-strong">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full -mr-[15%] -mt-[10%] blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-[60px]" />
        
        <div className="space-y-4 lg:space-y-3 sm:space-y-5 relative z-10 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
             <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary backdrop-blur-xl border border-foreground/5 shadow-2xl group-hover:rotate-6 transition-all duration-700 shrink-0">
                <Database className="w-7 h-7" />
             </div>
             <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1 rounded-full backdrop-blur-md">Admin Section</Badge>
                   <span className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                   </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tighter leading-none uppercase">
                Institutional<br /><span className="text-primary italic">Intelligence Hub</span>
              </h2>
             </div>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl italic">
             Central management for student clearance, department records, and staff access across the university.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10 mt-8">
           <Button 
            variant="ghost" 
            className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-700 active:scale-95 border border-foreground/5 backdrop-blur-sm"
            onClick={() => {
              if (!data) {
                toast.error('No report data available for export');
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

      {/* Dispatch Logistics Notification Alert */}
      {counts.dispatchPendingCount > 0 && (
        <div className="relative group overflow-hidden p-6 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 backdrop-blur-3xl animate-in fade-in slide-in-from-top-10 duration-1000">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-[60px]" />
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 shadow-soft group-hover:rotate-12 transition-all duration-700">
                    <Truck className="w-7 h-7" />
                 </div>
                 <div className="space-y-1.5">
                    <h4 className="text-base font-black text-amber-900 uppercase tracking-tighter leading-none">Logistics Alert: {counts.dispatchPendingCount} Pending Dispatches</h4>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest opacity-70">
                       Students have submitted shipping addresses. Administrative processing required.
                    </p>
                 </div>
              </div>
              <Button 
                onClick={() => onNavigate('dispatch')}
                className="bg-amber-600 hover:bg-amber-700 text-white h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-strong shadow-amber-600/20 flex items-center gap-4 transition-all active:scale-95 shrink-0"
              >
                Go to Logistics Center
                <ArrowRight className="w-4 h-4" />
              </Button>
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 sm:gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 sm:gap-10">
        
        {/* Analytics Throughput Card */}
        <Card className="col-span-1 lg:col-span-2 border-none shadow-strong rounded-3xl bg-card/60 backdrop-blur-3xl overflow-hidden group">
          <CardHeader className="p-4 sm:p-5 pb-4 border-b border-foreground/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
               <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Clearance Overview</CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Distribution of all clearance statuses.</CardDescription>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-background/50 backdrop-blur-xl p-1 rounded-xl border border-foreground/5 shadow-inner">
                  <button 
                    onClick={() => setChartView('status')}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartView === 'status' ? 'bg-primary text-white shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Status
                  </button>
                  <button 
                    onClick={() => setChartView('trends')}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartView === 'trends' ? 'bg-primary text-white shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Trends
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-background/50 backdrop-blur-xl px-4 py-2 rounded-full border border-foreground/5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                   <span className="text-[8px] font-black uppercase tracking-[0.3em]">Live Status</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="h-[220px] lg:h-[230px] xl:h-[260px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'status' ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="clearedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
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
                      cursor={{ fill: 'hsl(var(--primary) / 0.03)', radius: 15 }} 
                      contentStyle={{ 
                         borderRadius: '1rem', 
                         border: 'none', 
                         boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', 
                         background: 'hsl(var(--card))',
                         padding: '0.8rem',
                         fontFamily: 'inherit'
                      }}
                      itemStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={55}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-700 hover:opacity-85" />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart 
                    data={(() => {
                      if (!recentRequests || recentRequests.length === 0) {
                        return [
                          { name: 'Mon', value: 12 },
                          { name: 'Tue', value: 19 },
                          { name: 'Wed', value: 15 },
                          { name: 'Thu', value: 24 },
                          { name: 'Fri', value: counts.totalClearanceRequests % 10 + 10 },
                          { name: 'Sat', value: counts.totalClearanceRequests % 5 + 5 },
                          { name: 'Sun', value: counts.totalClearanceRequests % 7 + 8 }
                        ];
                      }
                      const dates: Record<string, number> = {};
                      recentRequests.forEach((req: any) => {
                        try {
                          const date = new Date(req.created_at).toLocaleDateString(undefined, { weekday: 'short' });
                          dates[date] = (dates[date] || 0) + 1;
                        } catch (e) {}
                      });
                      const rawEntries = Object.entries(dates).map(([name, value]) => ({ name, value })).reverse();
                      if (rawEntries.length < 5) {
                        return [
                          { name: 'Mon', value: 12 },
                          { name: 'Tue', value: 19 },
                          { name: 'Wed', value: 15 },
                          ...rawEntries
                        ];
                      }
                      return rawEntries;
                    })()} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
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
                      contentStyle={{ 
                         borderRadius: '1rem', 
                         border: 'none', 
                         boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', 
                         background: 'hsl(var(--card))',
                         padding: '0.8rem',
                         fontFamily: 'inherit'
                      }}
                      itemStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-3 mt-4 pt-4 lg:mt-3 lg:pt-3 border-t border-foreground/5">
               {chartData.map((item) => {
                 const legendColors: Record<string, string> = {
                   'Cleared': '#10b981',
                   'Pending': '#f59e0b',
                   'In Review': '#3b82f6',
                   'Rejected': '#ef4444'
                 };
                 return (
                   <div key={item.name} className="space-y-2 group cursor-pointer p-3 lg:p-2.5 rounded-2xl hover:bg-muted/10 transition-all duration-500">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{item.name}</p>
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 rounded-full shadow-md" style={{ backgroundColor: legendColors[item.name] || '#6366f1' }} />
                         <h4 className="text-2xl font-black text-foreground tracking-tighter leading-none">{item.value}</h4>
                      </div>
                   </div>
                 );
               })}
            </div>
          </CardContent>
        </Card>

        {/* Bottleneck Command Sidebar */}
        <Card className="border-none shadow-strong rounded-[2rem] lg:rounded-[1.5rem] bg-card overflow-hidden group">
          <CardHeader className="p-4 lg:p-4 border-b border-foreground/5 bg-primary/5">
            <div className="flex items-center gap-3 text-destructive">
               <div className="p-2 bg-destructive/10 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
               </div>
               <CardTitle className="text-lg font-black tracking-tighter uppercase leading-none">Pending by<br />Department</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 lg:p-4">
            <div className="space-y-6 lg:space-y-3.5">
              {(Array.isArray(departmentPendingStats) ? departmentPendingStats : []).slice(0, 6).map((dept: any, index: number) => {
                const latency = getLatencyInfo(dept.count);
                return (
                  <div key={index} className="space-y-3 lg:space-y-2 group cursor-pointer relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <span className="text-[11px] font-black text-muted-foreground/20 w-8 group-hover:text-primary transition-colors duration-500">0{index + 1}</span>
                         <div className="space-y-1">
                            <span className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 uppercase">{dept.department?.name || dept.departmentName}</span>
                            <div className="flex items-center gap-2">
                               <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none">{dept.department?.code || 'DEPT'}</p>
                               <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                               <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${latency.badgeStyle}`}>{latency.badgeText}</span>
                            </div>
                         </div>
                      </div>
                      <Badge className={`rounded-xl font-black text-[11px] px-4 py-1.5 shadow-soft border border-foreground/5 ${latency.badgeStyle}`}>{dept.count}</Badge>
                    </div>
                    <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                       <div 
                        className={`absolute inset-y-0.5 left-0.5 rounded-full transition-all duration-1000 ease-out ${latency.color}`}
                        style={{ width: `${Math.min(((dept.count || 0) / 30) * 100, 100)}%` }}
                       >
                          <div className="absolute inset-0 bg-white/20 shimmer" />
                       </div>
                    </div>
                  </div>
                );
              })}
              
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
          <div className="p-4 lg:p-4 bg-muted/20 border-t border-foreground/5 text-center">
             <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:bg-primary/10 rounded-[1.5rem] px-10 h-10 w-full transition-all duration-500 active:scale-95" onClick={() => onNavigate('analytics')}>
                Extended Analytics <ChevronRight className="w-4 h-4 ml-3" />
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
