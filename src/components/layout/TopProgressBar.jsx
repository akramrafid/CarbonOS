import React, { useState, useEffect } from 'react';
import { PAGE_TRANSITION_TIMING } from '../../lib/motion';
import { subscribeRouteLoading } from '../../lib/routePrefetch';

/**
 * TopProgressBar (Phase 6)
 * Slim top progress bar that appears ONLY if a route transition or chunk load
 * takes longer than 150ms (`PAGE_TRANSITION_TIMING.progressDelayMs`).
 */
export function TopProgressBar({ isPending = false }) {
  const [chunkBusy, setChunkBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return subscribeRouteLoading(setChunkBusy);
  }, []);

  const active = isPending || chunkBusy;

  useEffect(() => {
    let delayTimer = null;
    let stepTimer = null;

    if (active) {
      delayTimer = setTimeout(() => {
        setVisible(true);
        setProgress(35);
        stepTimer = setInterval(() => {
          setProgress((prev) => (prev < 88 ? prev + Math.max(2, (90 - prev) * 0.18) : prev));
        }, 120);
      }, PAGE_TRANSITION_TIMING.progressDelayMs);
    } else if (visible) {
      setProgress(100);
      delayTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 160);
    } else {
      setProgress(0);
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (stepTimer) clearInterval(stepTimer);
    };
  }, [active, visible]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="fixed top-0 left-0 right-0 h-0.5 z-[9999] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-accent transition-all duration-150 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default TopProgressBar;

