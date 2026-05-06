import React from 'react';
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
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass h-20 px-6 md:px-12 flex items-center justify-between border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter leading-none uppercase">COMSATS</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Clearance Ecosystem</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={onLoginClick}
            className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-colors hidden md:block"
          >
            Portal Access
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
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6 md:px-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -ml-96 -mb-96" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Enterprise Grade Academic Orchestration</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.8] text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Digital<br />
              <span className="text-primary italic">Clearance</span><br />
              Protocol
            </h1>
            
            <p className="max-w-2xl text-muted-foreground text-lg md:text-2xl font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              The ultimate institutional matrix. A high-performance digital lifecycle 
              designed to eliminate administrative friction and empower student mobility.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 w-full justify-center">
              <Button 
                onClick={onRegisterClick}
                className="w-full sm:w-auto h-16 px-12 bg-foreground text-background hover:opacity-90 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all group"
              >
                Start Enrollment <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                onClick={onLoginClick}
                className="w-full sm:w-auto h-16 px-12 border-2 border-foreground/5 bg-transparent hover:bg-foreground/5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all"
              >
                Access Terminal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 md:px-12 bg-secondary/30 border-y border-foreground/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">15+</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Nodes Connected</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">25k+</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Verified Records</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">99.9%</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">System Uptime</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">&lt; 1h</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Resolution Velocity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              Institutional<br />
              <span className="text-primary italic">Intelligence</span>
            </h2>
            <p className="text-muted-foreground text-xl font-medium italic border-l-4 border-primary/20 pl-6">
              A synchronized ecosystem of tools designed for the modern academic landscape, 
              ensuring zero-friction clearance and logistical excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bento-card p-10 space-y-8 group hover:border-primary/20 transition-colors">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/10">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Student Node</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Real-time submission portal with integrated document management 
                  and department-wise progress telemetry.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-foreground/5">
                {['Direct Feedback Loop', 'Digital Credentials', 'Omni-channel Alerts'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bento-card p-10 space-y-8 group hover:border-blue-500/20 transition-colors">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-500/10">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Administrative Hub</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Advanced departmental queue management with automated 
                  verification algorithms and bulk audit capabilities.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-foreground/5">
                {['Batch Approval Flow', 'Conflict Resolution', 'Telemetry Dashboard'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bento-card p-10 space-y-8 group hover:border-purple-500/20 transition-colors">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-purple-500/10">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Logistics Engine</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enterprise-grade degree dispatch system with real-time 
                  shipping tracking and automated waybill generation.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-foreground/5">
                {['Courier Integration', 'Shipping Telemetry', 'Secure Issuance'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Visionaries Section */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              The <span className="text-primary italic">Visionaries</span>
            </h2>
            <p className="text-muted-foreground text-lg font-black uppercase tracking-[0.4em] opacity-40">
              Architecture & Development Credits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Supervisor Card */}
            <div className="glass-card p-12 space-y-8 group relative overflow-hidden border border-foreground/5 rounded-[3rem] hover:border-primary/30 transition-all duration-500">
               <div className="absolute top-0 right-0 p-8">
                 <UserCheck className="w-8 h-8 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>
               
               <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 p-2 group-hover:scale-105 transition-transform">
                    <img 
                      src="https://muhammadabdullahwali.vercel.app/profile.png" 
                      alt="Muhammad Abdullah Wali"
                      className="w-full h-full object-cover rounded-full bg-secondary shadow-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Muhammad+Abdullah+Wali&background=0066FF&color=fff&size=512";
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black uppercase tracking-tighter">Muhammad Abdullah Wali</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Technical Supervisor</p>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed italic max-w-xs">
                    "AI Automation & Custom Software Architect. Leading the technological vision and systemic integrity of the UCMS platform."
                  </p>
                  <div className="flex gap-4 pt-4">
                    <a href="https://muhammadabdullahwali.vercel.app/" target="_blank" rel="noreferrer" className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
               </div>
            </div>

            {/* Developer Card */}
            <div className="glass-card p-12 space-y-8 group relative overflow-hidden border border-foreground/5 rounded-[3rem] hover:border-blue-500/30 transition-all duration-500">
               <div className="absolute top-0 right-0 p-8">
                 <Code2 className="w-8 h-8 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>
               
               <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/20 p-2 group-hover:scale-105 transition-transform">
                    <img 
                      src="https://portfolio-iota-eight-92.vercel.app/profile.png" 
                      alt="Alishba Iqbal"
                      className="w-full h-full object-cover rounded-full bg-secondary shadow-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Alishba+Iqbal&background=3B82F6&color=fff&size=512";
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black uppercase tracking-tighter">Alishba Iqbal</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Lead Full Stack Engineer</p>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed italic max-w-xs">
                    "Full Stack Developer specializing in high-performance React ecosystems. Architected the responsive frontend and backend integration."
                  </p>
                  <div className="flex gap-4 pt-4">
                    <a href="https://portfolio-iota-eight-92.vercel.app/" target="_blank" rel="noreferrer" className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 border-t border-foreground/5 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-black tracking-tighter leading-none uppercase">COMSATS</h2>
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
              Institutional digital infrastructure for university administrative excellence.
            </p>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ecosystem</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest opacity-60">
              <li className="hover:text-primary cursor-pointer transition-colors">Student Hub</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Department Node</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Command Center</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Logistics</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Legal</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest opacity-60">
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Protocol</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Service Terms</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Data Ethics</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Institutional</h5>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-60">
                <Globe className="w-4 h-4" /> Vehari, Punjab
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-60">
                <MessageSquare className="w-4 h-4" /> support@comsats.edu.pk
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">
            © 2026 COMSATS UNIVERSITY ISLAMABAD - TERMINAL V2.5.0
          </div>
          <div className="flex gap-8 opacity-20 grayscale">
            <Activity className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
};
