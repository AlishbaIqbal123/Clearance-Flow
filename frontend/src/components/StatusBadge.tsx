// UI ONLY — NO LOGIC CHANGED
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileSearch, 
  PauseCircle, 
  XCircle,
  FileCheck,
  Zap,
  ShieldCheck,
  ShieldAlert,
  History,
  Activity,
  Lock,
  ArrowRight
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge = ({ status, size = 'md', showIcon = true }: StatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'cleared':
      case 'approved':
        return { 
          className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:bg-emerald-500/20', 
          icon: ShieldCheck,
          label: 'Cleared'
        };
      case 'pending':
        return { 
          className: 'bg-amber-500/10 text-amber-600 border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:bg-amber-500/20', 
          icon: Clock,
          label: 'Pending'
        };
      case 'in_review':
      case 'review':
        return { 
          className: 'bg-primary/10 text-primary border-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.05)] hover:bg-primary/20', 
          icon: FileSearch,
          label: 'In Review'
        };
      case 'rejected':
        return { 
          className: 'bg-destructive/10 text-destructive border-destructive/10 shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:bg-destructive/20', 
          icon: ShieldAlert,
          label: 'Rejected'
        };
      case 'on_hold':
      case 'hold':
        return { 
          className: 'bg-slate-500/10 text-slate-600 border-slate-500/10 hover:bg-slate-500/20', 
          icon: PauseCircle,
          label: 'On Hold'
        };
      case 'partially_cleared':
        return { 
          className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/10 hover:bg-cyan-500/20', 
          icon: History,
          label: 'Partially Cleared'
        };
      case 'in_progress':
        return { 
          className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/10 hover:bg-indigo-500/20', 
          icon: Activity,
          label: 'In Progress'
        };
      case 'not_started':
        return { 
          className: 'bg-muted text-muted-foreground/60 border-muted hover:bg-muted/50', 
          icon: Clock,
          label: 'Not Started'
        };
      case 'submitted':
      case 'active':
        return { 
          className: 'bg-blue-500/10 text-blue-600 border-blue-500/10 hover:bg-blue-500/20', 
          icon: Activity,
          label: 'Active'
        };
      case 'locked':
        return {
           className: 'bg-muted text-muted-foreground border-muted hover:bg-muted/50',
           icon: Lock,
           label: 'Locked'
        };
      default:
        return { 
          className: 'bg-muted text-muted-foreground border-foreground/5 hover:bg-muted/80', 
          icon: Info,
          label: status.replace('_', ' ')
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[8px] gap-1.5',
    md: 'px-4 py-1.5 text-[9px] gap-2',
    lg: 'px-6 py-2.5 text-[11px] gap-2.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4.5 h-4.5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`
        rounded-full font-black uppercase tracking-[0.25em] flex items-center border-none transition-all duration-500 select-none
        ${sizeClasses[size]} 
        ${config.className}
      `}
    >
      {showIcon && <Icon className={`${iconSizes[size]} transition-transform duration-500 group-hover:scale-110`} />}
      <span className="leading-none">{config.label}</span>
    </Badge>
  );
};

const Info = ({ className }: { className?: string }) => <Activity className={className} />;
