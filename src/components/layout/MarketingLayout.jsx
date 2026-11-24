import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import ErrorBoundary from '../ErrorBoundary';
// [COMMENTED OUT FOR PERSONAL REFERENCE — OfflineBanner is mounted globally once in src/App.jsx]
// import OfflineBanner from '../OfflineBanner';
import DevGridOverlay from '../ui/DevGridOverlay';
import RouteTransitionOutlet from './RouteTransitionOutlet';

/**
 * Persistent Marketing Layout Shell (Phase 1 & Phase 6)
 * The Navbar and Footer remain mounted across route transitions while
 * RouteTransitionOutlet animates the inner <Outlet /> content.
 */
export function MarketingLayout() {
  return (
    <div className="bg-bg-canvas min-h-screen text-fg-primary font-sans selection:bg-accent selection:text-bg-canvas flex flex-col justify-between min-w-0 overflow-x-clip">
      {/* <OfflineBanner /> */}
      <Navbar />
      <main className="flex-1 w-full flex flex-col min-w-0" id="main-content">
        <ErrorBoundary>
          <RouteTransitionOutlet mode="marketing" />
        </ErrorBoundary>
      </main>
      <Footer />
      <DevGridOverlay />
    </div>
  );
}

export default MarketingLayout;
