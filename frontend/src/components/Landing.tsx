import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Globe, 
  GraduationCap, 
  Building2, 
  Activity, 
  Users, 
  Clock, 
  MousePointer2,
  Lock,
  ChevronRight,
  Sparkles,
  BarChart3,
  MessageSquare,
  Linkedin,
  Github,
  ExternalLink,
  Code2,
  UserCheck,
  Moon,
  Sun,
  LayoutDashboard,
  Cpu,
  Layers,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    React.startTransition(() => {
      setIsDark(prev => !prev);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-primary/5 rounded-full blur-[150px] -mr-[30vw] -mt-[20vh] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-blue-500/5 rounded-full blur-[150px] -ml-[20vw] -mb-[10vh]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-white/[0.02] dark:bg-grid-white/[0.01]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass h-20 px-6 md:px-12 flex items-center justify-between border-b border-foreground/5 shadow-soft">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-strong group-hover:scale-110 transition-all duration-500 p-1.5 border border-foreground/5">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter leading-none uppercase text-primary">CUI Vehari</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 italic">Clearance System</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-2xl bg-secondary text-foreground w-11 h-11 hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm border border-foreground/5 active:scale-95"
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </Button>

          <button 
            onClick={onLoginClick}
            className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-colors hidden md:block"
          >
            Terminal Access
          </button>
          
          <Button 
            onClick={onLoginClick}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-[0.3em] shadow-strong shadow-primary/20 active:scale-95 transition-all"
          >
            Sign In <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated University Lifecycle Management</span>
          </div>
          
          <div className="relative">
            <h1 className="text-7xl md:text-[11rem] font-black tracking-[ -0.05em] uppercase leading-[0.75] text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Future<br />
              <span className="text-primary italic">Aligned</span><br />
              Clearance
            </h1>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-20 hidden lg:block">
              <Network className="w-[40rem] h-[40rem] text-primary/10 animate-[spin_60s_linear_infinite]" />
            </div>
          </div>
          
          <p className="max-w-3xl mx-auto text-muted-foreground text-xl md:text-3xl font-medium leading-relaxed italic animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Redefining the administrative landscape. A seamless, high-velocity digital 
            matrix for students, faculty, and university authorities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 w-full justify-center">
            <Button 
              onClick={onRegisterClick}
              className="w-full sm:w-auto h-20 px-16 bg-foreground text-background hover:opacity-90 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all group"
            >
              Start Enrollment <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              onClick={onLoginClick}
              className="w-full sm:w-auto h-20 px-16 border-2 border-foreground/5 bg-transparent hover:bg-foreground/5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] active:scale-95 transition-all"
            >
              Access Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 md:py-40 px-6 md:px-12 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 bento-card p-12 space-y-12 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard className="w-64 h-64" />
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700">
               <Cpu className="w-8 h-8" />
            </div>
            <div className="space-y-6 max-w-xl relative">
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">Automated<br /><span className="text-primary italic">Verification</span></h3>
              <p className="text-muted-foreground text-xl font-medium leading-relaxed italic">
                Our core engine utilizes advanced node-based verification to process clearance 
                requests with sub-second latency, ensuring students never have to wait.
              </p>
            </div>
            <div className="flex gap-12 pt-8">
              <div className="space-y-2">
                <p className="text-4xl font-black text-primary tracking-tighter">98.5%</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Accuracy Matrix</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black text-primary tracking-tighter">0.5s</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Sync Latency</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bento-card p-12 flex flex-col justify-between group bg-primary text-white border-none shadow-strong shadow-primary/20">
            <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-md">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Secure<br />Protocol</h3>
              <p className="text-white/70 text-lg font-medium leading-relaxed italic">
                Encrypted institutional data layers protecting every student record and administrative action.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 bento-card p-12 space-y-8 group bg-blue-500 text-white border-none shadow-strong shadow-blue-500/20">
             <Layers className="w-12 h-12 text-white opacity-40" />
             <h4 className="text-2xl font-black uppercase tracking-tight">Multi-Node Matrix</h4>
             <p className="text-white/80 text-sm font-medium italic">Synchronized across Academic, Finance, and Library departments.</p>
          </div>

          <div className="md:col-span-8 bento-card p-12 flex flex-col md:flex-row items-center gap-12 group hover:bg-secondary/10 transition-colors">
             <div className="flex-1 space-y-6 text-center md:text-left">
                <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Direct<br /><span className="text-primary italic">Communication</span></h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">Integrated WhatsApp and Email protocols for instant departmental feedback.</p>
             </div>
             <div className="w-full md:w-auto h-40 aspect-video bg-background rounded-[2rem] border border-foreground/5 shadow-inner flex items-center justify-center p-8 overflow-hidden">
                <div className="flex gap-4 animate-[pulse_3s_infinite]">
                   {[1,2,3,4].map(i => <div key={i} className="w-2 h-12 bg-primary/20 rounded-full" />)}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* The Visionaries Section */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-[6rem] font-black tracking-tighter uppercase leading-none">
              The <span className="text-primary italic">Visionaries</span>
            </h2>
            <p className="text-muted-foreground text-lg font-black uppercase tracking-[0.4em] opacity-40">
              Platform Architecture & Execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Supervisor Card */}
            <div className="glass-card p-12 space-y-8 group relative overflow-hidden border border-foreground/5 rounded-[4rem] hover:border-primary/30 transition-all duration-700 bg-background/40">
               <div className="absolute top-0 right-0 p-8">
                 <UserCheck className="w-10 h-10 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>
               
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 p-2 group-hover:scale-105 transition-all duration-700 shadow-2xl relative">
                    <img 
                      src="/supervisor.png" 
                      alt="Muhammad Abdullah Wali"
                      className="w-full h-full object-cover rounded-full bg-secondary"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Muhammad+Abdullah+Wali&background=0066FF&color=fff&size=512";
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-4xl font-black uppercase tracking-tighter">Muhammad Abdullah Wali</h4>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Technical Supervisor & Mentor</p>
                  </div>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed italic max-w-xs">
                    "AI Automation & Software Architect. Architected the institutional framework and systemic logic of the UCMS ecosystem."
                  </p>
                  <div className="flex gap-6 pt-4">
                    <a href="https://muhammadabdullahwali.vercel.app/" target="_blank" rel="noreferrer" className="w-14 h-14 bg-foreground/5 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1">
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  </div>
               </div>
            </div>

            {/* Developer Card */}
            <div className="glass-card p-12 space-y-8 group relative overflow-hidden border border-foreground/5 rounded-[4rem] hover:border-blue-500/30 transition-all duration-700 bg-background/40">
               <div className="absolute top-0 right-0 p-8">
                 <Code2 className="w-10 h-10 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>
               
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500/20 p-2 group-hover:scale-105 transition-all duration-700 shadow-2xl relative">
                    <img 
                      src="https://portfolio-iota-eight-92.vercel.app/profile.png" 
                      alt="Alishba Iqbal"
                      className="w-full h-full object-cover rounded-full bg-secondary"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Alishba+Iqbal&background=3B82F6&color=fff&size=512";
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-4xl font-black uppercase tracking-tighter">Alishba Iqbal</h4>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500">Lead Full Stack Engineer</p>
                  </div>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed italic max-w-xs">
                    "Full Stack Developer specializing in high-performance React ecosystems. Designed and implemented the complete digital interface."
                  </p>
                  <div className="flex gap-6 pt-4">
                    <a href="https://portfolio-iota-eight-92.vercel.app/" target="_blank" rel="noreferrer" className="w-14 h-14 bg-foreground/5 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-xl hover:-translate-y-1">
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 border-t border-foreground/5 bg-background relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mb-32" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-primary/5 p-1 border border-foreground/5">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            <h2 className="text-lg font-black tracking-tighter leading-none uppercase">CUI Vehari</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 italic">Clearance System</p>
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
              Institutional digital infrastructure for university administrative excellence.
            </p>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ecosystem</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest opacity-60">
              <li className="hover:text-primary cursor-pointer transition-colors">Clearance Hub</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Department Node</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Admin Terminal</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Logistics</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Legal</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest opacity-60">
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Protocol</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Security Audit</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Data Ethics</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Connect</h5>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <Globe className="w-4 h-4" /> Vehari, Punjab
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <MessageSquare className="w-4 h-4" /> support@comsats.edu.pk
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row items-center justify-between gap-8 opacity-20 border-t border-foreground/5 mt-20">
          <div className="text-[9px] font-black uppercase tracking-[0.4em]">
            © 2026 web CUIvehari Clearance • TERMINAL V3.0.0
          </div>
          <div className="flex gap-12 grayscale">
            <Activity className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
};
