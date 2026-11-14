import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Activity, 
  Layers, 
  Sprout, 
  Menu 
} from 'lucide-react';

/**
 * Mobile Bottom Tab Bar (<768px)
 * Displays top 4 primary actions + "More" drawer trigger with safe-area insets.
 */
export function MobileTabBar({ onOpenDrawer }) {
  const { t } = useTranslation();
  const location = useLocation();

  const primaryTabs = [
    { id: 'esg', label: 'ESG', route: '/platform/saas-dashboard', icon: BarChart3 },
    { id: 'mrv', label: 'MRV', route: '/platform/mrv-dashboard', icon: Activity },
    { id: 'biomass', label: 'GIS Map', route: '/carbon-monitoring', icon: Layers },
    { id: 'crops', label: 'Crops', route: '/farmers-ai', icon: Sprout }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-md border-t border-border-subtle flex items-center justify-around px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] shrink-0"
    >
      {primaryTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.route;

        return (
          <NavLink
            key={tab.id}
            to={tab.route}
            aria-current={isActive ? 'page' : undefined}
            className={`
              flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[48px] text-[10px] font-medium transition-colors
              ${isActive ? 'text-accent font-semibold' : 'text-fg-muted hover:text-fg-primary'}
            `.trim()}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-accent/15' : ''}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="truncate mt-0.5">{tab.label}</span>
          </NavLink>
        );
      })}

      {/* "More" Trigger opens full drawer */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open more navigation"
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[48px] text-[10px] font-medium text-fg-muted hover:text-fg-primary transition-colors"
      >
        <div className="p-1 rounded-lg">
          <Menu className="w-5 h-5" aria-hidden="true" />
        </div>
        <span className="truncate mt-0.5">More</span>
      </button>
    </nav>
  );
}

export default MobileTabBar;
