import React, { useState, useEffect, useRef, memo } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { navConfig } from '../../config/nav.config';
import { Tooltip } from '../ui/Tooltip';
import { LayoutGroup, m } from 'framer-motion';
import { getSharedElementLayoutId, EASINGS, getPrefersReducedMotion } from '../../lib/motion';

/**
 * DashboardSidebar Component
 * Persistent, memoized navigation sidebar supporting:
 * - Full expanded mode (w-64) with accordion groups
 * - Icon rail mode (w-16) with portaled tooltips
 * - Active item auto-scroll-into-view
 * - Independent scrolling with top/bottom gradient fade masks
 * - Global Ctrl+B shortcut support
 */
export const DashboardSidebar = memo(function DashboardSidebar({
  collapsed,
  onToggleCollapse
}) {
  const location = useLocation();
  const { t } = useTranslation();
  const activeLinkRef = useRef(null);
  const navContainerRef = useRef(null);

  // Group open state for accordions (default all open)
  const [openGroups, setOpenGroups] = useState(() => {
    const state = {};
    navConfig.groups.forEach((g) => {
      state[g.id] = true;
    });
    return state;
  });

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Auto-expand group containing the active route
  useEffect(() => {
    navConfig.groups.forEach((group) => {
      const hasActive = group.items.some((item) => {
        if (item.route === location.pathname) return true;
        if (item.children) {
          return item.children.some((c) => c.route === location.pathname);
        }
        return false;
      });
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);

  // Scroll active item into view on mount or route change
  useEffect(() => {
    if (activeLinkRef.current && navContainerRef.current) {
      activeLinkRef.current.scrollIntoView({
        block: 'nearest',
        behavior: getPrefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [location.pathname, collapsed]);

  return (
    <aside
      aria-label="Dashboard navigation"
      className={`
        hidden md:flex flex-col border-r border-border-subtle bg-bg-surface
        transition-[width] duration-200 select-none shrink-0 sticky top-0 h-screen z-40 min-w-0
        ${collapsed ? 'w-16' : 'w-64'}
      `.trim()}
    >
      {/* Brand & Collapse Header */}
      <div className={`h-16 flex items-center border-b border-border-subtle shrink-0 ${collapsed ? 'justify-center px-1.5 gap-1' : 'justify-between px-4'}`}>
        {!collapsed ? (
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-fg-primary min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-canvas font-mono font-bold text-base shadow-sm shrink-0">
              C
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-lg tracking-normal leading-tight truncate">CarbonOS</span>
              <span className="text-[10px] font-mono text-accent leading-tight">NATIONAL MRV</span>
            </div>
          </Link>
        ) : (
          <Tooltip content="CarbonOS Home" position="right">
            <Link to="/" className="shrink-0" aria-label="CarbonOS Home">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-bg-canvas font-mono font-bold text-sm shadow-sm">
                C
              </div>
            </Link>
          </Tooltip>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? t('nav.expandSidebar', 'Expand sidebar (Ctrl+B)') : t('nav.collapseSidebar', 'Collapse sidebar (Ctrl+B)')}
          className={`flex items-center justify-center rounded-lg text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated transition-colors focus-ring-standard ${collapsed ? 'min-w-[26px] min-h-[36px] p-1' : 'min-w-[44px] min-h-[44px] p-1.5'}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Body with Independent Scroll & Gradient Fade Masks */}
      <div
        ref={navContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)] min-w-0"
      >
        <LayoutGroup id="dashboard-sidebar">
          {navConfig.groups.map((group) => {
            const isOpen = openGroups[group.id] !== false;

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Accordion Header (Expanded mode only) */}
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2 py-2 min-h-[40px] text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted hover:text-fg-primary transition-colors mb-1 rounded focus-ring-standard"
                    aria-expanded={isOpen}
                  >
                    <span className="truncate">
                      {group.titleKey ? t(group.titleKey, group.title) : group.title}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-fg-muted/70 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                    />
                  </button>
                )}

                {/* Group Items */}
                {(isOpen || collapsed) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = location.pathname === item.route;
                      const itemLabel = item.labelKey ? t(item.labelKey, item.label) : item.label;

                      const navLinkElement = (
                        <NavLink
                          key={item.id}
                          to={item.route}
                          ref={isItemActive ? activeLinkRef : undefined}
                          aria-current={isItemActive ? 'page' : undefined}
                          className={({ isActive }) => `
                          group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 min-h-[40px]
                          focus-ring-standard min-w-0
                          ${isActive
                              ? 'bg-accent text-fg-inverse font-semibold shadow-sm'
                              : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'
                            }
                          ${collapsed ? 'justify-center px-0' : ''}
                        `.trim()}
                        >
                          {isItemActive && (
                            <m.span
                              layoutId={getSharedElementLayoutId('sidebar', 'active-pill')}
                              transition={EASINGS.spring}
                              className="absolute inset-0 rounded-xl bg-accent shadow-sm -z-0"
                              aria-hidden="true"
                            />
                          )}
                          <Icon className="relative z-10 w-4 h-4 shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />

                          {!collapsed && (
                            <span className="relative z-10 truncate flex-1 text-left">
                              {itemLabel}
                            </span>
                          )}

                          {!collapsed && item.badge && (
                            <span
                              data-badge="live"
                              className={`relative z-10 ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${isItemActive
                                ? 'bg-fg-inverse/20 text-fg-inverse border border-fg-inverse/30'
                                : 'bg-accent/15 text-accent'
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );

                      // In rail mode, wrap in portaled Tooltip
                      if (collapsed) {
                        return (
                          <Tooltip key={item.id} content={itemLabel} position="right">
                            {navLinkElement}
                          </Tooltip>
                        );
                      }

                      return navLinkElement;
                    })}
                  </div>
                )
                }
              </div>
            );
          })}
        </LayoutGroup>
      </div>

      {/* Sidebar Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-border-subtle text-xs text-fg-secondary flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-fg-muted">Protocol Node</span>
            <span className="font-mono text-[11px] font-medium text-emerald-500">Mainnet v2.4</span>
          </div>
          <Link
            to="/"
            className="hover:text-accent flex items-center gap-1 transition-colors text-xs font-mono"
            aria-label="Exit to landing"
          >
            Landing <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="p-2 border-t border-border-subtle flex justify-center shrink-0">
          <Tooltip content="Exit to Landing" position="right">
            <Link to="/" className="p-2 rounded-lg text-fg-muted hover:text-accent hover:bg-bg-elevated transition-colors" aria-label="Exit to landing">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Tooltip>
        </div>
      )}
    </aside>
  );
});

export default DashboardSidebar;
