import { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  Mail, MessageCircle, MapPin, Phone, Loader2,
  FileText, ArrowRight, Building2, RefreshCcw,
  Trophy, Info, ExternalLink, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { studentService } from '@/lib/student.service';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; dot: string }> = {
  cleared: {
    label: 'Cleared',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: Clock,
    dot: 'bg-blue-500'
  },
  pending: {
    label: 'Pending',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: Clock,
    dot: 'bg-slate-300'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    dot: 'bg-red-500'
  }
};
const DepartmentCard = ({
  dept,
  index,
  isActive,
  isCompleted,
  isFuture,
  student,
  allStatuses
}: {
  dept: any;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  student: any;
  allStatuses: any[];
}) => {
  const isAcademic = dept.department?.type === 'academic';
  const phase1Cleared = (allStatuses || []).every((s: any) => 
    s.department?.type === 'academic' || s.status === 'cleared'
  );

  const rawStatus = dept.status || 'pending';
  const effectiveStatus = isActive ? 'in_progress' : rawStatus;
  const cfg = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  const handleWhatsApp = () => {
    const phone = dept.department?.contact_info?.phone || dept.department?.phone;
    if (phone) {
      const clean = phone.replace(/[^0-9]/g, '');
      window.open(
        `https://wa.me/${clean}?text=Assalam-o-Alaikum%2C%20I%20am%20inquiring%20about%20my%20clearance%20request%20at%20${encodeURIComponent(dept.department?.name || 'your department')}.`,
        '_blank'
      );
    } else {
      toast.error('WhatsApp number not available for this department');
    }
  };

  const handleEmail = () => {
    const rawEmail = dept.department?.contact_info?.email || dept.department?.email;
    const emailMatch = rawEmail?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch ? emailMatch[0] : null;
    if (email) {
      window.location.href = `mailto:${email}?subject=Clearance%20Inquiry%20-%20${encodeURIComponent(dept.department?.name || 'Department')}`;
    } else {
      toast.error('Email not available for this department');
    }
  };

  return (
    <div className="flex gap-4 relative">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`
          relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0
          ${isCompleted ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100' : ''}
          ${isActive ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 animate-pulse' : ''}
          ${isFuture ? 'bg-white border-slate-200' : ''}
        `}>
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
          {isActive && <Clock className="w-5 h-5 text-white" />}
          {isFuture && <span className="text-xs font-black text-slate-300">{index + 1}</span>}
        </div>
        {/* Vertical line */}
        <div className={`w-0.5 flex-1 mt-1 min-h-[3rem] transition-colors duration-500 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-100'}`} />
      </div>

      {/* Card */}
      <div className={`
        flex-1 mb-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${isActive ? 'border-blue-300 shadow-xl shadow-blue-50 scale-[1.01]' : ''}
        ${isCompleted ? 'border-emerald-100 shadow-sm' : ''}
        ${isFuture ? 'border-slate-100 opacity-60' : ''}
        bg-white
      `}>
        {/* Active indicator bar */}
        {isActive && (
          <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500 w-full" />
        )}
        {isCompleted && (
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500 w-full" />
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0
                ${isActive ? 'bg-blue-100 text-blue-700' : ''}
                ${isCompleted ? 'bg-emerald-100 text-emerald-700' : ''}
                ${isFuture ? 'bg-slate-50 text-slate-400' : ''}
              `}>
                {dept.department?.code || (index + 1)}
              </div>
              <div>
                <h3 className={`font-black text-base leading-tight ${isFuture ? 'text-slate-400' : 'text-slate-900'}`}>
                  {dept.department_id === student.department_id ? student.discipline : (dept.department?.name || `Department ${index + 1}`)}
                </h3>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isFuture ? 'text-slate-300' : 'text-slate-400'}`}>
                  {dept.department?.type || 'Administrative'} Office
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
               {isAcademic && !phase1Cleared && dept.status === 'pending' ? (
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[9px] font-black uppercase py-1">Phase 2: Locked</Badge>
               ) : (
                  <div className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black flex-shrink-0
                    ${cfg.bg} ${cfg.color} border ${cfg.border}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
                    {(dept.status || 'pending').replace('_', ' ').toUpperCase()}
                  </div>
               )}
            </div>
          </div>
          
          {isAcademic && !phase1Cleared && dept.status === 'pending' && (
             <div className="mb-4 p-4 rounded-2xl border bg-slate-50 border-slate-100 flex gap-3">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                  This departmental clearance is in Phase 2. It will be enabled once you have obtained clearance from all Phase 1 administrative offices (Library, Finance, etc.).
                </p>
             </div>
          )}

          {(!isAcademic || phase1Cleared || dept.status !== 'pending') && dept.department?.contact_info?.form_visible && dept.department?.contact_info?.form_link && (
             <div className="mb-4 p-4 rounded-2xl border bg-purple-50 border-purple-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <Link2 className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Please fill this first</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full bg-white border-purple-200 text-purple-700 hover:bg-purple-100 font-bold"
                  onClick={() => window.open(dept.department.contact_info.form_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Required Form
                </Button>
             </div>
          )}

          {/* Remarks */}
          {dept.remarks && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-700 font-medium italic">"{dept.remarks}"</p>
            </div>
          )}

          {/* Due amount */}
          {dept.due_amount > 0 && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-700">Outstanding Dues: <span className="font-black">Rs. {dept.due_amount?.toLocaleString()}</span></p>
            </div>
          )}

          {/* Cleared by / timestamp */}
          {isCompleted && dept.cleared_at && (
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[11px] text-emerald-600 font-bold">
                Cleared on {new Date(dept.cleared_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Contact buttons — always visible */}
          {!isFuture && (
            <div className="flex gap-2 pt-3 border-t border-slate-50">
              <Button
                size="sm"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-1.5 text-xs flex-1 h-9 shadow-md shadow-emerald-100"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-bold gap-1.5 text-xs flex-1 h-9"
                onClick={handleEmail}
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </Button>
            </div>
          )}

          {/* Contact info footer */}
          {(dept.department?.contact_info?.email || dept.department?.contact_info?.phone) && !isFuture && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {dept.department?.contact_info?.email && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Mail className="w-3 h-3" />
                  {dept.department.contact_info.email}
                </span>
              )}
              {dept.department?.contact_info?.phone && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Phone className="w-3 h-3" />
                  {dept.department.contact_info.phone}
                </span>
              )}
              {dept.department?.location && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <MapPin className="w-3 h-3" />
                  {dept.department.location}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MyClearance = ({ filterType }: { filterType?: 'administrative' | 'academic' }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await studentService.getDashboard();
      if (res.success) setData(res.data);
    } catch {
      toast.error('Failed to load clearance status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const activeRequest = data?.activeRequest;
  const allDepartments: any[] = activeRequest?.clearance_status || [];
  
  // Filter departments based on type
  const departments = allDepartments.filter(dept => {
    if (!filterType) return true;
    const isAcademic = dept.department?.type === 'academic';
    return filterType === 'academic' ? isAcademic : !isAcademic;
  });

  const progress = activeRequest?.progress || {};

  const getDeptDisplayName = (deptId: string, deptName: string) => {
    if (deptId === data.student.department_id && data.student.discipline) {
      return data.student.discipline;
    }
    return deptName;
  };

  // Determine which department is currently being processed for this specific view
  let activeIndex = -1;
  if (activeRequest && departments.length > 0) {
    activeIndex = departments.findIndex(d => d.status !== 'cleared');
  }

  const pageTitle = filterType === 'academic' ? 'Academic Clearance' : filterType === 'administrative' ? 'Administrative Clearance' : 'My Clearance';
  const pageDescription = filterType === 'academic' 
    ? 'Phase 2: Final sign-off from your academic department head.' 
    : filterType === 'administrative' 
    ? 'Phase 1: Clear all service departments including Library, Finance, and Sports.'
    : 'Track your clearance journey across all university departments';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pageTitle}</h2>
          <p className="text-slate-500 font-medium mt-1">{pageDescription}</p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-slate-200 font-bold gap-2 h-10"
          onClick={fetchStatus}
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>

      {activeRequest ? (
        <>
          {/* Progress Summary (Only show on main or admin page) */}
          {(!filterType || filterType === 'administrative') && (
            <Card className="border-none shadow-xl shadow-blue-100/50 rounded-[2rem] overflow-hidden bg-white">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-24 -translate-x-24" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-blue-100 text-xs font-black uppercase tracking-widest">Live Tracking</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">
                      {progress.clearedDepartments || 0} / {progress.totalDepartments || allDepartments.length}
                      <span className="text-blue-200 text-lg font-bold ml-2">Departments Cleared</span>
                    </h3>
                    <p className="text-blue-100 mt-1 font-medium">
                      Request ID: <span className="font-black text-white">{activeRequest.request_id}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black tracking-tighter">{progress.percentage || 0}%</div>
                    <div className="text-blue-200 text-xs font-black uppercase tracking-widest mt-1">Overall Progress</div>
                  </div>
                </div>

                <div className="relative mt-6">
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${progress.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Active Department Highlight */}
          {activeIndex >= 0 && (
            <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse flex-shrink-0" />
              <p className="text-sm font-bold text-blue-800">
                Awaiting approval:{' '}
                <span className="font-black">
                  {getDeptDisplayName(departments[activeIndex]?.department_id, departments[activeIndex]?.department?.name || 'Unknown Department')}
                </span>
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            <div className="space-y-0">
              {departments.map((dept, index) => {
                const isCompleted = dept.status === 'cleared';
                const isActive = index === activeIndex;
                const isFuture = !isCompleted && !isActive;
                return (
                  <DepartmentCard
                    key={dept.id || index}
                    dept={dept}
                    index={index}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    isFuture={isFuture}
                    student={data.student}
                    allStatuses={allDepartments}
                  />
                );
              })}
            </div>

            {/* Final completion node (Only on Academic page) */}
            {filterType === 'academic' && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0
                    ${progress.percentage === 100
                      ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100'
                      : 'bg-white border-dashed border-slate-200'
                    }
                  `}>
                    <Trophy className={`w-5 h-5 ${progress.percentage === 100 ? 'text-white' : 'text-slate-200'}`} />
                  </div>
                </div>
                <div className={`
                  flex-1 mb-2 rounded-2xl border-2 p-5 flex items-center gap-4
                  ${progress.percentage === 100
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-dashed border-slate-100 bg-slate-50/50'
                  }
                `}>
                  <div>
                    <p className={`font-black text-lg ${progress.percentage === 100 ? 'text-emerald-700' : 'text-slate-300'}`}>
                      {progress.percentage === 100 ? '🎉 Final Degree Clearance Complete!' : 'Final Degree Certificate'}
                    </p>
                    <p className={`text-xs font-medium mt-0.5 ${progress.percentage === 100 ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {progress.percentage === 100
                        ? 'Your final clearance has been verified by the Academic HOD.'
                        : 'Unlocked after Phase 1 and Academic sign-off.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* No active request state */
        <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] p-16 text-center bg-white">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No Active Clearance</h3>
          <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto">
            You haven't initiated your clearance process yet. Go to the Dashboard and click "Initiate New Clearance".
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
            <ArrowRight className="w-4 h-4" />
            Head to your Dashboard to get started
          </div>
        </Card>
      )}
    </div>
  );
};

export const AdminClearance = () => <MyClearance filterType="administrative" />;
export const AcademicClearance = () => <MyClearance filterType="academic" />;
