import React, { useMemo, useRef } from 'react';

/**
 * Accessible Tablist Navigation Component
 * Supports both flat `tabs` and hierarchical two-tier `groups` (Primary Category + Sub-Tabs).
 * Built with canonical Tailwind RGB tokens so Light and Dark themes preserve high contrast.
 */
export function Tabs({
  tabs = [],
  groups = null,
  activeTab,
  onChange,
  size = 'md',
  className = ''
}) {
  const tabRefs = useRef({});
  const isCompact = size === 'sm';

  const normalizedGroups = useMemo(() => {
    if (Array.isArray(groups) && groups.length > 0) return groups;
    return null;
  }, [groups]);

  const activeGroup = useMemo(() => {
    if (!normalizedGroups) return null;
    return (
      normalizedGroups.find((g) => g.tabs.some((t) => t.id === activeTab)) ||
      normalizedGroups[0]
    );
  }, [normalizedGroups, activeTab]);

  const visibleTabs = activeGroup ? activeGroup.tabs : tabs;

  const handleKeyDown = (e, idx) => {
    let nextIdx = null;
    if (e.key === 'ArrowRight') {
      nextIdx = (idx + 1) % visibleTabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + visibleTabs.length) % visibleTabs.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = visibleTabs.length - 1;
    }

    if (nextIdx !== null && visibleTabs[nextIdx]) {
      e.preventDefault();
      const targetTab = visibleTabs[nextIdx];
      onChange(targetTab.id);
      tabRefs.current[targetTab.id]?.focus();
    }
  };

  if (normalizedGroups && activeGroup) {
    return (
      <div className={`flex flex-col gap-2 w-full min-w-0 ${className}`}>
        {/* Primary Category Strip */}
        <div
          role="tablist"
          aria-label="Workspace sections"
          aria-orientation="horizontal"
          className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-bg-elevated/85 border border-border-subtle w-full sm:w-auto"
        >
          {normalizedGroups.map((group) => {
            const isGroupActive = group.id === activeGroup.id;
            return (
              <button
                key={group.id}
                role="tab"
                type="button"
                aria-selected={isGroupActive}
                onClick={() => {
                  if (!isGroupActive && group.tabs[0]) {
                    onChange(group.tabs[0].id);
                  }
                }}
                className={`
                  inline-flex items-center gap-2 ${isCompact ? 'h-9 px-3 text-xs' : 'h-10 px-3.5 text-xs sm:text-sm'} rounded-lg font-sans font-semibold whitespace-nowrap shrink-0 transition-all duration-150 select-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                  ${
                    isGroupActive
                      ? 'bg-accent text-fg-inverse shadow-sm border border-accent'
                      : 'text-fg-muted hover:text-fg-primary hover:bg-bg-surface/80 border border-transparent'
                  }
                `.trim()}
              >
                {group.icon && <span className="shrink-0 opacity-90">{group.icon}</span>}
                <span>{group.label}</span>
                {group.badge && <span className="shrink-0">{group.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Secondary Sub-Button Rail */}
        {visibleTabs.length > 0 && (
          <div
            role="tablist"
            aria-label={`${activeGroup.label} views`}
            aria-orientation="horizontal"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-bg-surface/95 border border-border-subtle w-full sm:w-auto"
          >
            {visibleTabs.map((tab, idx) => {
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
                    inline-flex items-center gap-2 ${isCompact ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-xs sm:text-sm'} rounded-lg font-sans font-medium whitespace-nowrap shrink-0 transition-all duration-150 select-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                    ${
                      isActive
                        ? 'bg-bg-elevated text-fg-primary border border-accent/50 shadow-sm font-semibold'
                        : 'text-fg-muted hover:text-fg-primary hover:bg-bg-elevated/60 border border-transparent'
                    }
                  `.trim()}
                >
                  {tab.icon && <span className="shrink-0 opacity-85">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.badge && <span className="shrink-0">{tab.badge}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-bg-elevated/85 border border-border-subtle ${className}`}
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
              inline-flex items-center gap-2 ${isCompact ? 'h-8 px-2.5 text-xs' : 'h-10 px-3.5 text-xs sm:text-sm'} rounded-lg font-sans font-medium whitespace-nowrap shrink-0 transition-all duration-150 select-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${
                isActive
                  ? 'bg-accent text-fg-inverse shadow-sm border border-accent font-semibold'
                  : 'text-fg-muted hover:text-fg-primary hover:bg-bg-surface/80 border border-transparent'
              }
            `.trim()}
          >
            {tab.icon && <span className="shrink-0 opacity-90">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
