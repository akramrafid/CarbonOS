import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { navConfig } from '../../config/nav.config';
import DevGridOverlay from '../ui/DevGridOverlay';
import OfflineBanner from '../OfflineBanner';

/**
 * Persistent Dashboard Layout Shell
 * The Sidebar and Header remain mounted across dashboard routes.
 * Pages render content only inside <Outlet />.
 */
export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('carbonos-sidebar-collapsed');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined' && window.innerWidth < 1280) return true;
      return false;
    } catch {
      return false;
    }
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('carbonos-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut Ctrl/Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-bg-canvas text-fg-primary font-sans flex flex-col antialiased selection:bg-accent selection:text-bg-canvas min-w-0 overflow-x-clip">
      <OfflineBanner />

      {/* Skip to Content for Accessibility */}
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] px-4 py-2 bg-accent text-fg-primary font-semibold rounded-lg shadow-xl"
      >
        Skip to main content
      </a>

      <div className="flex-1 flex w-full relative min-w-0">
        {/* Desktop Sidebar (Persistent) */}
        <aside
          aria-label="Sidebar navigation"
          className={`
            hidden md:flex flex-col border-r border-border-subtle bg-bg-surface
            transition-all duration-200 select-none shrink-0 sticky top-0 h-screen z-40
            ${collapsed ? 'w-16' : 'w-64'}
          `.trim()}
        >
          {/* Logo & Toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
            {!collapsed ? (
              <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-fg-primary">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-canvas font-mono font-bold text-base shadow-sm">
                  C
                </div>
                <span className="font-serif text-lg tracking-normal">CarbonOS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                  PROD
                </span>
              </Link>
            ) : (
              <Link to="/" className="mx-auto" aria-label="CarbonOS Home">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-canvas font-mono font-bold text-base shadow-sm">
                  C
                </div>
              </Link>
            )}

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
            {navConfig.groups.map((group) => (
              <div key={group.id} className="space-y-1">
                {!collapsed && (
                  <h3 className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted mb-2">
                    {group.title}
                  </h3>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.route}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                        focus-ring-standard
                        ${
                          isActive
                            ? 'bg-accent text-fg-inverse font-semibold shadow-sm'
                            : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'
                        }
                        ${collapsed ? 'justify-center px-0' : ''}
                      `.trim()}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/20 text-accent">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer of Sidebar */}
          {!collapsed && (
            <div className="p-3 border-t border-border-subtle text-xs text-fg-secondary flex items-center justify-between">
              <span className="font-mono text-[11px]">v2.4.0 • Dhaka MRV</span>
              <Link to="/" className="hover:text-accent flex items-center gap-1 transition-colors">
                Exit <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 px-4 sm:px-6 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Drawer Trigger */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Open mobile menu"
                className="md:hidden p-2 rounded-lg text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Menu className="w-5 h-5" />
              </button>

              <span className="text-xs font-mono text-fg-muted hidden sm:inline-block truncate">
                NATIONAL CARBON REGISTRY & ESG ENGINE
              </span>
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label="Switch Language"
                className="px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs font-mono font-medium hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                {i18n.language === 'en' ? 'বাংলা' : 'EN'}
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="p-2 rounded-lg border border-border-subtle text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber" /> : <Moon className="w-4 h-4 text-fg-secondary" />}
              </button>
            </div>
          </header>

          {/* Dynamic Page Outlet */}
          <main id="dashboard-main" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-bg-surface h-full flex flex-col p-4 shadow-2xl border-r border-border-subtle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <span className="font-serif font-bold text-lg text-fg-primary">
                CarbonOS
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center text-fg-secondary hover:text-fg-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {navConfig.groups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <h4 className="text-[11px] font-mono font-semibold uppercase text-fg-muted px-2 mb-1">
                    {group.title}
                  </h4>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.route}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px]
                          ${isActive ? 'bg-accent text-fg-inverse font-semibold' : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'}
                        `.trim()}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DevGridOverlay />
    </div>
  );
}

export default DashboardLayout;

