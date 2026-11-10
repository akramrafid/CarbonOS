import fs from 'fs';

const code = fs.readFileSync('src/pages/platform/CarbonMonitoring.jsx', 'utf8');
const lines = code.split('\n');

const topImports = lines.slice(0, 72).join('\n');
const mapHelpers = lines.slice(218, 273).join('\n');

function cleanBlock(start, end) {
  let block = lines.slice(start, end).join('\n');
  // Trim outer condition {activeTab === '...' && ( ... )}
  block = block.trim();
  if (block.startsWith('{activeTab ===')) {
    const firstParen = block.indexOf('(');
    const lastParen = block.lastIndexOf(')');
    block = block.slice(firstParen + 1, lastParen).trim();
  }
  return block;
}

// 1. BiomassOverviewPanel
const dashJSX = cleanBlock(1807, 2620);
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
    ${dashJSX}
  );
}

export default BiomassOverviewPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/BiomassOverviewPanel.jsx', dashCode, 'utf8');

// 2. VerraAuditPanel
const verraJSX = cleanBlock(2620, 3459);
const signModalJSX = lines.slice(5497, 5701).join('\n');
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

export function VerraAuditPanel(props) {
  const {
    isLight,
    isBn,
    t,
    selectedJob,
    setSelectedJob,
    analysisHistory,
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
      ${verraJSX}
      ${signModalJSX}
    </>
  );
}

export default VerraAuditPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/VerraAuditPanel.jsx', verraCode, 'utf8');

// 3. TieredVerificationPanel
const tieredJSX = cleanBlock(3459, 3767);
const tieredCode = `import React from 'react';
import {
  Mountain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Compass,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

export function TieredVerificationPanel(props) {
  const {
    isLight,
    isBn,
    t,
    verificationTasks,
    droneFormData,
    setDroneFormData,
    submittingDrone,
    handleCompleteDroneSurvey,
    triggerLocalBundleDownload
  } = props;

  return (
    ${tieredJSX}
  );
}

export default TieredVerificationPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/TieredVerificationPanel.jsx', tieredCode, 'utf8');

// 4. GisMapPanel
const mapJSX = cleanBlock(3767, 4398);
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
  AlertTriangle
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
    ${mapJSX}
  );
}

export default GisMapPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/GisMapPanel.jsx', mapCode, 'utf8');

// 5. SatelliteScenePanel
const satJSX = cleanBlock(4398, 4673);
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
    ${satJSX}
  );
}

export default SatelliteScenePanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/SatelliteScenePanel.jsx', satCode, 'utf8');

// 6. ReportsPanel
const repJSX = cleanBlock(4673, 4941);
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
    analysisHistory,
    selectedJob,
    setSelectedJob,
    triggerReportDownload,
    triggerDossierDownload,
    setActiveTab
  } = props;

  return (
    ${repJSX}
  );
}

export default ReportsPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/ReportsPanel.jsx', repCode, 'utf8');

// 7. AlertsPanel
const alertJSX = cleanBlock(4941, 5074);
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
    activeAlerts,
    handleResolveAlert,
    setActiveTab,
    setMapCenter,
    setMapZoom
  } = props;

  return (
    ${alertJSX}
  );
}

export default AlertsPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/AlertsPanel.jsx', alertCode, 'utf8');

// 8. SettingsPanel
const setJSX = cleanBlock(5074, 5497);
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
    modelSettings,
    setModelSettings,
    modelPerformance,
    handleSelectModel
  } = props;

  return (
    ${setJSX}
  );
}

export default SettingsPanel;
`;
fs.writeFileSync('src/features/carbon-monitoring/components/SettingsPanel.jsx', setCode, 'utf8');

console.log('Successfully generated all 8 sub-panel components under src/features/carbon-monitoring/components/');
