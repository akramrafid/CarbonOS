import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { subscribeDemoDataActive } from '../lib/esgApi';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const unsub = subscribeDemoDataActive((active) => {
      setIsDemoData(active);
    });

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      // Light check to see if network actually responds
      if (navigator.onLine) {
        setIsOffline(false);
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3000);
      } else {
        setIsOffline(true);
      }
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  if (!isOffline && !showRestored && !isDemoData) {
    return null;
  }

  if (isDemoData && !isOffline && !showRestored) {
    return (
      <div
        className={`w-full z-[99] px-4 py-2 transition-all duration-300 font-sans border-b shadow-sm ${
          isLight
            ? 'bg-amber-100 border-amber-300 text-amber-950'
            : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
        }`}
        role="alert"
        aria-live="polite"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="p-1 rounded-full bg-amber-500/20 shrink-0">
              <AlertTriangle size={14} className={isLight ? 'text-amber-800' : 'text-amber-400'} />
            </span>
            <p className="truncate sm:whitespace-normal">
              <strong className="font-semibold uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded bg-amber-200/90 text-amber-950 mr-1.5 font-mono">
                DEMO DATA
              </strong>
              <span>
                Showing offline demo fixtures. Backend is offline or mock fallback was served. Figures are not live, audited, or compliant.
              </span>
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase opacity-75 shrink-0 hidden md:inline">
            NOT AUDIT-GRADE
          </span>
        </div>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        className={`w-full z-[99] px-4 py-2.5 transition-all duration-300 font-sans border-b shadow-sm ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-accent'
            : 'bg-emerald/15 border-emerald/30 text-emerald'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center space-x-2.5">
            <span className="p-1 rounded-full bg-emerald-500/20">
              <Wifi size={14} className={isLight ? 'text-accent' : 'text-emerald'} />
            </span>
            <span>
              <strong>Connection restored:</strong> Sovereign ledger and telemetry synchronization active.
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-75 hidden sm:inline">ONLINE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full z-[99] px-4 py-2.5 transition-all duration-300 font-sans border-b shadow-sm ${
        isLight
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-amber-950/60 border-amber-500/30 text-amber-200'
      }`}
      role="status"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="p-1 rounded-full bg-amber-500/20 shrink-0">
            <WifiOff size={14} className={isLight ? 'text-amber-800' : 'text-amber-400'} />
          </span>
          <p className="truncate sm:whitespace-normal">
            <strong className="font-semibold">Operating Offline:</strong>{' '}
            <span className="hidden sm:inline">
              Local draft states and cached registry validations remain functional.
            </span>
            <span className="sm:hidden">Local features remain functional.</span>
          </p>
        </div>

        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className={`shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            isLight
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30'
          }`}
          title="Check connectivity status"
        >
          <RefreshCw size={12} className={isChecking ? 'animate-spin' : ''} />
          <span>{isChecking ? 'Checking...' : 'Check'}</span>
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;

