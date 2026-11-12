import React, { useRef, useEffect } from 'react';

/**
 * Universal Tabs Component
 * WAI-ARIA compliant tab navigation for progressive disclosure
 */
export function Tabs({
  tabs = [], // [{ id, label, icon, badge }]
  activeTab,
  onChange,
  className = '',
  size = 'md'
}) {
  const tabRefs = useRef({});

  const handleKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      onChange(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`inline-flex items-center gap-1 p-1 rounded-xl bg-carbon-surface-raised/80 border border-carbon-border/60 dark:bg-[#0D1812] dark:border-[#1E3326] ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`
              inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-sans font-medium transition-all duration-150 select-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald
              ${
                isActive
                  ? 'bg-carbon-surface text-registry shadow-sm border border-carbon-border/80 dark:bg-[#13241B] dark:text-[#E2ECE5] dark:border-[#2A4736]'
                  : 'text-mist hover:text-registry hover:bg-carbon-surface/50 dark:text-[#7A9A85] dark:hover:text-[#E2ECE5]'
              }
            `.trim()}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-1">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

