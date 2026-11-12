import fs from 'fs';
import { execSync } from 'child_process';

const original = execSync('git show HEAD:src/pages/platform/CarbonMonitoring.jsx', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const lines = original.split('\n');

// 1. useCarbonMonitoringState.js
// Lines 650 to 1655 (slice(650, 1656), omitting line 650 "const CarbonMonitoring = () => {")
const hookLines = lines.slice(650, 1656).join('\n');
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
${hookLines}

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
    selectedTaskForDrone, setSelectedTaskForDrone,
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

// Helper to strip outer `{activeTab === '...' && (` and closing `)}`
function stripOuterCondition(str) {
  let s = str.trim();
  const match = s.match(/^\{activeTab === [^&]+&&\s*\(/);
  if (match) {
    s = s.slice(match[0].length);
    // remove matching closing ')}' at end
    const lastParen = s.lastIndexOf(')}');
    if (lastParen !== -1) {
      s = s.slice(0, lastParen);
    }
  }
  return s.trim();
}

// 2. BiomassOverviewPanel.jsx
// lines 1807 to 2619
const dashRaw = lines.slice(1807, 2619).join('\n');
const dashClean = stripOuterCondition(dashRaw);
const dashCode = `import React from 'react';
import {
  Trees,
  Activity,
  Layers,
  Flame,
  CloudRain,
  Download,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Info
} from 'lucide-react';
import { TELEMETRY_QUARTERS } from '../constants';

export function BiomassOverviewPanel(props) {
  const {
    isLight,
    isBn,
    t,
    loadingDashboard,
    dashboardData,
    selectedMetric,
    setSelectedMetric,
    selectedHorizon,
    setSelectedHorizon,
    hoveredQuarter,
    setHoveredQuarter,
    setActiveTab,
    selectedJob
  } = props;

  return (
    ${dashClean}
  );
}

export default BiomassOverviewPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/BiomassOverviewPanel.jsx', dashCode, 'utf8');

// 3. VerraAuditPanel.jsx
// lines 2621 to 3457 + sign modal lines 5497 to 5700
const verraInner = lines.slice(2621, 3457).join('\n');
const signModalInner = lines.slice(5497, 5700).join('\n');
const verraCode = `import React from 'react';
import {
  ShieldCheck,
  CheckCircle,
  FileCheck,
  Download,
  ExternalLink,
  Copy,
  Check,
  Key,
  Lock,
  Scale,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { DEFAULT_ANALYSIS_HISTORY } from '../constants';

export function VerraAuditPanel(props) {
  const {
    isLight,
    isBn,
    t,
    selectedJob,
    setSelectedJob,
    analysisHistory = [],
    ledgerStatus,
    verifyingLedger,
    handleVerifyChain,
    copiedHash,
    copyToClipboard,
    triggerDossierDownload,
    handleExportVM0047Bundle,
    showSignModal,
    setShowSignModal,
    signFormData,
    setSignFormData,
    handleGenerateKeypair,
    handleSubmitSignature,
    generatingKeys,
    signingLedger,
    showPrivateKey,
    setShowPrivateKey
  } = props;

  return (
    <>
      {(() => {
${verraInner}
      })()}

      ${signModalInner}
    </>
  );
}

export default VerraAuditPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/VerraAuditPanel.jsx', verraCode, 'utf8');

// 4. TieredVerificationPanel.jsx
// lines 3459 to 3766 + drone modal lines 5301 to 5495
const tieredRaw = lines.slice(3459, 3766).join('\n');
const tieredClean = stripOuterCondition(tieredRaw);
const droneModalInner = lines.slice(5301, 5495).join('\n');
const tieredCode = `import React from 'react';
import {
  Mountain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Compass,
  Download,
  Upload,
  RefreshCw,
  Plane,
  X
} from 'lucide-react';

export function TieredVerificationPanel(props) {
  const {
    isLight,
    isBn,
    t,
    verificationTasks = [],
    droneFormData,
    setDroneFormData,
    submittingDrone,
    handleCompleteDroneSurvey,
    triggerLocalBundleDownload,
    selectedTaskForDrone,
    setSelectedTaskForDrone
  } = props;

  return (
    <>
      ${tieredClean}
      ${droneModalInner}
    </>
  );
}

export default TieredVerificationPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/TieredVerificationPanel.jsx', tieredCode, 'utf8');

// 5. GisMapPanel.jsx
// map helpers lines 218 to 273 + map lines 3767 to 4397
const mapHelpers = lines.slice(218, 273).join('\n');
const mapRaw = lines.slice(3767, 4397).join('\n');
const mapClean = stripOuterCondition(mapRaw);
const mapCode = `import React from 'react';
import { 
  MapContainer, 
  TileLayer, 
  ImageOverlay, 
  Polygon, 
  Marker, 
  useMap, 
  useMapEvents, 
  Popup, 
  Tooltip 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  Search,
  Upload,
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Trees,
  Info,
  Download,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  SUNDARBANS_RESERVE,
  CHT_RESERVE,
  BANGLADESH_BORDER,
  LAYER_CONFIG
} from '../constants';

${mapHelpers}

export function GisMapPanel(props) {
  const {
    isLight,
    isBn,
    t,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    mapBounds,
    setMapBounds,
    basemap,
    setBasemap,
    activeLayer,
    setActiveLayer,
    storedLocations,
    setStoredLocations,
    isDrawing,
    setIsDrawing,
    drawPoints,
    setDrawPoints,
    searchQuery,
    setSearchQuery,
    projectName,
    setProjectName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    cloudCeiling,
    setCloudCeiling,
    hoverCoords,
    setHoverCoords,
    inspectedPixel,
    setInspectedPixel,
    analyzing,
    handleRunAnalysis,
    handleBoundaryUpload,
    handleCoordsSearch,
    handlePixelClick,
    ecoZonePreset,
    setEcoZonePreset
  } = props;

  return (
    ${mapClean}
  );
}

export default GisMapPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/GisMapPanel.jsx', mapCode, 'utf8');

// 6. SatelliteScenePanel.jsx
// lines 4398 to 4672
const satRaw = lines.slice(4398, 4672).join('\n');
const satClean = stripOuterCondition(satRaw);
const satCode = `import React from 'react';
import {
  Sliders,
  Sparkles,
  RefreshCw,
  CloudRain,
  MapPin,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { FASTAPI_API_URL } from '../constants';

export function SatelliteScenePanel(props) {
  const {
    isLight,
    isBn,
    t,
    cloudCeiling,
    setCloudCeiling,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    analyzing,
    handleRunAnalysis,
    setActiveTab,
    selectedJob
  } = props;

  return (
    ${satClean}
  );
}

export default SatelliteScenePanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/SatelliteScenePanel.jsx', satCode, 'utf8');

// 7. ReportsPanel.jsx
// lines 4673 to 4940
const repRaw = lines.slice(4673, 4940).join('\n');
const repClean = stripOuterCondition(repRaw);
const repCode = `import React from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export function ReportsPanel(props) {
  const {
    isLight,
    isBn,
    t,
    analysisHistory = [],
    selectedJob,
    setSelectedJob,
    triggerReportDownload,
    triggerDossierDownload,
    setActiveTab
  } = props;

  return (
    ${repClean}
  );
}

export default ReportsPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/ReportsPanel.jsx', repCode, 'utf8');

// 8. AlertsPanel.jsx
// lines 4941 to 5072
const alertRaw = lines.slice(4941, 5072).join('\n');
const alertClean = stripOuterCondition(alertRaw);
const alertCode = `import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  ChevronRight,
  TrendingDown,
  Trees
} from 'lucide-react';

export function AlertsPanel(props) {
  const {
    isLight,
    isBn,
    t,
    activeAlerts = [],
    handleResolveAlert,
    setActiveTab,
    setMapCenter,
    setMapZoom
  } = props;

  return (
    ${alertClean}
  );
}

export default AlertsPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/AlertsPanel.jsx', alertCode, 'utf8');

// 9. SettingsPanel.jsx
// lines 5073 to 5300
const setRaw = lines.slice(5073, 5300).join('\n');
const setClean = stripOuterCondition(setRaw);
const setCode = `import React from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Cpu,
  ShieldCheck,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';

export function SettingsPanel(props) {
  const {
    isLight,
    isBn,
    t,
    modelSettings = {},
    setModelSettings,
    modelPerformance = {},
    handleSelectModel
  } = props;

  return (
    ${setClean}
  );
}

export default SettingsPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/SettingsPanel.jsx', setCode, 'utf8');

console.log('Successfully re-generated all clean decomposed modules!');
