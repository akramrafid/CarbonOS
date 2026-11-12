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
    <div className="bg-carbon min-h-screen text-registry font-sans selection:bg-emerald selection:text-carbon flex flex-col justify-between">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 w-full flex flex-col" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <DevGridOverlay />
    </div>
  );
}

export default MarketingLayout;

