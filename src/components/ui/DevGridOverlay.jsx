import React, { useState, useEffect } from 'react';

/**
 * DevGridOverlay
 * Dev-only 12-column layout & 4px spacing rhythm overlay
 * Toggled via "G" keypress
 */
export function DevGridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only register in dev mode
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible || !import.meta.env.DEV) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] select-none"
      aria-hidden="true"
    >
      {/* 12-Column Responsive Grid */}
      <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-full bg-emerald/10 border-x border-emerald/20 flex flex-col justify-between p-1"
          >
            <span className="text-[10px] font-mono text-emerald/60">Col {i + 1}</span>
            <span className="text-[10px] font-mono text-emerald/60 text-right">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Floating Status Pill */}
      <div className="fixed bottom-4 right-4 bg-carbon/95 text-emerald border border-emerald/40 px-3 py-1.5 rounded-full font-mono text-xs shadow-2xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
        <span>12-Col Grid Active (Press "G" to dismiss)</span>
      </div>
    </div>
  );
}

export default DevGridOverlay;
