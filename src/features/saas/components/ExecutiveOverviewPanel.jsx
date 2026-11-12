import React from 'react';

import OverviewDistrictSelector from './overview/OverviewDistrictSelector';
import ExecutiveShowcaseRow from './overview/ExecutiveShowcaseRow';
import DeepTelemetryRow from './overview/DeepTelemetryRow';
import ScopeBreakdownRow from './overview/ScopeBreakdownRow';
import ScopeCalculatorSection from './overview/ScopeCalculatorSection';
import InvoiceFootprintSection from './overview/InvoiceFootprintSection';
import EsgAiRagSection from './overview/EsgAiRagSection';
import OverviewProjectsCard from './overview/OverviewProjectsCard';
import OverviewSideCards from './overview/OverviewSideCards';

/**
 * ExecutiveOverviewPanel
 * Fully decomposed into focused subcomponents under 300 lines each.
 * Adopts universal UI primitives: Card, Button, IconButton, Badge, Modal.
 */
export const ExecutiveOverviewPanel = (props) => {
  const {
    navigate,
    isLight,
    selectedDistrict,
    setSelectedDistrict,
    showToast,
    activeClient,
    setIsEsgAuditModalOpen,
    esgMetrics,
    results,
    inputs,
    handleInputChange,
    clearCalculator,
    isUploading,
    handleFileDrop,
    executeAIExtraction,
    uploadedFile,
    uploadedFileObj,
    extractionResult,
    activeMatrix,
    extractionStep,
    setExtractionStep,
    unitMode,
    setUnitMode,
    donutHoveredId,
    setDonutHoveredId,
    setIsAddCustomModalOpen,
    isAddCustomModalOpen,
    newCustomItem,
    setNewCustomItem,
    handleAddCustomItem,
    customItems,
    handleDeleteCustomItem,
    editingCategory,
    setEditingCategory,
    handleSaveCategoryAdjustment,
    ragQuery,
    setRagQuery,
    ragCorpus,
    setRagCorpus,
    executeRagQuery,
    isRagLoading,
    ragResponse,
    selectedCitation,
    setSelectedCitation,
    setIsAddProjectOpen,
    projects = [],
    tasks = [],
    toggleTask,
    deleteTask,
    openTasksCount,
    setActiveMenu,
    setIsAddMemberOpen,
    teamMembers = [],
    removeMember,
    reductionTarget
  } = props;

  return (
    <div className="space-y-6">
      {/* Title & Geolocation Selector */}
      <OverviewDistrictSelector
        isLight={isLight}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        showToast={showToast}
      />

      {/* Row 1: Executive Showcase (Impact Overview & Emissions Trend) */}
      <ExecutiveShowcaseRow
        isLight={isLight}
        activeClient={activeClient}
        esgMetrics={esgMetrics}
        results={results}
        inputs={inputs}
        setIsEsgAuditModalOpen={setIsEsgAuditModalOpen}
      />

      {/* Row 2: Deep Telemetry (Carbon Overview, Active Data, Analyzer) */}
      <DeepTelemetryRow
        isLight={isLight}
        activeClient={activeClient}
        esgMetrics={esgMetrics}
        results={results}
        inputs={inputs}
        setIsEsgAuditModalOpen={setIsEsgAuditModalOpen}
        executeRagQuery={executeRagQuery}
      />

      {/* Row 3: Scope Breakdown Cards */}
      <ScopeBreakdownRow
        isLight={isLight}
        results={results}
        reductionTarget={reductionTarget}
      />

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scope Calculator, Invoice Intake, AI Copilot, Projects */}
        <div className="lg:col-span-2 space-y-8">
          <ScopeCalculatorSection
            isLight={isLight}
            inputs={inputs}
            handleInputChange={handleInputChange}
            clearCalculator={clearCalculator}
          />

          <InvoiceFootprintSection
            isLight={isLight}
            extractionStep={extractionStep}
            setExtractionStep={setExtractionStep}
            extractionResult={extractionResult}
            executeAIExtraction={executeAIExtraction}
            isUploading={isUploading}
            handleFileDrop={handleFileDrop}
            uploadedFile={uploadedFile}
            uploadedFileObj={uploadedFileObj}
            activeMatrix={activeMatrix}
            unitMode={unitMode}
            setUnitMode={setUnitMode}
            donutHoveredId={donutHoveredId}
            setDonutHoveredId={setDonutHoveredId}
            isAddCustomModalOpen={isAddCustomModalOpen}
            setIsAddCustomModalOpen={setIsAddCustomModalOpen}
            newCustomItem={newCustomItem}
            setNewCustomItem={setNewCustomItem}
            handleAddCustomItem={handleAddCustomItem}
            customItems={customItems}
            handleDeleteCustomItem={handleDeleteCustomItem}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            handleSaveCategoryAdjustment={handleSaveCategoryAdjustment}
          />

          <EsgAiRagSection
            isLight={isLight}
            ragQuery={ragQuery}
            setRagQuery={setRagQuery}
            ragCorpus={ragCorpus}
            setRagCorpus={setRagCorpus}
            executeRagQuery={executeRagQuery}
            isRagLoading={isRagLoading}
            ragResponse={ragResponse}
            selectedCitation={selectedCitation}
            setSelectedCitation={setSelectedCitation}
          />

          <OverviewProjectsCard
            isLight={isLight}
            projects={projects}
            setIsAddProjectOpen={setIsAddProjectOpen}
          />
        </div>

        {/* Right Column: Offsets, Tasks, Team */}
        <OverviewSideCards
          isLight={isLight}
          navigate={navigate}
          projects={projects}
          setIsAddProjectOpen={setIsAddProjectOpen}
          tasks={tasks}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          openTasksCount={openTasksCount}
          setActiveMenu={setActiveMenu}
          teamMembers={teamMembers}
          removeMember={removeMember}
          setIsAddMemberOpen={setIsAddMemberOpen}
        />
      </div>
    </div>
  );
};

export default ExecutiveOverviewPanel;
