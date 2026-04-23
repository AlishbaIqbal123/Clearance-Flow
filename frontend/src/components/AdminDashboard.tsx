import { useState, useEffect } from 'react';
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
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp, onClick }: { title: string; value: any; icon: any; color: string; trend?: string; trendUp?: boolean; onClick?: () => void }) => (
  <Card 
    className={`border-none shadow-xl shadow-slate-200/40 rounded-[2rem] bg-white overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-8 relative">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full ${color} opacity-5 blur-2xl group-hover:scale-110 transition-transform`} />
      <div className="flex items-start justify-between relative">
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shadow-sm w-fit`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {trend}
              <span className="text-slate-400 text-[10px] font-medium ml-1">vs last month</span>
            </div>
          )}
        </div>
        {onClick && (
          <div className="p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const AdminDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Admin Overview</h2>
          <p className="text-slate-500 font-medium">Welcome back! Here's what's happening across the university today.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 h-12 px-6 font-bold text-slate-600 hover:bg-slate-50"
            onClick={() => toast.info('Exporting analytical data...')}
           >
             Export Data
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-12 px-6 font-bold shadow-xl shadow-slate-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Quick Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuItem className="rounded-xl font-bold" onClick={() => onNavigate('students')}>
                  <Users className="w-4 h-4 mr-2" />
                  New Student
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl font-bold" onClick={() => onNavigate('departments')}>
                  <Building2 className="w-4 h-4 mr-2" />
                  New Department
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl font-bold" onClick={() => onNavigate('users')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  New Official
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={counts.totalStudents.toLocaleString()} 
          icon={Users} 
          color="bg-blue-600" 
          trend="12.5%" 
          trendUp={true} 
          onClick={() => onNavigate('students')}
        />
        <StatCard 
          title="Departments" 
          value={counts.totalDepartments} 
          icon={Building2} 
          color="bg-purple-600" 
          trend="2 new" 
          trendUp={true} 
          onClick={() => onNavigate('departments')}
        />
        <StatCard 
          title="Active Requests" 
          value={counts.totalClearanceRequests} 
          icon={FileText} 
          color="bg-amber-600" 
          trend="5.2%" 
          trendUp={false} 
          onClick={() => onNavigate('requests')}
        />
        <StatCard 
          title="Total Officials" 
          value={counts.totalStaff} 
          icon={CheckCircle2} 
          color="bg-emerald-600" 
          trend="99.9%" 
          trendUp={true} 
          onClick={() => onNavigate('users')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Card */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Clearance Distribution</CardTitle>
                <CardDescription className="font-medium text-slate-500">Breakdown of current clearance statuses across system</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 py-1.5 rounded-full font-bold">LIVE UPDATES</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
               {chartData.map((item) => (
                 <div key={item.name} className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                       <h4 className="text-xl font-black text-slate-900 tracking-tighter">{item.value}</h4>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Table Card */}
        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Bottlenecks</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Departments with most pending requests</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {(Array.isArray(departmentPendingStats) ? departmentPendingStats : []).slice(0, 5).map((dept: any, index: number) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-slate-300 w-4 group-hover:text-blue-500 transition-colors">0{index + 1}</span>
                       <span className="text-sm font-bold text-slate-700 tracking-tight">{dept.department?.name || dept.departmentName}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{dept.count}</span>
                  </div>
                  <Progress value={(dept.count / 100) * 100} className="h-1.5 bg-slate-100 rounded-full" />
                </div>
              ))}
              
              {departmentPendingStats.length === 0 && (
                <div className="py-12 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                   </div>
                   <p className="text-sm font-bold text-slate-500">All departments are cleared! 🚀</p>
                </div>
              )}
            </div>
          </CardContent>
          {departmentPendingStats.length > 5 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
               <Button variant="link" className="text-xs font-black uppercase tracking-widest text-slate-600">
                  View All Statistics <ArrowRight className="w-3 h-3 ml-2" />
               </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students by Department */}
        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Academic Distribution</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Students enrolled per department</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStudentStats} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Summary */}
        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden flex flex-col justify-center p-10 text-center space-y-6">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-10 h-10 text-blue-600" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Academic Registry Ready</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">All departments (including Biotech and Math) are now fully integrated into the clearance workflow.</p>
           </div>
           <Button className="rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 text-white font-black px-8 shadow-xl" onClick={() => onNavigate('students')}>
              MANAGE STUDENT REGISTRY
           </Button>
        </Card>
      </div>

      {/* Recent Requests List */}
      <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 flex flex-row items-center justify-between border-b border-slate-50">
          <div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Recent Clearance Activities</CardTitle>
            <CardDescription className="text-slate-500 font-medium">The most recent requests and updates from across the system</CardDescription>
          </div>
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-6 h-12 shadow-sm">
            View All Logs
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Information</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Request ID</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</TableHead>
                <TableHead className="py-5 text-right px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(recentRequests) ? recentRequests : []).map((request: any) => (
                <TableRow key={request.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                         {request.student?.first_name?.[0]}{request.student?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight">{request.student?.first_name} {request.student?.last_name}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{request.student?.registration_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 tracking-wider">
                      {request.request_id}
                    </code>
                  </TableCell>
                  <TableCell className="capitalize font-black text-xs text-slate-600">
                    {request.request_type}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                       <p className="text-xs font-bold text-slate-700">{new Date(request.created_at).toLocaleDateString()}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-lg transition-all">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2 shadow-2xl">
                         <DropdownMenuItem className="rounded-xl mt-1 font-bold"><FileText className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                         <DropdownMenuItem className="rounded-xl mt-1 font-bold"><Clock className="w-4 h-4 mr-2" /> Timeline View</DropdownMenuItem>
                         <DropdownMenuItem className="rounded-xl mt-1 font-bold text-red-600"><AlertCircle className="w-4 h-4 mr-2" /> Flag Issue</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              
              {recentRequests.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="h-48 text-center px-10">
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No Recent Activity Found</p>
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
