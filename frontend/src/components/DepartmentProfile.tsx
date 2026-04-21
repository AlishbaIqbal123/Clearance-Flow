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
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
      toast.error('Failed to load department settings');
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
        toast.success(res.message || 'Department profile updated successfully');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with Save Button */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Department Settings</h2>
           <p className="text-slate-500 font-medium">Manage how students and the system interact with your office.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card: Contact Preferences */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
             <div className="bg-slate-900 p-8 text-white">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                      <Mail className="w-6 h-6" />
                   </div>
                   <div>
                      <CardTitle className="text-xl font-bold">Contact Preferences</CardTitle>
                      <CardDescription className="text-slate-400 font-medium mt-0.5">Control which emails students use to reach you.</CardDescription>
                   </div>
                </div>
             </div>
             <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">University Assigned Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      value={deptData?.contact_info?.email || 'N/A'} 
                      readOnly 
                      className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-500 pointer-events-none" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Personal / Secondary Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      value={deptData?.contact_info?.secondary_email || ''} 
                      onChange={(e) => setDeptData({
                        ...deptData, 
                        contact_info: { ...deptData?.contact_info, secondary_email: e.target.value }
                      })}
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-blue-600 bg-white font-bold text-slate-900 transition-all" 
                      placeholder="e.g. hod.finance@gmail.com"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-50" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 ring-4 ring-blue-50">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900">Email Visibility Preference</h4>
                    <p className="text-xs text-slate-500 font-medium leading-tight">Students will see the selected email on their dashboard.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 ${deptData?.contact_info?.contact_preference !== 'secondary' ? 'text-blue-600' : 'text-slate-400'}`}>University</span>
                  <Switch 
                    checked={deptData?.contact_info?.contact_preference === 'secondary'} 
                    onCheckedChange={(checked) => setDeptData({
                      ...deptData,
                      contact_info: { ...deptData?.contact_info, contact_preference: checked ? 'secondary' : 'university' }
                    })}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 ${deptData?.contact_info?.contact_preference === 'secondary' ? 'text-blue-600' : 'text-slate-400'}`}>Personal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Social & Messaging */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </div>
                Messaging & Chat
              </CardTitle>
              <CardDescription className="text-slate-500">Provide direct communication channels for student inquiries.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">WhatsApp Contact</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <Input 
                    value={deptData?.contact_info?.whatsapp_number || ''} 
                    onChange={(e) => setDeptData({
                      ...deptData, 
                      contact_info: { ...deptData?.contact_info, whatsapp_number: e.target.value }
                    })}
                    className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-emerald-500 bg-white font-bold text-slate-900 transition-all font-mono" 
                    placeholder="+92 300 0000000"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Office Location</Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={deptData?.location || ''} 
                    onChange={(e) => setDeptData({ ...deptData, location: e.target.value })}
                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-white font-bold text-slate-900" 
                    placeholder="e.g. Ground Floor, Block A"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] bg-blue-600 text-white overflow-hidden p-8">
            <div className="relative z-10 space-y-6">
              <div>
                <CardTitle className="text-xl font-bold">Portal Tip</CardTitle>
                <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                  Keeping your contact info updated helps reduce physical office visits and speeds up the clearance process.
                </p>
              </div>
              <div className="h-px bg-white/20 w-full" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Need assistance?</span>
              </div>
            </div>
          </Card>

          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200/50 space-y-4">
            <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Office Availability</Label>
            <Textarea 
              value={deptData?.office_hours || ''} 
              onChange={(e) => setDeptData({ ...deptData, office_hours: e.target.value })}
              className="min-h-[120px] rounded-2xl border-slate-200 bg-white font-medium" 
              placeholder="e.g. Monday - Friday&#13;09:00 AM - 04:00 PM"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
