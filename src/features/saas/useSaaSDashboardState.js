import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { SaaSLocales } from '../../pages/platform/SaaSLocalization';
import { CLIENT_PROFILES } from '../../pages/platform/clientProfiles';
import { extractESGFromDocument, parseDocumentTextToEsgParams } from '../../lib/esgDocumentExtractor';
import { esgFetch } from '../../lib/esgApi';
import { calculateESGMetrics } from '../../pages/platform/esgMetricsCalculator';
import { computeCategoryMatrix } from './constants';

export const useSaaSDashboardState = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  // Active Menu / Tabs state
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Bilingual Localization & Reporting Currency state
  const [lang, setLang] = useState('en');
  const locale = SaaSLocales[lang] || SaaSLocales.en;
  const [currency, setCurrency] = useState('BDT');

  // Selected District state
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");

  // Multi-Tenant Corporate Client Profiles
  const [activeClientId, setActiveClientId] = useState('east-delta-university');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEsgAuditModalOpen, setIsEsgAuditModalOpen] = useState(false);
  const activeClient = CLIENT_PROFILES.find(c => c.id === activeClientId) || CLIENT_PROFILES[0];

  // Calculator inputs state
  const [inputs, setInputs] = useState(() => ({
    diesel: activeClient?.baselineInputs?.diesel || '2200',
    petrol: activeClient?.baselineInputs?.petrol || '1400',
    lpg: activeClient?.baselineInputs?.lpg || '800',
    electricity: activeClient?.baselineInputs?.electricity || '96000',
    employees: activeClient?.baselineInputs?.employees || '420',
    airTravel: activeClient?.baselineInputs?.airTravel || '34000',
    truckTransport: activeClient?.baselineInputs?.truckTransport || '14000',
    rawMaterials: activeClient?.baselineInputs?.rawMaterials || '120'
  }));

  // GHG Protocol Emission Factors state
  const [ef, setEf] = useState({
    diesel: 2.68,
    petrol: 2.31,
    lpg: 2.98,
    electricity: null,
    employees: 0.40,
    airTravel: 0.12,
    truckTransport: 0.20,
    rawMaterials: 2.50
  });

  // Calculation results state
  const [results, setResults] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });

  // Search input query
  const [searchQuery, setSearchQuery] = useState('');

  // Materiality Assessment State
  const [materialityScores, setMaterialityScores] = useState({
    climateChange: { name: "Climate Change & Emissions", impact: 5, financial: 5, description: "GHG emissions footprint and energy efficiency transition risks." },
    waterResources: { name: "Water & Marine Resources", impact: 3, financial: 4, description: "Freshwater withdrawal, waste water discharge and scarcity risks." },
    biodiversity: { name: "Biodiversity & Ecosystems", impact: 4, financial: 2, description: "Land use change, deforestation, and ecosystem degradation." },
    circularEconomy: { name: "Resource Use & Circular Economy", impact: 4, financial: 3, description: "Raw materials sourcing, plastic packaging and waste recycle loops." },
    ownWorkforce: { name: "Own Workforce (Social)", impact: 4, financial: 3, description: "Gender ratio, labor standards, training hours and safety records." },
    affectedCommunities: { name: "Affected Communities", impact: 3, financial: 2, description: "Impact on local neighborhoods, human rights, and investments." },
    businessConduct: { name: "Business Conduct & Governance", impact: 4, financial: 4, description: "Ethics, cybersecurity, whistleblowing, and anti-corruption." }
  });

  // Auditor Mode State
  const [isAuditorMode, setIsAuditorMode] = useState(false);

  // Base Year Recalculation State
  const [baseYear, setBaseYear] = useState(2025);
  const [baseYearEmissions, setBaseYearEmissions] = useState(1200);
  const [acquisitionsDivestments, setAcquisitionsDivestments] = useState(0);

  // CBAM State
  const [cbamCommodity, setCbamCommodity] = useState('Steel');
  const [cbamWeight, setCbamWeight] = useState(500);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [downloadingApp, setDownloadingApp] = useState(false);

  // Modals state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', sector: 'Solar Irrigation', target: '300' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Auditor', email: '', permission: 'Auditor' });

  // Floating Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSelectClient = (clientId) => {
    setActiveClientId(clientId);
    setIsClientModalOpen(false);
    const client = CLIENT_PROFILES.find(c => c.id === clientId);
    if (client) {
      if (client.baselineInputs) {
        setInputs(prev => ({
          ...prev,
          ...client.baselineInputs
        }));
      }
      if (client.district) {
        setSelectedDistrict(client.district);
      }
      showToast(
        lang === 'bn' 
          ? `ক্লায়েন্ট প্রোফাইল সক্রিয়: ${client.name}` 
          : `Active corporate workspace: ${client.name}`,
        "info"
      );
    }
  };

  // Carbon Zero BD ESG Multi-Corpus RAG State
  const [extractionResult, setExtractionResult] = useState(null);
  const [showExtractionEvidence, setShowExtractionEvidence] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragCorpus, setRagCorpus] = useState('all');
  const [ragResponse, setRagResponse] = useState(null);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isSyncingFactors, setIsSyncingFactors] = useState(false);

  // Multi-Category Invoice Footprint & Metrics State
  const [extractionStep, setExtractionStep] = useState(1);
  const [unitMode, setUnitMode] = useState('tonnes');
  const [customItems, setCustomItems] = useState([]);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState({
    name: '',
    categoryId: 'transport',
    scope: 'Scope 1',
    spendBdt: '',
    quantity: '',
    unit: 'Liters',
    factor: '2.31'
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryAdjustments, setCategoryAdjustments] = useState({});
  const [donutHoveredId, setDonutHoveredId] = useState(null);

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newCustomItem.name.trim()) {
      showToast("Please enter an item description.", "error");
      return;
    }
    const spend = parseFloat(newCustomItem.spendBdt) || 0;
    const qty = parseFloat(newCustomItem.quantity) || 0;
    const factor = parseFloat(newCustomItem.factor) || 1.0;
    const carbonKg = qty > 0 ? Math.round(qty * factor) : Math.round(spend * 0.065);

    const item = {
      id: Date.now(),
      name: newCustomItem.name,
      categoryId: newCustomItem.categoryId,
      scope: newCustomItem.scope,
      spendBdt: spend,
      quantity: qty || 1,
      unit: newCustomItem.unit || 'Units',
      factor: factor,
      carbonKg: carbonKg
    };

    setCustomItems(prev => [...prev, item]);
    setIsAddCustomModalOpen(false);
    setNewCustomItem({
      name: '',
      categoryId: 'transport',
      scope: 'Scope 1',
      spendBdt: '',
      quantity: '',
      unit: 'Liters',
      factor: '2.31'
    });
    showToast(`Added "${item.name}" (+${carbonKg.toLocaleString()} kg CO₂e) to footprint matrix!`, "success");
  };

  const handleDeleteCustomItem = (id) => {
    setCustomItems(prev => prev.filter(i => i.id !== id));
    showToast("Removed custom item from matrix.", "info");
  };

  const handleSaveCategoryAdjustment = (catId, newSpend, newKg, newQty) => {
    setCategoryAdjustments(prev => ({
      ...prev,
      [catId]: {
        spend: parseFloat(newSpend) || 0,
        kg: parseFloat(newKg) || 0,
        qty: parseFloat(newQty) || 0
      }
    }));
    setEditingCategory(null);
    showToast("Category parameters refined and recalculated!", "success");
  };

  // Interactive Checklist Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload Q2 Boiler Fuel statements', completed: true },
    { id: 2, text: 'Verify Scope 3 Cargo Commutes', completed: false },
    { id: 3, text: 'Purchase offsets for raw materials (plastic)', completed: false },
    { id: 4, text: 'Verify Solar Branch 2 generation statements', completed: false },
    { id: 5, text: 'Calibrate Blynk IoT Node 4 sensor stream', completed: false }
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Blynk IoT device Carbon Monitor connected successfully.", read: false, time: "2 mins ago" },
    { id: 2, text: "Verification Report for Q1 2026 approved by Tasnim Chowdhury.", read: true, time: "1 hour ago" },
    { id: 3, text: "Annual ESG target set to 38% reduction.", read: true, time: "1 day ago" }
  ]);

  // Team members list state
  const [teamMembers, setTeamMembers] = useState([
    { name: "Tasnim Chowdhury", role: "Lead ESG Auditor", email: "tasnim@carbonzero.io", permission: "Admin", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80", status: "Active" },
    { name: "Kazi Rahman", role: "Carbon Credit Specialist", email: "kazi@carbonzero.io", permission: "Auditor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80", status: "Active" },
    { name: "Arif Hasan", role: "IoT Hardware Engineer", email: "arif@carbonzero.io", permission: "Auditor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80", status: "Active" }
  ]);

  // Projects list state
  const [projects, setProjects] = useState([
    { id: 1, name: 'Dhaka Solar Rooftop Phase 1', sector: 'Solar Energy', target: '250', status: 'In Progress' },
    { id: 2, name: 'AgriCarbon Rice Methane Mitigation', sector: 'Agriculture', target: '480', status: 'Verified' },
    { id: 3, name: 'Mymensingh Clean Cookstoves', sector: 'Clean Cookstoves', target: '180', status: 'Draft' }
  ]);

  // Calendar Event dates state
  const [calendarEvents, setCalendarEvents] = useState({
    4: { title: "Scope 1 Boiler Audit", auditor: "Tasnim Chowdhury", time: "10:00 AM" },
    11: { title: "Scope 2 Grid reporting", auditor: "Kazi Rahman", time: "02:00 PM" },
    18: { title: "AI Document footprint check", auditor: "Arif Hasan", time: "11:30 AM" },
    25: { title: "Offsets purchase settlement", auditor: "Tasnim Chowdhury", time: "04:00 PM" },
    28: { title: "Board ESG presentation", auditor: "Tanveer Ahmed", time: "09:00 AM" }
  });
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(4);

  // Settings target reduction state
  const [reductionTarget, setReductionTarget] = useState(38);

  // FAQ Accordion open states
  const [faqOpen, setFaqOpen] = useState({ 0: true, 1: false, 2: false });

  // Geolocation API to auto select Bangladesh District
  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    showToast("Detecting regional location...", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let detected = "Dhaka";
        if (lat > 24.5) detected = "Sylhet";
        else if (lat < 22.5) detected = "Chittagong";
        else if (lon < 89.5) detected = "Khulna";
        else if (lat > 24 && lon < 89.5) detected = "Rajshahi";
        else detected = "Dhaka";
        
        setSelectedDistrict(detected);
        showToast(`Located in ${detected} district! Regional default emission parameters applied.`, "success");
      },
      () => {
        showToast("Unable to detect coordinates. Defaulted to Dhaka.", "info");
      }
    );
  };

  // Perform emissions calculations
  const calculateEmissions = (vals, factors = ef) => {
    const dVal = parseFloat(vals.diesel) || 0;
    const pVal = parseFloat(vals.petrol) || 0;
    const lVal = parseFloat(vals.lpg) || 0;
    const eVal = parseFloat(vals.electricity) || 0;
    const empVal = parseFloat(vals.employees) || 0;
    const airVal = parseFloat(vals.airTravel) || 0;
    const truckVal = parseFloat(vals.truckTransport) || 0;
    const rawVal = parseFloat(vals.rawMaterials) || 0;

    const scope1 = ((dVal * factors.diesel) + (pVal * factors.petrol) + (lVal * factors.lpg)) / 1000;
    const scope2Missing = eVal > 0 && factors.electricity == null;
    const scope2 = scope2Missing ? null : (eVal * (factors.electricity || 0)) / 1000;
    const scope2Market = scope2;
    const scope3 = (empVal * factors.employees) + 
                   ((airVal * factors.airTravel) / 1000) + 
                   ((truckVal * factors.truckTransport) / 1000) + 
                   (rawVal * factors.rawMaterials);

    const total = scope1 + (scope2 ?? 0) + scope3;
    const totalMarket = scope1 + (scope2Market ?? 0) + scope3;

    setResults({
      scope1: parseFloat(scope1.toFixed(2)),
      scope2: scope2 === null ? null : parseFloat(scope2.toFixed(2)),
      scope2Missing,
      scope2Market: scope2Market === null ? null : parseFloat(scope2Market.toFixed(2)),
      scope3: parseFloat(scope3.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalMarket: parseFloat(totalMarket.toFixed(2))
    });
  };

  const esgMetrics = calculateESGMetrics(results, inputs, ef, activeClient, 0.12);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...inputs, [name]: value };
    setInputs(updated);
  };

  useEffect(() => {
    calculateEmissions(inputs, ef);
  }, [inputs, ef]);

  const SAMPLE_TEXT = `Dexterity Textiles Ltd Q2 Audit Statement DEPZ TX-8491. High Speed Diesel generator: 14,200 Liters. Fleet octane petrol: 4,800 Liters. Commercial LPG: 1,950 kg. DESCO Grid active electricity: 156,000 kWh. Workforce: 148 employees. Overseas marketing flights: 82,000 km. Outward truck freight: 39,000 ton-km. Purchased raw cotton fabric yarn: 580 metric tons. Total Invoiced Spend: BDT 14,850,000.`;

  const executeAIExtraction = async (fileOrName = "ESG_Statement_Q2_2026.xlsx") => {
    setIsUploading(true);
    const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
    showToast(`Extracting activity data from ${fileName}...`, "info");

    try {
      let data = null;
      if (typeof fileOrName !== 'string' && fileOrName instanceof File) {
        try {
          data = await extractESGFromDocument(fileOrName);
        } catch (clientErr) {
          console.warn("Client ESG extraction note:", clientErr);
        }
        if (!data || !data.details?.length) {
          const formData = new FormData();
          formData.append('file', fileOrName);
          data = await esgFetch('/api/esg/extract-footprint', { method: 'POST', body: formData });
        }
      } else {
        const parsed = parseDocumentTextToEsgParams(SAMPLE_TEXT, fileName);
        data = {
          filename: `${fileName} (DEMO SAMPLE)`,
          overall_confidence: null,
          extraction_method: "demo-sample",
          review_status: "DEMO_SAMPLE",
          summary: "Demo sample data for a fictional company. Not customer data and not verified.",
          parameters: parsed.parameters,
          details: parsed.details,
          spendBdt: parsed.spendBdt
        };
      }

      if (!data || !data.details?.length) {
        throw new Error("No activity quantities were found in the document.");
      }

      const newParams = { ...data.parameters };
      const newInputs = { ...inputs };
      for (const key of ['diesel', 'petrol', 'lpg', 'electricity', 'employees', 'airTravel', 'truckTransport', 'rawMaterials']) {
        if (newParams[key] !== undefined) newInputs[key] = String(newParams[key]);
      }
      if (data.spendBdt) newInputs.spendBdt = data.spendBdt;

      setInputs(newInputs);
      calculateEmissions(newInputs, ef);
      setExtractionResult(data);
      setShowExtractionEvidence(true);
      setExtractionStep(2);
      setTasks(prev => prev.map(t => t.id === 2 ? { ...t, completed: true } : t));
      setNotifications(prev => [
        { id: Date.now(), text: `Extracted ${data.details.length} value(s) from ${fileName} — review required`, read: false, time: "Just now" },
        ...prev
      ]);
      showToast(`Extracted ${data.details.length} value(s). Review each value before use.`, "success");
    } catch (err) {
      showToast(`Extraction failed: ${err.message || "unknown error."} Enter values manually.`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
    if (file) {
      setUploadedFile(file.name);
      setUploadedFileObj(file);
      showToast(`Selected file: ${file.name}. Initializing Carbon Zero BD RAG pipeline...`, "info");
      await executeAIExtraction(file);
      if (e.target && e.target.value !== undefined) {
        e.target.value = '';
      }
    }
  };

  const executeRagQuery = async (overrideQuery = null) => {
    const q = overrideQuery || ragQuery;
    if (!q || !q.trim()) return;

    setIsRagLoading(true);
    setRagQuery(q);

    try {
      const data = await esgFetch('/api/esg/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, corpus: ragCorpus, top_k: 5 })
      });
      setRagResponse(data);
    } catch (err) {
      setRagResponse({
        query: q,
        answer: `The ESG assistant is unavailable: ${err.message} No answer was generated.`,
        confidence: null,
        citations: [],
        corpus: ragCorpus,
        model_used: "unavailable",
        insufficient_data: true,
        latency_ms: null
      });
    } finally {
      setIsRagLoading(false);
    }
  };

  const syncOfficialFactors = async () => {
    setIsSyncingFactors(true);
    try {
      const factors = await esgFetch('/api/esg/emission-factors');
      const newEf = { ...ef };
      factors.forEach(item => {
        const name = item.fuel_or_activity.toLowerCase();
        if (name.includes("diesel")) newEf.diesel = item.factor_value;
        if (name.includes("petrol")) newEf.petrol = item.factor_value;
        if (name.includes("lpg")) newEf.lpg = item.factor_value;
        if (name.includes("commute")) newEf.employees = item.factor_value;
        if (name.includes("air")) newEf.airTravel = item.factor_value;
        if (name.includes("truck")) newEf.truckTransport = item.factor_value;
        if (name.includes("raw")) newEf.rawMaterials = item.factor_value;
      });
      setEf(newEf);
      showToast(`Loaded ${factors.length} factor(s) from the ESG factor table. Citations are not yet independently validated.`, "success");
    } catch (e) {
      showToast(`Factors not updated: ${e.message}`, "error");
    } finally {
      setIsSyncingFactors(false);
    }
  };

  const clearCalculator = () => {
    const cleared = {
      diesel: '',
      petrol: '',
      lpg: '',
      electricity: '',
      employees: '',
      airTravel: '',
      truckTransport: '',
      rawMaterials: ''
    };
    setInputs(cleared);
    setUploadedFile(null);
    showToast("Calculator inputs cleared.", "info");
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const [taskInput, setTaskInput] = useState('');
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const newTask = {
      id: Date.now(),
      text: taskInput.trim(),
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setTaskInput('');
    showToast("Verification task added successfully!", "success");
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Task deleted.", "info");
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    const project = {
      id: Date.now(),
      name: newProject.name.trim(),
      sector: newProject.sector,
      target: newProject.target,
      status: 'Draft'
    };
    setProjects(prev => [...prev, project]);
    setNewProject({ name: '', sector: 'Solar Irrigation', target: '300' });
    setIsAddProjectOpen(false);
    showToast(`Project "${project.name}" added successfully!`, "success");
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    const member = {
      name: newMember.name.trim(),
      role: newMember.role,
      email: newMember.email.trim(),
      permission: newMember.permission,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=80&q=80`,
      status: "Active"
    };
    setTeamMembers(prev => [...prev, member]);
    setNewMember({ name: '', role: 'Auditor', email: '', permission: 'Auditor' });
    setIsAddMemberOpen(false);
    showToast(`${member.name} added to ESG Audit Team!`, "success");
  };

  const toggleMemberStatus = (name) => {
    setTeamMembers(prev => prev.map(m => m.name === name ? { ...m, status: m.status === 'Active' ? 'Offline' : 'Active' } : m));
    showToast("Member status toggled.", "info");
  };

  const removeMember = (name) => {
    setTeamMembers(prev => prev.filter(m => m.name !== name));
    showToast("Team member removed.", "info");
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "success");
  };

  const handleDownloadApp = () => {
    setDownloadingApp(true);
    showToast("Downloading CarbonZero companion installer...", "info");
    setTimeout(() => {
      setDownloadingApp(false);
      showToast("App installer downloaded successfully!", "success");
    }, 2500);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast("ESG settings and emission factors saved successfully!", "success");
  };

  const openTasksCount = tasks.filter(t => !t.completed).length;
  const activeParams = extractionResult ? (extractionResult.parameters || inputs) : inputs;
  const activeMatrix = computeCategoryMatrix(activeParams, customItems, categoryAdjustments, ef.electricity);

  return {
    navigate,
    theme,
    toggleTheme,
    isLight,
    activeMenu,
    setActiveMenu,
    lang,
    setLang,
    locale,
    currency,
    setCurrency,
    selectedDistrict,
    setSelectedDistrict,
    activeClientId,
    setActiveClientId,
    isClientModalOpen,
    setIsClientModalOpen,
    isEsgAuditModalOpen,
    setIsEsgAuditModalOpen,
    activeClient,
    inputs,
    setInputs,
    ef,
    setEf,
    results,
    setResults,
    searchQuery,
    setSearchQuery,
    materialityScores,
    setMaterialityScores,
    isAuditorMode,
    setIsAuditorMode,
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
    isUploading,
    uploadedFile,
    uploadedFileObj,
    isNotificationsOpen,
    setIsNotificationsOpen,
    downloadingApp,
    isAddProjectOpen,
    setIsAddProjectOpen,
    isAddMemberOpen,
    setIsAddMemberOpen,
    newProject,
    setNewProject,
    newMember,
    setNewMember,
    toast,
    showToast,
    handleSelectClient,
    extractionResult,
    showExtractionEvidence,
    setShowExtractionEvidence,
    ragQuery,
    setRagQuery,
    ragCorpus,
    setRagCorpus,
    ragResponse,
    isRagLoading,
    selectedCitation,
    setSelectedCitation,
    isSyncingFactors,
    extractionStep,
    setExtractionStep,
    unitMode,
    setUnitMode,
    customItems,
    isAddCustomModalOpen,
    setIsAddCustomModalOpen,
    newCustomItem,
    setNewCustomItem,
    editingCategory,
    setEditingCategory,
    categoryAdjustments,
    donutHoveredId,
    setDonutHoveredId,
    handleAddCustomItem,
    handleDeleteCustomItem,
    handleSaveCategoryAdjustment,
    tasks,
    notifications,
    teamMembers,
    projects,
    calendarEvents,
    selectedCalendarDay,
    setSelectedCalendarDay,
    reductionTarget,
    setReductionTarget,
    faqOpen,
    detectLocation,
    calculateEmissions,
    esgMetrics,
    handleInputChange,
    executeAIExtraction,
    handleFileDrop,
    executeRagQuery,
    syncOfficialFactors,
    clearCalculator,
    toggleTask,
    taskInput,
    setTaskInput,
    handleAddTask,
    deleteTask,
    handleAddProject,
    handleAddMember,
    toggleMemberStatus,
    removeMember,
    toggleFaq,
    unreadNotificationsCount,
    markAllNotificationsRead,
    handleDownloadApp,
    handleSaveSettings,
    openTasksCount,
    activeMatrix
  };
};
