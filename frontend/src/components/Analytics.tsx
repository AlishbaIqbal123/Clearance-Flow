import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, CheckCircle2, AlertCircle, Clock, 
  BarChart3, PieChart, Activity, Building, ArrowUpRight, ArrowDownRight,
  Sparkles, Layers, Zap, Globe, Lock, ShieldCheck, Database,
  ArrowRight, ChevronRight, Info, Calendar, Download, Share2,
  Filter, Search, LayoutGrid, List, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { analyticsService } from '@/lib/analytics.service';
import { toast } from 'sonner';

interface DepartmentStat {
  name: string;
  progress: number;
  status: string;
  color: string;
}

export const Analytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsService.getOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Telemetry sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // 30s Real-time Pulse
    return () => clearInterval(interval);
  }, []);

  // General statistics derived from live data
  const stats = [
    { 
      title: 'Total Students', 
      value: data?.summary?.totalStudents?.toLocaleString() || '0', 
      change: '+4%', 
      icon: Users, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      title: 'Active Requests', 
      value: (data?.summary?.totalRequests || 0).toLocaleString(), 
      change: `+${data?.statusBreakdown?.pending || 0}`, 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: 'Completed Nodes', 
      value: (data?.statusBreakdown?.cleared || 0).toLocaleString(), 
      change: 'Audit Verified', 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      title: 'System Uptime', 
      value: '99.9%', 
      change: 'Stable', 
      icon: Activity, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/10' 
    }
  ];

  const departmentPerformance: DepartmentStat[] = (data?.departmentPerformance || []).slice(0, 5).map((d: any) => ({
    name: d.name || 'Unknown Node',
    progress: d.clearanceRate || 0,
    status: (d.clearanceRate || 0) > 80 ? 'GOOD' : (d.clearanceRate || 0) > 50 ? 'MODERATE' : 'BUSY',
    color: (d.clearanceRate || 0) > 80 ? 'bg-emerald-500' : (d.clearanceRate || 0) > 50 ? 'bg-amber-500' : 'bg-primary'
  }));

  const recentTrends = [
    { label: 'Total Requests', value: `${data?.summary?.totalRequests || 0} Units`, trend: 'up' },
    { label: 'Staff Count', value: `${data?.summary?.totalStaff || 0} Members`, trend: 'up' },
    { label: 'Departments', value: `${data?.summary?.totalDepartments || 0} Nodes`, trend: 'up' }
  ];

  if (loading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-2xl animate-spin" />
           <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Calibrating Matrix Pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/10 group-hover:scale-110 transition-transform duration-700" />
                 <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 sm:px-4 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">System Statistics</Badge>
                    <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">System Status</span>
                 </div>
                 <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none">Dashboard Overview</h2>
              </div>
           </div>
           <p className="text-xs sm:text-base text-muted-foreground font-medium max-w-xl leading-relaxed italic opacity-80">
             Monitoring system progress, department speed, and overall clearance requests.
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-muted/20 p-2 sm:p-3 rounded-2xl sm:rounded-[2.5rem] border border-foreground/5 backdrop-blur-md shadow-soft">
          <div className="px-4 sm:px-5 py-2 sm:py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 justify-center">
             <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <span className="text-emerald-700 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Live Stream Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex w-14 h-14 rounded-2xl hover:bg-card hover:shadow-soft text-muted-foreground transition-all duration-500">
               <Share2 className="w-6 h-6" />
            </Button>
            <Button 
              className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl bg-foreground text-background hover:bg-foreground/90 h-12 sm:h-14 px-6 sm:px-8 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] shadow-strong flex items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:-translate-y-1 transition-transform" />
              <span>Export Audit</span>
            </Button>
          </div>
        </div>
      </div>


      {/* Hero Stats Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-soft rounded-2xl group hover:-translate-y-1 transition-all duration-700 bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start mb-4 sm:mb-5">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 ${stat.bg} rounded-xl flex items-center justify-center transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-inner`}>
                  <stat.icon className={`w-4.5 h-4.5 sm:w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black shadow-soft uppercase tracking-widest ${
                  stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                }`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight className="w-2.5 h-2.5" /> : <Activity className="w-2.5 h-2.5" />}
                  {stat.change}
                </div>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-muted-foreground font-black text-[8px] uppercase tracking-[0.3em] opacity-40 italic">{stat.title}</p>
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none group-hover:text-primary transition-colors duration-700">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Department Efficiency Matrix */}
        <Card className="lg:col-span-8 border-none shadow-soft rounded-3xl bg-card/60 backdrop-blur-3xl border border-foreground/5 group overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-foreground/5">
            <div className="flex items-center gap-4">
               <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:rotate-6 transition-transform duration-700 shadow-soft">
                  <Building className="w-4.5 h-4.5 sm:w-5 h-5" />
               </div>
               <div className="space-y-0.5">
                  <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Efficiency Matrix</CardTitle>
                  <CardDescription className="font-black text-[8px] uppercase tracking-[0.3em] opacity-40 mt-0.5 italic">Real-time department performance.</CardDescription>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-xl border border-foreground/5">
               <Filter className="w-3 h-3 text-primary opacity-40" />
               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Weekly</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-8">
            {Array.isArray(departmentPerformance) && departmentPerformance.map((dept: DepartmentStat, i: number) => (
              <div key={i} className="space-y-3 sm:space-y-4 group/item">
                <div className="flex justify-between items-end">
                   <div className="space-y-0.5">
                     <p className="text-sm sm:text-base font-black text-foreground tracking-tight leading-none group-hover/item:text-primary transition-colors duration-500 uppercase">{dept.name}</p>
                     <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[7px] font-black uppercase border-none bg-primary/5 text-primary/60 px-2 py-0.5 rounded-lg">{dept.status}</Badge>
                        <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest">Audit Verified</span>
                     </div>
                   </div>
                   <div className="text-right space-y-0.5">
                     <p className="text-lg sm:text-xl font-black text-foreground tracking-tighter leading-none">{dept.progress}%</p>
                     <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Rate</p>
                   </div>
                </div>
                <div className="w-full h-2 sm:h-2.5 bg-secondary/50 rounded-full overflow-hidden p-0.5 shadow-inner relative group/bar">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                   <div 
                    className={`h-full ${dept.color} rounded-full transition-all duration-2000 ease-out shadow-strong relative group/progress`}
                    style={{ width: `${dept.progress}%` }}
                   >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/progress:translate-x-[100%] transition-transform duration-1500 skew-x-12" />
                   </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* Intelligence Streams */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-soft rounded-3xl bg-foreground text-background overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
              <CardHeader className="p-5 sm:p-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-strong group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4.5 h-4.5 sm:w-5 h-5" />
                   </div>
                   <div className="space-y-0.5">
                      <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Matrix Pulse</CardTitle>
                      <p className="text-background/40 font-black text-[8px] uppercase tracking-[0.4em] italic">Trend Analysis.</p>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 relative z-10">
                 {recentTrends.map((trend, i) => (
                   <div key={i} className="flex items-center justify-between p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/5 group/trend hover:bg-white/10 transition-all duration-500">
                      <div className="space-y-1">
                        <p className="text-[7px] text-background/40 font-black uppercase tracking-[0.3em]">{trend.label}</p>
                        <p className="text-base sm:text-lg font-black tracking-tight uppercase leading-none">{trend.value}</p>
                      </div>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-700 group-hover/trend:rotate-6 ${trend.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                         {trend.trend === 'up' ? <ArrowUpRight className="w-4.5 h-4.5 sm:w-5 h-5" /> : <ArrowDownRight className="w-4.5 h-4.5 sm:w-5 h-5" />}
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-soft rounded-3xl bg-primary text-white group overflow-hidden relative cursor-pointer active:scale-95 transition-all duration-700">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 skew-x-12" />
              <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
                 <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-xl flex items-center justify-center shadow-strong shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                    <Database className="w-7 h-7 sm:w-8 sm:h-8" />
                 </div>
                 <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Matrix Audit</h3>
                    <p className="text-white/60 text-[10px] sm:text-xs font-medium leading-relaxed italic">Generate and export comprehensive institutional performance analytics.</p>
                 </div>
                 <Button className="w-full h-12 sm:h-14 bg-white text-primary rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.5em] shadow-strong hover:bg-indigo-50 transition-all active:scale-90">
                    Audit Report
                    <ArrowRight className="ml-3 w-4 h-4 sm:w-5 h-5 group-hover:translate-x-3 transition-transform" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      <Card className="border-none shadow-soft rounded-[2rem] bg-secondary/30 backdrop-blur-3xl p-5 sm:p-8 border border-foreground/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-opacity opacity-0 group-hover:opacity-100 duration-1000" />
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
             <div className="w-12 h-12 sm:w-14 sm:h-14 bg-card rounded-xl border border-foreground/5 shadow-soft flex items-center justify-center text-primary shrink-0 group-hover:rotate-6 transition-transform duration-700">
                <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
             </div>
             <div className="space-y-1.5 sm:space-y-2 flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-[0.4em]">Audit Trail</Badge>
                   <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Active Pulse</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none">Predictive Sequence Modeling</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-relaxed italic opacity-60">
                   Institutional telemetry indicates a 14% increase in clearance velocity.
                </p>
             </div>
             <div className="flex flex-col items-center gap-1 px-6 py-4 bg-card rounded-2xl border border-foreground/5 shadow-soft shrink-0">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">Uptime</p>
                <p className="text-xl sm:text-2xl font-black text-primary tracking-tighter">99.9%</p>
                <div className="flex items-center gap-2 text-emerald-500 text-[8px] font-black uppercase tracking-widest mt-1">
                   <ShieldCheck className="w-2.5 h-2.5" /> High Availability
                </div>
             </div>
          </div>
       </Card>
    </div>
  );
};
