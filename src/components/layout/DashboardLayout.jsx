import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import DevGridOverlay from '../ui/DevGridOverlay';
import ErrorBoundary from '../ErrorBoundary';
// [COMMENTED OUT FOR PERSONAL REFERENCE — OfflineBanner is mounted globally once in src/App.jsx]
// import OfflineBanner from '../OfflineBanner';
import DashboardSidebar from './DashboardSidebar';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';
import MobileTabBar from './MobileTabBar';
import CommandPalette from './CommandPalette';
import Footer from '../Footer';
import RouteTransitionOutlet from './RouteTransitionOutlet';
import { safeGetItem, safeSetItem } from '../../lib/safeStorage';

export const DashboardLayoutContext = createContext(false);

/**
 * Persistent Dashboard Layout Shell (Phase 4 & Phase 6)
 * Architecture:
 * - DashboardSidebar: persistent, memoized, collapsible (Ctrl+B), accordion groups, fade masks
 * - TopBar: auto-breadcrumbs, search trigger (⌘K), notifications, language, theme, user menu
 * - RouteTransitionOutlet: animates only the inner <Outlet /> with direction-aware Framer Motion,
 *   scroll restoration, <h1> focus management, aria-live announcements, and layout skeleton
 * - MobileDrawer: full slide-in menu with focus trap & Esc dismissal
 * - MobileTabBar: sticky bottom navigation for mobile viewports (<768px)
 * - CommandPalette: global Ctrl+K / Cmd+K search palette across all 36 routes
 */
export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = safeGetItem('carbonos-sidebar-collapsed');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined' && window.innerWidth < 1280) return true;
      return false;
    } catch {
      return false;
    }
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      safeSetItem('carbonos-sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Global Keyboard Shortcuts (Ctrl/Cmd+B for sidebar, Ctrl/Cmd+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  return (
    <div className="min-h-screen bg-bg-canvas text-fg-primary font-sans flex flex-col antialiased selection:bg-accent selection:text-bg-canvas min-w-0 overflow-x-clip">
      {/* <OfflineBanner /> [COMMENTED OUT FOR PERSONAL REFERENCE — rendered once globally in src/App.jsx] */}

      {/* Accessibility: Skip to Content */}
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] px-4 py-2 bg-accent text-fg-inverse font-semibold rounded-lg shadow-xl focus-ring-standard"
      >
        Skip to main content
      </a>

      <div className="flex-1 flex w-full relative min-w-0">
        {/* Persistent Desktop & Tablet Sidebar */}
        <DashboardSidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar with Breadcrumbs, Search, Telemetry Alerts, and Actions */}
          <TopBar
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          {/* Dynamic Page Outlet with compact density padding */}
          <main
            id="dashboard-main"
            className="flex-1 px-4 pt-3 sm:px-5 sm:pt-4 lg:px-6 lg:pt-4 pb-20 md:pb-6 max-w-[1600px] w-full mx-auto min-w-0 flex flex-col"
          >
            <DashboardLayoutContext.Provider value={true}>
              <ErrorBoundary>
                <RouteTransitionOutlet mode="dashboard" />
              </ErrorBoundary>
            </DashboardLayoutContext.Provider>
          </main>

          {/* Slim Workspace Footer (Product Mode) */}
          <div className="hidden md:block">
            <Footer variant="slim" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Mobile Bottom Tab Bar (<768px) */}
      <MobileTabBar
        onOpenDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Dev Grid & Spacing Overlay (Toggled with 'G' key) */}
      <DevGridOverlay />
    </div>
  );
}

export default DashboardLayout;
