import React, { useState, useEffect } from 'react';
import { Loader2, User, Mail, Lock, BookOpen, Hash, GraduationCap, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/lib/auth.service';
import { toast } from 'sonner';

interface RegisterProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (userData: any) => void;
}

export const Register: React.FC<RegisterProps> = ({ onBackToLogin, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [fetchingDepts, setFetchingDepts] = useState(true);

  const PROGRAM_DISCIPLINE_MAP = {
    'Undergraduate Programs (BS)': [
      'BS Computer Science',
      'BS Software Engineering',
      'BS Business Administration (BBA)',
      'BS Accounting and Finance',
      'BS Environmental Sciences',
      'BS Biotechnology',
      'BS Economics',
      'BS English',
      'BS Media and Communication Studies',
      'BS Mathematics'
    ],
    'Graduate Programs (MS/MBA)': [
      'MS Computer Science',
      'MS Management Sciences',
      'MBA (2 Years)',
      'MS Environmental Sciences',
      'MS Economics',
      'MS English (Linguistics)',
      'MS Mathematics'
    ],
    'Doctoral Programs (PhD)': [
      'PhD Management Sciences',
      'PhD Environmental Sciences',
      'PhD Economics',
      'PhD English (Linguistics)',
      'PhD Mathematics'
    ]
  };

  const DISCIPLINE_DEPT_MAP: Record<string, string> = {
    'BS Computer Science': 'Computer Science',
    'BS Software Engineering': 'Software Engineering',
    'MS Computer Science': 'Computer Science',
    'BS Business Administration (BBA)': 'Management Sciences',
    'BS Accounting and Finance': 'Management Sciences',
    'MS Management Sciences': 'Management Sciences',
    'MBA (2 Years)': 'Management Sciences',
    'PhD Management Sciences': 'Management Sciences',
    'BS Environmental Sciences': 'Environmental Sciences',
    'BS Biotechnology': 'Biotechnology',
    'MS Environmental Sciences': 'Environmental Sciences',
    'PhD Environmental Sciences': 'Environmental Sciences',
    'BS Economics': 'Economics',
    'MS Economics': 'Economics',
    'PhD Economics': 'Economics',
    'BS English': 'Humanities',
    'BS Media and Communication Studies': 'Humanities',
    'MS English (Linguistics)': 'Humanities',
    'PhD English (Linguistics)': 'Humanities',
    'BS Mathematics': 'Mathematics',
    'MS Mathematics': 'Mathematics',
    'PhD Mathematics': 'Mathematics'
  };

  const getAvailableDisciplines = () => {
    if (!formData.program) return [];
    return PROGRAM_DISCIPLINE_MAP[formData.program as keyof typeof PROGRAM_DISCIPLINE_MAP] || [];
  };
  
  const [formData, setFormData] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    program: '',
    discipline: '',
    batch: '',
    phone: ''
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        if (data.success) {
          // Only academic departments should be mapped for students
          setDepartments(data.data.filter((d: any) => d.type === 'academic'));
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setFetchingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  // Reset discipline when program changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, discipline: '' }));
  }, [formData.program]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    // Auto-map departmentId based on discipline
    const deptName = DISCIPLINE_DEPT_MAP[formData.discipline];
    const dept = departments.find(d => d.name === deptName);
    
    if (!dept) {
      return toast.error('Could not map department for selected discipline');
    }

    const submissionData = {
      ...formData,
      departmentId: dept.id
    };

    setLoading(true);
    try {
      const res = await authService.studentSignup(submissionData);
      if (res.success) {
        toast.success('Registration successful! Welcome to the portal.');
        onRegisterSuccess(res.user);
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Info */}
        <div className="md:w-1/3 bg-blue-600 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black leading-tight mb-4">Join the<br />Clearance Flow</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Register now to start your digital clearance process and track your status in real-time.
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 text-xs font-bold text-blue-100">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Instant Dashboard Access</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-blue-100">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Real-time Notifications</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-2/3 p-8 md:p-10">
          <button 
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO LOGIN
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Sign Up</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Fill in your academic details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Registration Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. FA20-BCS-001"
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your-active-email@gmail.com"
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative group">
                  <input
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program</label>
                <select
                  required
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                >
                  <option value="">Select Program</option>
                  {Object.keys(PROGRAM_DISCIPLINE_MAP).map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discipline</label>
                <select
                  required
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleChange}
                  disabled={!formData.program}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">Select Discipline</option>
                  {getAvailableDisciplines().map(disc => (
                    <option key={disc} value={disc}>{disc}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch</label>
                <input
                  required
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="e.g. FA20"
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <input
                    required
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-95 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  SIGN UP NOW
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
