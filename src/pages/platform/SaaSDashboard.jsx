import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Bell, 
  FileText, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Compass, 
  Trash2, 
  Loader2,
  Calendar as CalendarIcon,
  Users,
  Grid,
  TrendingDown,
  Building,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  MapPin,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  Info
} from 'lucide-react';

// Bangladesh Districts List
const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", 
  "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", 
  "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", 
  "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", 
  "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", 
  "Madaripur", "Magura", "Manikganj", "Maulvibazar", "Meherpur", "Munshiganj", 
  "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", 
  "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", 
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", 
  "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", 
  "Thakurgaon"
];

const SaaSDashboard = () => {
  const navigate = useNavigate();

  // Active Menu / Tabs state
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Selected District state
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");

  // Calculator inputs state
  const [inputs, setInputs] = useState({
    diesel: '10000',
    petrol: '4000',
    lpg: '1200',
    electricity: '85000',
    employees: '120',
    airTravel: '45000',
    truckTransport: '18000',
    rawMaterials: '320'
  });

  // GHG Protocol Emission Factors state (allows runtime configuration in Settings tab)
  const [ef, setEf] = useState({
    diesel: 2.68, // kg CO2e / Liter
    petrol: 2.31, // kg CO2e / Liter
    lpg: 2.98, // kg CO2e / kg
    electricity: 0.55, // kg CO2e / kWh (Bangladesh grid average)
    employees: 0.40, // tCO2e / employee / year average commute
    airTravel: 0.12, // kg CO2e / km
    truckTransport: 0.20, // kg CO2e / ton-km
    rawMaterials: 2.50 // tCO2e / ton (composite raw materials)
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

  // Dual Scope 2 Settings
  const [marketFactor, setMarketFactor] = useState(0.12); // kg CO2e / kWh (green tariff)
  
  // Base Year Recalculation State
  const [baseYear, setBaseYear] = useState(2025);
  const [baseYearEmissions, setBaseYearEmissions] = useState(1200);
  const [acquisitionsDivestments, setAcquisitionsDivestments] = useState(0);

  // CBAM State
  const [cbamCommodity, setCbamCommodity] = useState('Steel');
  const [cbamWeight, setCbamWeight] = useState(500); // tons

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
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
        // Simple division logic for demonstration coordinates mapping
        if (lat > 24.5) {
          detected = "Sylhet";
        } else if (lat < 22.5) {
          detected = "Chittagong";
        } else if (lon < 89.5) {
          detected = "Khulna";
        } else if (lat > 24 && lon < 89.5) {
          detected = "Rajshahi";
        } else {
          detected = "Dhaka";
        }
        
        setSelectedDistrict(detected);
        showToast(`Located in ${detected} district! Regional default emission parameters applied.`, "success");
      },
      (error) => {
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

    // Scope 1: Direct emissions (fuels converted to tons by dividing by 1000)
    const scope1 = ((dVal * factors.diesel) + (pVal * factors.petrol) + (lVal * factors.lpg)) / 1000;

    // Scope 2 Location-based (default factor)
    const scope2 = (eVal * factors.electricity) / 1000;
    
    // Scope 2 Market-based (uses custom marketFactor, which defaults to 0.12 kg CO2e / kWh)
    const scope2Market = (eVal * marketFactor) / 1000;

    // Scope 3: Value Chain emissions (commutes in tons, travel/freight converted, raw materials in tons)
    const scope3 = (empVal * factors.employees) + 
                   ((airVal * factors.airTravel) / 1000) + 
                   ((truckVal * factors.truckTransport) / 1000) + 
                   (rawVal * factors.rawMaterials);

    const total = scope1 + scope2 + scope3;
    const totalMarket = scope1 + scope2Market + scope3;

    setResults({
      scope1: parseFloat(scope1.toFixed(2)),
      scope2: parseFloat(scope2.toFixed(2)),
      scope2Market: parseFloat(scope2Market.toFixed(2)),
      scope3: parseFloat(scope3.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalMarket: parseFloat(totalMarket.toFixed(2))
    });
  };

  // Handle manual inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...inputs, [name]: value };
    setInputs(updated);
    setIsVerified(false); // Reset verification sign on manual edit
  };

  // Trigger calculations whenever inputs or emission factors change
  useEffect(() => {
    calculateEmissions(inputs, ef);
  }, [inputs, ef, marketFactor]);

  // Handle drag and drop file upload
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
    if (file) {
      setUploadedFile(file.name);
      setIsVerified(false);
      showToast(`Selected file: ${file.name}. Trigger AI Extraction to verify.`, "info");
      
      // Auto run AI extraction for a premium feel
      setTimeout(() => {
        runAIExtraction(file.name);
      }, 600);
    }
  };

  // Run AI simulated extraction
  const runAIExtraction = (fileName = "ESG_Statement_Q2_2026.xlsx") => {
    setIsUploading(true);
    showToast(`AI Extractor analyzing ${fileName}...`, "info");

    // Simulate AI parsing duration
    setTimeout(() => {
      const extractedInputs = {
        diesel: '14200',
        petrol: '4800',
        lpg: '1950',
        electricity: '156000',
        employees: '148',
        airTravel: '82000',
        truckTransport: '39000',
        rawMaterials: '580'
      };

      setInputs(extractedInputs);
      setIsUploading(false);
      setIsVerified(true); // Display verification seal

      // Check task id 2 (Verify Scope 3 Cargo Commutes)
      setTasks(prev => prev.map(t => t.id === 2 ? { ...t, completed: true } : t));

      // Append notification
      setNotifications(prev => [
        { id: Date.now(), text: `AI Extractor successfully verified Q2 report: ${fileName}`, read: false, time: "Just now" },
        ...prev
      ]);

      showToast("AI data extraction and verification completed!", "success");
    }, 2200);
  };

  // Clear inputs
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
    setIsVerified(false);
    showToast("Calculator inputs cleared.", "info");
  };

  // Toggle tasks check
  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Add a new checklist task
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

  // Delete checklist task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Task deleted.", "info");
  };

  // Add new project
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

  // Add new team member
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

  // Toggle Member Status
  const toggleMemberStatus = (name) => {
    setTeamMembers(prev => prev.map(m => m.name === name ? { ...m, status: m.status === 'Active' ? 'Offline' : 'Active' } : m));
    showToast("Member status toggled.", "info");
  };

  // Delete team member
  const removeMember = (name) => {
    setTeamMembers(prev => prev.filter(m => m.name !== name));
    showToast("Team member removed.", "info");
  };

  // Toggle FAQ collapse
  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Notifications helper
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "success");
  };

  // App download handler
  const handleDownloadApp = () => {
    setDownloadingApp(true);
    showToast("Downloading CarbonZero companion installer...", "info");
    setTimeout(() => {
      setDownloadingApp(false);
      showToast("App installer downloaded successfully!", "success");
    }, 2500);
  };

  // Settings Save Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast("ESG settings and emission factors saved successfully!", "success");
  };

  // Active tasks count
  const openTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="pt-20 min-h-screen bg-[#F8F9FA] text-[#1E293B] flex relative platform-saas-dashboard">
      
      {/* FLOAT TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl shadow-xl border text-white transition-all transform duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-[#0F291B] border-[#4ADE80]/30' 
            : toast.type === 'error'
              ? 'bg-red-800 border-red-500/30'
              : 'bg-[#1E293B] border-[#E2E8F0]/20'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#4ADE80]" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-sky-400" />
          )}
          <span className="font-sans font-semibold text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-[240px] bg-white border-r border-[#E2E8F0] p-6 hidden lg:flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 px-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[#0F291B] flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-[#4ADE80]" />
            </div>
            <span className="font-sans font-bold text-lg text-[#0F291B] tracking-tight">CarbonZero</span>
          </Link>

          {/* Menu Sections */}
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[9px] text-[#94A3B8] uppercase tracking-wider block px-2 mb-2 font-bold">Menu</span>
              <nav className="space-y-1">
                {[
                  { name: 'Dashboard', icon: Grid },
                  { name: 'Materiality', icon: Compass },
                  { name: 'Audit & Compliance', icon: CheckCircle2 },
                  { name: 'Tasks', icon: CheckCircle, badge: openTasksCount > 0 ? `${openTasksCount} left` : null },
                  { name: 'Calendar', icon: CalendarIcon },
                  { name: 'Analytics', icon: BarChart2 },
                  { name: 'Team', icon: Users }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#0D2B1A]/10 text-[#0F291B]' 
                          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F291B]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F291B]' : 'text-[#94A3B8]'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <span className="font-mono text-[9px] text-[#94A3B8] uppercase tracking-wider block px-2 mb-2 font-bold">General</span>
              <nav className="space-y-1">
                {[
                  { name: 'Settings', icon: Settings },
                  { name: 'Help', icon: HelpCircle },
                  { name: 'Logout', icon: LogOut }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.name === 'Logout') {
                          navigate('/');
                        } else {
                          setActiveMenu(item.name);
                        }
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#0D2B1A]/10 text-[#0F291B]' 
                          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F291B]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F291B]' : 'text-[#94A3B8]'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Promo Card */}
        <div className="bg-gradient-to-br from-[#0F291B] to-[#1C4E34] text-white p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full"></div>
          <h4 className="font-sans font-bold text-xs mb-1">Track ESG on the go</h4>
          <p className="text-[10px] text-white/70 mb-3 leading-relaxed">Download our mobile companion app to sync emissions feeds.</p>
          <button 
            disabled={downloadingApp}
            onClick={handleDownloadApp}
            className="bg-white text-[#0F291B] font-sans font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors w-full flex items-center justify-center space-x-1"
          >
            {downloadingApp ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#0F291B]" />
                <span>Downloading...</span>
              </>
            ) : (
              <span>Download App</span>
            )}
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8 pb-20 relative">
        
        {/* Auditor Read-only Active Watermark Banner */}
        {isAuditorMode && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-red-800 animate-pulse mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-xs font-sans font-bold uppercase tracking-wider">
                Auditor Assurance Lock Active — System Read-only Mode (ISAE 3410)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
              Locked
            </span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#E2E8F0] pb-6 relative z-30">
          
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, team, projects... (⌘F)" 
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-sans placeholder-[#94A3B8] focus:outline-none focus:border-[#0F291B] bg-white text-[#1E293B]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#64748B] hover:text-[#0F291B]"
              >
                Clear
              </button>
            )}
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            
            {/* Top action buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsAddProjectOpen(true)}
                className="bg-[#0F291B] hover:bg-[#1A4B31] text-white font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
              <button 
                onClick={() => {
                  const inputEl = document.getElementById('drag-file-input');
                  if (inputEl) inputEl.click();
                }}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F291B] font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Import Data
              </button>
            </div>

            {/* Profile & Notifications Bell */}
            <div className="flex items-center space-x-3 pl-4 border-l border-[#E2E8F0] relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 rounded-full hover:bg-white text-[#64748B] hover:text-[#0F291B] transition-colors"
              >
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                )}
                <Bell className="w-4.5 h-4.5" />
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 space-y-3 z-50 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                    <span className="font-sans font-bold text-sm text-[#0F291B]">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-sans font-semibold text-emerald hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-[#64748B] py-4 text-center">No alerts or notifications.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2 rounded-lg text-xs flex items-start gap-2.5 ${n.read ? 'bg-transparent' : 'bg-emerald/5 border-l-2 border-emerald'}`}>
                          <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${n.read ? 'bg-transparent' : 'bg-emerald'}`}></div>
                          <div className="flex-1">
                            <p className="text-[#1E293B] font-sans leading-tight">{n.text}</p>
                            <span className="text-[9px] text-[#94A3B8] font-mono block mt-1">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] overflow-hidden border border-emerald/20">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                    alt="User profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-sans font-bold text-xs text-[#0F291B]">Mohammad Tanveer</div>
                  <div className="text-[10px] text-[#64748B] font-mono">tanveer@carbonzero.io</div>
                </div>
              </div>
            </div>
            
          </div>
        </header>

        {/* -------------------- TAB CONTENT: DASHBOARD -------------------- */}
        {activeMenu === 'Dashboard' && (
          <>
            {/* Dashboard Title & Introduction */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="font-sans font-bold text-3xl text-[#0F291B]">Dashboard</h1>
                <p className="text-sm text-[#64748B] mt-1 font-sans">Plan, prioritize, and verify your corporate emissions with ease.</p>
              </div>

              {/* Bangladesh Geolocation Selector */}
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] self-start md:self-auto">
                <MapPin className="w-4 h-4 text-emerald" />
                <span className="text-xs font-sans text-[#64748B]">District:</span>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    showToast(`District branch updated to ${e.target.value}.`, "info");
                  }}
                  className="text-xs font-sans font-bold text-[#0F291B] border-none bg-transparent focus:ring-0 cursor-pointer"
                >
                  {BANGLADESH_DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                <button 
                  onClick={detectLocation}
                  className="font-mono text-[9px] bg-emerald/10 text-emerald hover:bg-emerald/20 px-2 py-0.5 rounded transition-all"
                >
                  Auto Select
                </button>
              </div>
            </div>

            {/* KPI Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Emissions */}
              <div className="bg-[#0F291B] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between aspect-[1.6]">
                <div>
                  <div className="font-mono text-[9px] text-[#A7F3D0] uppercase tracking-wider font-bold mb-3">Total Carbon footprint</div>
                  <div className="font-sans font-bold text-3xl lg:text-4xl tracking-tight">
                    {results.total} <span className="text-xs font-mono font-normal">tCO2e</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-[#4ADE80] font-mono bg-white/10 px-2.5 py-1 rounded-full flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {reductionTarget}% reduced
                  </span>
                  <span className="text-[9px] text-[#A7F3D0] font-sans">vs last year</span>
                </div>
              </div>

              {/* Card 2: Scope 1 */}
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between aspect-[1.6]">
                <div>
                  <div className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold mb-3">Scope 1 (Direct)</div>
                  <div className="font-sans font-bold text-3xl tracking-tight text-[#0F291B]">
                    {results.scope1} <span className="text-xs font-mono font-normal text-[#64748B]">tCO2e</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-[10px] text-[#64748B]">
                  <span>Boilers, Generators, Vehicles</span>
                  <span className="font-mono font-bold text-amber">
                    {results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Card 3: Scope 2 */}
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between aspect-[1.6]">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold">Scope 2 (Electricity)</span>
                    <span className="bg-emerald/10 text-emerald text-[8px] font-bold px-1.5 py-0.5 rounded font-sans uppercase">Dual Reporting</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-[#94A3B8] font-semibold uppercase block">Location-based</span>
                      <span className="font-sans font-bold text-xl lg:text-2xl text-[#0F291B]">
                        {results.scope2} <span className="text-[10px] font-mono font-normal text-[#64748B]">t</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#94A3B8] font-semibold uppercase block">Market-based</span>
                      <span className="font-sans font-bold text-xl lg:text-2xl text-[#059669]">
                        {results.scope2Market} <span className="text-[10px] font-mono font-normal text-[#64748B]">t</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] text-[#64748B]">
                  <span>Purchased Power</span>
                  <span className="font-mono text-[9px] text-[#94A3B8]">
                    Loc: {results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}% | Mkt: {results.totalMarket > 0 ? ((results.scope2Market / results.totalMarket) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Card 4: Scope 3 */}
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between aspect-[1.6]">
                <div>
                  <div className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold mb-3">Scope 3 (Value Chain)</div>
                  <div className="font-sans font-bold text-3xl tracking-tight text-[#0F291B]">
                    {results.scope3} <span className="text-xs font-mono font-normal text-[#64748B]">tCO2e</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-[10px] text-[#64748B]">
                  <span>Supply Chain & Commutes</span>
                  <span className="font-mono font-bold text-purple-600">
                    {results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Main Two Column Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (Calculator & File Dropzone) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Scope Emissions Calculator Module */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                  
                  <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-4">
                    <div>
                      <h3 className="font-sans font-bold text-lg text-[#0F291B]">Protocol Emissions Calculator</h3>
                      <p className="text-xs text-[#64748B] mt-0.5 font-sans">Input raw values or upload utility invoices to extract footprint.</p>
                    </div>
                    <button 
                      onClick={clearCalculator}
                      className="font-mono text-[10px] text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 px-3 py-1 rounded transition-colors"
                    >
                      Clear Data
                    </button>
                  </div>

                  {/* Scope Calculator Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Scope 1 Column */}
                    <div className="space-y-4">
                      <div className="font-mono text-[10px] text-[#0F291B] uppercase tracking-wider font-bold pb-2 border-b border-[#F1F5F9]">
                        Scope 1 (Direct)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Diesel (Liters)</label>
                          <input 
                            type="number"
                            name="diesel"
                            value={inputs.diesel}
                            onChange={handleInputChange}
                            placeholder="e.g. 10000"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Petrol (Liters)</label>
                          <input 
                            type="number"
                            name="petrol"
                            value={inputs.petrol}
                            onChange={handleInputChange}
                            placeholder="e.g. 5000"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">LPG (Kg)</label>
                          <input 
                            type="number"
                            name="lpg"
                            value={inputs.lpg}
                            onChange={handleInputChange}
                            placeholder="e.g. 1500"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope 2 Column */}
                    <div className="space-y-4">
                      <div className="font-mono text-[10px] text-[#0F291B] uppercase tracking-wider font-bold pb-2 border-b border-[#F1F5F9]">
                        Scope 2 (Indirect)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Grid Power (kWh)</label>
                          <input 
                            type="number"
                            name="electricity"
                            value={inputs.electricity}
                            onChange={handleInputChange}
                            placeholder="e.g. 100000"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope 3 Column */}
                    <div className="space-y-4">
                      <div className="font-mono text-[10px] text-[#0F291B] uppercase tracking-wider font-bold pb-2 border-b border-[#F1F5F9]">
                        Scope 3 (Value Chain)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Employees (Commute)</label>
                          <input 
                            type="number"
                            name="employees"
                            value={inputs.employees}
                            onChange={handleInputChange}
                            placeholder="e.g. 150"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Air Travel (Km)</label>
                          <input 
                            type="number"
                            name="airTravel"
                            value={inputs.airTravel}
                            onChange={handleInputChange}
                            placeholder="e.g. 50000"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Truck Freight (T-Km)</label>
                          <input 
                            type="number"
                            name="truckTransport"
                            value={inputs.truckTransport}
                            onChange={handleInputChange}
                            placeholder="e.g. 20000"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Raw Materials (Tons)</label>
                          <input 
                            type="number"
                            name="rawMaterials"
                            value={inputs.rawMaterials}
                            onChange={handleInputChange}
                            placeholder="e.g. 400"
                            disabled={isAuditorMode}
                            className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* AI Document Dropzone & Extraction controls */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                  
                  <div>
                    <h3 className="font-sans font-bold text-lg text-[#0F291B] flex items-center">
                      <FileText className="w-5 h-5 text-emerald mr-2" />
                      AI Document Footprint Extractor
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                      Upload your annual financial dashboard, expenses report, or utility spreadsheets. CarbonZero AI will scan and populate the parameters.
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-8 text-center bg-[#F8F9FA]/50 hover:bg-[#F1F5F9]/50 transition-colors cursor-pointer relative"
                  >
                    <input 
                      type="file" 
                      id="drag-file-input"
                      onChange={handleFileDrop}
                      className="hidden" 
                      accept=".csv,.xlsx,.xls,.pdf"
                    />
                    <div onClick={() => document.getElementById('drag-file-input').click()} className="space-y-3">
                      <Upload className="w-10 h-10 text-[#64748B] mx-auto animate-none" />
                      <div className="text-xs font-bold text-[#0F291B]">
                        {uploadedFile ? `Uploaded: ${uploadedFile}` : "Drag & Drop Financial spreadsheets or bills here"}
                      </div>
                      <div className="text-[10px] text-[#64748B]">Supports PDF, XLSX, CSV (Max 25MB)</div>
                    </div>
                  </div>

                  {/* Controls & Verification Sign */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* Track Emissions simulated button */}
                    <button
                      onClick={() => runAIExtraction(uploadedFile || undefined)}
                      disabled={isUploading}
                      className="bg-[#10B981] hover:bg-[#059669] disabled:bg-[#94A3B8] force-white font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 w-full sm:w-auto"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin force-white" />
                          <span className="force-white">AI Extracting Data...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-4 h-4 force-white" />
                          <span className="force-white">Track Emissions</span>
                        </>
                      )}
                    </button>

                    {/* Audit Verification Seal */}
                    {isVerified && (
                      <div className="flex items-center space-x-2.5 bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-2 rounded-xl text-[#065F46] animate-none">
                        <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                        <div className="text-left leading-none">
                          <div className="font-mono text-[9px] uppercase tracking-wider font-bold">Audit Status</div>
                          <div className="font-sans font-bold text-xs">CARBONOS VERIFIED</div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Company Projects List in Dashboard */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm">
                  <div className="flex justify-between items-center pb-4 border-b border-[#F1F5F9] mb-4">
                    <div>
                      <h3 className="font-sans font-bold text-lg text-[#0F291B]">Active Corporate Projects</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">District specific offsetting initiatives under CarbonZero monitoring.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddProjectOpen(true)}
                      className="text-xs font-sans font-bold text-emerald hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Project</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="text-[#64748B] font-bold border-b border-[#F1F5F9] pb-2">
                          <th className="py-2.5">Project Name</th>
                          <th>Sector</th>
                          <th>Target (tCO2e/yr)</th>
                          <th>Audit Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {projects.map(p => (
                          <tr key={p.id} className="hover:bg-[#F8F9FA]">
                            <td className="py-3 font-bold text-[#0F291B]">{p.name}</td>
                            <td className="text-[#64748B]">{p.sector}</td>
                            <td className="font-mono font-semibold">{p.target} tCO2e</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.status === 'Verified' 
                                  ? 'bg-emerald/10 text-emerald border border-emerald/20' 
                                  : p.status === 'In Progress'
                                    ? 'bg-amber/10 text-amber border border-amber/20'
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (Reminders, Offset and Team) */}
              <div className="space-y-8">
                
                {/* Offset Options Panel */}
                <div className="bg-[#0F291B] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between h-[230px]">
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] text-[#A7F3D0] uppercase tracking-wider font-bold">EMISSIONS COMPENSATIONS</div>
                    <h3 className="font-sans font-bold text-lg leading-tight">Offset Your Footprint</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      Purchase certified Bangladeshi carbon credits directly on our registry to mitigate your calculated corporate emissions debt.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/platform/marketplace')}
                    className="bg-[#4ADE80] hover:bg-[#22C55E] force-white font-sans font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <span className="force-white">Browse Marketplace</span>
                    <ExternalLink className="w-3.5 h-3.5 force-white" />
                  </button>
                </div>

                {/* Reminders / To-dos */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#F1F5F9]">
                    <h3 className="font-sans font-bold text-sm text-[#0F291B]">Verification Tasks</h3>
                    <span className="bg-[#E2E8F0] text-[#0F291B] text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {openTasksCount} left
                    </span>
                  </div>
                  
                  <ul className="space-y-3 font-sans text-xs">
                    {tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTask(task.id)}
                            className="mt-0.5 border-[#E2E8F0] rounded text-emerald focus:ring-emerald cursor-pointer" 
                          />
                          <span className={task.completed ? "text-[#64748B] line-through" : "text-[#1E293B]"}>
                            {task.text}
                          </span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setActiveMenu('Tasks')}
                    className="w-full text-center text-xs font-sans font-bold text-emerald hover:underline mt-4 pt-3 border-t border-[#F1F5F9]"
                  >
                    View All Tasks
                  </button>
                </div>

                {/* Team Members */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#F1F5F9]">
                    <h3 className="font-sans font-bold text-sm text-[#0F291B]">ESG Audit Team</h3>
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="text-[10px] font-sans font-semibold text-emerald hover:underline"
                    >
                      Add Member
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-7 h-7 rounded-full bg-[#E2E8F0] overflow-hidden border border-emerald/10 cursor-pointer" onClick={() => toggleMemberStatus(member.name)}>
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left leading-none">
                            <div className="font-sans font-bold text-xs text-[#0F291B]">{member.name}</div>
                            <div className="text-[9px] text-[#64748B] font-mono mt-0.5">{member.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] border px-2 py-0.5 rounded uppercase font-bold ${
                            member.status === 'Active' 
                              ? 'bg-emerald/10 text-emerald border-emerald/20' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {member.status}
                          </span>
                          <button onClick={() => removeMember(member.name)} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

        {/* -------------------- TAB CONTENT: MATERIALITY -------------------- */}
        {activeMenu === 'Materiality' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">Double Materiality Assessment</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">
                Identify and prioritize key ESG issues based on their Impact Materiality and Financial Materiality (CSRD/ESRS aligned).
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Matrix Plot (Visual Grid) */}
              <div className="xl:col-span-1 bg-[#F8F9FA] rounded-2xl p-6 border border-[#E2E8F0] flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#0F291B] mb-4">Double Materiality Matrix</h3>
                  <div className="relative w-full aspect-square bg-white border-l-2 border-b-2 border-[#64748B] grid grid-cols-5 grid-rows-5 rounded-tr-lg">
                    {/* Matrix Labels */}
                    <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 text-[9px] font-mono uppercase text-[#64748B] font-bold">Impact Materiality →</div>
                    <div className="absolute -left-14 top-1/2 transform -translate-y-1/2 rotate-90 text-[9px] font-mono uppercase text-[#64748B] font-bold">Financial Materiality →</div>
                    
                    {/* Materiality threshold line (dashed red) */}
                    <div className="absolute inset-0 border-t border-r border-dashed border-red-400 pointer-events-none" style={{ left: '40%', top: '40%' }}>
                      <span className="absolute right-2 top-2 text-[8px] font-mono text-red-500 font-bold uppercase tracking-wider bg-white/80 px-1 rounded">Material Threshold</span>
                    </div>

                    {/* Plotted Topics */}
                    {Object.entries(materialityScores).map(([key, topic]) => {
                      // Map 1-5 to percentage coordinates
                      const xPercent = (topic.impact - 0.5) * 20; 
                      const yPercent = (5.5 - topic.financial) * 20; // invert y for top-origin
                      
                      const isMaterial = topic.impact >= 3 && topic.financial >= 3;

                      return (
                        <div 
                          key={key}
                          className={`absolute w-4 h-4 rounded-full cursor-pointer flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-md transition-all hover:scale-125 ${
                            isMaterial ? 'bg-[#0F291B] border-2 border-emerald-400' : 'bg-[#94A3B8] border-2 border-white'
                          }`}
                          style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                          title={`${topic.name} (Impact: ${topic.impact}, Financial: ${topic.financial})`}
                          onClick={() => showToast(`Selected: ${topic.name}. Impact: ${topic.impact}, Financial: ${topic.financial}`, "info")}
                        >
                          <span className="text-[7px] text-white font-bold">{topic.name.charAt(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[10px] text-[#64748B] mt-10 leading-relaxed font-sans">
                  * Dark green dots with emerald borders represent **Material Topics** which exceed the ESRS threshold (≥ 3.0 on both dimensions) and must be included in your ESG disclosures.
                </div>
              </div>

              {/* Slider Controls */}
              <div className="xl:col-span-2 space-y-6">
                <h3 className="font-sans font-bold text-sm text-[#0F291B] border-b border-[#F1F5F9] pb-2">Rate ESG Topics</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {Object.entries(materialityScores).map(([key, topic]) => (
                    <div key={key} className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-sans font-bold text-xs text-[#0F291B]">{topic.name}</h4>
                          <p className="text-[10px] text-[#64748B] mt-0.5 font-sans leading-relaxed">{topic.description}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          topic.impact >= 3 && topic.financial >= 3
                            ? 'bg-[#0F291B]/10 text-[#0F291B] border border-[#0F291B]/20'
                            : 'bg-[#94A3B8]/10 text-[#64748B]'
                        }`}>
                          {topic.impact >= 3 && topic.financial >= 3 ? 'Material' : 'Non-Material'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                            <span>Impact Materiality</span>
                            <span className="font-bold">{topic.impact} / 5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={topic.impact}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setMaterialityScores(prev => ({
                                ...prev,
                                [key]: { ...prev[key], impact: val }
                              }));
                            }}
                            className="w-full h-1 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-emerald"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                            <span>Financial Materiality</span>
                            <span className="font-bold">{topic.financial} / 5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={topic.financial}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setMaterialityScores(prev => ({
                                ...prev,
                                [key]: { ...prev[key], financial: val }
                              }));
                            }}
                            className="w-full h-1 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-emerald"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: AUDIT & COMPLIANCE -------------------- */}
        {activeMenu === 'Audit & Compliance' && (
          <div className="space-y-8 text-left">
            
            {/* Page Title & Controls */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="font-sans font-bold text-3xl text-[#0F291B] flex items-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald mr-2" />
                  Audit & Compliance Center
                </h1>
                <p className="text-sm text-[#64748B] mt-1 font-sans">
                  Manage third party assurance reviews, base-year restructuring, and CBAM customs export reports.
                </p>
              </div>

              {/* Auditor Mode Toggle */}
              <div className="flex items-center space-x-3 bg-[#F8F9FA] px-4 py-2.5 rounded-2xl border border-[#E2E8F0] self-start md:self-auto">
                <span className="text-xs font-sans font-bold text-[#0F291B]">Auditor View Lock:</span>
                <button 
                  onClick={() => {
                    setIsAuditorMode(!isAuditorMode);
                    showToast(
                      !isAuditorMode 
                        ? "Auditor Mode active. System metrics locked for assurance review." 
                        : "Auditor read-only lock disabled. Editing unlocked.",
                      "info"
                    );
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all focus:outline-none ${
                    isAuditorMode ? 'bg-[#0F291B]' : 'bg-[#94A3B8]'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                    isAuditorMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Base Year Recalculation & CBAM Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card A: Base Year Recalculation Policy */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-sans font-bold text-base text-[#0F291B] border-b border-[#F1F5F9] pb-2">Base Year Recalculation Policy</h3>
                <p className="text-xs text-[#64748B] leading-relaxed font-sans">
                  The GHG Protocol mandates adjusting baseline emissions when structural changes (mergers, acquisitions, or divestitures) alter corporate boundaries by &gt; 5%.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Base Year</label>
                      <input 
                        type="number"
                        value={baseYear}
                        onChange={(e) => setBaseYear(parseInt(e.target.value) || 2025)}
                        disabled={isAuditorMode}
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Baseline Emissions (tCO₂e)</label>
                      <input 
                        type="number"
                        value={baseYearEmissions}
                        onChange={(e) => setBaseYearEmissions(parseFloat(e.target.value) || 0)}
                        disabled={isAuditorMode}
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Structural Adjustment (Acquisitions/Divestments tCO₂e)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        placeholder="e.g. +120 or -80"
                        onChange={(e) => setAcquisitionsDivestments(parseFloat(e.target.value) || 0)}
                        disabled={isAuditorMode}
                        className="flex-1 text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <button 
                        onClick={() => {
                          setBaseYearEmissions(prev => parseFloat((prev + acquisitionsDivestments).toFixed(2)));
                          showToast(`Baseline recalculated successfully by ${acquisitionsDivestments > 0 ? '+' : ''}${acquisitionsDivestments} tCO₂e!`, "success");
                        }}
                        disabled={isAuditorMode}
                        className="bg-[#0F291B] hover:bg-[#1A4B31] disabled:bg-[#94A3B8] text-white px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all disabled:cursor-not-allowed"
                      >
                        Adjust
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E2E8F0] flex justify-between items-center text-xs">
                    <span className="font-sans text-[#64748B]">Adjusted Baseline ({baseYear}):</span>
                    <span className="font-mono font-bold text-[#0F291B]">{baseYearEmissions} tCO₂e</span>
                  </div>
                </div>
              </div>

              {/* Card B: CBAM Certificate Exporter */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-sans font-bold text-base text-[#0F291B] border-b border-[#F1F5F9] pb-2">CBAM Export Declaration</h3>
                <p className="text-xs text-[#64748B] leading-relaxed font-sans">
                  Calculate and export embedded greenhouse gas emissions certificates for industrial commodities exported to the European Union market.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Export Commodity Sector</label>
                    <select 
                      value={cbamCommodity}
                      onChange={(e) => setCbamCommodity(e.target.value)}
                      className="w-full text-xs font-sans font-bold text-[#0F291B] p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-white cursor-pointer"
                    >
                      <option value="Steel">Steel & Iron Products</option>
                      <option value="Aluminium">Aluminium Extrusions & Castings</option>
                      <option value="Cement">Portland Cement & Clinkers</option>
                      <option value="Fertilizers">Ammonia & Nitrogenous Fertilizers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Export Net Weight (Metric Tons)</label>
                    <input 
                      type="number"
                      value={cbamWeight}
                      onChange={(e) => setCbamWeight(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>

                  <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E2E8F0] flex justify-between items-center text-xs">
                    <span className="font-sans text-[#64748B]">Embedded Carbon (CBAM):</span>
                    <span className="font-mono font-bold text-[#0F291B]">
                      {parseFloat((cbamWeight * (cbamCommodity === 'Steel' ? 1.85 : cbamCommodity === 'Aluminium' ? 6.42 : cbamCommodity === 'Cement' ? 0.92 : 2.15)).toFixed(2))} tCO₂e
                    </span>
                  </div>

                  <button 
                    onClick={() => showToast(`CBAM Declaration Certificate for ${cbamWeight} Tons of ${cbamCommodity} exported!`, "success")}
                    className="w-full bg-[#0F291B] hover:bg-[#1A4B31] text-white font-sans font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Generate CBAM Declaration</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Traceable Audit Trail Log */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F1F5F9] pb-4 gap-2">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#0F291B]">Traceable Audit Trail Log</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Calculations verified under GHG Protocol and ISAE 3410 assurance guidelines.</p>
                </div>
                <span className="bg-emerald/10 text-emerald text-[10px] px-3 py-1 rounded-full font-bold border border-emerald/20">
                  EF Library: DEFRA 2025 v1.4
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs min-w-[800px]">
                  <thead>
                    <tr className="text-[#64748B] font-bold border-b border-[#F1F5F9] pb-2.5">
                      <th className="py-2.5">Emissions Source</th>
                      <th>Activity Data</th>
                      <th>Emission Factor (EF)</th>
                      <th>Assurance Formula</th>
                      <th>Scope</th>
                      <th>Evidence Doc</th>
                      <th className="text-right">Footprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {[
                      { name: "Diesel Backup Generators", data: `${inputs.diesel} L`, factor: `${ef.diesel} kgCO2e/L`, formula: "Activity × EF / 1000", scope: "Scope 1", doc: "diesel_invoice_Q2.pdf", value: `${((parseFloat(inputs.diesel) || 0) * ef.diesel / 1000).toFixed(2)} t` },
                      { name: "Executive Transport Vehicles", data: `${inputs.petrol} L`, factor: `${ef.petrol} kgCO2e/L`, formula: "Activity × EF / 1000", scope: "Scope 1", doc: "fuel_receipts_june.xlsx", value: `${((parseFloat(inputs.petrol) || 0) * ef.petrol / 1000).toFixed(2)} t` },
                      { name: "Purchased Grid Power (Location-based)", data: `${inputs.electricity} kWh`, factor: `${ef.electricity} kgCO2e/kWh`, formula: "Activity × Grid EF / 1000", scope: "Scope 2 (Loc)", doc: "dhaka_power_june.pdf", value: `${results.scope2} t` },
                      { name: "Purchased Grid Power (Market-based)", data: `${inputs.electricity} kWh`, factor: `${marketFactor} kgCO2e/kWh`, formula: "Activity × Green tariff EF / 1000", scope: "Scope 2 (Mkt)", doc: "green_ppa_contract.pdf", value: `${results.scope2Market} t` },
                      { name: "Employee Daily Commute", data: `${inputs.employees} Staff`, factor: `${ef.employees} tCO2e/emp/yr`, formula: "Staff Count × EF", scope: "Scope 3", doc: "hr_roster_2026.csv", value: `${(parseFloat(inputs.employees) || 0) * ef.employees} t` },
                      { name: "Supplier Logistics (Truck Transport)", data: `${inputs.truckTransport} t-km`, factor: `${ef.truckTransport} kgCO2e/t-km`, formula: "Activity × EF / 1000", scope: "Scope 3", doc: "freight_logistics_q2.pdf", value: `${((parseFloat(inputs.truckTransport) || 0) * ef.truckTransport / 1000).toFixed(2)} t` }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F9FA]">
                        <td className="py-3.5 font-bold text-[#0F291B]">{row.name}</td>
                        <td className="font-mono text-[11px]">{row.data}</td>
                        <td className="font-mono text-[11px] text-slate-600">{row.factor}</td>
                        <td className="font-mono text-[10px] text-slate-400">{row.formula}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.scope.includes("Scope 1") 
                              ? 'bg-amber/10 text-amber' 
                              : row.scope.includes("Scope 2")
                                ? 'bg-emerald/10 text-emerald'
                                : 'bg-purple-600/10 text-purple-600'
                          }`}>
                            {row.scope}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => showToast(`Opening audit evidence: ${row.doc}`, "info")}
                            className="text-xs font-semibold text-[#0F291B] hover:underline flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-[11px] text-slate-600">{row.doc}</span>
                          </button>
                        </td>
                        <td className="text-right font-mono font-bold text-[#0F291B]">{row.value} CO₂e</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* -------------------- TAB CONTENT: TASKS -------------------- */}
        {activeMenu === 'Tasks' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">Verification Tasks</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Verify, audit, and log compliance steps to confirm climate metrics.</p>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 relative">
              <input 
                type="text" 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Type a new corporate ESG verification task..." 
                className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-xl text-xs font-sans placeholder-[#94A3B8] focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
              />
              <button 
                type="submit" 
                className="bg-[#0F291B] text-white hover:bg-[#1C4E34] px-5 py-3 rounded-xl text-xs font-sans font-bold transition-all shadow-md"
              >
                Add Task
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-3">
              {tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748B]">No matching verification tasks found.</div>
              ) : (
                tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3.5 border border-[#F1F5F9] rounded-xl hover:bg-[#F8F9FA] transition-all">
                    <div className="flex items-center space-x-3.5">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="w-4.5 h-4.5 border-[#E2E8F0] rounded text-emerald focus:ring-emerald cursor-pointer"
                      />
                      <span className={`text-sm font-sans font-medium ${task.completed ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-[#94A3B8] hover:text-[#EF4444] p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: CALENDAR -------------------- */}
        {activeMenu === 'Calendar' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">ESG Reporting Calendar</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Track verification schedules, third party audits, and offset purchases.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Calendar Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-sm text-[#0F291B]">June 2026</h3>
                  <div className="flex items-center space-x-1 text-xs text-[#64748B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block"></span>
                    <span>Audit Events</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold">
                  {/* Days of week */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-[#94A3B8] py-1">{day}</div>
                  ))}
                  
                  {/* Empty spaces for starting offset of June 2026 (Starts on Monday) */}
                  <div className="border border-transparent p-3"></div>
                  
                  {/* Days of month */}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const hasEvent = calendarEvents[day];
                    const isSelected = selectedCalendarDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => hasEvent && setSelectedCalendarDay(day)}
                        className={`border rounded-xl p-3 relative flex flex-col items-center justify-between font-mono font-bold aspect-square transition-all ${
                          isSelected 
                            ? 'bg-[#0F291B] border-[#0F291B] text-white shadow-md' 
                            : 'border-[#F1F5F9] hover:bg-[#F8F9FA] text-[#1E293B]'
                        } ${hasEvent ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                      >
                        <span>{day}</span>
                        {hasEvent && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#4ADE80]' : 'bg-[#10B981]'}`}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event details panel */}
              <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-[#E2E8F0] space-y-4 h-fit">
                <h3 className="font-sans font-bold text-sm text-[#0F291B] border-b border-[#E2E8F0] pb-2">Event Schedule Details</h3>
                {selectedCalendarDay && calendarEvents[selectedCalendarDay] ? (
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">DATE</span>
                      <span className="font-bold text-[#0F291B]">June {selectedCalendarDay}, 2026</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">AUDIT MISSION</span>
                      <span className="font-bold text-sm text-[#0F291B] block mt-0.5">{calendarEvents[selectedCalendarDay].title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">ASSIGNED AUDITOR</span>
                      <span className="font-semibold text-emerald">{calendarEvents[selectedCalendarDay].auditor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">SCHEDULED TIME</span>
                      <span className="font-mono font-bold text-[#1E293B]">{calendarEvents[selectedCalendarDay].time}</span>
                    </div>
                    <button 
                      onClick={() => showToast(`Report for "${calendarEvents[selectedCalendarDay].title}" requested.`, "success")}
                      className="w-full bg-[#0F291B] text-white font-bold text-xs py-2 px-3 rounded-lg hover:bg-[#1A4B31] transition-colors shadow-sm block text-center"
                    >
                      Request Audit Dossier
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#64748B]">Click on any highlighted date in the calendar to view its ESG audit logs.</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: ANALYTICS -------------------- */}
        {activeMenu === 'Analytics' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">Emissions Analytics</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Deep dive into corporate footprint breakdown per GHG Protocol Scopes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">Carbon Intensity Score</span>
                <div className="text-2xl font-sans font-bold text-[#0F291B]">0.18 <span className="text-xs text-[#64748B]">tCO2e/person</span></div>
                <p className="text-[10px] text-[#64748B]">Average monthly emissions calculated per corporate employee.</p>
              </div>
              <div className="border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">Revenue Intensity</span>
                <div className="text-2xl font-sans font-bold text-[#0F291B]">1.24 <span className="text-xs text-[#64748B]">kgCO2e/৳</span></div>
                <p className="text-[10px] text-[#64748B]">Carbon dioxide generated per Taka generated in business activity.</p>
              </div>
              <div className="border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">Energy Efficiency</span>
                <div className="text-2xl font-sans font-bold text-emerald">Grade A+</div>
                <p className="text-[10px] text-[#64748B]">Optimized power grid usage vs average Bangladeshi manufacturing.</p>
              </div>
            </div>

            {/* Scope Visual Progress Bars */}
            <div className="space-y-5 border-t border-[#F1F5F9] pt-6">
              <h3 className="font-sans font-bold text-base text-[#0F291B]">Scope Distribution</h3>
              
              <div className="space-y-4">
                {/* Scope 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-[#0F291B]">Scope 1 (Direct Fuel Burning)</span>
                    <span className="font-mono font-semibold text-amber">{results.scope1} tCO2e ({results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope1 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-[#0F291B]">Scope 2 (Electricity Consumption)</span>
                    <span className="font-mono font-semibold text-emerald">{results.scope2} tCO2e ({results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope2 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-[#0F291B]">Scope 3 (Supply Chain & Business travel)</span>
                    <span className="font-mono font-semibold text-purple-600">{results.scope3} tCO2e ({results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope3 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Breakdown Grid */}
            <div className="border-t border-[#F1F5F9] pt-6 space-y-4">
              <h3 className="font-sans font-bold text-base text-[#0F291B]">Activity Emission Logs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">Diesel</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.diesel) || 0) * ef.diesel / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">Petrol</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.petrol) || 0) * ef.petrol / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">LPG Gas</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.lpg) || 0) * ef.lpg / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">Electricity</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.electricity) || 0) * ef.electricity / 1000).toFixed(2)} tCO2e</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* -------------------- TAB CONTENT: TEAM -------------------- */}
        {activeMenu === 'Team' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-sans font-bold text-3xl text-[#0F291B]">ESG Audit Team</h1>
                <p className="text-sm text-[#64748B] mt-1 font-sans">Manage corporate accounts, permissions, and verifiers.</p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="bg-[#0F291B] hover:bg-[#1A4B31] text-white font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase())).map((member, i) => (
                <div key={i} className="border border-[#E2E8F0] rounded-2xl p-5 space-y-4 relative flex flex-col justify-between">
                  <button 
                    onClick={() => removeMember(member.name)}
                    className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#EF4444]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald/20">
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-[#0F291B]">{member.name}</h4>
                      <p className="text-xs text-[#64748B]">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-[#F1F5F9] pt-3 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Email:</span>
                      <span className="font-mono text-[#0F291B]">{member.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Access:</span>
                      <span className="font-bold text-[#0F291B]">{member.permission}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Status:</span>
                      <button 
                        onClick={() => toggleMemberStatus(member.name)}
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          member.status === 'Active' 
                            ? 'bg-emerald/10 text-emerald border-emerald/20' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {member.status}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: SETTINGS -------------------- */}
        {activeMenu === 'Settings' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">ESG Parameter Settings</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Configure GHG Protocol emission factors and reduction targets.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Target configurations */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-base text-[#0F291B] border-b border-[#F1F5F9] pb-2">Target Metrics</h3>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Corporate Reduction Target (%)</label>
                  <input 
                    type="number"
                    value={reductionTarget}
                    onChange={(e) => setReductionTarget(e.target.value)}
                    className="w-full max-w-xs text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  />
                  <p className="text-[10px] text-[#64748B] mt-1">This configures the target carbon footprint reduction card on the dashboard.</p>
                </div>
              </div>

              {/* Emission Factors grid */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-base text-[#0F291B] border-b border-[#F1F5F9] pb-2">GHG Emission Factors (EF)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Diesel (kg CO₂e/L)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.diesel}
                      onChange={(e) => setEf({ ...ef, diesel: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Petrol (kg CO₂e/L)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.petrol}
                      onChange={(e) => setEf({ ...ef, petrol: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">LPG Gas (kg CO₂e/kg)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.lpg}
                      onChange={(e) => setEf({ ...ef, lpg: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Grid Power (kg CO₂e/kWh)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.electricity}
                      onChange={(e) => setEf({ ...ef, electricity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Commute (tCO₂e/emp/yr)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.employees}
                      onChange={(e) => setEf({ ...ef, employees: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Air Travel (kg CO₂e/km)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.airTravel}
                      onChange={(e) => setEf({ ...ef, airTravel: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="bg-[#0F291B] hover:bg-[#1A4B31] text-white font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-block"
              >
                Save Settings
              </button>

            </form>
          </div>
        )}

        {/* -------------------- TAB CONTENT: HELP -------------------- */}
        {activeMenu === 'Help' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">FAQ & GHG Guidelines</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Understand Scope definitions and carbon tracking calculations.</p>
            </div>

            {/* Accordion */}
            <div className="space-y-4 border-t border-[#F1F5F9] pt-4">
              {[
                {
                  q: "What is Scope 1 Direct Emissions?",
                  a: "Scope 1 emissions are direct greenhouse gas emissions from sources that are owned or controlled by the company. Examples include emissions from combustion in owned boilers, diesel generators, furnaces, and corporate vehicles."
                },
                {
                  q: "What is Scope 2 Indirect Electricity Emissions?",
                  a: "Scope 2 accounts for greenhouse gas emissions from the generation of purchased electricity, steam, heating, and cooling consumed by the reporting company. In Bangladesh, grid electricity factors average around 0.55 kgCO2e/kWh due to natural gas power station footprints."
                },
                {
                  q: "What is Scope 3 Value Chain Emissions?",
                  a: "Scope 3 emissions are a consequence of the activities of the company, but occur from sources not owned or controlled by it. Examples include employee business commutes, supplier raw material logistics (plastic, glass), and third party flights."
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-4 bg-[#F8F9FA] text-left text-xs font-sans font-bold text-[#0F291B]"
                  >
                    <span>{item.q}</span>
                    {faqOpen[idx] ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
                  </button>
                  {faqOpen[idx] && (
                    <div className="p-4 bg-white border-t border-[#E2E8F0] text-xs font-sans text-[#64748B] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="border-t border-[#F1F5F9] pt-6 space-y-4">
              <h3 className="font-sans font-bold text-sm text-[#0F291B]">Need help with auditing?</h3>
              <p className="text-xs text-[#64748B] font-sans">Our certified ESG specialists are available to review your corporate data streams.</p>
              <button 
                onClick={() => showToast("A support request has been sent. An ESG auditor will reach out soon.", "success")}
                className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors shadow-sm"
              >
                Consult CarbonOS Specialists
              </button>
            </div>

          </div>
        )}

      </main>

      {/* -------------------- ADD PROJECT MODAL DIALOG -------------------- */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-[#E2E8F0]">
            <button 
              onClick={() => setIsAddProjectOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F291B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-sans font-bold text-lg text-[#0F291B] flex items-center">
                <Building className="w-5 h-5 text-emerald mr-2" />
                Add Corporate Project
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">Register a regional emission monitoring offset project.</p>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Chittagong Mangrove Restoration" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Project Sector</label>
                <select 
                  value={newProject.sector}
                  onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] cursor-pointer"
                >
                  <option value="Solar Irrigation">Solar Irrigation</option>
                  <option value="Rice Methane">Rice Methane</option>
                  <option value="Clean Cookstoves">Clean Cookstoves</option>
                  <option value="Waste-To-Energy">Waste-To-Energy</option>
                  <option value="Mangrove Carbon">Mangrove Carbon</option>
                  <option value="Brick Kilns">Brick Kilns</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Annual Emission reduction Target (tCO2e/yr)</label>
                <input 
                  type="number" 
                  value={newProject.target}
                  onChange={(e) => setNewProject({ ...newProject, target: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0F291B] text-white font-bold py-2.5 rounded-xl hover:bg-[#1A4B31] transition-all shadow-md"
                >
                  Add Project
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddProjectOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- ADD MEMBER MODAL DIALOG -------------------- */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-[#E2E8F0]">
            <button 
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F291B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-sans font-bold text-lg text-[#0F291B] flex items-center">
                <Users className="w-5 h-5 text-emerald mr-2" />
                Add ESG Team Member
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">Invite a member to collaborate on corporate emissions data.</p>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Rafiqul Islam" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="e.g. rafiqul@carbonzero.io" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Role / Job Title</label>
                <input 
                  type="text" 
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="e.g. ESG Auditor" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Permission Level</label>
                <select 
                  value={newMember.permission}
                  onChange={(e) => setNewMember({ ...newMember, permission: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] cursor-pointer"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Editor">Editor (Read/Write)</option>
                  <option value="Auditor">Auditor (Verify Only)</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0F291B] text-white font-bold py-2.5 rounded-xl hover:bg-[#1A4B31] transition-all shadow-md"
                >
                  Invite Member
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SaaSDashboard;
