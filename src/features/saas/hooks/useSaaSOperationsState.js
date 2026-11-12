import { useState } from 'react';

export const useSaaSOperationsState = (showToast) => {
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [downloadingApp, setDownloadingApp] = useState(false);

  // Modals state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', sector: 'Solar Irrigation', target: '300' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Auditor', email: '', permission: 'Auditor' });

  // Interactive Checklist Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload Q2 Boiler Fuel statements', completed: true },
    { id: 2, text: 'Verify Scope 3 Cargo Commutes', completed: false },
    { id: 3, text: 'Purchase offsets for raw materials (plastic)', completed: false },
    { id: 4, text: 'Verify Solar Branch 2 generation statements', completed: false },
    { id: 5, text: 'Calibrate Blynk IoT Node 4 sensor stream', completed: false }
  ]);
  const [taskInput, setTaskInput] = useState('');

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
  const [calendarEvents] = useState({
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

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

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

  return {
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
    tasks,
    setTasks,
    taskInput,
    setTaskInput,
    notifications,
    setNotifications,
    teamMembers,
    projects,
    calendarEvents,
    selectedCalendarDay,
    setSelectedCalendarDay,
    reductionTarget,
    setReductionTarget,
    faqOpen,
    toggleTask,
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
    openTasksCount
  };
};
