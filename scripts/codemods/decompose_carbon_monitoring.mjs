import fs from 'fs';
import path from 'path';

const srcFile = 'src/pages/platform/CarbonMonitoring.jsx';
const code = fs.readFileSync(srcFile, 'utf8');
const lines = code.split('\n');

const topImports = lines.slice(0, 65).join('\n');

// 1. GIS Map helper components (RecenterMap, MapResizeHandler, MapEventHandler)
const mapHelpers = lines.slice(218, 273).join('\n');

// 2. Locate tab boundaries
const dashStart = lines.findIndex(l => l.includes("{activeTab === 'dashboard' && ("));
const verraStart = lines.findIndex(l => l.includes("{activeTab === 'verra_audit' && (() => {"));
const tieredStart = lines.findIndex(l => l.includes("{activeTab === 'tiered_verification' && ("));
const mapStart = lines.findIndex(l => l.includes("{activeTab === 'map' && ("));
const satStart = lines.findIndex(l => l.includes("{activeTab === 'satellite' && ("));
const repStart = lines.findIndex(l => l.includes("{activeTab === 'reports' && ("));
const alertStart = lines.findIndex(l => l.includes("{activeTab === 'alerts' && ("));
const setStart = lines.findIndex(l => l.includes("{activeTab === 'settings' && ("));
const signModalStart = lines.findIndex(l => l.includes('{showSignModal && ('));
const rootEnd = lines.findIndex(l => l.includes('return (') && l.includes('min-h-screen')) || 1720;

console.log({
  dashStart: dashStart + 1,
  verraStart: verraStart + 1,
  tieredStart: tieredStart + 1,
  mapStart: mapStart + 1,
  satStart: satStart + 1,
  repStart: repStart + 1,
  alertStart: alertStart + 1,
  setStart: setStart + 1,
  signModalStart: signModalStart + 1
});

// Extract hook body: from line 650 to where the JSX return begins
const hookBody = lines.slice(650, 1720).join('\n');

// Write useCarbonMonitoringState.js
const hookCode = `import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  FASTAPI_API_URL,
  SUNDARBANS_RESERVE,
  CHT_RESERVE,
  BANGLADESH_BORDER,
  TELEMETRY_QUARTERS,
  LAYER_CONFIG,
  DEFAULT_VERIFICATION_TASKS,
  DEFAULT_SIGNATURES,
  DEFAULT_MODEL_SETTINGS,
  DEFAULT_DASHBOARD_DATA,
  DEFAULT_ANALYSIS_HISTORY,
  DEFAULT_ALERTS
} from './constants';

export function useCarbonMonitoringState() {
${hookBody}

  return {
    isBn,
    theme,
    isLight,
    selectedMetric, setSelectedMetric,
    selectedHorizon, setSelectedHorizon,
    hoveredQuarter, setHoveredQuarter,
    activeTab, setActiveTab,
    loadingDashboard, setLoadingDashboard,
    loadingHistory, setLoadingHistory,
    loadingAlerts, setLoadingAlerts,
    analyzing, setAnalyzing,
    dashboardData, setDashboardData,
    analysisHistory, setAnalysisHistory,
    activeAlerts, setActiveAlerts,
    selectedJob, setSelectedJob,
    mapCenter, setMapCenter,
    mapZoom, setMapZoom,
    mapBounds, setMapBounds,
    basemap, setBasemap,
    activeLayer, setActiveLayer,
    storedLocations, setStoredLocations,
    isDrawing, setIsDrawing,
    drawPoints, setDrawPoints,
    searchQuery, setSearchQuery,
    projectName, setProjectName,
    startDate, setStartDate,
    endDate, setEndDate,
    cloudCeiling, setCloudCeiling,
    hoverCoords, setHoverCoords,
    inspectedPixel, setInspectedPixel,
    toast, setToast, showToast,
    verifyingLedger,
    ledgerStatus,
    copiedHash,
    copyToClipboard,
    triggerDossierDownload,
    handleVerifyChain,
    verificationTasks,
    droneFormData, setDroneFormData,
    submittingDrone,
    handleCompleteDroneSurvey,
    triggerLocalBundleDownload,
    showSignModal, setShowSignModal,
    signFormData, setSignFormData,
    signingLedger,
    generatingKeys,
    handleGenerateKeypair,
    handleSubmitSignature,
    showPrivateKey, setShowPrivateKey,
    modelSettings, setModelSettings,
    modelPerformance,
    handleSelectModel,
    provenanceTrust,
    fetchProvenanceTrust,
    handleExportVM0047Bundle,
    fetchDashboardStats,
    fetchHistory,
    fetchAlerts,
    handleRunAnalysis,
    handleBoundaryUpload,
    getJobBounds,
    handleCoordsSearch,
    handlePixelClick,
    handleResolveAlert,
    triggerReportDownload,
    ecoZonePreset, setEcoZonePreset
  };
}

export default useCarbonMonitoringState;
`;

fs.writeFileSync('src/features/carbon-monitoring/useCarbonMonitoringState.js', hookCode, 'utf8');
console.log('Successfully wrote useCarbonMonitoringState.js');

