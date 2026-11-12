import React from 'react';
import { AlertOctagon, RotateCcw, Home, Copy, Check, Terminal } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      copied: false,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    const errorId = `ERR_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[CarbonOS Global ErrorBoundary caught exception]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false, errorId: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyDetails = () => {
    const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
    const errorDetails = [
      `CarbonOS Diagnostic Report`,
      `Reference: ${this.state.errorId || 'N/A'}`,
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `UserAgent: ${navigator.userAgent}`,
      `Error: ${this.state.error?.toString() || 'Unknown'}`,
      `Component Stack:`,
      this.state.errorInfo?.componentStack || 'No component stack recorded'
    ].join('\n');

    navigator.clipboard?.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {});
  };

  render() {
    if (this.state.hasError) {
      const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
      const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

      return (
        <div
          className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans transition-colors ${
            isLight ? 'bg-bg-canvas text-fg-primary' : 'bg-carbon text-registry'
          }`}
          role="alert"
        >
          <div
            className={`max-w-xl w-full rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden transition-all shadow-2xl ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
                : 'bg-bg-surface/85 border border-emerald/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* Ambient Corner Glow */}
            <div
              className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                isLight ? 'bg-rose-500/10' : 'bg-rose-500/15'
              }`}
            ></div>

            {/* Error Header */}
            <div className="flex items-center space-x-3.5 mb-6 relative z-10">
              <div
                className={`p-3 rounded-2xl border ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}
              >
                <AlertOctagon size={26} />
              </div>
              <div>
                <span
                  className={`font-mono text-[11px] uppercase tracking-wider font-semibold block ${
                    isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  Registry Runtime Anomaly // {this.state.errorId || 'ERR_EXEC'}
                </span>
                <h1
                  className={`font-sans font-bold text-xl sm:text-2xl ${
                    isLight ? 'text-fg-primary' : 'text-white'
                  }`}
                >
                  Something went wrong
                </h1>
              </div>
            </div>

            {/* Message Body */}
            <p
              className={`font-sans text-xs sm:text-sm leading-relaxed mb-6 font-normal ${
                isLight ? 'text-fg-muted' : 'text-white/80'
              }`}
            >
              The sovereign platform encountered an unexpected runtime exception while processing this view.
              Your local carbon ledger state and active draft documents remain preserved.
            </p>

            {/* Error Message Snippet (Sanitized in production) */}
            <div
              className={`border rounded-xl p-3.5 sm:p-4 mb-6 font-mono text-xs break-words max-h-36 overflow-y-auto ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-rose-800'
                  : 'bg-bg-canvas border-white/10 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                <Terminal size={12} />
                <span>Exception Detail</span>
              </div>
              {isProd
                ? `System processing halted at runtime. Diagnostics reference: ${this.state.errorId || 'N/A'}`
                : this.state.error?.message || this.state.error?.toString() || 'Unknown execution error'}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center relative z-10">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center bg-accent hover:bg-accent-active text-white dark:bg-emerald dark:hover:bg-emerald/90 dark:text-fg-primary font-sans font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,200,83,0.3)] active:scale-95"
              >
                <RotateCcw size={15} className="mr-2" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className={`inline-flex items-center justify-center font-sans font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                }`}
              >
                Reload Window
              </button>

              <button
                onClick={this.handleGoHome}
                className={`inline-flex items-center justify-center font-sans font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors ${
                  isLight
                    ? 'bg-transparent hover:bg-slate-100 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <Home size={15} className="mr-1.5" />
                <span>Home</span>
              </button>

              <button
                onClick={this.handleCopyDetails}
                className={`ml-auto inline-flex items-center text-xs transition-colors p-2 rounded-lg ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title="Copy error diagnostics for engineering review"
              >
                {this.state.copied ? (
                  <Check size={14} className="text-accent dark:text-emerald mr-1" />
                ) : (
                  <Copy size={14} className="mr-1" />
                )}
                <span>{this.state.copied ? 'Copied' : 'Diagnostics'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
