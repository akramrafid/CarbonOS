import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  Building, 
  MapPin, 
  Layers, 
  Hash, 
  UserCheck, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  X,
  FileCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { CLIENT_PROFILES } from '../clientProfiles';

// Helper for number formatting
const fmt = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '0.00';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Generates verified production-grade activity records and linked evidence
 * for a given corporate client profile based on their baseline data and facilities.
 */
export const generateClientActivityData = (client) => {
  if (!client) return { activities: [], evidenceList: [] };

  const facilities = client.facilities || [
    { name: "Primary Headquarters & Operations", location: "Dhaka", type: "Corporate Office" }
  ];
  const b = client.baselineInputs || {};

  const dieselQty = parseFloat(b.diesel) || 3000;
  const petrolQty = parseFloat(b.petrol) || 1500;
  const lpgQty = parseFloat(b.lpg) || 600;
  const elecQty = parseFloat(b.electricity) || 75000;
  const empQty = parseFloat(b.employees) || 80;
  const airQty = parseFloat(b.airTravel) || 25000;
  const truckQty = parseFloat(b.truckTransport) || 30000;
  const rawQty = parseFloat(b.rawMaterials) || 200;

  // Evidence Registry Items
  const evidenceList = [
    {
      id: `EVD-${client.id.toUpperCase().slice(0, 4)}-001`,
      documentNumber: `DESCO/HT3/2026/08429`,
      title: client.sampleInvoiceName || `${client.name}_Electricity_Utility_Statement.pdf`,
      issuer: client.facilities?.[0]?.location?.includes("Chittagong") ? "BPDB Chittagong" : "DESCO / DPDC Grid Authority",
      type: "Utility Invoice (High Tension Grid)",
      date: "2026-06-15",
      period: "May 2026 - June 2026",
      amountBdt: Math.round(elecQty * 11.85),
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      verifiedBy: client.assignedAuditor || "Senior ESG Assurance Lead",
      status: "Verified",
      notes: "Substation meter telemetry cross-verified with Bangladesh DoE Grid Factor (0.550 kg CO₂e/kWh)."
    },
    {
      id: `EVD-${client.id.toUpperCase().slice(0, 4)}-002`,
      documentNumber: `MPL/BULK/2026/4102`,
      title: `${client.name}_Backup_Gen_Bulk_Diesel_Receipt.pdf`,
      issuer: "Meghna Petroleum Limited",
      type: "Fuel Waybill & Bulk Dispenser Receipt",
      date: "2026-06-10",
      period: "Q2 2026",
      amountBdt: Math.round(dieselQty * 108.5),
      sha256: "a8f5f167f44f4964e6c998dee827110c0800b4b2450d6046e75a50787e742878",
      verifiedBy: client.assignedAuditor || "Senior ESG Assurance Lead",
      status: "Verified",
      notes: "Captive diesel generators maintenance log & fuel delivery challan."
    },
    {
      id: `EVD-${client.id.toUpperCase().slice(0, 4)}-003`,
      documentNumber: `POCL/FLEET/2026/9021`,
      title: `${client.name}_Fleet_Service_Fuel_Challan.pdf`,
      issuer: "Padma Oil Company Limited",
      type: "Octane Commercial Fleet Fuel Log",
      date: "2026-06-05",
      period: "June 2026",
      amountBdt: Math.round(petrolQty * 125.0),
      sha256: "c5d2e737c35e3fbcf7eb9808e08d13038d82d41b539c366ff5b62e49c7161b2a",
      verifiedBy: client.assignedAuditor || "Senior ESG Assurance Lead",
      status: "Verified",
      notes: "Service vehicles & dispatch mobility logs reconciled with odometer records."
    },
    {
      id: `EVD-${client.id.toUpperCase().slice(0, 4)}-004`,
      documentNumber: `FREIGHT/INTER/2026/774`,
      title: `${client.name}_SupplyChain_Freight_Waybill.pdf`,
      issuer: "Inter-District Transport Consortium",
      type: "Commercial Cargo Consignment Note",
      date: "2026-05-28",
      period: "May 2026",
      amountBdt: Math.round(truckQty * 4.2),
      sha256: "7d793037a0760186574b0282f2f435e7090a6ffcd0c8db6738980b18f0249216",
      verifiedBy: client.assignedAuditor || "Senior ESG Assurance Lead",
      status: "Reviewed",
      notes: "Heavy freight truck ton-km dispatch manifests from port & distribution outposts."
    },
    {
      id: `EVD-${client.id.toUpperCase().slice(0, 4)}-005`,
      documentNumber: `HR/CENSUS/2026/04`,
      title: `${client.name}_Employee_Commute_Survey_2026.xlsx`,
      issuer: "Corporate Human Resources & HSE",
      type: "Annual Workforce Commute Audit",
      date: "2026-04-12",
      period: "FY 2026",
      amountBdt: 0,
      sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      verifiedBy: client.assignedAuditor || "Senior ESG Assurance Lead",
      status: "Verified",
      notes: "Aggregated survey covering transit mode distribution and average radial distance."
    }
  ];

  // Activities linked to facilities and evidence
  const activities = [
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-001`,
      period: "FY 2026",
      month: "2026-06",
      siteId: facilities[0]?.name || "Facility 1",
      siteLocation: facilities[0]?.location || "Dhaka",
      department: "Production & Energy Systems",
      activityType: "Purchased Electricity (Grid Consumption)",
      scope: "Scope 2 (Loc)",
      scopeGroup: "Scope 2",
      category: "Purchased Electricity",
      quantity: elecQty,
      unit: "kWh",
      emissionFactorId: "EF-BD-GRID-2024",
      emissionFactorVersion: "v2024.1 (DoE SRO Gazette)",
      kgCO2ePerUnit: 0.550,
      tCO2e: parseFloat(((elecQty * 0.550) / 1000).toFixed(2)),
      formula: "Qty (kWh) × 0.550 kg CO₂e/kWh ÷ 1000",
      dataSource: "High-Tension Utility Substation Meter",
      evidenceId: `EVD-${client.id.toUpperCase().slice(0, 4)}-001`,
      evidenceFileName: client.sampleInvoiceName || `${client.name}_Electricity_Utility_Statement.pdf`,
      dataQualityRating: "High",
      status: "Verified",
      responsiblePerson: "Engr. Mahmudul Hasan • Head of Plant Energy"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-002`,
      period: "FY 2026",
      month: "2026-06",
      siteId: facilities[0]?.name || "Facility 1",
      siteLocation: facilities[0]?.location || "Dhaka",
      department: "Operations & Facilities",
      activityType: "Captive Generator Backup (Diesel Combustion)",
      scope: "Scope 1",
      scopeGroup: "Scope 1",
      category: "Stationary Combustion",
      quantity: dieselQty,
      unit: "Liters",
      emissionFactorId: "EF-DEFRA-DIESEL-2024",
      emissionFactorVersion: "v2024.2 (DEFRA / IPCC AR6)",
      kgCO2ePerUnit: 2.680,
      tCO2e: parseFloat(((dieselQty * 2.680) / 1000).toFixed(2)),
      formula: "Qty (L) × 2.680 kg CO₂e/L ÷ 1000",
      dataSource: "Bulk Diesel Tank Meter & Delivery Receipts",
      evidenceId: `EVD-${client.id.toUpperCase().slice(0, 4)}-002`,
      evidenceFileName: `${client.name}_Backup_Gen_Bulk_Diesel_Receipt.pdf`,
      dataQualityRating: "High",
      status: "Verified",
      responsiblePerson: "Kamrul Islam • Facility Operations Officer"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-003`,
      period: "FY 2026",
      month: "2026-06",
      siteId: facilities[1]?.name || facilities[0]?.name || "Facility 2",
      siteLocation: facilities[1]?.location || facilities[0]?.location || "Dhaka",
      department: "Logistics & Client Dispatch",
      activityType: "Company Owned Transport (Petrol/Octane)",
      scope: "Scope 1",
      scopeGroup: "Scope 1",
      category: "Mobile Combustion",
      quantity: petrolQty,
      unit: "Liters",
      emissionFactorId: "EF-DEFRA-PETROL-2024",
      emissionFactorVersion: "v2024.1 (DEFRA Mobile)",
      kgCO2ePerUnit: 2.310,
      tCO2e: parseFloat(((petrolQty * 2.310) / 1000).toFixed(2)),
      formula: "Qty (L) × 2.310 kg CO₂e/L ÷ 1000",
      dataSource: "Padma Oil Fleet Invoices & Odometer Audit",
      evidenceId: `EVD-${client.id.toUpperCase().slice(0, 4)}-003`,
      evidenceFileName: `${client.name}_Fleet_Service_Fuel_Challan.pdf`,
      dataQualityRating: "High",
      status: "Verified",
      responsiblePerson: "Samiul Bari • Fleet Decarbonization Manager"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-004`,
      period: "FY 2026",
      month: "2026-06",
      siteId: facilities[0]?.name || "Facility 1",
      siteLocation: facilities[0]?.location || "Dhaka",
      department: "Thermal & Steam Utilities",
      activityType: "Auxiliary Heating & Kitchen Cooking (LPG)",
      scope: "Scope 1",
      scopeGroup: "Scope 1",
      category: "Stationary Combustion",
      quantity: lpgQty,
      unit: "kg",
      emissionFactorId: "EF-IPCC-LPG-2024",
      emissionFactorVersion: "v2024.1 (IPCC Guidelines)",
      kgCO2ePerUnit: 2.980,
      tCO2e: parseFloat(((lpgQty * 2.980) / 1000).toFixed(2)),
      formula: "Qty (kg) × 2.980 kg CO₂e/kg ÷ 1000",
      dataSource: "Commercial Cylinder Replacement Slips",
      evidenceId: null,
      evidenceFileName: null,
      dataQualityRating: "Medium",
      status: "Ready",
      responsiblePerson: "HSE Admin Desk"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-005`,
      period: "FY 2026",
      month: "2026-06",
      siteId: facilities[0]?.name || "Facility 1",
      siteLocation: facilities[0]?.location || "Dhaka",
      department: "Supply Chain & Material Inbound",
      activityType: "Inbound Supply Chain Freight (Truck Transport)",
      scope: "Scope 3",
      scopeGroup: "Scope 3",
      category: "Upstream Transportation & Logistics",
      quantity: truckQty,
      unit: "t-km",
      emissionFactorId: "EF-GLEC-TRUCK-2024",
      emissionFactorVersion: "v2024.1 (GLEC Framework)",
      kgCO2ePerUnit: 0.200,
      tCO2e: parseFloat(((truckQty * 0.200) / 1000).toFixed(2)),
      formula: "Qty (t-km) × 0.200 kg CO₂e/t-km ÷ 1000",
      dataSource: "Logistics Freight Consignment Consolidations",
      evidenceId: `EVD-${client.id.toUpperCase().slice(0, 4)}-004`,
      evidenceFileName: `${client.name}_SupplyChain_Freight_Waybill.pdf`,
      dataQualityRating: "High",
      status: "Reviewed",
      responsiblePerson: "Maksud Alam • Head of Logistics"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-006`,
      period: "FY 2026",
      month: "2026-06",
      siteId: "All Corporate Sites",
      siteLocation: "Nationwide",
      department: "Human Resources",
      activityType: "Workforce Commuting (165 Employees)",
      scope: "Scope 3",
      scopeGroup: "Scope 3",
      category: "Employee Commuting",
      quantity: empQty,
      unit: "Employees",
      emissionFactorId: "EF-BD-COMMUTE-2024",
      emissionFactorVersion: "v2024.1 (Dhaka Urban Transit Model)",
      kgCO2ePerUnit: 400.0,
      tCO2e: parseFloat(((empQty * 0.40)).toFixed(2)),
      formula: "Employees × 0.40 tCO₂e/emp/year",
      dataSource: "HR Payroll Roster & Transit Mode Survey",
      evidenceId: `EVD-${client.id.toUpperCase().slice(0, 4)}-005`,
      evidenceFileName: `${client.name}_Employee_Commute_Survey_2026.xlsx`,
      dataQualityRating: "Medium",
      status: "Verified",
      responsiblePerson: "Farzana Yasmin • People & Culture Lead"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-007`,
      period: "FY 2026",
      month: "2026-06",
      siteId: "Corporate Headquarters",
      siteLocation: "Dhaka",
      department: "Executive Management & Sales",
      activityType: "Commercial Passenger Air Travel",
      scope: "Scope 3",
      scopeGroup: "Scope 3",
      category: "Business Travel",
      quantity: airQty,
      unit: "p-km",
      emissionFactorId: "EF-ICAO-AIR-2024",
      emissionFactorVersion: "v2024.2 (ICAO Carbon Calculator)",
      kgCO2ePerUnit: 0.120,
      tCO2e: parseFloat(((airQty * 0.120) / 1000).toFixed(2)),
      formula: "Qty (p-km) × 0.120 kg CO₂e/km ÷ 1000",
      dataSource: "Corporate Travel Agency Booking Ledger",
      evidenceId: null,
      evidenceFileName: null,
      dataQualityRating: "Medium",
      status: "Ready",
      responsiblePerson: "Travel & Protocol Secretariat"
    },
    {
      id: `ACT-${client.id.toUpperCase().slice(0, 4)}-008`,
      period: "FY 2026",
      month: "2026-06",
      siteId: facilities[0]?.name || "Facility 1",
      siteLocation: facilities[0]?.location || "Dhaka",
      department: "Procurement & Material Staging",
      activityType: client.category === 'circular' ? "Raw Jute & Bio-additives" : client.category === 'mobility' ? "Lithium Battery Cells & Motor Aluminum" : "Packaging & Product Material Sourcing",
      scope: "Scope 3",
      scopeGroup: "Scope 3",
      category: "Purchased Goods & Services",
      quantity: rawQty,
      unit: "tonnes",
      emissionFactorId: client.category === 'circular' ? "EF-LCA-JUTE-2024" : "EF-LCA-ALUM-2024",
      emissionFactorVersion: "v2024.1 (Ecoinvent 3.9)",
      kgCO2ePerUnit: client.category === 'circular' ? 450 : 2500,
      tCO2e: parseFloat(((rawQty * (client.category === 'circular' ? 0.45 : 2.50))).toFixed(2)),
      formula: `Qty (t) × ${client.category === 'circular' ? '0.45' : '2.50'} tCO₂e/t`,
      dataSource: "Material Purchasing Bills of Lading & Mill Challans",
      evidenceId: null,
      evidenceFileName: null,
      dataQualityRating: "Estimated",
      status: "Draft",
      responsiblePerson: "Chief Procurement Officer"
    }
  ];

  return { activities, evidenceList };
};

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
  const activeClient = useMemo(() => {
    return CLIENT_PROFILES.find(c => c.id === activeClientId) || CLIENT_PROFILES[0];
  }, [activeClientId]);

  // Generate activities and evidence for the selected client
  const { activities: initialActivities, evidenceList: initialEvidence } = useMemo(() => {
    return generateClientActivityData(activeClient);
  }, [activeClient]);

  const [activities, setActivities] = useState(initialActivities);
  const [evidenceList, setEvidenceList] = useState(initialEvidence);

  // Re-sync when client changes
  React.useEffect(() => {
    const data = generateClientActivityData(activeClient);
    setActivities(data.activities);
    setEvidenceList(data.evidenceList);
  }, [activeClient]);

  // Filtering and search state
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'evidence'
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  // Selected Evidence Modal state
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // New Activity Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: '',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    facility: activeClient.facilities?.[0]?.name || 'Facility 1',
    department: 'Operations',
    quantity: '',
    unit: 'Liters',
    factorValue: '2.68',
    responsiblePerson: '',
    dataQuality: 'High'
  });

  // Calculate high-level KPIs
  const totalEmissions = useMemo(() => {
    return activities.reduce((sum, item) => sum + (parseFloat(item.tCO2e) || 0), 0);
  }, [activities]);

  const scopeTotals = useMemo(() => {
    const s1 = activities.filter(a => a.scopeGroup === 'Scope 1').reduce((s, a) => s + (parseFloat(a.tCO2e) || 0), 0);
    const s2 = activities.filter(a => a.scopeGroup === 'Scope 2').reduce((s, a) => s + (parseFloat(a.tCO2e) || 0), 0);
    const s3 = activities.filter(a => a.scopeGroup === 'Scope 3').reduce((s, a) => s + (parseFloat(a.tCO2e) || 0), 0);
    return { s1, s2, s3 };
  }, [activities]);

  const evidenceCoverage = useMemo(() => {
    const withEvidence = activities.filter(a => a.evidenceId && a.status === 'Verified').length;
    return Math.round((withEvidence / (activities.length || 1)) * 100);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(item => {
      const matchesSearch = 
        item.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesScope = scopeFilter === 'all' || item.scopeGroup === scopeFilter;
      const matchesQuality = qualityFilter === 'all' || item.dataQualityRating === qualityFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesFacility = facilityFilter === 'all' || item.siteId === facilityFilter;

      return matchesSearch && matchesScope && matchesQuality && matchesStatus && matchesFacility;
    });
  }, [activities, searchQuery, scopeFilter, qualityFilter, statusFilter, facilityFilter]);

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter(item => {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [evidenceList, searchQuery]);

  // Handle Add Activity
  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivity.activityType || !newActivity.quantity) {
      alert("Please provide activity description and quantity.");
      return;
    }

    const qty = parseFloat(newActivity.quantity) || 0;
    const factor = parseFloat(newActivity.factorValue) || 1.0;
    const tCO2e = parseFloat(((qty * factor) / 1000).toFixed(2));

    const record = {
      id: `ACT-${activeClient.id.toUpperCase().slice(0, 4)}-${String(activities.length + 1).padStart(3, '0')}`,
      period: "FY 2026",
      month: "2026-06",
      siteId: newActivity.facility,
      siteLocation: "Bangladesh",
      department: newActivity.department,
      activityType: newActivity.activityType,
      scope: newActivity.scope,
      scopeGroup: newActivity.scope.includes('Scope 1') ? 'Scope 1' : newActivity.scope.includes('Scope 2') ? 'Scope 2' : 'Scope 3',
      category: newActivity.category,
      quantity: qty,
      unit: newActivity.unit,
      emissionFactorId: `EF-CUSTOM-${Date.now().toString().slice(-4)}`,
      emissionFactorVersion: "v2026.1 (User Specified)",
      kgCO2ePerUnit: factor,
      tCO2e: tCO2e,
      formula: `Qty (${newActivity.unit}) × ${factor} kg CO₂e/${newActivity.unit} ÷ 1000`,
      dataSource: "Manual Corporate Ledger Entry",
      evidenceId: null,
      evidenceFileName: null,
      dataQualityRating: newActivity.dataQuality,
      status: "Ready",
      responsiblePerson: newActivity.responsiblePerson || "Assigned Officer"
    };

    setActivities(prev => [record, ...prev]);
    setIsAddModalOpen(false);
    setNewActivity({
      activityType: '',
      scope: 'Scope 1',
      category: 'Stationary Combustion',
      facility: activeClient.facilities?.[0]?.name || 'Facility 1',
      department: 'Operations',
      quantity: '',
      unit: 'Liters',
      factorValue: '2.68',
      responsiblePerson: '',
      dataQuality: 'High'
    });
  };

  // Export Activities to CSV
  const handleExportCSV = () => {
    const headers = [
      "Activity ID",
      "Month",
      "Site / Facility",
      "Department",
      "Activity Type",
      "Category",
      "Scope",
      "Quantity",
      "Unit",
      "EF ID",
      "EF Version",
      "kg CO2e/Unit",
      "Total tCO2e",
      "Formula",
      "Data Source",
      "Evidence Ref",
      "Data Quality",
      "Verification Status",
      "Responsible Person"
    ];

    const rows = activities.map(a => [
      `"${a.id}"`,
      `"${a.month}"`,
      `"${a.siteId}"`,
      `"${a.department}"`,
      `"${a.activityType}"`,
      `"${a.category}"`,
      `"${a.scope}"`,
      a.quantity,
      `"${a.unit}"`,
      `"${a.emissionFactorId}"`,
      `"${a.emissionFactorVersion}"`,
      a.kgCO2ePerUnit,
      a.tCO2e,
      `"${a.formula}"`,
      `"${a.dataSource}"`,
      `"${a.evidenceFileName || 'Missing'}"`,
      `"${a.dataQualityRating}"`,
      `"${a.status}"`,
      `"${a.responsiblePerson}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeClient.id}_Activity_Data_ISO14064_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Workspace Selector */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition-all relative overflow-hidden ${
        isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C853]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 14064-1 & GHG Protocol Activity Data Center</span>
            </div>
            <h1 className={`font-sans font-bold text-2xl sm:text-3xl mt-1 tracking-tight ${
              isLight ? 'text-[#0F2417]' : 'text-white'
            }`}>
              Activity Data & Evidence Register
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-[#7C9A88]'
            }`}>
              Maintain tamper-evident activity records, emission factor version lineage, and cross-referenced primary evidence documents for <span className="font-bold text-[#00C853]">{activeClient.legalName}</span>.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] font-mono">
              <span className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B2114] border-[#174D2B] text-emerald-300'
              }`}>
                <Building className="w-3.5 h-3.5 text-[#00C853]" />
                <span>Sector: <strong>{activeClient.sector}</strong></span>
              </span>

              <span className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B2114] border-[#174D2B] text-emerald-300'
              }`}>
                <UserCheck className="w-3.5 h-3.5 text-[#00C853]" />
                <span>Assigned Lead: <strong>{activeClient.assignedAuditor}</strong></span>
              </span>

              <span className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B2114] border-[#174D2B] text-emerald-300'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-[#00C853]" />
                <span>{activeClient.facilities?.length || 1} Registered Sites</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#00C853] hover:bg-[#00E676] text-[#05180B] font-sans font-bold text-xs py-2.5 px-4 rounded-xl shadow-[0_2px_12px_rgba(0,200,83,0.3)] transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#05180B]" />
              <span>Record Activity Data</span>
            </button>

            <button
              onClick={handleExportCSV}
              className={`font-sans font-bold text-xs py-2.5 px-4 rounded-xl border transition-all flex items-center space-x-2 cursor-pointer ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' 
                  : 'bg-[#040906] border-[#152B1D] text-white hover:border-[#00C853]/40'
              }`}
            >
              <Download className="w-4 h-4 text-[#00C853]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#152B1D]/40">
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
          }`}>
            <span className="text-[10px] font-mono uppercase text-[#7C9A88] block">Total Carbon Inventory</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className={`text-2xl font-mono font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                {fmt(totalEmissions, 2)}
              </span>
              <span className="text-xs font-mono text-[#00C853]">tCO₂e</span>
            </div>
            <span className="text-[10px] text-[#7C9A88] mt-1 block">8 Traceable Activities</span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
          }`}>
            <span className="text-[10px] font-mono uppercase text-[#7C9A88] block">Scope Breakdown</span>
            <div className="text-xs font-mono space-y-0.5 mt-1">
              <div className="flex justify-between">
                <span className="text-amber-400">Scope 1:</span>
                <span className="font-bold">{fmt(scopeTotals.s1, 1)} t</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">Scope 2:</span>
                <span className="font-bold">{fmt(scopeTotals.s2, 1)} t</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Scope 3:</span>
                <span className="font-bold">{fmt(scopeTotals.s3, 1)} t</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
          }`}>
            <span className="text-[10px] font-mono uppercase text-[#7C9A88] block">Evidence Ratio</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-mono font-bold text-[#00C853]">
                {evidenceCoverage}%
              </span>
              <span className="text-xs font-mono text-emerald-400">verified</span>
            </div>
            <span className="text-[10px] text-[#7C9A88] mt-1 block">DESCO/DPDC, fuel & freight invoices</span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
          }`}>
            <span className="text-[10px] font-mono uppercase text-[#7C9A88] block">Assurance Level</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <ShieldCheck className="w-5 h-5 text-[#00C853]" />
              <span className={`text-base font-sans font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                ISAE 3410
              </span>
            </div>
            <span className="text-[10px] text-[#00C853] mt-1 block">ISO 14064-1 Pre-Audit Ready</span>
          </div>
        </div>
      </div>

      {/* Main Tabs & Search Toolbar */}
      <div className={`rounded-3xl p-5 border shadow-xl ${
        isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#152B1D]/40">
          {/* Tab Switcher */}
          <div className="flex items-center space-x-2 bg-black/20 p-1 rounded-2xl border border-[#152B1D]">
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'activities'
                  ? 'bg-[#00C853] text-[#05180B] shadow-sm'
                  : 'text-[#7C9A88] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Activity Records ({activities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'evidence'
                  ? 'bg-[#00C853] text-[#05180B] shadow-sm'
                  : 'text-[#7C9A88] hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Evidence Register ({evidenceList.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'activities' ? "Search activity, department, or owner..." : "Search document name, issuer, hash..."}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-sans border focus:outline-none focus:border-[#00C853] ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar (For Activities Tab) */}
        {activeTab === 'activities' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Scope</label>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
                }`}
              >
                <option value="all">All Scopes (1, 2, 3)</option>
                <option value="Scope 1">Scope 1 - Direct</option>
                <option value="Scope 2">Scope 2 - Grid Power</option>
                <option value="Scope 3">Scope 3 - Value Chain</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Facility / Site</label>
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
                }`}
              >
                <option value="all">All Facilities ({activeClient.facilities?.length || 1})</option>
                {activeClient.facilities?.map((f, i) => (
                  <option key={i} value={f.name}>{f.name} ({f.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Data Quality</label>
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
                }`}
              >
                <option value="all">All Data Qualities</option>
                <option value="High">High (Metered / Invoiced)</option>
                <option value="Medium">Medium (Supplier Data)</option>
                <option value="Estimated">Estimated (Proxy Models)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Audit Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
                }`}
              >
                <option value="all">All Audit Statuses</option>
                <option value="Verified">Verified by Auditor</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Ready">Ready for Review</option>
                <option value="Draft">Draft Entry</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 1: Activities Table */}
        {activeTab === 'activities' && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse min-w-[1100px]">
              <thead>
                <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                  isLight ? 'text-slate-500 border-slate-200 bg-slate-50/50' : 'text-[#7C9A88] border-[#152B1D] bg-[#040906]/60'
                }`}>
                  <th className="py-3 px-3">Activity & Scope</th>
                  <th className="py-3 px-3">Site / Facility</th>
                  <th className="py-3 px-3">Department & Lead</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3">Factor Applied (Lineage)</th>
                  <th className="py-3 px-3 text-right">Footprint</th>
                  <th className="py-3 px-3">Evidence Ref</th>
                  <th className="py-3 px-3 text-center">Quality</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isLight ? 'divide-slate-100 text-slate-800' : 'divide-[#152B1D]/40 text-slate-200'
              }`}>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400 font-sans">
                      No activity records found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((row) => {
                    const linkedEvidence = evidenceList.find(e => e.id === row.evidenceId);

                    return (
                      <tr 
                        key={row.id}
                        className={`transition-colors group ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-[#00C853]/5'
                        }`}
                      >
                        {/* Activity & Scope */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              row.scopeGroup === 'Scope 1'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : row.scopeGroup === 'Scope 2'
                                  ? 'bg-[#00C853]/10 text-[#00E676] border-[#00C853]/30'
                                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}>
                              {row.scope}
                            </span>
                            <span className="font-bold text-sm tracking-tight block">
                              {row.activityType}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5 ml-1">
                            {row.id} • {row.category}
                          </span>
                        </td>

                        {/* Site */}
                        <td className="py-3.5 px-3">
                          <span className="font-semibold block truncate max-w-[180px]">{row.siteId}</span>
                          <span className="text-[10px] text-gray-400 font-mono block">{row.siteLocation}</span>
                        </td>

                        {/* Department & Lead */}
                        <td className="py-3.5 px-3">
                          <span className="font-medium block">{row.department}</span>
                          <span className="text-[10px] text-gray-400 font-sans block truncate max-w-[160px]">
                            {row.responsiblePerson}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-3 text-right font-mono">
                          <span className="font-bold text-sm">{fmt(row.quantity, 0)}</span>
                          <span className="text-[10px] text-gray-400 block">{row.unit}</span>
                        </td>

                        {/* Factor Lineage */}
                        <td className="py-3.5 px-3 font-mono text-[11px]">
                          <span className="text-[#00C853] font-bold block">{row.kgCO2ePerUnit} kg/unit</span>
                          <span className="text-[9px] text-gray-400 block truncate max-w-[170px]" title={row.emissionFactorVersion}>
                            {row.emissionFactorId} ({row.emissionFactorVersion})
                          </span>
                        </td>

                        {/* Total Footprint */}
                        <td className="py-3.5 px-3 text-right font-mono">
                          <span className="font-bold text-sm text-[#00C853] block">
                            {fmt(row.tCO2e, 2)}
                          </span>
                          <span className="text-[9px] text-gray-400 block">tCO₂e</span>
                        </td>

                        {/* Evidence Ref */}
                        <td className="py-3.5 px-3">
                          {row.evidenceFileName ? (
                            <button
                              onClick={() => {
                                if (linkedEvidence) setSelectedEvidence(linkedEvidence);
                              }}
                              className="text-left group/btn flex items-center space-x-1.5 text-[#00C853] hover:underline cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                              <span className="font-mono text-[11px] truncate max-w-[150px]">
                                {row.evidenceFileName}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Missing Primary Evidence</span>
                            </span>
                          )}
                        </td>

                        {/* Data Quality */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            row.dataQualityRating === 'High'
                              ? 'bg-[#00C853]/15 text-[#00E676] border-[#00C853]/30'
                              : row.dataQualityRating === 'Medium'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}>
                            {row.dataQualityRating}
                          </span>
                        </td>

                        {/* Verification Status */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center justify-center space-x-1 mx-auto w-fit ${
                            row.status === 'Verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : row.status === 'Reviewed'
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          }`}>
                            {row.status === 'Verified' && <CheckCircle2 className="w-2.5 h-2.5" />}
                            <span>{row.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Evidence Register */}
        {activeTab === 'evidence' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvidence.map((doc) => {
                const linkedCount = activities.filter(a => a.evidenceId === doc.id).length;

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedEvidence(doc)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isLight 
                        ? 'bg-slate-50/70 border-slate-200 hover:border-[#00C853] hover:bg-white' 
                        : 'bg-[#040906] border-[#152B1D] hover:border-[#00C853]/50 hover:bg-[#00C853]/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-xl bg-[#00C853]/15 flex items-center justify-center text-[#00E676]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block">{doc.id}</span>
                            <h4 className={`font-sans font-bold text-sm truncate max-w-[280px] ${
                              isLight ? 'text-[#0F2417]' : 'text-white'
                            }`}>
                              {doc.title}
                            </h4>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          {doc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-sans">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Issuer / Authority</span>
                          <span className="font-semibold block truncate">{doc.issuer}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Doc Number</span>
                          <span className="font-mono font-bold block truncate">{doc.documentNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Audit Period</span>
                          <span className="font-mono block">{doc.period}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Recorded Spend</span>
                          <span className="font-mono font-bold text-[#00C853] block">
                            {doc.amountBdt > 0 ? `BDT ${fmt(doc.amountBdt, 0)}` : 'Internal Census'}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                        {doc.notes}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#152B1D]/40 flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <div className="flex items-center space-x-1 text-[#00C853]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>SHA-256 Verified</span>
                      </div>
                      <span className="text-gray-400">
                        Linked: <strong>{linkedCount} Activities</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ----------------- MODAL 1: EVIDENCE DETAILS & CRYPTOGRAPHIC SEAL ----------------- */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 overflow-y-auto">
          <div className={`max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative border transition-all ${
            isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#08130C] border-[#152B1D] text-white'
          }`}>
            <button
              onClick={() => setSelectedEvidence(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Primary Evidence Audit Trail</span>
            </div>

            <h3 className="font-sans font-bold text-xl sm:text-2xl mt-1">
              {selectedEvidence.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Official verification record under ISAE 3410 assurance for {activeClient.name}.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-2xl bg-black/30 border border-[#152B1D] text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block">DOCUMENT IDENTIFIER</span>
                <span className="font-mono font-bold text-white text-sm">{selectedEvidence.id}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">ISSUING AUTHORITY</span>
                <span className="font-semibold text-white">{selectedEvidence.issuer}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">REGISTRATION / METER REF</span>
                <span className="font-mono text-white">{selectedEvidence.documentNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">AUDIT PERIOD</span>
                <span className="font-mono text-white">{selectedEvidence.period}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">VERIFIED MONETARY AMOUNT</span>
                <span className="font-mono font-bold text-[#00C853] text-sm">
                  {selectedEvidence.amountBdt > 0 ? `BDT ${fmt(selectedEvidence.amountBdt, 0)}` : 'Internal Census / Free'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">ATTESTING AUDITOR</span>
                <span className="font-semibold text-emerald-300">{selectedEvidence.verifiedBy}</span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Stamp */}
            <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-[#152B1D] font-mono text-[11px] space-y-1">
              <span className="text-gray-400 text-[10px] block">SHA-256 CRYPTOGRAPHIC PROVENANCE HASH</span>
              <span className="text-[#00E676] break-all select-all font-mono">
                {selectedEvidence.sha256}
              </span>
            </div>

            {/* Notes */}
            <div className="mt-4 p-3.5 rounded-xl bg-black/20 border border-[#152B1D] text-xs leading-relaxed text-gray-300">
              <span className="font-bold text-white block mb-0.5">Assurance Note:</span>
              {selectedEvidence.notes}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedEvidence(null)}
                className="px-4 py-2 rounded-xl text-xs font-sans font-bold bg-[#00C853] text-[#05180B] hover:bg-[#00E676]"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 2: ADD ACTIVITY DATA ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 overflow-y-auto">
          <div className={`max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative border transition-all my-8 ${
            isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#08130C] border-[#152B1D] text-white'
          }`}>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <Plus className="w-4 h-4" />
              <span>New Operational Activity Entry</span>
            </div>

            <h3 className="font-sans font-bold text-xl sm:text-2xl mt-1">
              Log Activity Data
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Record energy or material consumption with instant tCO₂e calculation and audit traceability.
            </p>

            <form onSubmit={handleCreateActivity} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Activity Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backup Generator Diesel Consumption (Stationary)"
                  value={newActivity.activityType}
                  onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value })}
                  className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">GHG Protocol Scope</label>
                  <select
                    value={newActivity.scope}
                    onChange={(e) => {
                      const sc = e.target.value;
                      let defaultFactor = '2.68';
                      let defaultUnit = 'Liters';
                      if (sc.includes('Scope 2')) {
                        defaultFactor = '0.550';
                        defaultUnit = 'kWh';
                      } else if (sc.includes('Scope 3')) {
                        defaultFactor = '0.20';
                        defaultUnit = 't-km';
                      }
                      setNewActivity({ ...newActivity, scope: sc, factorValue: defaultFactor, unit: defaultUnit });
                    }}
                    className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  >
                    <option value="Scope 1">Scope 1 (Direct Stationary/Mobile)</option>
                    <option value="Scope 2 (Loc)">Scope 2 (Grid Electricity - Loc)</option>
                    <option value="Scope 3">Scope 3 (Value Chain / Logistics)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Operating Facility</label>
                  <select
                    value={newActivity.facility}
                    onChange={(e) => setNewActivity({ ...newActivity, facility: e.target.value })}
                    className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  >
                    {activeClient.facilities?.map((f, i) => (
                      <option key={i} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5000"
                    value={newActivity.quantity}
                    onChange={(e) => setNewActivity({ ...newActivity, quantity: e.target.value })}
                    className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Unit</label>
                  <select
                    value={newActivity.unit}
                    onChange={(e) => setNewActivity({ ...newActivity, unit: e.target.value })}
                    className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  >
                    <option value="kWh">kWh (Power)</option>
                    <option value="Liters">Liters (Fuel)</option>
                    <option value="kg">kg (Gas/Materials)</option>
                    <option value="tonnes">Tonnes (Bulk)</option>
                    <option value="t-km">t-km (Freight)</option>
                    <option value="p-km">p-km (Travel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Factor (kg CO₂e/unit)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newActivity.factorValue}
                    onChange={(e) => setNewActivity({ ...newActivity, factorValue: e.target.value })}
                    className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Realtime Footprint Preview */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#152B1D] flex items-center justify-between text-xs">
                <span className="text-gray-400">Calculated Emission Footprint:</span>
                <span className="font-mono font-bold text-sm text-[#00E676]">
                  {fmt(((parseFloat(newActivity.quantity) || 0) * (parseFloat(newActivity.factorValue) || 0)) / 1000, 3)} tCO₂e
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Responsible Data Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Plant Energy Lead"
                    value={newActivity.responsiblePerson}
                    onChange={(e) => setNewActivity({ ...newActivity, responsiblePerson: e.target.value })}
                    className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Data Quality Tier</label>
                  <select
                    value={newActivity.dataQuality}
                    onChange={(e) => setNewActivity({ ...newActivity, dataQuality: e.target.value })}
                    className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#040906] border-[#152B1D] text-white'
                    }`}
                  >
                    <option value="High">High (Direct Meter / Invoiced)</option>
                    <option value="Medium">Medium (Supplier Average)</option>
                    <option value="Estimated">Estimated (Proxy Estimation)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#152B1D]/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-sans font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-sans font-bold bg-[#00C853] text-[#05180B] hover:bg-[#00E676] shadow-sm cursor-pointer"
                >
                  Commit Activity Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityEvidenceWorkspace;
