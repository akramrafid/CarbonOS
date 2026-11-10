import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Mountain, 
  Map as MapIcon, 
  Sliders, 
  FileText, 
  AlertTriangle, 
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { useCarbonMonitoringState } from '../../features/carbon-monitoring/useCarbonMonitoringState';

// Modular Feature Panels
import BiomassOverviewPanel from '../../features/carbon-monitoring/components/BiomassOverviewPanel';
import VerraAuditPanel from '../../features/carbon-monitoring/components/VerraAuditPanel';
import TieredVerificationPanel from '../../features/carbon-monitoring/components/TieredVerificationPanel';
import GisMapPanel from '../../features/carbon-monitoring/components/GisMapPanel';
import SatelliteScenePanel from '../../features/carbon-monitoring/components/SatelliteScenePanel';
import ReportsPanel from '../../features/carbon-monitoring/components/ReportsPanel';
import AlertsPanel from '../../features/carbon-monitoring/components/AlertsPanel';
import SettingsPanel from '../../features/carbon-monitoring/components/SettingsPanel';

/**
 * CarbonMonitoring Page
 * Decomposed from 5,707-line monolith into focused feature panels.
 * Operates strictly in Product Mode: dense, functional, and accessible.
 */
export const CarbonMonitoring = () => {
  const state = useCarbonMonitoringState();
  const {
    isBn,
    activeTab,
    setActiveTab,
    toast,
    verificationTasks = [],
    activeAlerts = []
  } = state;

  const pendingVerificationCount = verificationTasks.filter(t => t.status === 'pending').length;
  const unresolvedAlertsCount = activeAlerts.filter(a => !a.is_resolved).length;

  const tabs = [
    { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { 
      id: 'verra_audit', 
      label: isBn ? 'ভেরা VM0047 অডিট' : 'Verra VM0047 dMRV', 
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: <Badge variant="emerald" size="sm">VM0047</Badge>
    },
    { 
      id: 'tiered_verification', 
      label: isBn ? 'টায়ার্ড ভেরিফিকেশন' : 'Tiered Verification', 
      icon: <Mountain className="w-4 h-4" />,
      badge: pendingVerificationCount > 0 ? <Badge variant="warning" size="sm">{pendingVerificationCount}</Badge> : undefined
    },
    { id: 'map', label: isBn ? 'ইন্টারঅ্যাক্টিভ ম্যাপ' : 'Interactive Map', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'satellite', label: isBn ? 'স্যাটেলাইট ইঞ্জিন' : 'Satellite Engine', icon: <Sliders className="w-4 h-4" /> },
    { id: 'reports', label: isBn ? 'বিশ্লেষণ রিপোর্ট' : 'Reports', icon: <FileText className="w-4 h-4" /> },
    { 
      id: 'alerts', 
      label: isBn ? 'ঝুঁকি অ্যালার্ট' : 'Alerts', 
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: unresolvedAlertsCount > 0 ? <Badge variant="danger" size="sm">{unresolvedAlertsCount}</Badge> : undefined
    },
    { id: 'settings', label: isBn ? 'সেটিংস' : 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="w-full max-w-[1780px] mx-auto flex flex-col space-y-6">
      {/* Toast Notification Container */}
      {toast.show && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 rounded-xl bg-carbon-surface-raised border border-emerald/40 text-registry text-sm shadow-2xl flex items-center gap-2 dark:bg-[#13241B] dark:text-[#E2ECE5]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header (Design Principle 1: Exactly 1 H1 per page) */}
      <PageHeader
        title={isBn ? "জিআইএস রিমোট সেন্সিং ও বায়োমাস হিটম্যাপ" : "GIS Remote Sensing & Biomass Heatmap"}
        description={isBn ? "টায়ার-৩ সেন্টিনেল ১/২ এসএআর রিমোট সেন্সিং, ডিএমআরভি টেলিমেট্রি ও ভেরা ভিএম০০৪৭ ক্রিপ্টোগ্রাফিক লেজার" : "Tier-3 Sentinel-1/2 SAR remote sensing, dMRV telemetry, and Verra VM0047 cryptographic ledger"}
        badge={<Badge variant="emerald" dot>Live STAC / GEE</Badge>}
        breadcrumbs={[
          { label: 'Platform', path: '/platform/mrv-dashboard' },
          { label: 'GIS Biomass Heatmap', path: '/carbon-monitoring' }
        ]}
      />

      {/* Tabs Navigation */}
      <div className="w-full overflow-x-auto pb-1">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Active Tab Panel */}
      <div className="w-full">
        {activeTab === 'dashboard' && <BiomassOverviewPanel {...state} />}
        {activeTab === 'verra_audit' && <VerraAuditPanel {...state} />}
        {activeTab === 'tiered_verification' && <TieredVerificationPanel {...state} />}
        {activeTab === 'map' && <GisMapPanel {...state} />}
        {activeTab === 'satellite' && <SatelliteScenePanel {...state} />}
        {activeTab === 'reports' && <ReportsPanel {...state} />}
        {activeTab === 'alerts' && <AlertsPanel {...state} />}
        {activeTab === 'settings' && <SettingsPanel {...state} />}
      </div>
    </div>
  );
};

export default CarbonMonitoring;
