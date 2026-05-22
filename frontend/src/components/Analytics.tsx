import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, CheckCircle2, AlertCircle, Clock, 
  BarChart3, PieChart as LucidePieChart, Activity, Building, ArrowUpRight, ArrowDownRight,
  Sparkles, Layers, Zap, Globe, Lock, ShieldCheck, Database,
  ArrowRight, ChevronRight, Info, Calendar, Download, Share2,
  Filter, Search, LayoutGrid, List, GraduationCap, Trophy, Award, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { analyticsService } from '@/lib/analytics.service';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

interface DepartmentStat {
  name: string;
  progress: number;
  status: string;
  color: string;
  total: number;
  cleared: number;
  pending: number;
}

export const Analytics = ({ user }: { user: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'cohorts'>('overview');

  // Aggregated status counts for database compatibility
  const clearedCount = (data?.statusBreakdown?.cleared || 0) + (data?.statusBreakdown?.fully_cleared || 0) + (data?.statusBreakdown?.completed || 0);
  const pendingCount = (data?.statusBreakdown?.pending || 0) + (data?.statusBreakdown?.in_progress || 0) + (data?.statusBreakdown?.submitted || 0);
  const reviewCount = (data?.statusBreakdown?.in_review || 0);
  const rejectedCount = (data?.statusBreakdown?.rejected || 0);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsService.getOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Dashboard data sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // 30s Real-time Pulse
    return () => clearInterval(interval);
  }, []);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Page Border
      doc.setDrawColor(15, 23, 42, 0.1);
      doc.setLineWidth(1);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Institutional Branding Banner
      doc.setFillColor(15, 23, 42); // Sleek Dark Slate
      doc.rect(5, 5, pageWidth - 10, 35, 'F');
      
      // Header Accent line
      doc.setFillColor(37, 99, 235); // Accent Primary Blue
      doc.rect(5, 40, pageWidth - 10, 2, 'F');

      // Logo drawing
      try {
        const logoImg = new Image();
        logoImg.src = '/logo.png';
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        doc.addImage(logoImg, 'PNG', 15, 12, 22, 22);
      } catch (e) {
        console.error('Logo failed to load for PDF');
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('COMSATS UNIVERSITY ISLAMABAD', 42, 20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(147, 197, 253); // Blue-300
      doc.text('VEHARI CAMPUS | ONLINE CLEARANCE PORTAL', 42, 26);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text(`INSTITUTIONAL PERFORMANCE AUDIT REPORT - GENERATED ON ${new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 42, 32);
      
      // Report Metadata Info Block
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYTICS SYSTEM OVERVIEW', 15, 58);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Audited By: ${user?.firstName} ${user?.lastName} (${user?.role?.toUpperCase()})`, 15, 64);
      if (user?.department?.name) {
        doc.text(`Administrative Unit: ${user.department.name}`, 15, 70);
      }

      // Modern KPI Metric Cards - Side by Side
      const cardWidth = 58;
      const cardHeight = 20;
      const cardY = 76;
      
      // Card 1: Total Students
      doc.setFillColor(248, 250, 252); // Slate-50 background
      doc.setDrawColor(226, 232, 240); // Slate-200 border
      doc.setLineWidth(0.5);
      doc.roundedRect(15, cardY, cardWidth, cardHeight, 2, 2, 'FD');
      doc.setFillColor(15, 23, 42); // Top dark accent line
      doc.rect(15, cardY, cardWidth, 1.2, 'F');
      
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL ROSTER STUDENTS', 18, cardY + 7);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data?.summary?.totalStudents || 0), 18, cardY + 15);
      
      // Card 2: Active Requests
      doc.setFillColor(254, 243, 199); // Amber-50 background
      doc.setDrawColor(252, 211, 77); // Amber-300 border
      doc.roundedRect(15 + cardWidth + 3, cardY, cardWidth, cardHeight, 2, 2, 'FD');
      doc.setFillColor(245, 158, 11); // Top amber accent line
      doc.rect(15 + cardWidth + 3, cardY, cardWidth, 1.2, 'F');
      
      doc.setTextColor(180, 83, 9); // Amber-800
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('ACTIVE QUEUE COUNT', 15 + cardWidth + 6, cardY + 7);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(String(pendingCount), 15 + cardWidth + 6, cardY + 15);
      
      // Card 3: Clearance Rate
      const totalRequests = data?.summary?.totalRequests || 0;
      const clearedRequests = clearedCount;
      const clearanceRate = totalRequests > 0 ? Math.round((clearedRequests / totalRequests) * 100) : 0;
      
      doc.setFillColor(209, 250, 229); // Emerald-50 background
      doc.setDrawColor(110, 231, 183); // Emerald-300 border
      doc.roundedRect(15 + (cardWidth + 3) * 2, cardY, cardWidth, cardHeight, 2, 2, 'FD');
      doc.setFillColor(16, 185, 129); // Top emerald accent line
      doc.rect(15 + (cardWidth + 3) * 2, cardY, cardWidth, 1.2, 'F');
      
      doc.setTextColor(4, 120, 87); // Emerald-800
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('OVERALL CLEARANCE RATE', 15 + (cardWidth + 3) * 2 + 3, cardY + 7);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`${clearanceRate}%`, 15 + (cardWidth + 3) * 2 + 3, cardY + 15);

      // Summary Table
      const summaryData = [
        ['Total Roster Students', data?.summary?.totalStudents || 0],
        ['Total Clearance Requests Issued', data?.summary?.totalRequests || 0],
        ['Cleared Requests (Completed)', clearedCount],
        ['Pending Requests (In Queue)', pendingCount],
        ['In Review status', reviewCount],
        ['Rejected Requests', rejectedCount]
      ];

      autoTable(doc, {
        startY: 102,
        head: [['Performance Indicator', 'System Count']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillOpacity: 0.04 },
        margin: { left: 15, right: 15 }
      });

      // Department Performance
      if (data?.departmentPerformance?.length > 0) {
        const deptData = data.departmentPerformance.map((d: any) => [
          d.name,
          `${d.clearanceRate}%`,
          d.total,
          d.cleared,
          d.pending
        ]);

        const nextY = (doc as any).lastAutoTable.finalY + 15;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DEPARTMENT EFFICIENCY INDEX', 15, nextY);

        autoTable(doc, {
          startY: nextY + 6,
          head: [['Department Name', 'Clearance Rate', 'Total Requests', 'Cleared', 'Pending']],
          body: deptData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], fontSize: 9, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8.5 },
          margin: { left: 15, right: 15 }
        });
      }

      // Batch Distribution
      if (data?.batchDistribution?.length > 0) {
        const batchData = data.batchDistribution.map((b: any) => [`Batch ${b.batch}`, b.count]);
        
        doc.addPage();
        // Page Border for page 2
        doc.setDrawColor(15, 23, 42, 0.1);
        doc.setLineWidth(1);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT COHORT DISTRIBUTION (PENDING CLEARANCE)', 15, 20);

        autoTable(doc, {
          startY: 26,
          head: [['Cohort / Academic Year', 'Active Queue Count']],
          body: batchData,
          theme: 'striped',
          headStyles: { fillColor: [15, 23, 42], fontSize: 9, fontStyle: 'bold' },
          bodyStyles: { fontSize: 9 },
          margin: { left: 15, right: 15 }
        });
      }

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `CONFIDENTIAL: COMSATS University Islamabad (Vehari) | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 12,
          { align: 'center' }
        );
      }

      doc.save(`CUI_Vehari_Clearance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Audit report generated successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate audit report');
    } finally {
      setIsExporting(false);
    }
  };

  const batchDistribution = data?.batchDistribution || [];

  // General statistics derived from live data
  const stats = [
    { 
      title: 'Total Students', 
      value: data?.summary?.totalStudents?.toLocaleString() || '0', 
      change: '+4%', 
      icon: Users, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      title: 'Active Requests', 
      value: (data?.summary?.totalRequests || 0).toLocaleString(), 
      change: `+${pendingCount}`, 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: 'Completed Departments', 
      value: clearedCount.toLocaleString(), 
      change: 'Audit Verified', 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      title: 'System Uptime', 
      value: '99.9%', 
      change: 'Stable', 
      icon: Activity, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/10' 
    }
  ];

  const departmentPerformance: DepartmentStat[] = (data?.departmentPerformance || []).map((d: any) => ({
    name: d.name || 'Unknown Department',
    progress: d.clearanceRate || 0,
    status: (d.clearanceRate || 0) > 80 ? 'GOOD' : (d.clearanceRate || 0) > 50 ? 'MODERATE' : 'BUSY',
    color: (d.clearanceRate || 0) > 80 ? 'bg-emerald-500' : (d.clearanceRate || 0) > 50 ? 'bg-amber-500' : 'bg-primary',
    total: d.total || 0,
    cleared: d.cleared || 0,
    pending: d.pending || 0
  }));

  const sortedDepts = [...departmentPerformance].sort((a, b) => b.progress - a.progress);

  const recentTrends = [
    { label: 'Total Requests', value: `${data?.summary?.totalRequests || 0} Units`, trend: 'up' },
    { label: 'Staff Count', value: `${data?.summary?.totalStaff || 0} Members`, trend: 'up' },
    { label: 'Departments', value: `${data?.summary?.totalDepartments || 0} Departments`, trend: 'up' }
  ];

  // Calculate congestion percentage
  const totalReq = data?.summary?.totalRequests || 0;
  const pendingReq = pendingCount;
  const congestionPct = totalReq > 0 ? Math.round((pendingReq / totalReq) * 100) : 0;

  const getCongestionDetails = (pct: number) => {
    if (pct < 30) {
      return {
        label: 'Low Congestion',
        desc: 'Processing queues are operating at peak efficiency. Latency is minimal.',
        style: 'bg-emerald-500/10 text-emerald-500 border-none'
      };
    } else if (pct < 65) {
      return {
        label: 'Moderate Congestion',
        desc: 'Slight clearance delays in queue processing. Resource reallocation recommended.',
        style: 'bg-amber-500/10 text-amber-500 border-none'
      };
    } else {
      return {
        label: 'Critical Congestion',
        desc: 'Action required immediately. High volumes of pending approvals detected.',
        style: 'bg-rose-500/10 text-rose-500 border-none'
      };
    }
  };

  const congestionDetails = getCongestionDetails(congestionPct);

  if (loading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-2xl animate-spin" />
           <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Calibrating Dashboard...</p>
      </div>
    );
  }

  // Chart data formatting
  const pieChartData = [
    { name: 'Cleared', value: clearedCount, fill: 'url(#clearedColor)' },
    { name: 'Pending', value: pendingCount, fill: 'url(#pendingColor)' },
    { name: 'In Review', value: reviewCount, fill: 'url(#reviewColor)' },
    { name: 'Rejected', value: rejectedCount, fill: 'url(#rejectedColor)' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-soft relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/10 group-hover:scale-110 transition-transform duration-700" />
                 <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              </div>
              <div className="space-y-0.5">
                 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 sm:px-4 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">System Statistics</Badge>
                    <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">System Status</span>
                 </div>
                 <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none">Institutional Analytics</h2>
              </div>
           </div>
           <p className="text-xs sm:text-base text-muted-foreground font-medium max-w-xl leading-relaxed italic opacity-80">
             Monitoring system progress, department speed, and overall clearance requests.
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-muted/20 p-2 sm:p-3 rounded-2xl sm:rounded-[2.5rem] border border-foreground/5 backdrop-blur-md shadow-soft">
          <div className="px-4 sm:px-5 py-2 sm:py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 justify-center">
             <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <span className="text-emerald-700 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Live Stream Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl bg-foreground text-background hover:bg-foreground/90 h-12 sm:h-14 px-6 sm:px-8 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] shadow-strong flex items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <Download className={`w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:-translate-y-1 transition-transform ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Generating...' : 'Export Audit'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 p-1.5 bg-card/60 backdrop-blur-3xl rounded-[2rem] border border-foreground/5 max-w-lg w-full shadow-soft">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3.5 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-strong shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5" />
            Performance Overview
          </span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 py-3.5 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
            activeTab === 'departments'
              ? 'bg-primary text-white shadow-strong shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Building className="w-3.5 h-3.5" />
            Department Standings
          </span>
        </button>
        <button
          onClick={() => setActiveTab('cohorts')}
          className={`flex-1 py-3.5 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
            activeTab === 'cohorts'
              ? 'bg-primary text-white shadow-strong shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Cohort Trends
          </span>
        </button>
      </div>

      {/* Overview View */}
      {activeTab === 'overview' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-soft rounded-2xl group hover:-translate-y-1 transition-all duration-700 bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />
                <CardContent className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-4 sm:mb-5">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${stat.bg} rounded-xl flex items-center justify-center transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-inner`}>
                      <stat.icon className={`w-4.5 h-4.5 sm:w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black shadow-soft uppercase tracking-widest ${
                      stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {stat.change.startsWith('+') ? <ArrowUpRight className="w-2.5 h-2.5" /> : <Activity className="w-2.5 h-2.5" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-muted-foreground font-black text-[8px] uppercase tracking-[0.3em] opacity-40 italic">{stat.title}</p>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase leading-none group-hover:text-primary transition-colors duration-700">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Clearance Overview Pie Chart */}
            <Card className="lg:col-span-7 border-none shadow-strong rounded-3xl bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 group">
              <CardHeader className="p-6 border-b border-foreground/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-xl" />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <LucidePieChart className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Clearance Ratios</CardTitle>
                    <CardDescription className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">Distribution of all clearance requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[250px] w-full relative">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="clearedColor" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="pendingColor" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <linearGradient id="reviewColor" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                          <linearGradient id="rejectedColor" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={pieChartData.length > 1 ? 6 : 0}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} className="focus:outline-none transition-transform hover:scale-105 duration-300" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                             borderRadius: '1.2rem', 
                             border: 'none', 
                             boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', 
                             background: 'hsl(var(--card))',
                             padding: '0.8rem'
                          }}
                          itemStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          formatter={(value) => <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs uppercase font-black">No Clearance Records</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Circular Queue Congestion Gauge */}
            <Card className="lg:col-span-5 border-none shadow-strong rounded-3xl bg-card/60 backdrop-blur-3xl overflow-hidden border border-foreground/5 group flex flex-col justify-center">
              <CardHeader className="p-6 border-b border-foreground/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <Gauge className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Queue Congestion</CardTitle>
                    <CardDescription className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">Current administrative burden ratio</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center mb-6">
                  {/* Circular SVG Gauge */}
                  <svg height="140" width="140" className="transform -rotate-90">
                    <circle
                      stroke="hsl(var(--secondary))"
                      fill="transparent"
                      strokeWidth="10"
                      r="50"
                      cx="70"
                      cy="70"
                    />
                    <circle
                      stroke="url(#congestionGrad)"
                      fill="transparent"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - congestionPct / 100)}`}
                      strokeLinecap="round"
                      r="50"
                      cx="70"
                      cy="70"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="congestionGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor={congestionPct > 70 ? "#ef4444" : congestionPct > 35 ? "#f59e0b" : "#10b981"} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black tracking-tighter text-foreground leading-none">{congestionPct}%</span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground tracking-widest mt-1">Congested</span>
                  </div>
                </div>

                <div className="text-center space-y-2 max-w-xs">
                  <Badge className={congestionDetails.style}>
                    {congestionDetails.label}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                    {congestionDetails.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modeling and Uptime Pulse */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <Card className="border-none shadow-soft rounded-[2rem] bg-secondary/30 backdrop-blur-3xl p-5 sm:p-8 border border-foreground/5 relative overflow-hidden group h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-opacity opacity-0 group-hover:opacity-100 duration-1000" />
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-card rounded-xl border border-foreground/5 shadow-soft flex items-center justify-center text-primary shrink-0 group-hover:rotate-6 transition-transform duration-700">
                    <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-[0.4em]">Audit Trail</Badge>
                      <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Active Pulse</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none">Clearance Status Modeling</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-relaxed italic opacity-60">
                      Processing analytics model shows a 14% improvement in overall approval cycles.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-6 py-4 bg-card rounded-2xl border border-foreground/5 shadow-soft shrink-0">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">Uptime</p>
                    <p className="text-xl sm:text-2xl font-black text-primary tracking-tighter">99.9%</p>
                    <div className="flex items-center gap-2 text-emerald-500 text-[8px] font-black uppercase tracking-widest mt-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> High Availability
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-4">
              <Card className="border-none shadow-soft rounded-3xl bg-foreground text-background overflow-hidden relative group h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
                <CardHeader className="p-5 sm:p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-strong group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4.5 h-4.5 sm:w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Metrics Pulse</CardTitle>
                      <p className="text-background/40 font-black text-[8px] uppercase tracking-[0.4em] italic">Real-time status</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3 relative z-10">
                  {recentTrends.map((trend, i) => (
                    <div key={i} className="flex items-center justify-between p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/5 group/trend hover:bg-white/10 transition-all duration-500">
                      <div className="space-y-1">
                        <p className="text-[7px] text-background/40 font-black uppercase tracking-[0.3em]">{trend.label}</p>
                        <p className="text-base sm:text-lg font-black tracking-tight uppercase leading-none">{trend.value}</p>
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                        <ArrowUpRight className="w-4.5 h-4.5 sm:w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Departments Standings View */}
      {activeTab === 'departments' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none shadow-soft rounded-3xl bg-card/60 backdrop-blur-3xl border border-foreground/5 group overflow-hidden">
            <CardHeader className="p-6 border-b border-foreground/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-soft">
                  <Trophy className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Processing Speed Leaderboard</CardTitle>
                  <CardDescription className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">Department processing speeds and completion rates</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-foreground/5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Efficiency Rankings</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {sortedDepts.map((dept, index) => {
                let badgeContent = null;
                let trophyColor = 'text-muted-foreground/20';
                
                if (index === 0) {
                  badgeContent = (
                    <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-lg px-2.5 py-0.5 font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                      <Trophy className="w-2.5 h-2.5" />
                      Fastest Approver
                    </Badge>
                  );
                  trophyColor = 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                } else if (index === 1) {
                  badgeContent = (
                    <Badge className="bg-slate-400/10 text-slate-500 border-none rounded-lg px-2.5 py-0.5 font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                      <Award className="w-2.5 h-2.5" />
                      High Efficiency
                    </Badge>
                  );
                  trophyColor = 'text-slate-400';
                } else if (index === 2) {
                  badgeContent = (
                    <Badge className="bg-orange-500/10 text-orange-600 border-none rounded-lg px-2.5 py-0.5 font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                      <Award className="w-2.5 h-2.5" />
                      Active Clearance
                    </Badge>
                  );
                  trophyColor = 'text-orange-500';
                }

                return (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card/50 backdrop-blur-md rounded-2xl border border-foreground/5 hover:border-primary/20 hover:bg-card transition-all duration-500 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-xs text-primary group-hover/item:rotate-6 transition-transform">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-foreground uppercase tracking-tight">{dept.name}</h4>
                          {badgeContent}
                        </div>
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">
                          Clearance Completed: {dept.cleared} / {dept.total} requests
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 justify-between sm:justify-end w-full sm:w-auto">
                      {/* Linear progress bar mini gauge */}
                      <div className="w-32 hidden md:block">
                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${dept.color}`}
                            style={{ width: `${dept.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xl font-black text-foreground tracking-tighter leading-none">{dept.progress}%</span>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Clearance Rate</p>
                        </div>
                        <Trophy className={`w-6 h-6 shrink-0 ${trophyColor}`} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {sortedDepts.length === 0 && (
                <div className="py-20 text-center opacity-25">
                  <Building className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Department Data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cohort Trends View */}
      {activeTab === 'cohorts' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Batch Distribution Card */}
          {batchDistribution.length > 0 && (
            <Card className="border-none shadow-soft rounded-3xl bg-card/60 backdrop-blur-3xl border border-foreground/5 group overflow-hidden">
              <CardHeader className="p-6 border-b border-foreground/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:rotate-6 transition-transform duration-700 shadow-soft">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">Batch Cohorts Distribution</CardTitle>
                    <CardDescription className="font-black text-[8px] uppercase tracking-[0.3em] opacity-40 mt-0.5 italic">Pending student count per academic cohort.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                {batchDistribution.map((b: any, i: number) => (
                  <div key={i} className="bg-secondary/20 p-5 rounded-2xl border border-foreground/5 space-y-1.5 hover:bg-primary/5 transition-colors duration-500">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 leading-none">Cohort {b.batch}</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter leading-none">{b.count}</p>
                    <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Students Pending Clearance</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Pending Requests Table */}
          {data?.recentPending?.length > 0 && (
            <Card className="border-none shadow-soft rounded-3xl bg-card/60 backdrop-blur-3xl border border-foreground/5 group overflow-hidden">
              <CardHeader className="p-6 border-b border-foreground/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-soft">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">High Priority Pending Approvals</CardTitle>
                    <CardDescription className="font-black text-[8px] uppercase tracking-[0.3em] opacity-40 mt-0.5 italic">Awaiting immediate review from campus units.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-foreground/5">
                  {data.recentPending.map((req: any, i: number) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-primary/5 transition-colors group/req">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-xs text-primary border border-foreground/5 group-hover/req:scale-110 group-hover:rotate-6 transition-all duration-500">
                          {req.student?.first_name?.[0]}{req.student?.last_name?.[0]}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-foreground uppercase tracking-tight leading-none group-hover/req:text-primary transition-colors">
                            {req.student?.first_name} {req.student?.last_name}
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                            {req.student?.registration_number} • Batch {req.student?.batch}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
