// UI ONLY — NO LOGIC CHANGED
import { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  MapPin, 
  Save, 
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  Link2,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronRight,
  Loader2,
  Settings2,
  LayoutGrid,
  ExternalLink,
  Info,
  Activity,
  Layers,
  Globe2,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

export const DepartmentProfile = ({ user }: { user: any }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deptData, setDeptData] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get('/departments/profile');
      if (res.success) {
        setDeptData(res.data.department);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load institutional node parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: res } = await api.put('/departments/profile', {
        description: deptData.description,
        location: deptData.location,
        office_hours: deptData.office_hours,
        contactInfo: deptData.contact_info
      });
      if (res.success) {
        toast.success('Node configuration persisted');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to update node configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
           <div className="w-20 h-20 bg-card rounded-2xl border border-foreground/5 shadow-strong flex items-center justify-center relative z-10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
           </div>
        </div>
        <div className="space-y-2 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Node Matrix...</p>
           <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Authenticating Institutional Registry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-12">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/10 group-hover:scale-110 transition-transform duration-700" />
                 <Settings2 className="w-6 h-6 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em]">Profile Info</Badge>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Department Details</span>
                 </div>
                 <h2 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">Department Settings</h2>
              </div>
           </div>
           <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed italic">
             Defining institutional communication endpoints and administrative visibility protocols for academic synchronization.
           </p>
        </div>
        
        <Button 
          className="rounded-xl bg-foreground text-background hover:bg-foreground/90 h-10 px-6 font-black text-[9px] uppercase tracking-[0.3em] shadow-strong flex items-center gap-2 active:scale-95 transition-all group overflow-hidden relative shrink-0"
          onClick={handleSave}
          disabled={saving}
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> <span>Save Changes</span></>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Matrix */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Module: Communication Sequences */}
          <Card className="border-none shadow-strong rounded-2xl bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 group">
             <div className="bg-foreground p-6 text-background relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-125" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-strong group-hover:rotate-6 transition-transform duration-700">
                      <Mail className="w-6 h-6 text-white" />
                   </div>
                   <div className="space-y-0.5">
                      <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none">Contact Info</CardTitle>
                      <CardDescription className="text-background/50 font-black text-[8px] uppercase tracking-[0.3em] italic mt-0.5">Primary contact points.</CardDescription>
                   </div>
                </div>
             </div>
             <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/80 ml-2">Official Email</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary opacity-60 group-focus-within/input:opacity-100 transition-opacity relative z-10" />
                    <Input 
                      value={deptData?.contact_info?.email || deptData?.email || ''} 
                      onChange={(e) => setDeptData({
                        ...deptData, 
                        contact_info: { ...deptData?.contact_info, email: e.target.value }
                      })}
                      className="pl-10 h-10 rounded-xl bg-secondary/40 border-none font-bold text-foreground transition-all duration-500 shadow-inner relative z-10 text-[10px] tracking-tighter uppercase focus:bg-card focus:ring-4 focus:ring-primary/10" 
                      placeholder="dept.official@univ.edu"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/70 ml-2">Secondary Email</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within/input:text-primary transition-colors relative z-10" />
                    <Input 
                      value={deptData?.contact_info?.secondary_email || ''} 
                      onChange={(e) => setDeptData({
                        ...deptData, 
                        contact_info: { ...deptData?.contact_info, secondary_email: e.target.value }
                      })}
                      className="pl-10 h-10 rounded-xl border-none bg-secondary/50 focus:bg-card focus:ring-4 focus:ring-primary/10 font-bold text-foreground transition-all duration-500 shadow-inner relative z-10 text-xs" 
                      placeholder="registrar.node@univ.edu"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 group/pref hover:bg-primary/10 transition-all duration-700">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center text-primary group-hover/pref:scale-110 group-hover/pref:rotate-12 transition-all duration-700 border border-foreground/5">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-lg font-black text-foreground tracking-tighter uppercase">Routing Preference</h4>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed max-w-xs opacity-60">Determines which email is shown to students.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl shadow-strong border border-foreground/5 shrink-0 transition-transform hover:scale-105 duration-500">
                  <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 transition-colors ${deptData?.contact_info?.contact_preference !== 'secondary' ? 'text-primary' : 'text-foreground/40'}`}>Primary</span>
                  <Switch 
                    checked={deptData?.contact_info?.contact_preference === 'secondary'} 
                    onCheckedChange={(checked) => setDeptData({
                      ...deptData,
                      contact_info: { ...deptData?.contact_info, contact_preference: checked ? 'secondary' : 'university' }
                    })}
                    className="data-[state=checked]:bg-primary h-5 w-9"
                  />
                  <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 transition-colors ${deptData?.contact_info?.contact_preference === 'secondary' ? 'text-primary' : 'text-foreground/40'}`}>Manual</span>
                </div>
              </div>
             </CardContent>
          </Card>

          {/* Module: Real-time Telemetry & Help */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-strong rounded-2xl bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 group">
              <CardHeader className="p-6 border-b border-foreground/5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-700">
                      <MessageCircle className="w-5 h-5" />
                   </div>
                   <div className="space-y-0.5">
                      <CardTitle className="text-base font-black tracking-tighter uppercase">Direct Assistance</CardTitle>
                      <CardDescription className="font-black text-[7px] uppercase tracking-[0.2em] opacity-40 mt-0.5">Institutional Support Vectors.</CardDescription>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground ml-2">WhatsApp Secure Channel</Label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/input:text-emerald-500 transition-colors" />
                    <Input 
                      value={deptData?.contact_info?.whatsapp_number || ''} 
                      onChange={(e) => setDeptData({
                        ...deptData, 
                        contact_info: { ...deptData?.contact_info, whatsapp_number: e.target.value }
                      })}
                      className="pl-10 h-10 rounded-xl bg-secondary/50 border-none font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all duration-500 tracking-widest shadow-inner" 
                      placeholder="+92 000 0000000"
                    />
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-2">
                   <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                   <p className="text-[8px] font-black text-emerald-700/60 uppercase tracking-widest leading-relaxed">Direct support helps students resolve issues faster.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-strong rounded-2xl bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 group">
              <CardHeader className="p-6 border-b border-foreground/5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:-rotate-12 transition-transform duration-700">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div className="space-y-0.5">
                      <CardTitle className="text-base font-black tracking-tighter uppercase">Department Location</CardTitle>
                      <CardDescription className="font-black text-[7px] uppercase tracking-[0.2em] opacity-40 mt-0.5">Geospatial Coordinates.</CardDescription>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground ml-2">Institutional Location</Label>
                  <div className="relative group/input">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                    <Input 
                      value={deptData?.location || ''} 
                      onChange={(e) => setDeptData({ ...deptData, location: e.target.value })}
                      className="pl-10 h-10 rounded-xl bg-secondary/50 border-none font-bold text-xs focus:ring-4 focus:ring-primary/10 transition-all duration-500 shadow-inner" 
                      placeholder="e.g. Admin Block, Level 2"
                    />
                  </div>
                </div>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
                   <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest leading-relaxed">Ensure accuracy for on-site student verifications.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module: Institutional Protocols — Multi-Form Links */}
          <Card className="border-none shadow-strong rounded-2xl bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 group">
            <div className="p-5 border-b border-foreground/5 bg-secondary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    <Link2 className="w-6 h-6" />
                 </div>
                 <div className="space-y-0.5">
                    <CardTitle className="text-lg font-black tracking-tighter uppercase leading-none">External Forms</CardTitle>
                    <CardDescription className="font-black text-[8px] uppercase tracking-[0.3em] opacity-40 mt-0.5 italic">Add Google Form links for students.</CardDescription>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl shadow-strong border border-foreground/5 group-hover:border-primary/20 transition-all duration-700">
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">Show Forms</span>
                 <Switch 
                   checked={deptData?.contact_info?.form_visible || false} 
                   onCheckedChange={(checked) => setDeptData({
                     ...deptData,
                     contact_info: { ...deptData?.contact_info, form_visible: checked }
                   })}
                   className="data-[state=checked]:bg-primary h-5 w-9"
                 />
              </div>
            </div>
            <CardContent className="p-6 space-y-4">

              {/* Form Links List */}
              <div className="space-y-3">
                {((deptData?.contact_info?.form_links as any[]) || []).length === 0 && (
                   <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-dashed border-foreground/10">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                      No forms added yet. Click "Add Form Link" below.
                    </p>
                  </div>
                )}

                {((deptData?.contact_info?.form_links as any[]) || []).map((formLink: any, idx: number) => (
                  <div key={idx} className="group/formrow flex flex-col gap-2 p-4 bg-secondary/30 rounded-xl border border-foreground/5 hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-[10px]">
                          {idx + 1}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">Form {idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const links = [...((deptData?.contact_info?.form_links as any[]) || [])];
                          links.splice(idx, 1);
                          setDeptData({ ...deptData, contact_info: { ...deptData?.contact_info, form_links: links } });
                        }}
                        className="w-7 h-7 flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground ml-2">Form Title</Label>
                      <Input
                        value={formLink.label || ''}
                        onChange={(e) => {
                          const links = [...((deptData?.contact_info?.form_links as any[]) || [])];
                          links[idx] = { ...links[idx], label: e.target.value };
                          setDeptData({ ...deptData, contact_info: { ...deptData?.contact_info, form_links: links } });
                        }}
                        className="h-9 rounded-lg border-none bg-card focus:bg-card focus:ring-4 focus:ring-primary/10 font-bold transition-all duration-500 shadow-inner text-[11px]"
                        placeholder="e.g. Library Clearance Form"
                      />
                    </div>

                    <div className="space-y-1 relative z-10">
                      <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground ml-2">Google Form URL</Label>
                      <div className="relative group/input">
                        <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          value={formLink.url || ''}
                          onChange={(e) => {
                            const links = [...((deptData?.contact_info?.form_links as any[]) || [])];
                            links[idx] = { ...links[idx], url: e.target.value };
                            setDeptData({ ...deptData, contact_info: { ...deptData?.contact_info, form_links: links } });
                          }}
                          className="pl-9 h-9 rounded-lg border-none bg-card focus:bg-card focus:ring-4 focus:ring-primary/10 font-bold transition-all duration-500 shadow-inner text-[11px]"
                          placeholder="https://docs.google.com/forms/..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const links = [...((deptData?.contact_info?.form_links as any[]) || []), { label: '', url: '' }];
                  setDeptData({ ...deptData, contact_info: { ...deptData?.contact_info, form_links: links } });
                }}
                className="w-full flex items-center justify-center gap-2 h-10 py-2 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-black text-[9px] uppercase tracking-[0.3em] transition-all duration-500 group/add active:scale-[0.98]"
              >
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center group-hover/add:bg-primary group-hover/add:text-white transition-all duration-500 group-hover/add:rotate-90">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                Add Form Link
              </button>

              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl border border-foreground/5">
                 <div className="p-2.5 bg-primary rounded-lg shadow-strong shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                 </div>
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                   All added forms will appear on the student's clearance page when "Show Forms" is enabled.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tactical Support Column */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="border-none shadow-strong rounded-2xl bg-foreground text-background overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16 animate-pulse" />
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="w-12 h-12 bg-background/10 rounded-xl backdrop-blur-md flex items-center justify-center border border-background/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                 <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black tracking-tighter uppercase leading-none">Unit Information</h3>
                <p className="text-background/50 text-[9px] font-black uppercase tracking-widest leading-relaxed italic">
                  Keeping your department profile updated helps students complete their clearance faster.
                </p>
              </div>
              <div className="h-px bg-background/10 w-full" />
              <div className="flex items-center gap-2">
                 <Badge className="bg-primary text-white border-none rounded-full px-3 py-0.5 text-[7px] font-black uppercase tracking-[0.3em]">Institutional Standard</Badge>
                 <span className="text-[8px] font-black text-background/30 uppercase tracking-[0.2em]">Verified V4</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-3xl border border-foreground/5 shadow-strong space-y-4 group">
            <div className="flex items-center gap-3 text-primary">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <Clock className="w-5 h-5" />
               </div>
               <div className="space-y-0.5">
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Office Hours</Label>
                  <p className="text-[7px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">When we are available.</p>
               </div>
            </div>
            <Textarea 
              value={deptData?.office_hours || ''} 
              onChange={(e) => setDeptData({ ...deptData, office_hours: e.target.value })}
              className="min-h-[140px] rounded-xl border-none bg-secondary/50 focus:bg-card focus:ring-4 focus:ring-primary/10 font-black text-foreground p-4 leading-relaxed shadow-inner transition-all duration-500 text-xs uppercase tracking-tight placeholder:opacity-20" 
              placeholder="MON - FRI&#13;08:00 - 16:30"
            />
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10">
               <Activity className="w-3.5 h-3.5 shrink-0 opacity-40" />
               <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed">Visibility restricted to authenticated student sessions.</p>
            </div>
          </div>

          <Card className="border-none shadow-strong rounded-2xl bg-primary overflow-hidden relative group cursor-pointer active:scale-95 transition-all duration-700">
             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 skew-x-12" />
             <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl group-hover:rotate-12 transition-transform duration-700 shadow-strong shadow-black/20">
                   <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-0.5">
                   <p className="text-white font-black text-sm uppercase tracking-tighter leading-none">Node Registry</p>
                   <p className="text-white/50 text-[8px] font-black uppercase tracking-[0.3em]">Department Code</p>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-700">
                   <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Persistent Action Bar - Bottom */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-card/60 backdrop-blur-3xl rounded-2xl border border-foreground/5 shadow-strong animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-sm font-black text-foreground tracking-tighter uppercase leading-none">Security Registry</h4>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Changes require node authorization</p>
          </div>
        </div>
        <Button 
          className="rounded-xl bg-primary text-white hover:bg-primary/90 h-12 px-8 font-black text-[9px] uppercase tracking-[0.3em] shadow-strong flex items-center gap-2 active:scale-95 transition-all group overflow-hidden relative shrink-0"
          onClick={handleSave}
          disabled={saving}
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 group-hover:scale-125 transition-transform" /> <span>Save All Changes</span></>}
        </Button>
      </div>
    </div>
  );
};
