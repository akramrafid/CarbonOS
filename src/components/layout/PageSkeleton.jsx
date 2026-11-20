import React, { useState, useEffect } from 'react';
import { PAGE_TRANSITION_TIMING } from '../../lib/motion';

/**
 * PageSkeleton (Phase 6)
 * Layout-matched Suspense fallback for content outlets.
 * - Delayed by 150ms so warm/fast chunk loads never flash a placeholder.
 * - Matches the real anatomy of Dashboard (PageHeader + 4 KPI StatCards + Main Content)
 *   or Marketing pages, while the persistent shell (Navbar, Sidebar, TopBar, Footer) stays mounted.
 */
export function PageSkeleton({ mode = 'dashboard', immediate = false }) {
  const [show, setShow] = useState(immediate);

  useEffect(() => {
    if (immediate) return undefined;
    const timer = setTimeout(() => {
      setShow(true);
    }, PAGE_TRANSITION_TIMING.progressDelayMs);
    return () => clearTimeout(timer);
  }, [immediate]);

  if (!show) {
    return <div className="min-h-[60dvh] w-full" aria-busy="true" />;
  }

  if (mode === 'marketing') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading page content"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 animate-pulse motion-reduce:animate-none"
      >
        {/* Hero / Page Header Skeleton */}
        <div className="space-y-4 max-w-3xl">
          <div className="h-5 w-32 rounded-full bg-bg-elevated border border-border-subtle" />
          <div className="h-12 w-3/4 rounded-2xl bg-bg-elevated" />
          <div className="h-5 w-2/3 rounded-xl bg-bg-surface" />
        </div>

        {/* 3-Column Feature Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-56 rounded-2xl bg-bg-surface border border-border-subtle p-6 flex flex-col justify-between"
            >
              <div className="h-6 w-1/2 rounded-lg bg-bg-elevated" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-bg-elevated" />
                <div className="h-4 w-4/5 rounded bg-bg-elevated" />
              </div>
              <div className="h-8 w-28 rounded-lg bg-bg-elevated" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Product / Dashboard mode anatomy (PageHeader + 4 KPIs + Main Content Grid)
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading workspace view"
      className="w-full space-y-6 animate-pulse motion-reduce:animate-none"
    >
      {/* PageHeader Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-bg-elevated" />
          <div className="h-8 w-64 rounded-xl bg-bg-elevated" />
          <div className="h-4 w-80 max-w-full rounded bg-bg-surface" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-bg-elevated shrink-0" />
      </div>

      {/* 4 KPI StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="h-28 rounded-2xl bg-bg-surface border border-border-subtle p-4 flex flex-col justify-between"
          >
            <div className="h-3 w-24 rounded bg-bg-elevated" />
            <div className="h-7 w-32 rounded-lg bg-bg-elevated" />
            <div className="h-3 w-20 rounded bg-bg-elevated" />
          </div>
        ))}
      </div>

      {/* Primary Workspace Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-4">
          <div className="h-5 w-48 rounded bg-bg-elevated" />
          <div className="h-56 w-full rounded-xl bg-bg-elevated/60" />
        </div>
        <div className="h-80 rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-bg-elevated" />
          <div className="space-y-3">
            <div className="h-12 w-full rounded-xl bg-bg-elevated/60" />
            <div className="h-12 w-full rounded-xl bg-bg-elevated/60" />
            <div className="h-12 w-full rounded-xl bg-bg-elevated/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageSkeleton;

