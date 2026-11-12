import React from 'react';
import { Search, X, Layers, FileCheck } from 'lucide-react';
import { generateClientActivityData } from './activity-workspace/activityData';
import { useActivityWorkspaceState } from './activity-workspace/useActivityWorkspaceState';
import { WorkspaceHeader } from './activity-workspace/WorkspaceHeader';
import { ActivitiesTableTab } from './activity-workspace/ActivitiesTableTab';
import { EvidenceRegisterTab } from './activity-workspace/EvidenceRegisterTab';
import { EvidenceDetailModal } from './activity-workspace/EvidenceDetailModal';
import { AddActivityModal } from './activity-workspace/AddActivityModal';
import { Tabs } from '../../../components/ui/Tabs';
import { IconButton } from '../../../components/ui/IconButton';

export { generateClientActivityData };

/**
 * Activity & Evidence Register Workspace
 * Production-grade data registry modeled after ISO 14064-1 & GHG Protocol verification standards.
 */
export const ActivityEvidenceWorkspace = ({
  isLight = false,
  locale = {},
  activeClientId = 'revoo-ev',
  onSelectClient = () => {}
}) => {
  const {
    activeClient,
    activities,
    evidenceList,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    scopeFilter,
    setScopeFilter,
    qualityFilter,
    setQualityFilter,
    statusFilter,
    setStatusFilter,
    facilityFilter,
    setFacilityFilter,
    selectedEvidence,
    setSelectedEvidence,
    isAddModalOpen,
    setIsAddModalOpen,
    newActivity,
    setNewActivity,
    totalEmissions,
    scopeTotals,
    evidenceCoverage,
    filteredActivities,
    filteredEvidence,
    handleCreateActivity,
    handleExportCSV
  } = useActivityWorkspaceState(activeClientId);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Workspace Selector */}
      <WorkspaceHeader
        isLight={isLight}
        activeClient={activeClient}
        totalEmissions={totalEmissions}
        scopeTotals={scopeTotals}
        evidenceCoverage={evidenceCoverage}
        activitiesCount={activities.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Main Tabs & Search Toolbar */}
      <div
        className={`rounded-3xl p-5 border shadow-xl ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#152B1D]/40">
          {/* Tab Switcher */}
          <Tabs
            tabs={[
              { id: 'activities', label: `Activity Records (${activities.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'evidence', label: `Evidence Register (${evidenceList.length})`, icon: <FileCheck className="w-3.5 h-3.5" /> }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="bg-black/20 border-[#152B1D]"
          />

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'activities' ? 'Search activity, department, or owner...' : 'Search document name, issuer, hash...'}
              className={`w-full pl-10 pr-10 py-2 rounded-xl text-xs font-sans border focus:outline-none focus:border-[#00C853] ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
              }`}
            />
            {searchQuery && (
              <IconButton
                icon={<X className="w-3.5 h-3.5" />}
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] p-1 text-gray-400 hover:text-white"
              />
            )}
          </div>
        </div>

        {/* Tab 1: Activities Table */}
        {activeTab === 'activities' && (
          <ActivitiesTableTab
            isLight={isLight}
            filteredActivities={filteredActivities}
            evidenceList={evidenceList}
            scopeFilter={scopeFilter}
            setScopeFilter={setScopeFilter}
            facilityFilter={facilityFilter}
            setFacilityFilter={setFacilityFilter}
            qualityFilter={qualityFilter}
            setQualityFilter={setQualityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            activeClient={activeClient}
            onSelectEvidence={setSelectedEvidence}
          />
        )}

        {/* Tab 2: Evidence Register */}
        {activeTab === 'evidence' && (
          <EvidenceRegisterTab
            isLight={isLight}
            filteredEvidence={filteredEvidence}
            activities={activities}
            onSelectEvidence={setSelectedEvidence}
          />
        )}
      </div>

      {/* Evidence Details Modal */}
      <EvidenceDetailModal
        selectedEvidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        activeClient={activeClient}
        isLight={isLight}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateActivity}
        newActivity={newActivity}
        setNewActivity={setNewActivity}
        activeClient={activeClient}
        isLight={isLight}
      />
    </div>
  );
};

export default ActivityEvidenceWorkspace;
