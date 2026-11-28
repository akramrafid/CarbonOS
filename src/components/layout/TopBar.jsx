import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  User,
  LogOut,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { getBreadcrumbs } from '../../config/nav.config';
import { Tooltip } from '../ui/Tooltip';
import { clearAllUserStorage } from '../../lib/safeStorage';
import { signOut } from '../../lib/esgAuth';

/**
 * TopBar Component
 * Config-driven auto breadcrumbs, search command palette trigger,
 * real-time telemetry notifications popover, language/theme toggles, and user menu.
 */
export function TopBar({ onOpenMobileDrawer, onOpenCommandPalette }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const moreRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    clearAllUserStorage();
    try {
      await signOut();
    } catch {
      navigate('/');
    }
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Notifications mock data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Sundarbans VM0047 Batch Verified',
      time: '12m ago',
      desc: '14,200 tCO₂e Tier-3 multi-pool verified by SGS auditor.'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Sentinel-2 Cloud Cover Warning',
      time: '1h ago',
      desc: 'Chittagong quadrant exceeds 35% cloud mask; fallback to Sentinel-1 SAR.'
    },
    {
      id: 3,
      type: 'info',
      title: 'Titas Gas Bill Processed',
      time: '3h ago',
      desc: '5,000 m³ natural gas extracted and dual-approved for Scope 1 ledger.'
    }
  ];

  return (
      <header className="h-16 px-4 sm:px-6 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4 min-w-0">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            aria-label="Open mobile menu"
            className="md:hidden p-2 rounded-lg text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Auto Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-fg-muted min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={(crumb.route || crumb.label) + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-fg-muted/60 shrink-0" />}
                {crumb.isCurrent ? (
                  <span className="text-fg-primary font-semibold truncate max-w-[180px] lg:max-w-xs" aria-current="page">
                    {crumb.label}
                  </span>
                ) : crumb.route ? (
                  <Link
                    to={crumb.route}
                    className="hover:text-accent transition-colors truncate max-w-[140px]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate max-w-[140px] text-fg-muted">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, Language, Theme & User */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Button (⌘K) */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label={t('nav.searchPlaceholder', 'Search (Ctrl+K)')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-canvas/60 text-fg-muted hover:text-fg-primary hover:border-border-strong text-xs font-mono transition-all min-h-[44px]"
          >
            <Search className="w-4 h-4 text-fg-muted" />
            <span className="hidden md:inline-block">Search...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-fg-muted bg-bg-surface border border-border-subtle rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <Tooltip content="Notifications">
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                aria-label="View notifications"
                className="relative p-2 rounded-lg border border-border-subtle text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </Tooltip>

            {notificationsOpen && (
                <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:absolute sm:right-0 sm:top-full mt-2 sm:w-96 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl p-4 z-50 animate-fade-in text-sm min-w-0">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <span className="font-semibold text-fg-primary font-mono text-xs uppercase tracking-wider">
                      Telemetry Alerts
                    </span>
                    <span className="text-[11px] font-mono text-accent">3 unread</span>
                  </div>
                  <div className="divide-y divide-border-subtle/50 max-h-72 overflow-y-auto mt-2 space-y-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 flex items-start gap-3 hover:bg-bg-elevated/40 px-2 rounded-lg transition-colors">
                        {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {n.type === 'info' && <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            {/* <h5 className="font-medium text-xs text-fg-primary truncate">{n.title}</h5> [COMMENTED OUT FOR PERSONAL REFERENCE — avoided h1->h5 heading skip] */}
                            <span className="font-medium text-xs text-fg-primary truncate block">{n.title}</span>
                            <span className="text-[10px] text-fg-muted font-mono shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-fg-secondary mt-0.5 line-clamp-2">{n.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          )}
              </div>

        {/* Language Switcher */}
            <Tooltip content="Toggle language (English / বাংলা)">
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label="Switch Language"
                className="px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs font-mono font-medium hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                {i18n.language === 'en' ? 'বাংলা' : 'EN'}
              </button>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="p-2 rounded-lg border border-border-subtle text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber" /> : <Moon className="w-4 h-4 text-fg-secondary" />}
              </button>
            </Tooltip>

            {/* User Profile Menu */}
            <div className="relative ml-1" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-label="Open user menu"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-border-subtle bg-bg-surface hover:bg-bg-elevated transition-colors min-h-[44px]"
              >
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-mono font-bold text-xs">
                  MR
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-fg-primary leading-tight">Workspace Session</span>
                  <span className="text-[10px] font-mono text-fg-muted leading-tight">Tenant Operator</span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl p-2 z-50 animate-fade-in text-sm">
                  <div className="px-3 py-2 border-b border-border-subtle mb-1">
                    <p className="font-semibold text-xs text-fg-primary">Active Workspace</p>
                    <p className="text-[11px] text-fg-muted font-mono truncate">Session scoped via Bearer / Demo</p>
                  </div>
                  <div className="px-2 py-2 border-b border-border-subtle mb-1 flex justify-center">
                    <ThemeToggle variant="segmented" />
                  </div>
                  <Link
                    to="/platform/verification-workflow"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Verification Queue</span>
                  </Link>
                  <Link
                    to="/platform/saas-dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-fg-muted" />
                    <span>Workspace Settings</span>
                  </Link>
                  <div className="border-t border-border-subtle my-1" />
                  {/* [COMMENTED OUT FOR PERSONAL REFERENCE — previously fake Link to="/", now clears all storage & OIDC/demo sessions] */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 transition-colors min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
      </header>
      );
}

      export default TopBar;
