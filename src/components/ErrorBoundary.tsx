/* COPYRIGHT ALEN PEPA */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
          <div className="cyber-card max-w-md w-full p-8 text-center space-y-6">
            <div className="corner-accent corner-tl" />
            <div className="corner-accent corner-tr" />
            <div className="flex justify-center">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertTriangle className="text-red-500 w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-mono font-bold text-white uppercase tracking-widest">System Kernel Panic</h2>
              <p className="text-sm text-gray-500 font-mono">
                A critical exception occurred in the CyberSuite core.
              </p>
            </div>
            <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg text-left">
              <p className="text-[10px] font-mono text-red-400 break-all">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-mono text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={16} />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
