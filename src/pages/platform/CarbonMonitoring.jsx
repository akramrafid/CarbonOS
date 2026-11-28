import React, { Suspense, lazy } from 'react';
import {
  Activity,
  ShieldCheck,
  Mountain,
  Map as MapIcon,
  Sliders,
  FileText,
  AlertTriangle,
  Settings as SettingsIcon
  /* [COMMENTED OUT FOR PERSONAL REFERENCE — unused Sparkles import removed] */
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { LAYER_CONFIG } from '../../features/carbon-monitoring/constants';
import { useCarbonMonitoringState } from '../../features/carbon-monitoring/useCarbonMonitoringState';

// Lazy-loaded Feature Panels
const BiomassOverviewPanel = lazy(() => import('../../features/carbon-monitoring/components/BiomassOverviewPanel'));
const VerraAuditPanel = lazy(() => import('../../features/carbon-monitoring/components/VerraAuditPanel'));
const TieredVerificationPanel = lazy(() => import('../../features/carbon-monitoring/components/TieredVerificationPanel'));
const GisMapPanel = lazy(() => import('../../features/carbon-monitoring/components/GisMapPanel'));
const SatelliteScenePanel = lazy(() => import('../../features/carbon-monitoring/components/SatelliteScenePanel'));
const ReportsPanel = lazy(() => import('../../features/carbon-monitoring/components/ReportsPanel'));
const AlertsPanel = lazy(() => import('../../features/carbon-monitoring/components/AlertsPanel'));
const SettingsPanel = lazy(() => import('../../features/carbon-monitoring/components/SettingsPanel'));
const DmrvMapStudio = lazy(() => import('../../components/DmrvMapStudio'));

const PanelLoadingFallback = () => (
  <div className="w-full min-h-[360px] rounded-2xl border border-border bg-surface/60 flex items-center justify-center text-sm font-mono text-fg-muted animate-pulse">
    Loading panel...
  </div>
);

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

  const tabGroups = [
    {
      id: 'monitoring-spatial',
      label: isBn ? 'মনিটরিং ও ম্যাপ' : 'Monitoring & Spatial',
      icon: <Activity className="w-4 h-4" />,
      tabs: [
        { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'map', label: isBn ? 'ইন্টারঅ্যাক্টিভ ম্যাপ' : 'Interactive Map', icon: <MapIcon className="w-4 h-4" /> },
        { id: 'dmrv_3d', label: isBn ? '৩ডি স্যাটেলাইট ডিএমআরভি' : '3D Satellite dMRV', icon: <Mountain className="w-4 h-4" /> },
        { id: 'satellite', label: isBn ? 'স্যাটেলাইট ইঞ্জিন' : 'Satellite Engine', icon: <Sliders className="w-4 h-4" /> }
      ]
    },
    {
      id: 'verification-compliance',
      label: isBn ? 'ভেরিফিকেশন ও কমপ্লায়েন্স' : 'Verification & Compliance',
      icon: <ShieldCheck className="w-4 h-4" />,
      tabs: [
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
        { id: 'reports', label: isBn ? 'বিশ্লেষণ রিপোর্ট' : 'Reports', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      id: 'operations',
      label: isBn ? 'অপারেশনস' : 'Operations',
      icon: <AlertTriangle className="w-4 h-4" />,
      tabs: [
        {
          id: 'alerts',
          label: isBn ? 'ঝুঁকি অ্যালার্ট' : 'Alerts',
          icon: <AlertTriangle className="w-4 h-4" />,
          badge: unresolvedAlertsCount > 0 ? <Badge variant="danger" size="sm">{unresolvedAlertsCount}</Badge> : undefined
        },
        { id: 'settings', label: isBn ? 'সেটিংস' : 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div className="w-full max-w-[1780px] mx-auto flex flex-col space-y-4">
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

      {/* Grouped Tabs Navigation */}
      <div className="w-full">
        <Tabs
          groups={tabGroups}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Active Tab Panel with Suspense Lazy Loading */}
      <div className="w-full">
        <Suspense fallback={<PanelLoadingFallback />}>
          {activeTab === 'dashboard' && <BiomassOverviewPanel {...state} />}
          {activeTab === 'verra_audit' && <VerraAuditPanel {...state} />}
          {activeTab === 'tiered_verification' && <TieredVerificationPanel {...state} />}
          {activeTab === 'map' && <GisMapPanel {...state} />}
          {activeTab === 'dmrv_3d' && (
              <div className="h-[560px] w-full rounded-3xl overflow-hidden bg-bg-surface">
                <DmrvMapStudio
                  drawPoints={state.drawPoints}
                  setDrawPoints={state.setDrawPoints}
                  isDrawing={state.isDrawing}
                  basemap={state.basemap}
                  setBasemap={state.setBasemap}
                  activeLayer={state.activeLayer}
                  layerConfig={LAYER_CONFIG}
                  osmContext={state.selectedJob?.osm_context || null}
                  osmOverlays={state.selectedJob?.osm_overlays || { leakage_belt: true, forest: true, water: true, roads: true, industrial: true }}
                  baselineData={state.selectedJob?.baseline_data || state.dashboardData || null}
                  donorPlotsGeoJson={state.selectedJob?.donor_plots_geojson || null}
                  inspectedPixel={state.inspectedPixel}
                  activeAlerts={state.activeAlerts}
                  selectedJob={state.selectedJob}
                  mapBounds={state.mapBounds}
                  mapCenter={state.mapCenter}
                  mapZoom={state.mapZoom}
                  onPixelClick={state.handlePixelClick}
                  onHoverCoords={state.setHoverCoords}
                  onFinishDrawing={() => {
                    state.setIsDrawing(false);
                    state.handleRunAnalysis();
                  }}
                  analyzing={state.analyzing}
                  isLight={state.isLight}
                />
              </div>
          )}
              {activeTab === 'satellite' && <SatelliteScenePanel {...state} />}
              {activeTab === 'reports' && <ReportsPanel {...state} />}
              {activeTab === 'alerts' && <AlertsPanel {...state} />}
              {activeTab === 'settings' && <SettingsPanel {...state} />}
            </Suspense>
      </div>
    </div>
  );
};

export default CarbonMonitoring;
