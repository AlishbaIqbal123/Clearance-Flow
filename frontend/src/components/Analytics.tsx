import { 
  TrendingUp, Users, CheckCircle2, AlertCircle, Clock, 
  BarChart3, PieChart, Activity, Building, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const Analytics = () => {
  // Demo Data for testing
  const stats = [
    { title: 'Total Students', value: '0', change: '0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Requests', value: '0', change: '0%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Fully Cleared', value: '0', change: '0%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'System Uptime', value: '100%', change: 'Stable', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  const departmentPerformance = [
    { name: 'Library', progress: 0, status: 'Idle', color: 'bg-slate-300' },
    { name: 'Accounts Office', progress: 0, status: 'Idle', color: 'bg-slate-300' },
    { name: 'Sports Dept', progress: 0, status: 'Idle', color: 'bg-slate-300' },
    { name: 'Hostel Warden', progress: 0, status: 'Idle', color: 'bg-slate-300' },
    { name: 'IT Services', progress: 0, status: 'Idle', color: 'bg-slate-300' }
  ];

  const recentTrends = [
    { label: 'Weekly Requests', value: 0, trend: 'neutral' },
    { label: 'Average Processing Time', value: '0 days', trend: 'neutral' },
    { label: 'Certificate Issuance', value: 0, trend: 'neutral' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Systems Intelligence</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time analytics & performance metrics</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-700 text-xs font-black uppercase tracking-wider">Live Monitoring</span>
           </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] group hover:scale-[1.02] transition-all bg-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${stat.bg} rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-6`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                  stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Efficiency */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-100/50 rounded-[3rem] bg-white">
          <CardHeader className="p-10 pb-4">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Building className="w-5 h-5" /></div>
               <CardTitle className="text-2xl font-black tracking-tight">Departmental Efficiency</CardTitle>
            </div>
            <CardDescription className="font-medium text-slate-400">Processing throughput by administrative unit</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-6 space-y-8">
            {departmentPerformance.map((dept, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                   <div>
                     <p className="font-black text-slate-900 tracking-tight leading-none mb-1">{dept.name}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dept.status} VOLUME</p>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-slate-900">{dept.progress}%</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CLEARANCE RATE</p>
                   </div>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                   <div 
                    className={`h-full ${dept.color} rounded-full transition-all duration-1000 shadow-lg`}
                    style={{ width: `${dept.progress}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Insights */}
        <div className="space-y-8">
           <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[3rem] bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-blue-400" />
                   System Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 {recentTrends.map((trend, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">{trend.label}</p>
                        <p className="text-xl font-black">{trend.value}</p>
                      </div>
                      <div className={`p-2 rounded-xl ${trend.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                         {trend.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white group overflow-hidden">
              <CardContent className="p-10 relative">
                 <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                 <BarChart3 className="w-10 h-10 mb-6 text-indigo-200" />
                 <h3 className="text-2xl font-black leading-tight mb-2">Automated Audit Available</h3>
                 <p className="text-indigo-100/80 font-medium mb-8">Generate comprehensive system performance reports in one click.</p>
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20">
                    Export Statistics
                 </button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};
