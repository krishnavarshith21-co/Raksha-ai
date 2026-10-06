import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RAKSHYA SYSTEM ERROR BOUNDARY CAUGHT]:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      localStorage.removeItem('rakshya_token');
      localStorage.removeItem('rakshya_user');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070707] text-[#F2EEE7] flex items-center justify-center p-6 font-sans relative overflow-hidden">
          {/* Subtle background ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#C9A66B]/[0.025] blur-[160px] pointer-events-none rounded-full" />

          <div className="w-full max-w-md relative z-10">
            <div className="surface-card p-8 sm:p-10 rounded-2xl border border-white/10 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-[#141415] border border-amber-500/30 text-[#C9A66B] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/50">
                <ShieldAlert className="w-6 h-6 text-[#E0C28D]" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101011] border border-white/[0.08] text-[10.5px] font-mono text-[#E0C28D] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>SEC_SESSION_FAULT_INTERCEPT</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#F2EEE7] tracking-tight font-medium mb-3">
                AUTHENTICATION SERVICE UNAVAILABLE
              </h2>

              <p className="text-[14.5px] text-[#96939A] leading-relaxed mb-8">
                Unable to initialize the security session.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="btn-gold w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C9A66B]/15"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetSession}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#141415] hover:bg-[#1A1A1D] border border-white/10 hover:border-[#C9A66B]/40 text-sm font-medium text-[#D8D4CC] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-[#96939A]" />
                  <span>Reset Session</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#66636A]">
                <span>RAKSHYA GATEWAY v2.8</span>
                <span>ZERO-TRUST INTEGRITY</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
