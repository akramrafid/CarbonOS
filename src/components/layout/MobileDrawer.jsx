import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ExternalLink } from 'lucide-react';
import { navConfig } from '../../config/nav.config';

/**
 * Mobile Navigation Drawer
 * Accessible slide-in drawer with backdrop, focus trap, and Escape dismissal.
 */
export function MobileDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Close on Escape key and trap Tab focus inside open drawer
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 30);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-[9999] flex md:hidden bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        className="w-80 max-w-[85vw] bg-bg-surface h-full flex flex-col p-4 pt-[max(1rem,env(safe-area-inset-top,1rem))] pb-[max(1rem,env(safe-area-inset-bottom,1rem))] shadow-2xl border-r border-border-subtle animate-slide-in min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-border-subtle shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 font-bold tracking-tight text-fg-primary">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-canvas font-mono font-bold text-base shadow-sm">
              C
            </div>
            <span className="font-serif text-lg tracking-normal text-fg-primary">CarbonOS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/15 text-accent">PROD</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {navConfig.groups.map((group) => (
            <div key={group.id} className="space-y-1">
              <h2 className="text-[11px] font-mono font-semibold uppercase text-fg-muted px-2 mb-1 tracking-wider">
                {group.titleKey ? t(group.titleKey, group.title) : group.title}
              </h2>
              {group.items.map((item) => {
                const Icon = item.icon;
                const label = item.labelKey ? t(item.labelKey, item.label) : item.label;

                return (
                  <NavLink
                    key={item.id}
                    to={item.route}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[44px] transition-colors
                      ${isActive ? 'bg-accent text-fg-inverse font-semibold shadow-sm' : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'}
                    `.trim()}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate flex-1">{label}</span>
                    {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated text-fg-secondary border border-border-subtle shrink-0">
                          {item.badge}
                        </span>
                    )}
                      </NavLink>
                    );
              })}
                  </div>
                ))}
            </div>

        {/* Drawer Footer */ }
            < div className = "pt-3 border-t border-border-subtle mt-2 flex items-center justify-between text-xs text-fg-muted shrink-0" >
          <span className="font-mono text-[11px]">v2.4.0 • Dhaka MRV</span>
          <Link
            to="/"
            onClick={onClose}
            className="hover:text-accent flex items-center gap-1 font-mono transition-colors"
          >
            Landing <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MobileDrawer;
