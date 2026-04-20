import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-rose-100">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Something went wrong</h2>
          <p className="text-slate-500 mt-2 max-w-sm font-medium">
            The system encountered an unexpected error. Don't worry, your data is safe.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-8 rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 px-8 font-bold shadow-xl shadow-blue-100"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reload Dashboard
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
