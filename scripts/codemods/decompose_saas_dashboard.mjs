import fs from 'fs';
import path from 'path';
import cp from 'child_process';

const ROOT = process.cwd();
const originalSource = cp.execSync('git show HEAD:src/pages/platform/SaaSDashboard.jsx').toString();
const sourceLines = originalSource.split('\n');

console.log(`Read ${sourceLines.length} lines from original SaaSDashboard.jsx`);

// Helper to get 1-based line slice
const getSlice = (start, end) => sourceLines.slice(start - 1, end).join('\n');

// 1. constants.jsx
const constantsContent = `import React, { useState } from 'react';
import { 
  Utensils, 
  Car, 
  Zap, 
  Shirt, 
  ShoppingBag, 
  Home, 
  Film, 
  HeartPulse, 
  Package, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

${getSlice(86, 693)}

export {
  SemiCircularGauge,
  getSplinePath,
  EmissionsTrendChart,
  SegmentedProgressBar,
  MicroBarChart,
  CarouselIndicator,
  BANGLADESH_DISTRICTS,
  NINE_CATEGORIES_CONFIG,
  computeCategoryMatrix,
  CarbonDistributionDonut
};
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/constants.jsx'), constantsContent);
console.log('Written src/features/saas/constants.jsx');

// 2. useSaaSDashboardState.js (unchanged, already working)
console.log('src/features/saas/useSaaSDashboardState.js already present');

// 3. ExecutiveOverviewPanel.jsx
// Slices lines 1840 to 3969
const execOverviewContent = `import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Info, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  MoreHorizontal, 
  Upload, 
  RefreshCw, 
  Plus, 
  ShieldCheck, 
  Search, 
  Database, 
  FileText, 
  CheckCircle, 
  BookOpen, 
  Building, 
  Send, 
  Quote, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sliders, 
  Lightbulb, 
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  Loader2,
  Calendar as CalendarIcon,
  Users,
  Grid,
  CheckCircle2,
  ExternalLink,
  Sun,
  Moon,
  Leaf,
  Smile,
  Zap,
  Globe,
  Cpu,
  GitBranch,
  Utensils,
  Car,
  Shirt,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  Package,
  PieChart
} from 'lucide-react';
import {
  SemiCircularGauge,
  EmissionsTrendChart,
  SegmentedProgressBar,
  MicroBarChart,
  CarouselIndicator,
  BANGLADESH_DISTRICTS,
  NINE_CATEGORIES_CONFIG,
  CarbonDistributionDonut
} from '../constants';

export const ExecutiveOverviewPanel = (props) => {
  const {
    navigate,
    isLight,
    lang,
    locale,
    currency,
    selectedDistrict,
    setSelectedDistrict,
    showToast,
    activeClient,
    setIsEsgAuditModalOpen,
    setIsClientModalOpen,
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
    showExtractionEvidence,
    setShowExtractionEvidence,
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
    setActiveMenu,
    setIsAddMemberOpen,
    teamMembers = []
  } = props;

  return (
    <div className="space-y-6">
${getSlice(1840, 3970)}
    </div>
  );
};

export default ExecutiveOverviewPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/ExecutiveOverviewPanel.jsx'), execOverviewContent);
console.log('Written src/features/saas/components/ExecutiveOverviewPanel.jsx');

// 4. MaterialityPanel.jsx
// Slices lines 3976 to 4097
const materialityContent = `import React from 'react';
import { Compass } from 'lucide-react';

export const MaterialityPanel = (props) => {
  const {
    materialityScores,
    setMaterialityScores,
    showToast
  } = props;

  return (
${getSlice(3976, 4097)}
  );
};

export default MaterialityPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/MaterialityPanel.jsx'), materialityContent);
console.log('Written src/features/saas/components/MaterialityPanel.jsx');

// 5. TasksPanel.jsx
// Slices lines 4113 to 4164
const tasksContent = `import React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

export const TasksPanel = (props) => {
  const {
    tasks = [],
    toggleTask,
    deleteTask,
    taskInput,
    setTaskInput,
    handleAddTask
  } = props;

  return (
${getSlice(4113, 4164)}
  );
};

export default TasksPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/TasksPanel.jsx'), tasksContent);
console.log('Written src/features/saas/components/TasksPanel.jsx');

// 6. EsgCalendarPanel.jsx
// Slices lines 4169 to 4254
const calendarContent = `import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export const EsgCalendarPanel = (props) => {
  const {
    calendarEvents = {},
    selectedCalendarDay,
    setSelectedCalendarDay,
    showToast
  } = props;

  return (
${getSlice(4169, 4254)}
  );
};

export default EsgCalendarPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/EsgCalendarPanel.jsx'), calendarContent);
console.log('Written src/features/saas/components/EsgCalendarPanel.jsx');

// 7. EsgAnalyticsPanel.jsx
// Slices lines 4259 to 4361
const analyticsContent = `import React from 'react';
import { TrendingDown, TrendingUp, BarChart2 } from 'lucide-react';

export const EsgAnalyticsPanel = (props) => {
  const {
    results,
    inputs,
    activeClient
  } = props;

  return (
${getSlice(4259, 4361)}
  );
};

export default EsgAnalyticsPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/EsgAnalyticsPanel.jsx'), analyticsContent);
console.log('Written src/features/saas/components/EsgAnalyticsPanel.jsx');

// 8. EsgTeamPanel.jsx
// Slices lines 4366 to 4427
const teamContent = `import React from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';

export const EsgTeamPanel = (props) => {
  const {
    teamMembers = [],
    toggleMemberStatus,
    removeMember,
    setIsAddMemberOpen
  } = props;

  return (
${getSlice(4366, 4427)}
  );
};

export default EsgTeamPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/EsgTeamPanel.jsx'), teamContent);
console.log('Written src/features/saas/components/EsgTeamPanel.jsx');

// 9. EsgSettingsPanel.jsx
// Slices lines 4432 to 4544
const settingsContent = `import React from 'react';
import { RefreshCw } from 'lucide-react';

export const EsgSettingsPanel = (props) => {
  const {
    reductionTarget,
    setReductionTarget,
    baseYear,
    setBaseYear,
    baseYearEmissions,
    setBaseYearEmissions,
    acquisitionsDivestments,
    setAcquisitionsDivestments,
    cbamCommodity,
    setCbamCommodity,
    cbamWeight,
    setCbamWeight,
    ef,
    setEf,
    syncOfficialFactors,
    isSyncingFactors,
    handleSaveSettings
  } = props;

  return (
${getSlice(4432, 4544)}
  );
};

export default EsgSettingsPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/EsgSettingsPanel.jsx'), settingsContent);
console.log('Written src/features/saas/components/EsgSettingsPanel.jsx');

// 10. EsgHelpPanel.jsx
// Slices lines 4549 to 4600
const helpContent = `import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const EsgHelpPanel = (props) => {
  const {
    faqOpen,
    toggleFaq,
    showToast
  } = props;

  return (
${getSlice(4549, 4600)}
  );
};

export default EsgHelpPanel;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/EsgHelpPanel.jsx'), helpContent);
console.log('Written src/features/saas/components/EsgHelpPanel.jsx');

// 11. CorporateClientModal.jsx
// Slices lines 4684 to 4791
const clientModalContent = `import React from 'react';
import { X, Building, CheckCircle2, ExternalLink } from 'lucide-react';
import { CLIENT_PROFILES } from '../../../pages/platform/clientProfiles';

export const CorporateClientModal = (props) => {
  const {
    isOpen,
    onClose,
    isLight,
    activeClientId,
    handleSelectClient,
    CLIENT_PROFILES: profiles = CLIENT_PROFILES
  } = props;

  if (!isOpen) return null;

  return (
${getSlice(4684, 4791)}
  );
};

export default CorporateClientModal;
`;

fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/CorporateClientModal.jsx'), clientModalContent);
console.log('Written src/features/saas/components/CorporateClientModal.jsx');

// 12. AddProjectModal.jsx & AddMemberModal.jsx
const addProjectModalContent = `import React from 'react';
import { X } from 'lucide-react';

export const AddProjectModal = ({ isOpen, onClose, newProject, setNewProject, handleAddProject }) => {
  if (!isOpen) return null;
  return (
${getSlice(4796, 4870)}
  );
};

export default AddProjectModal;
`;
fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/AddProjectModal.jsx'), addProjectModalContent);
console.log('Written src/features/saas/components/AddProjectModal.jsx');

const addMemberModalContent = `import React from 'react';
import { X } from 'lucide-react';

export const AddMemberModal = ({ isOpen, onClose, newMember, setNewMember, handleAddMember }) => {
  if (!isOpen) return null;
  return (
${getSlice(4875, 4959)}
  );
};

export default AddMemberModal;
`;
fs.writeFileSync(path.join(ROOT, 'src/features/saas/components/AddMemberModal.jsx'), addMemberModalContent);
console.log('Written src/features/saas/components/AddMemberModal.jsx');

console.log('Updated SaaSDashboard decomposition!');
