import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import OfflineBanner from '../OfflineBanner';
import DevGridOverlay from '../ui/DevGridOverlay';

/**
 * Persistent Marketing Layout Shell
 * The Navbar and Footer remain mounted across route transitions.
 */
export function MarketingLayout() {
  return (
    <div className="bg-bg-canvas min-h-screen text-fg-primary font-sans selection:bg-accent selection:text-bg-canvas flex flex-col justify-between min-w-0 overflow-x-clip">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 w-full flex flex-col min-w-0" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <DevGridOverlay />
    </div>
  );
}

export default MarketingLayout;

