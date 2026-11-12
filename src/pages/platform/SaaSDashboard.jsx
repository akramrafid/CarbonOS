import React, { Suspense, lazy } from 'react';
import { 
  Grid, 
  Compass, 
  CheckCircle2, 
  CheckCircle, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Users, 
  Settings, 
  HelpCircle,
  Database,
  FileText,
  Sliders,
  Layers,
  Building
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// State hook
import { useSaaSDashboardState } from '../../features/saas/useSaaSDashboardState';

// Lazy-loaded Feature Panels
const ExecutiveOverviewPanel = lazy(() => import('../../features/saas/components/ExecutiveOverviewPanel'));
const MaterialityPanel = lazy(() => import('../../features/saas/components/MaterialityPanel'));
const TasksPanel = lazy(() => import('../../features/saas/components/TasksPanel'));
const EsgCalendarPanel = lazy(() => import('../../features/saas/components/EsgCalendarPanel'));
const EsgAnalyticsPanel = lazy(() => import('../../features/saas/components/EsgAnalyticsPanel'));
const EsgTeamPanel = lazy(() => import('../../features/saas/components/EsgTeamPanel'));
const EsgSettingsPanel = lazy(() => import('../../features/saas/components/EsgSettingsPanel'));
const EsgHelpPanel = lazy(() => import('../../features/saas/components/EsgHelpPanel'));

// Lazy-loaded Core Studios & Modals
const DuckDBEngineView = lazy(() => import('./components/DuckDBEngineView').then(m => ({ default: m.DuckDBEngineView })));
const SatelliteMRVStudio = lazy(() => import('./components/SatelliteMRVStudio').then(m => ({ default: m.SatelliteMRVStudio })));
const FactorRegistryStudio = lazy(() => import('./components/FactorRegistryStudio').then(m => ({ default: m.FactorRegistryStudio })));
const AtlasBenchmarkStudio = lazy(() => import('./components/AtlasBenchmarkStudio').then(m => ({ default: m.AtlasBenchmarkStudio })));
const ConglomerateTreeStudio = lazy(() => import('./components/ConglomerateTreeStudio').then(m => ({ default: m.ConglomerateTreeStudio })));
const UniversalUtilityExtractor = lazy(() => import('./components/UniversalUtilityExtractor').then(m => ({ default: m.UniversalUtilityExtractor })));
const ActivityEvidenceWorkspace = lazy(() => import('./components/ActivityEvidenceWorkspace').then(m => ({ default: m.ActivityEvidenceWorkspace })));
const EsgReportGenerator = lazy(() => import('./components/EsgReportGenerator').then(m => ({ default: m.EsgReportGenerator })));
const VerificationReadinessCenter = lazy(() => import('./components/VerificationReadinessCenter').then(m => ({ default: m.VerificationReadinessCenter })));
const EsgAuditModal = lazy(() => import('./components/EsgAuditModal').then(m => ({ default: m.EsgAuditModal })));
const CorporateClientModal = lazy(() => import('../../features/saas/components/CorporateClientModal'));
const AddProjectModal = lazy(() => import('../../features/saas/components/AddProjectModal'));
const AddMemberModal = lazy(() => import('../../features/saas/components/AddMemberModal'));

const PanelFallback = () => (
  <div className="w-full min-h-[380px] rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-sm font-mono text-mist/60 animate-pulse">
    Loading workspace panel...
  </div>
);

/**
 * SaaSDashboard Page
 * Decomposed from 4,967-line monolith into focused feature panels.
 * Operates in Product Mode: calm, dense, fast, and accessible.
 */
export const SaaSDashboard = () => {
  const state = useSaaSDashboardState();
  const {
    isLight,
    activeMenu,
    setActiveMenu,
    lang,
    locale,
    currency,
    activeClient,
    setIsClientModalOpen,
    isClientModalOpen,
    isEsgAuditModalOpen,
    setIsEsgAuditModalOpen,
    esgMetrics,
    results,
    inputs,
    ef,
    calculateEmissions,
    showToast,
    toast,
    openTasksCount,
    isAddProjectOpen,
    setIsAddProjectOpen,
    newProject,
    setNewProject,
    handleAddProject,
    isAddMemberOpen,
    setIsAddMemberOpen,
    newMember,
    setNewMember,
    handleAddMember,
    handleSelectClient
  } = state;

  const tabs = [
    { id: 'Dashboard', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: <Grid className="w-4 h-4" /> },
    { id: 'Materiality', label: lang === 'bn' ? 'ম্যাটেরিয়ালিটি' : 'Materiality', icon: <Compass className="w-4 h-4" /> },
    { 
      id: 'Audit & Compliance', 
      label: lang === 'bn' ? 'অডিট ও কমপ্লায়েন্স' : 'Audit & Compliance', 
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: <Badge variant="emerald" size="sm">ISO 14064</Badge>
    },
    { 
      id: 'Tasks', 
      label: lang === 'bn' ? 'টাস্ক' : 'Tasks', 
      icon: <CheckCircle className="w-4 h-4" />,
      badge: openTasksCount > 0 ? <Badge variant="warning" size="sm">{openTasksCount}</Badge> : undefined
    },
    { id: 'Calendar', label: lang === 'bn' ? 'ক্যালেন্ডার' : 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'Analytics', label: lang === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'DuckDB Engine', label: 'DuckDB Engine', icon: <Database className="w-4 h-4" /> },
    { id: 'Utility Invoices', label: 'Utility Invoices', icon: <FileText className="w-4 h-4" /> },
    { id: 'Satellite MRV', label: 'Satellite MRV', icon: <Sliders className="w-4 h-4" /> },
    { id: 'Factor Registry', label: 'Factor Registry', icon: <Layers className="w-4 h-4" /> },
    { id: 'ATLAS Benchmark', label: 'ATLAS Benchmark', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'Entity Tree', label: 'Entity Tree', icon: <Building className="w-4 h-4" /> },
    { id: 'Activity & Evidence', label: 'Evidence', icon: <FileText className="w-4 h-4" /> },
    { id: 'ESG Reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'Team', label: lang === 'bn' ? 'টিম' : 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'Settings', label: lang === 'bn' ? 'সেটিংস' : 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'Help', label: lang === 'bn' ? 'সাহায্য' : 'Help', icon: <HelpCircle className="w-4 h-4" /> }
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
        title={lang === 'bn' ? "কর্পোরেট ইএসজি ও কার্বন অ্যাকাউন্টিং" : "Corporate ESG & Carbon Accounting"}
        description={
          lang === 'bn' 
            ? "জিএইচজি প্রোটোকল কর্পোরেট স্ট্যান্ডার্ড, আইএসও ১৪০৬৪-১ ও ডুয়াল স্কোপ-২ অ্যাকাউন্টিং কনসোল"
            : `GHG Protocol Corporate Standard & ISO 14064-1 workspace for ${activeClient.name}`
        }
        badge={<Badge variant="emerald" dot>{activeClient.name}</Badge>}
        breadcrumbs={[
          { label: 'Platform', path: '/platform/mrv-dashboard' },
          { label: 'ESG Workspace', path: '/platform/saas-dashboard' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="min-h-[44px] min-w-[44px]"
              onClick={() => setIsClientModalOpen(true)}
            >
              Switch Client
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="min-h-[44px] min-w-[44px]"
              onClick={() => setIsEsgAuditModalOpen(true)}
            >
              24-Capsule Audit
            </Button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="w-full overflow-x-auto pb-1">
        <Tabs
          tabs={tabs}
          activeTab={activeMenu}
          onChange={setActiveMenu}
        />
      </div>

      {/* Active Tab Panel */}
      <div className="w-full">
        <Suspense fallback={<PanelFallback />}>
          {activeMenu === 'Dashboard' && <ExecutiveOverviewPanel {...state} />}
          {activeMenu === 'Materiality' && <MaterialityPanel {...state} />}
          {activeMenu === 'Audit & Compliance' && (
            <VerificationReadinessCenter 
              activeClientId={state.activeClientId}
              isLight={isLight}
              locale={locale}
              currency={currency}
              showToast={showToast}
            />
          )}
          {activeMenu === 'Tasks' && <TasksPanel {...state} />}
          {activeMenu === 'Calendar' && <EsgCalendarPanel {...state} />}
          {activeMenu === 'Analytics' && <EsgAnalyticsPanel {...state} />}
          {activeMenu === 'Team' && <EsgTeamPanel {...state} />}
          {activeMenu === 'Settings' && <EsgSettingsPanel {...state} />}
          {activeMenu === 'Help' && <EsgHelpPanel {...state} />}

          {/* Studios */}
          {activeMenu === 'DuckDB Engine' && (
            <DuckDBEngineView 
              isLight={isLight} 
              locale={locale} 
              currency={currency}
              activityInputs={inputs}
              activityResults={results}
              onRecalculate={() => calculateEmissions(inputs, ef)}
            />
          )}
          {activeMenu === 'Utility Invoices' && (
            <UniversalUtilityExtractor 
              isLight={isLight} 
              locale={locale} 
              activeClientId={state.activeClientId}
              onApplyToLedger={(extractedData) => {
                showToast(
                  lang === 'bn'
                    ? `ইউটিলিটি লেজার আপডেট সম্পন্ন: ${extractedData.segments?.length || 0} টি সেগমেন্ট অন্তর্ভুক্ত`
                    : `Universal utility ledger updated: ${extractedData.segments?.length || 0} segments committed with SHA-256 seal.`, 
                  "success"
                );
              }}
            />
          )}
          {activeMenu === 'Satellite MRV' && (
            <SatelliteMRVStudio isLight={isLight} locale={locale} />
          )}
          {activeMenu === 'Factor Registry' && (
            <FactorRegistryStudio isLight={isLight} locale={locale} />
          )}
          {activeMenu === 'ATLAS Benchmark' && (
            <AtlasBenchmarkStudio isLight={isLight} locale={locale} />
          )}
          {activeMenu === 'Entity Tree' && (
            <ConglomerateTreeStudio isLight={isLight} locale={locale} />
          )}
          {activeMenu === 'Activity & Evidence' && (
            <ActivityEvidenceWorkspace 
              activeClientId={state.activeClientId}
              isLight={isLight}
              locale={locale}
              currency={currency}
              showToast={showToast}
            />
          )}
          {activeMenu === 'ESG Reports' && (
            <EsgReportGenerator 
              activeClientId={state.activeClientId}
              isLight={isLight}
              locale={locale}
              currency={currency}
              showToast={showToast}
            />
          )}
        </Suspense>
      </div>

      {/* Global Modals with Suspense */}
      <Suspense fallback={null}>
        {isEsgAuditModalOpen && (
          <EsgAuditModal
            isOpen={isEsgAuditModalOpen}
            onClose={() => setIsEsgAuditModalOpen(false)}
            isLight={isLight}
            activeClient={activeClient}
            esgMetrics={esgMetrics}
            results={results}
            inputs={inputs}
            ef={ef}
            marketFactor={0.12}
          />
        )}

        {isClientModalOpen && (
          <CorporateClientModal
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            isLight={isLight}
            activeClientId={state.activeClientId}
            handleSelectClient={handleSelectClient}
          />
        )}

        {isAddProjectOpen && (
          <AddProjectModal
            isOpen={isAddProjectOpen}
            onClose={() => setIsAddProjectOpen(false)}
            newProject={newProject}
            setNewProject={setNewProject}
            handleAddProject={handleAddProject}
          />
        )}

        {isAddMemberOpen && (
          <AddMemberModal
            isOpen={isAddMemberOpen}
            onClose={() => setIsAddMemberOpen(false)}
            newMember={newMember}
            setNewMember={setNewMember}
            handleAddMember={handleAddMember}
          />
        )}
      </Suspense>
    </div>
  );
};

export default SaaSDashboard;
