import React from 'react';
import { Loader2, ShieldCheck, Activity } from 'lucide-react';

export const LoadingSpinner = ({
  variant = 'container', // 'screen' | 'container' | 'inline' | 'skeleton'
  text = 'Initializing Sovereign Module...',
  subtext = 'Connecting to Bangladesh Article 6.2 registry consensus',
  size = 'md',
  className = '',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`w-full space-y-4 animate-pulse motion-reduce:animate-none ${className}`}>
        <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5"></div>
          <div className="h-28 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5"></div>
          <div className="h-28 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5"></div>
        </div>
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5"></div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-2 text-accent dark:text-emerald font-sans text-xs ${className}`}>
        <Loader2 size={16} className="animate-spin motion-reduce:animate-none text-accent dark:text-emerald" />
        {text && <span>{text}</span>}
      </div>
    );
  }

  const isScreen = variant === 'screen';

  return (
    <div
      className={`w-full flex flex-col items-center justify-center font-sans relative overflow-hidden transition-colors ${
        isScreen
          ? 'fixed inset-0 z-[100] bg-carbon text-registry'
          : 'min-h-[55dvh] py-16 bg-transparent text-registry'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient background blur glow */}
      <div className="w-56 h-56 bg-emerald/10 rounded-full blur-3xl pointer-events-none absolute"></div>

      {/* Sovereign Orbital Loader Graphic */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer Pulsing Ping Ring */}
        <div className="absolute w-20 h-20 rounded-full border border-emerald-500/20 dark:border-emerald/20 animate-ping motion-reduce:animate-none opacity-30"></div>
        
        {/* Rotating Segment Ring */}
        <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 dark:border-emerald/20 border-t-[#166534] dark:border-t-emerald animate-spin motion-reduce:animate-none"></div>
        
        {/* Inner Glowing Core Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck size={22} className="text-accent dark:text-emerald animate-pulse motion-reduce:animate-none" />
        </div>
      </div>

      {/* Primary Status Text */}
      <div className="flex items-center space-x-2 font-mono text-xs sm:text-sm font-semibold tracking-widest text-accent dark:text-emerald uppercase text-center px-4">
        <Activity size={14} className="animate-pulse motion-reduce:animate-none" />
        <span>{text}</span>
      </div>

      {/* Optional Context Subtext */}
      {subtext && (
        <p className="font-sans text-xs text-fg-muted dark:text-mist/80 mt-2 max-w-sm text-center px-6 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
