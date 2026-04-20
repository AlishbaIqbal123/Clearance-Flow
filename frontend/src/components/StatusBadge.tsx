import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileSearch, 
  PauseCircle, 
  XCircle 
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
          className: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
          icon: CheckCircle2,
          label: 'Cleared'
        };
      case 'pending':
        return { 
          className: 'bg-amber-50 text-amber-700 border-amber-100', 
          icon: Clock,
          label: 'Pending'
        };
      case 'in_review':
      case 'review':
        return { 
          className: 'bg-blue-50 text-blue-700 border-blue-100', 
          icon: FileSearch,
          label: 'In Review'
        };
      case 'rejected':
        return { 
          className: 'bg-red-50 text-red-700 border-red-100', 
          icon: XCircle,
          label: 'Rejected'
        };
      case 'on_hold':
      case 'hold':
        return { 
          className: 'bg-orange-50 text-orange-700 border-orange-100', 
          icon: PauseCircle,
          label: 'On Hold'
        };
      case 'submitted':
      case 'active':
        return { 
          className: 'bg-purple-50 text-purple-700 border-purple-100', 
          icon: AlertCircle,
          label: 'Submitted'
        };
      default:
        return { 
          className: 'bg-slate-50 text-slate-700 border-slate-100', 
          icon: Clock,
          label: status.replace('_', ' ')
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border capitalize shadow-sm ${config.className}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />}
      <span className={size === 'sm' ? 'text-[10px]' : 'text-xs'}>{config.label}</span>
    </Badge>
  );
};
