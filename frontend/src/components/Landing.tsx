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
  MessageSquare
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
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Now Live: Phase 2.0 Integration</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Digital<br />
              <span className="text-primary italic">Clearance</span><br />
              Ecosystem
            </h1>
            
            <p className="max-w-2xl text-muted-foreground text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              The next generation of academic administrative management. 
              A unified matrix for students, departments, and administration 
              to streamline the university clearance protocol.
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-20 w-full max-w-4xl opacity-40 animate-in fade-in duration-1000 delay-500 grayscale">
               <div className="flex flex-col items-center gap-2">
                 <Globe className="w-8 h-8" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Global Matrix</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <ShieldCheck className="w-8 h-8" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Secure Link</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Activity className="w-8 h-8" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Zap className="w-8 h-8" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Instant Node</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 md:px-12 bg-secondary/30 border-y border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">12+</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Integrated Departments</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">10k+</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Students Cleared</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-primary tracking-tighter">2min</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Avg Processing Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Administrative<br />
              <span className="text-primary italic">Intelligence</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium italic border-l-4 border-primary/20 pl-6">
              A comprehensive suite of tools designed for high-efficiency 
              university management and student success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bento-card p-10 space-y-8 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Student Portal</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Submit clearance requests, track real-time progress across 
                  all departments, and receive instant notifications.
                </p>
              </div>
              <ul className="space-y-3 pt-4">
                {['Live Status Tracking', 'Document Repository', 'Direct Communication'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bento-card p-10 space-y-8 group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Department Node</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Advanced dashboard for department officers to review, 
                  approve, or provide feedback on student requests.
                </p>
              </div>
              <ul className="space-y-3 pt-4">
                {['Queue Management', 'Automated Filters', 'Bulk Operations'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bento-card p-10 space-y-8 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Command Center</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Full system oversight for administrators with 
                  comprehensive analytics and user management.
                </p>
              </div>
              <ul className="space-y-3 pt-4">
                {['Real-time Analytics', 'Audit Logging', 'Access Control'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Operational<br />
                <span className="text-primary italic">Protocol</span>
              </h2>
              <p className="text-muted-foreground text-lg font-medium italic">
                From initial request to final certificate, the ecosystem 
                ensures a seamless, paperless transition.
              </p>
            </div>

            <div className="space-y-10">
              {[
                { 
                  icon: <MousePointer2 className="w-6 h-6" />, 
                  title: 'Initiate Request', 
                  desc: 'Students start the clearance process with a single click from their personalized dashboard.' 
                },
                { 
                  icon: <BarChart3 className="w-6 h-6" />, 
                  title: 'Multi-Node Review', 
                  desc: 'Requests flow through relevant departments for automated and manual verification.' 
                },
                { 
                  icon: <CheckCircle2 className="w-6 h-6" />, 
                  title: 'Final Clearance', 
                  desc: 'Once all nodes are cleared, the system generates a digital verifiable certificate.' 
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center shrink-0 shadow-soft border border-foreground/5 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-black uppercase tracking-tight text-lg">{step.title}</h5>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl aspect-square relative">
             <div className="absolute inset-0 bg-primary/5 rounded-[4rem] rotate-3 animate-pulse" />
             <div className="absolute inset-0 bg-background rounded-[4rem] -rotate-3 border border-foreground/5 shadow-2xl flex flex-col p-12 justify-center gap-12">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Matrix Progress</span>
                    <span className="text-3xl font-black tracking-tighter text-primary">85%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] animate-shimmer" />
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Academic Node', status: 'Cleared', color: 'text-emerald-500' },
                    { label: 'Finance Node', status: 'Cleared', color: 'text-emerald-500' },
                    { label: 'Library Node', status: 'Processing', color: 'text-primary animate-pulse' },
                    { label: 'Transport Node', status: 'Pending', color: 'text-muted-foreground opacity-40' }
                  ].map((node, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-foreground/5 pb-4">
                      <span className="text-[11px] font-black uppercase tracking-widest">{node.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${node.color}`}>{node.status}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            Ready to<br />
            <span className="text-primary italic">Proceed?</span>
          </h2>
          <p className="text-muted-foreground text-xl font-medium max-w-xl mx-auto italic">
            Join thousands of students and faculty members already 
            utilizing the COMSATS Digital Clearance Ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button 
              onClick={onRegisterClick}
              className="w-full sm:w-auto h-16 px-12 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-strong shadow-primary/20 active:scale-95 transition-all"
            >
              Enroll Now
            </Button>
            <Button 
              variant="ghost"
              className="w-full sm:w-auto h-16 px-12 font-black text-xs uppercase tracking-[0.4em] hover:bg-primary/5 transition-all"
            >
              Contact Support
            </Button>
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
              <li className="hover:text-primary cursor-pointer transition-colors">API Console</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Legal</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest opacity-60">
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Protocol</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Service Terms</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Data Ethics</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Security Audit</li>
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
            © 2026 COMSATS UNIVERSITY ISLAMABAD - TERMINAL V2.0.4
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
