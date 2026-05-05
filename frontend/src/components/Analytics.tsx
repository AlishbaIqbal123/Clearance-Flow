// UI ONLY — NO LOGIC CHANGED
import { 
  TrendingUp, Users, CheckCircle2, AlertCircle, Clock, 
  BarChart3, PieChart, Activity, Building, ArrowUpRight, ArrowDownRight,
  Sparkles, Layers, Zap, Globe, Lock, ShieldCheck, Database,
  ArrowRight, ChevronRight, Info, Calendar, Download, Share2,
  Filter, Search, LayoutGrid, List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Analytics = () => {
  // General statistics
  const stats = [
    { title: 'Total Students', value: '1,482', change: '+12%', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Active Requests', value: '342', change: '+5%', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Completed Steps', value: '1,120', change: '+18%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'System Uptime', value: '99.9%', change: 'Stable', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
  ];

  const departmentPerformance = [
    { name: 'Financial Office', progress: 84, status: 'BUSY', color: 'bg-primary' },
    { name: 'Library', progress: 92, status: 'GOOD', color: 'bg-emerald-500' },
    { name: 'Sports Office', progress: 65, status: 'MODERATE', color: 'bg-amber-500' },
    { name: 'Hostel Office', progress: 78, status: 'GOOD', color: 'bg-indigo-500' },
    { name: 'IT Center', progress: 95, status: 'GOOD', color: 'bg-emerald-500' }
  ];

  const recentTrends = [
    { label: 'Weekly Volume', value: '428 Requests', trend: 'up' },
    { label: 'Avg. Processing', value: '1.4 Days', trend: 'down' },
    { label: 'Requests / Day', value: '56', trend: 'up' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-10">
        <div className="space-y-4 sm:space-y-6">
           <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-18 sm:h-18 bg-primary/10 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/10 group-hover:scale-110 transition-transform duration-700" />
                 <BarChart3 className="w-7 h-7 sm:w-9 sm:h-9 relative z-10" />
              </div>
              <div className="space-y-1">
                 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 sm:px-4 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">System Statistics</Badge>
                    <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">System Status</span>
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Dashboard Overview</h2>
              </div>
           </div>
           <p className="text-sm sm:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed italic">
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
              className="flex-1 sm:flex-none rounded-xl sm:rounded-[1.75rem] bg-foreground text-background hover:bg-foreground/90 h-14 sm:h-16 px-6 sm:px-10 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] shadow-strong flex items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-1 transition-transform" />
              <span>Export Audit</span>
            </Button>
          </div>
        </div>
      </div>


      {/* Hero Stats Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-strong rounded-3xl sm:rounded-[4rem] group hover:-translate-y-2 sm:hover:-translate-y-3 transition-all duration-700 bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
            <CardContent className="p-6 sm:p-10">
              <div className="flex justify-between items-start mb-6 sm:mb-10">
                <div className={`w-14 h-14 sm:w-18 sm:h-18 ${stat.bg} rounded-2xl sm:rounded-[1.75rem] flex items-center justify-center transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-inner`}>
                  <stat.icon className={`w-7 h-7 sm:w-9 sm:h-9 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[10px] font-black shadow-soft uppercase tracking-widest ${
                  stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                }`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <Activity className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-muted-foreground font-black text-[8px] sm:text-[10px] uppercase tracking-[0.4em] opacity-40 italic">{stat.title}</p>
                <h3 className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter uppercase leading-none group-hover:text-primary transition-colors duration-700">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Department Efficiency Matrix */}
        <Card className="lg:col-span-8 border-none shadow-strong rounded-3xl sm:rounded-[4rem] bg-card/60 backdrop-blur-3xl border border-foreground/5 group overflow-hidden">
          <CardHeader className="p-6 sm:p-12 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 border-b border-foreground/5">
            <div className="flex items-center gap-4 sm:gap-6">
               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-700 shadow-soft">
                  <Building className="w-6 h-6 sm:w-8 sm:h-8" />
               </div>
               <div className="space-y-1">
                  <CardTitle className="text-xl sm:text-3xl font-black tracking-tighter uppercase leading-none">Department Performance</CardTitle>
                  <CardDescription className="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.3em] opacity-40 mt-1 sm:mt-2 italic">Activity by different offices.</CardDescription>
               </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-secondary/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-foreground/5">
               <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary opacity-40" />
               <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Past 7 Days</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-12 space-y-8 sm:space-y-12">
            {departmentPerformance.map((dept, i) => (
              <div key={i} className="space-y-4 sm:space-y-6 group/item">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                     <p className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none group-hover/item:text-primary transition-colors duration-500 uppercase">{dept.name}</p>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <Badge variant="outline" className="text-[7px] sm:text-[8px] font-black uppercase border-none bg-primary/5 text-primary/60 px-2 sm:px-3 py-0.5 rounded-lg">{dept.status}</Badge>
                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">Verified Data</span>
                     </div>
                   </div>
                   <div className="text-right space-y-1">
                     <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-none">{dept.progress}%</p>
                     <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Completion Rate</p>
                   </div>
                </div>
                <div className="w-full h-3 sm:h-4 bg-secondary/50 rounded-full overflow-hidden p-0.5 sm:p-1 shadow-inner relative group/bar">
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
        <div className="lg:col-span-4 space-y-12">
           <Card className="border-none shadow-strong rounded-3xl sm:rounded-[4rem] bg-foreground text-background overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse" />
              <CardHeader className="p-8 sm:p-12 relative z-10">
                <div className="flex items-center gap-4 sm:gap-5">
                   <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-strong group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                   </div>
                   <div className="space-y-1">
                      <CardTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Matrix Pulse</CardTitle>
                      <p className="text-background/40 font-black text-[8px] sm:text-[9px] uppercase tracking-[0.4em] italic">Real-time Trend Analysis.</p>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-12 pt-0 space-y-4 sm:space-y-8 relative z-10">
                 {recentTrends.map((trend, i) => (
                   <div key={i} className="flex items-center justify-between p-6 sm:p-8 bg-white/5 rounded-2xl sm:rounded-[2.5rem] border border-white/5 group/trend hover:bg-white/10 transition-all duration-500">
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-[8px] sm:text-[10px] text-background/40 font-black uppercase tracking-[0.3em]">{trend.label}</p>
                        <p className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none">{trend.value}</p>
                      </div>
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-700 group-hover/trend:rotate-12 ${trend.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                         {trend.trend === 'up' ? <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8" /> : <ArrowDownRight className="w-6 h-6 sm:w-8 sm:h-8" />}
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-strong rounded-3xl sm:rounded-[4rem] bg-primary text-white group overflow-hidden relative cursor-pointer active:scale-95 transition-all duration-700">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 skew-x-12" />
              <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-10">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl sm:rounded-[2.5rem] backdrop-blur-xl flex items-center justify-center shadow-strong shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                    <Database className="w-8 h-8 sm:w-10 sm:h-10" />
                 </div>
                 <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase leading-none">Matrix Audit</h3>
                    <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed italic">Generate and export comprehensive institutional performance analytics for board review.</p>
                 </div>
                 <Button className="w-full h-16 sm:h-20 bg-white text-primary rounded-2xl sm:rounded-[2rem] font-black text-[9px] sm:text-[11px] uppercase tracking-[0.5em] shadow-strong hover:bg-indigo-50 transition-all active:scale-90">
                    Audit Report
                    <ArrowRight className="ml-3 sm:ml-5 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-3 transition-transform" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      <Card className="border-none shadow-strong rounded-3xl sm:rounded-[4.5rem] bg-secondary/30 backdrop-blur-3xl p-8 sm:p-16 border border-foreground/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-opacity opacity-0 group-hover:opacity-100 duration-1000" />
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative z-10">
             <div className="w-16 h-16 sm:w-24 sm:h-24 bg-card rounded-2xl sm:rounded-[3rem] border border-foreground/5 shadow-strong flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform duration-700">
                <Activity className="w-8 h-8 sm:w-12 sm:h-12" />
             </div>
             <div className="space-y-3 sm:space-y-4 flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                   <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 sm:px-5 py-1 sm:py-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em]">Historical Integrity</Badge>
                   <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Audit Trail Active</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">Predictive Sequence Modeling</h3>
                <p className="text-sm sm:text-lg text-muted-foreground font-medium leading-relaxed italic opacity-60">
                  Institutional telemetry indicates a 14% increase in clearance velocity following implementation of verification protocols.
                </p>
             </div>
             <div className="flex flex-col items-center gap-1 sm:gap-2 px-8 sm:px-12 py-6 sm:py-8 bg-card rounded-2xl sm:rounded-[2.5rem] border border-foreground/5 shadow-soft shrink-0">
                <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Global Uptime</p>
                <p className="text-3xl sm:text-5xl font-black text-primary tracking-tighter">99.9%</p>
                <div className="flex items-center gap-2 text-emerald-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1 sm:mt-2">
                   <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> High Availability
                </div>
             </div>
          </div>
       </Card>
    </div>
  );
};
