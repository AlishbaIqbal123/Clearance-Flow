import { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { studentService } from '@/lib/student.service';

const StatCard = ({ title, value, icon: Icon, color, onClick }: { title: string; value: any; icon: any; color: string; onClick?: () => void }) => (
  <Card 
    className={`border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:bg-white hover:-translate-y-1' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-6 relative">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${color} opacity-5 blur-2xl`} />
      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-sm`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
          </div>
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-slate-300 self-center" />}
      </div>
    </CardContent>
  </Card>
);

export const StudentDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState('graduation');
  const [reason, setReason] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSubmitRequest = async () => {
    if (!reason) {
      toast.error('Please provide a reason for clearance');
      return;
    }
    setSubmitting(true);
    try {
      const res = await studentService.submitRequest({ requestType, reason });
      if (res.success) {
        // If there are files, upload them
        if (selectedFiles.length > 0) {
          const formData = new FormData();
          selectedFiles.forEach(file => formData.append('files', file));
          await studentService.uploadDocuments(res.data.request.id, formData);
        }
        
        toast.success('Clearance request submitted successfully');
        setReason('');
        setSelectedFiles([]);
        fetchDashboard();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const student = data?.student || {};
  const activeRequest = data?.activeRequest || null;
  const canSubmitNewRequest = data?.canSubmitNewRequest ?? true;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Salaam, {student.first_name || 'Student'}! 👋</h2>
            <p className="text-blue-100 font-medium">Manage your university clearance process from your personal dashboard.</p>
            <div className="flex items-center gap-3 mt-4">
              <Badge variant="outline" className="border-blue-400 text-blue-50 bg-blue-500/30 font-bold px-3 py-1 uppercase tracking-wider text-[10px]">
                ID: {student.registration_number}
              </Badge>
              <Badge variant="outline" className="border-blue-400 text-blue-50 bg-blue-500/30 font-bold px-3 py-1 uppercase tracking-wider text-[10px]">
                Dept: {student.department?.code || 'N/A'}
              </Badge>
            </div>
          </div>
          
          {canSubmitNewRequest && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 rounded-2xl font-bold shadow-xl shadow-blue-900/20 group">
                  <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Initiate New Clearance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-slate-900">Request Clearance</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    This will initiate the clearance process across all university departments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Clearance Type</label>
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="graduation">Final Graduation Clearance</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal / Leaving University</SelectItem>
                        <SelectItem value="transfer">Campus Transfer</SelectItem>
                        <SelectItem value="semester_end">Semester End Clearance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Detailed Reason</label>
                    <Textarea 
                      placeholder="Please specify why you are requesting clearance..." 
                      className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Supporting Documents (Optional)</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        id="file-upload" 
                        multiple 
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedFiles(prev => [...prev, ...files]);
                        }}
                      />
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed border-2 border-slate-200 rounded-xl h-20 flex flex-col gap-1 hover:border-blue-300 hover:bg-blue-50 transition-all"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <FileText className="w-6 h-6 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Click to upload files</span>
                      </Button>
                      
                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedFiles.map((file, idx) => (
                            <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 rounded-lg bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                              <span className="max-w-[150px] truncate">{file.name}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-5 h-5 rounded-full hover:bg-red-50 hover:text-red-600"
                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                              >
                                ×
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Note: Once submitted, your request will be sent to all departments simultaneously. 
                      You cannot edit the reason after submission.
                    </p>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="ghost" className="rounded-xl h-12 font-bold text-slate-500">Cancel</Button>
                  <Button 
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 h-12 px-8 font-bold shadow-lg shadow-blue-100 flex-1"
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Submit Request'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Current Status" 
          value={student.clearance_status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'} 
          icon={Info} 
          color="bg-blue-600" 
          onClick={() => onNavigate('my-clearance')}
        />
        <StatCard 
          title="Completed" 
          value={activeRequest?.progress?.clearedDepartments || 0} 
          icon={CheckCircle2} 
          color="bg-emerald-600" 
          onClick={() => onNavigate('my-clearance')}
        />
        <StatCard 
          title="Total Required" 
          value={activeRequest?.progress?.totalDepartments || (data?.departments?.length || 0)} 
          icon={FileText} 
          color="bg-slate-600" 
          onClick={() => onNavigate('my-clearance')}
        />
        <StatCard 
          title="History" 
          value={data?.clearanceHistory?.length || 0} 
          icon={Calendar} 
          color="bg-purple-600" 
          onClick={() => toast.info('Historical data is shown in the My Clearance tab')}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Progress */}
        <div className="lg:col-span-2 space-y-6">
          {activeRequest ? (
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Active Clearance Progress</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Real-time status tracking for ID: <span className="text-blue-600 font-bold">{activeRequest.request_id}</span></CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Overall Completion</p>
                    <h4 className="text-3xl font-black text-blue-600 tracking-tighter mt-1">{activeRequest.progress?.percentage || 0}%</h4>
                  </div>
                </div>
                <div className="mt-8 relative">
                   <Progress value={activeRequest.progress?.percentage || 0} className="h-4 bg-slate-100 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {(Array.isArray(activeRequest.clearance_status) 
                      ? [...activeRequest.clearance_status].sort((a, b) => {
                          const priority: any = { 'cleared': 1, 'rejected': 2, 'in_review': 3, 'pending': 4 };
                          return priority[a.status] - priority[b.status];
                        })
                      : []
                    ).map((ds: any) => {
                      const getStatusStyle = () => {
                        switch (ds.status) {
                          case 'cleared': return 'bg-white border-emerald-100 shadow-emerald-50';
                          case 'rejected': return 'bg-white border-rose-100 shadow-rose-50';
                          case 'in_review': return 'bg-white border-blue-100 shadow-blue-50';
                          default: return 'bg-white border-slate-100 shadow-slate-50';
                        }
                      };

                      const Icon = ds.status === 'cleared' ? CheckCircle2 : ds.status === 'rejected' ? AlertCircle : ds.status === 'in_review' ? Loader2 : Clock;
                      const iconColor = ds.status === 'cleared' ? 'text-emerald-500' : ds.status === 'rejected' ? 'text-rose-500' : ds.status === 'in_review' ? 'text-blue-500' : 'text-amber-500';

                      return (
                        <div key={ds.id} className={`group relative p-5 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getStatusStyle()}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors`}>
                                <Icon className={`w-5 h-5 ${iconColor} ${ds.status === 'in_review' ? 'animate-[spin_3s_linear_infinite]' : ''}`} />
                              </div>
                              <div className="min-w-0 pr-10">
                                <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ds.department?.name || 'Department Name'}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">{ds.department?.code || 'CODE'}</p>
                              </div>
                            </div>
                            <StatusBadge status={ds.status} size="sm" />
                          </div>

                          {/* Center Section: Remarks/Dues */}
                          {(ds.remarks || ds.due_amount > 0) && (
                            <div className={`mb-4 p-3 rounded-2xl border ${ds.status === 'rejected' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                              {ds.due_amount > 0 && (
                                 <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Dues: Rs. {ds.due_amount.toLocaleString()}</p>
                              )}
                              {ds.remarks && (
                                <p className="text-xs text-slate-600 font-medium line-clamp-2 italic">"{ds.remarks}"</p>
                              )}
                            </div>
                          )}

                          {/* Bottom Section: Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                             <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8 h-8 rounded-xl text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => {
                                     const contact = ds.department?.contact_info || {};
                                     const whatsapp = contact.whatsapp_number;
                                     if (whatsapp && whatsapp !== '') {
                                       const clean = whatsapp.replace(/\D/g, '');
                                       window.open(`https://wa.me/${clean}`, '_blank');
                                     } else {
                                       toast.error('WhatsApp not configured for this office');
                                     }
                                  }}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8 h-8 rounded-xl text-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    const contact = ds.department?.contact_info || {};
                                    const isSecondary = contact.contact_preference === 'secondary';
                                    const headEmail = ds.department?.head?.email;
                                    const email = (isSecondary ? contact.secondary_email : contact.email) || contact.email || headEmail || ds.department?.email;
                                    
                                    if (email && email !== 'N/A') {
                                      window.location.href = `mailto:${email}`;
                                    } else {
                                      toast.error('No contact email registered for this department');
                                    }
                                  }}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </Button>
                             </div>
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                {ds.department?.type}
                             </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-12 text-center bg-white">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No Active Clearance Request</h3>
                <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">
                  Initiate your clearance process by clicking the button above. 
                  Keep track of every department's approval in real-time.
                </p>
                {canSubmitNewRequest && (
                  <Button 
                    variant="outline" 
                    className="mt-8 border-slate-200 rounded-xl px-8 h-12 font-bold hover:bg-slate-50"
                    onClick={() => {
                       const el = document.querySelector('[role="dialog"]');
                       if(!el) (document.querySelector('button.bg-white.text-blue-600') as HTMLButtonElement)?.click();
                    }}
                  >
                    Start Clearance Now
                  </Button>
                )}
              </Card>

              {/* Requirement Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Required Departments ({data?.departments?.length || 0})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {(data?.departments || []).map((dept: any) => {
                     const contact = dept.contact_info || {};
                     const isSecondary = contact.contact_preference === 'secondary';
                     const displayEmail = (isSecondary ? contact.secondary_email : contact.email) || contact.email || 'N/A';

                     return (
                       <Card key={dept.id} className="border-none shadow-sm rounded-2xl bg-white/60 backdrop-blur-sm p-4 flex items-center gap-4 group hover:bg-white transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-colors ${dept.type === 'academic' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                             {dept.code}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h5 className="text-sm font-bold text-slate-800 leading-none mb-1 truncate">{dept.name}</h5>
                             <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${dept.type === 'academic' ? 'text-indigo-400' : 'text-slate-400'}`}>
                               {displayEmail}
                             </p>
                          </div>
                       </Card>
                     );
                   })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-slate-900 overflow-hidden group">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <CardTitle className="text-white text-xl font-bold tracking-tight relative flex items-center gap-2">
                Need Help?
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2 font-medium relative leading-relaxed">
                Contact the central clearance cell if you face any issues with your portal.
              </CardDescription>
              <div className="space-y-3 mt-6 relative">
                 <Button 
                  className="w-full bg-white text-slate-900 border-none hover:bg-slate-100 rounded-xl h-11 font-bold"
                  onClick={() => window.open('mailto:support@university.edu.pk')}
                 >
                    <Mail className="w-4 h-4 mr-2" />
                    Support Email
                 </Button>
                 <Button 
                  variant="outline" 
                  className="w-full border-slate-700 text-white hover:bg-slate-800 rounded-xl h-11 font-bold"
                  onClick={() => toast.info('Knowledge Base is currently being updated.')}
                 >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Knowledge Base
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Department Contact Card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">Direct Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {(data?.departments || []).slice(0, 4).map((dept: any) => (
                <div key={dept.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {dept.code}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 truncate w-24 sm:w-auto">{dept.name}</h5>
                      <p className="text-[10px] font-medium text-slate-400 italic">Central Admin</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {
                        const whatsapp = dept.contact_info?.whatsapp_number;
                        if (whatsapp) window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}`, '_blank');
                        else toast.error('WhatsApp not configured');
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-7 h-7 rounded-lg text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        const email = dept.contact_info?.email;
                        if (email) window.location.href = `mailto:${email}`;
                        else toast.error('Email not configured');
                      }}
                    >
                       <Mail className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2">
                 View Directory <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
