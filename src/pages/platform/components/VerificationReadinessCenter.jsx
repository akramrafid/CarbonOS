import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  RefreshCw, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Building, 
  Database, 
  Send, 
  Plus, 
  Layers, 
  Award, 
  Globe, 
  ArrowUpRight, 
  Clock, 
  FileCheck, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { CLIENT_PROFILES } from '../clientProfiles';
import { generateClientActivityData } from './ActivityEvidenceWorkspace';

export const VerificationReadinessCenter = ({
  activeClientId = 'polyjute',
  isLight = false,
  locale = 'en',
  currency = 'BDT',
  showToast = (msg, type) => console.log(msg, type)
}) => {
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'datagaps' | 'inquiries' | 'baseyear' | 'cbam' | 'signoff'
  const [isAuditorLocked, setIsAuditorLocked] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Active Client Data
  const client = useMemo(() => {
    return CLIENT_PROFILES.find(c => c.id === activeClientId) || CLIENT_PROFILES[0];
  }, [activeClientId]);

  // Client Activity & Evidence items
  const clientActivity = useMemo(() => {
    return generateClientActivityData(client);
  }, [client]);

  // Base Year Recalculation State
  const [baseYear, setBaseYear] = useState(client.baselineYear || 2024);
  const [baseYearEmissions, setBaseYearEmissions] = useState(
    client.emissionsBreakdown 
      ? client.emissionsBreakdown.scope1 + client.emissionsBreakdown.scope2 + (client.emissionsBreakdown.scope3 || 0)
      : 1250.0
  );
  const [structuralChangeTco2e, setStructuralChangeTco2e] = useState(0);
  const [structuralChangeReason, setStructuralChangeReason] = useState('Acquisition of auxiliary processing plant');

  // CBAM State
  const [cbamSector, setCbamSector] = useState(client.sector.includes('Packaging') ? 'Jute & Polymer Composites' : 'Steel & Industrial Metals');
  const [cbamExportTons, setCbamExportTons] = useState(1500);
  const [cbamElectricityOrigin, setCbamElectricityOrigin] = useState('National Grid (DoE Bangladesh 0.550 kg/kWh)');

  // Verifier Checklist Items (8-point ISO 14064-1 & GHG Protocol assurance protocol)
  const [checklist, setChecklist] = useState([
    {
      id: 'chk-1',
      code: 'ISO-14064-4.1',
      title: 'Organizational Boundary Definition',
      description: 'Formal adoption of Operational Control consolidation approach across all active facilities, subsidiaries, and leased assets.',
      owner: 'Chief Sustainability Officer',
      status: 'Verified',
      evidenceRef: 'DOC-BND-2026-01',
      requiredForAssurance: 'Limited & Reasonable'
    },
    {
      id: 'chk-2',
      code: 'ISO-14064-5.1',
      title: 'Scope 1 Direct Combustion Inventory',
      description: '100% accounting of stationary diesel generators, LPG process heating, and company-owned vehicle fleet fuel manifests.',
      owner: 'Facilities Director',
      status: 'Verified',
      evidenceRef: 'EV-DSL-2026-Q1',
      requiredForAssurance: 'Reasonable'
    },
    {
      id: 'chk-3',
      code: 'GHG-SCOPE2-DUAL',
      title: 'Scope 2 Dual-Reporting (Location & Market)',
      description: 'Location-based reporting via DoE grid factor (0.550 kg CO₂e/kWh) plus market-based contractual green tariff / solar PPA adjustments.',
      owner: 'Lead ESG Controller',
      status: 'Verified',
      evidenceRef: 'EV-UTIL-DESCO-HT',
      requiredForAssurance: 'Limited & Reasonable'
    },
    {
      id: 'chk-4',
      code: 'ISO-14064-5.2',
      title: 'Scope 3 Materiality & Screening Criteria',
      description: 'Documented threshold screening for upstream supplier logistics, raw material acquisition, waste treatment, and employee commuting.',
      owner: 'Supply Chain Auditor',
      status: 'Ready',
      evidenceRef: 'SCR-3-MAT-04',
      requiredForAssurance: 'Limited & Reasonable'
    },
    {
      id: 'chk-5',
      code: 'ISO-14064-6.2',
      title: 'Emission Factor Lineage & Version Control',
      description: 'All emission factors tagged with source authority (Bangladesh DoE 2024, IPCC AR6, DEFRA 2025) with immutable version lock.',
      owner: 'Data Architect',
      status: 'Verified',
      evidenceRef: 'EF-REG-v2024.1',
      requiredForAssurance: 'Reasonable'
    },
    {
      id: 'chk-6',
      code: 'ISAE-3410-EV',
      title: 'Primary Evidence Document Coverage',
      description: 'At least 95% of total gross emissions supported by primary utility statements, delivery challans, or meter telemetry.',
      owner: 'Internal QA Manager',
      status: 'Needs Review',
      evidenceRef: 'AUD-REG-COV-96',
      requiredForAssurance: 'Reasonable'
    },
    {
      id: 'chk-7',
      code: 'GHG-CORP-CH5',
      title: 'Base Year Recalculation Threshold Policy',
      description: 'Formal policy establishing >5% cumulative structural emission variance trigger for baseline recalculation.',
      owner: 'Chief Financial Officer',
      status: 'Ready',
      evidenceRef: 'POL-BASE-REC-02',
      requiredForAssurance: 'Limited & Reasonable'
    },
    {
      id: 'chk-8',
      code: 'ISO-14064-7.3',
      title: 'Uncertainty & Data Quality Scoring',
      description: 'Qualitative and quantitative uncertainty assessment (Data Quality Indicators: High, Medium, Estimated) across all categories.',
      owner: 'Lead Verifier',
      status: 'Verified',
      evidenceRef: 'UNC-ASSESS-2026',
      requiredForAssurance: 'Reasonable'
    }
  ]);

  // Verifier Questions & Inquiry Register
  const [inquiries, setInquiries] = useState([
    {
      id: 'inq-1',
      verifier: 'SGS / Bureau Veritas Assurance Team',
      question: 'What is the institutional basis for the Scope 2 electricity grid factor in Bangladesh?',
      response: 'The factor 0.550 kg CO₂e/kWh is published by the Department of Environment (DoE), Ministry of Environment, Forest and Climate Change, Government of Bangladesh in the 2024 National Grid Carbon Intensity Baseline Report. All meter billing reconciles with DESCO / DPDC bulk power utility accounts.',
      status: 'Addressed',
      date: '2026-03-28'
    },
    {
      id: 'inq-2',
      verifier: 'DNV GL Lead GHG Verifier',
      question: 'How do you prevent double-counting between company fleet transport and contractor third-party logistics?',
      response: 'Vehicles owned or under long-term operational lease are tracked under Scope 1 mobile combustion through fuel challans. Third-party logistics (trucks and maritime shipping) are categorized under Scope 3, Category 4 (Upstream Transportation) based on t-km delivery waybills with verified DEFRA freight factors.',
      status: 'Addressed',
      date: '2026-04-02'
    },
    {
      id: 'inq-3',
      verifier: 'TÜV SÜD ESG Auditor',
      question: 'Has the base year inventory been adjusted for any recent corporate acquisitions or site divestments?',
      response: 'The company follows the GHG Protocol 5% cumulative significance rule. The baseline recalculation policy is managed in the CarbonZero BD ledger and reflects operational adjustments documented in Board Resolution ESG-2025-BR03.',
      status: 'Under Review',
      date: '2026-04-10'
    }
  ]);

  const [newInquiryQuestion, setNewInquiryQuestion] = useState('');
  const [newInquiryVerifier, setNewInquiryVerifier] = useState('');

  // Handle Checklist Status Change
  const handleToggleChecklistStatus = (id) => {
    if (isAuditorLocked) {
      showToast('Workspace is in Auditor View Lock mode. Status cannot be modified.', 'error');
      return;
    }
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Verified' ? 'Needs Review' : item.status === 'Needs Review' ? 'Ready' : 'Verified';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    showToast('Checklist item status updated', 'success');
  };

  // Calculate Verification Readiness Percentage
  const readinessStats = useMemo(() => {
    const verifiedCount = checklist.filter(i => i.status === 'Verified').length;
    const readyCount = checklist.filter(i => i.status === 'Ready').length;
    const score = Math.round(((verifiedCount * 1.0 + readyCount * 0.5) / checklist.length) * 100);
    return { verifiedCount, readyCount, total: checklist.length, score };
  }, [checklist]);

  // Data Gap Analysis (from client's activities)
  const dataGapSummary = useMemo(() => {
    const missingEvidence = clientActivity.filter(a => !a.evidenceFileReference);
    const estimatedQuality = clientActivity.filter(a => a.dataQualityRating === 'Estimated');
    const draftStatus = clientActivity.filter(a => a.verificationStatus === 'Draft');

    return {
      missingEvidence,
      estimatedQuality,
      draftStatus,
      totalGaps: missingEvidence.length + estimatedQuality.length + draftStatus.length
    };
  }, [clientActivity]);

  // Base Year Variance calculation
  const baseYearRecalculation = useMemo(() => {
    const currentAdjusted = baseYearEmissions + structuralChangeTco2e;
    const percentChange = baseYearEmissions > 0 
      ? ((structuralChangeTco2e / baseYearEmissions) * 100).toFixed(2)
      : '0.00';
    const exceedsThreshold = Math.abs(parseFloat(percentChange)) >= 5.0;

    return {
      original: baseYearEmissions,
      adjustment: structuralChangeTco2e,
      adjustedTotal: currentAdjusted,
      percentChange,
      exceedsThreshold
    };
  }, [baseYearEmissions, structuralChangeTco2e]);

  // CBAM Calculation
  const cbamResult = useMemo(() => {
    // Embedded intensity factor based on commodity
    let factor = 1.85; // default steel
    if (cbamSector.includes('Jute') || cbamSector.includes('Polymer')) factor = 0.88;
    else if (cbamSector.includes('Aluminium')) factor = 6.42;
    else if (cbamSector.includes('Cement')) factor = 0.92;
    else if (cbamSector.includes('Fertilizer')) factor = 2.15;

    const embeddedEmissions = (cbamExportTons * factor).toFixed(2);
    const euEtsBenchmarkAllowance = (cbamExportTons * (factor * 0.72)).toFixed(2);
    const netCbamCertificatesNeeded = Math.max(0, parseFloat((embeddedEmissions - euEtsBenchmarkAllowance).toFixed(2)));

    return {
      factor,
      embeddedEmissions,
      euEtsBenchmarkAllowance,
      netCbamCertificatesNeeded
    };
  }, [cbamSector, cbamExportTons]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className={`space-y-8 font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
      
      {/* -------------------- HEADER BANNER & CONTROLS -------------------- */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
        isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
      }`}>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 14064-1 & GHG Protocol Assurance Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 flex items-center gap-3">
              <span>Verification Readiness Center</span>
              <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${
                readinessStats.score >= 80 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {readinessStats.score}% Assurance Ready
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Auditor-grade verification workspace for <strong className="text-white font-semibold">{client.name}</strong>. Reconciles primary activity evidence, gap analyses, base-year recalculations, and verifier inquiry trails prior to external third-party assurance.
            </p>
          </div>

          {/* Action Tools & Lock Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Auditor View Lock */}
            <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border transition-all ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
            }`}>
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                {isAuditorLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
                <span className="text-xs">Auditor View Lock:</span>
              </div>
              <button 
                onClick={() => {
                  setIsAuditorLocked(!isAuditorLocked);
                  showToast(
                    !isAuditorLocked 
                      ? 'Auditor View Lock enabled. All metrics and inventory states frozen for verification.' 
                      : 'Auditor View Lock disabled. Editing and uploading unlocked.',
                    'info'
                  );
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
                  isAuditorLocked ? 'bg-[#00C853]' : 'bg-gray-700'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                  isAuditorLocked ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Quick Export Statement */}
            <button
              onClick={() => setActiveTab('signoff')}
              className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-white" />
              <span>Verifier Statement</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Assurance Level Target</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">Reasonable Assurance</span>
            <span className="text-[10px] text-emerald-400 font-mono">ISAE 3410 / ISO 14064-3</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Checklist Items Verified</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">{readinessStats.verifiedCount} / {readinessStats.total}</span>
            <span className="text-[10px] text-gray-400 font-mono">{readinessStats.readyCount} pending final review</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Primary Evidence Coverage</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">96.4% Gross Footprint</span>
            <span className="text-[10px] text-emerald-400 font-mono">Exceeds 95% threshold</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Active Data Gaps</span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${dataGapSummary.totalGaps > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {dataGapSummary.totalGaps} Identified
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {dataGapSummary.missingEvidence.length} missing docs
            </span>
          </div>
        </div>
      </div>

      {/* -------------------- WORKSPACE SUB-NAVIGATION TABS -------------------- */}
      <div className="flex border-b border-white/10 space-x-1 sm:space-x-3 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'checklist', label: '1. ISO 14064 Checklist', count: checklist.length },
          { id: 'datagaps', label: '2. Data Gap Analyzer', count: dataGapSummary.totalGaps, badgeColor: dataGapSummary.totalGaps > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300' },
          { id: 'inquiries', label: '3. Verifier Inquiries (Q&A)', count: inquiries.length },
          { id: 'baseyear', label: '4. Base Year Recalculation (>5%)' },
          { id: 'cbam', label: '5. EU CBAM Customs Export' },
          { id: 'signoff', label: '6. Attestation Statement' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl transition-all font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? (isLight ? 'bg-white border-t-2 border-[#00C853] text-[#0A2E19] shadow-sm font-bold' : 'bg-[#08130C] border-t-2 border-[#00E676] text-white font-bold')
                : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white')
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${tab.badgeColor || 'bg-white/10 text-gray-300'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* -------------------- TAB 1: ISO 14064 CHECKLIST -------------------- */}
      {activeTab === 'checklist' && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-lg">ISO 14064-1 & GHG Protocol Assurance Verification Checklist</h3>
              <p className="text-xs text-gray-400 mt-0.5">8-point mandatory criteria for limited and reasonable assurance verification.</p>
            </div>
            <div className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              Click status pill to toggle review state
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {checklist.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00C853]/15 text-[#00E676] border border-[#00C853]/30 font-bold">
                      {item.code}
                    </span>
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">({item.requiredForAssurance})</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.description}</p>
                  <div className="flex items-center space-x-4 text-[10px] text-gray-400 font-mono pt-1">
                    <span>Owner: <strong className="text-gray-300">{item.owner}</strong></span>
                    <span>Evidence Ref: <strong className="text-emerald-400">{item.evidenceRef}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleToggleChecklistStatus(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      item.status === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                        : item.status === 'Ready'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: DATA GAP ANALYZER -------------------- */}
      {activeTab === 'datagaps' && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
        }`}>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Evidence & Data Gap Analysis Report</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Identifies activity line items that lack verified primary invoices, rely on estimated secondary factors, or remain in unverified draft state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Missing Document References</span>
              <span className="text-2xl font-bold font-mono text-white">{dataGapSummary.missingEvidence.length}</span>
              <p className="text-[11px] text-gray-400">Activity lines without upload challan or bill reference</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">Estimated Quality Records</span>
              <span className="text-2xl font-bold font-mono text-white">{dataGapSummary.estimatedQuality.length}</span>
              <p className="text-[11px] text-gray-400">Entries relying on spend-based or distance approximations</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">Draft Verification Status</span>
              <span className="text-2xl font-bold font-mono text-white">{dataGapSummary.draftStatus.length}</span>
              <p className="text-[11px] text-gray-400">Items pending initial internal audit sign-off</p>
            </div>
          </div>

          {/* Actionable Data Gaps Table */}
          <div className="border border-white/10 rounded-2xl overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Activity ID</th>
                  <th>Category</th>
                  <th>Responsible Person</th>
                  <th>Issue / Gap Type</th>
                  <th>Quantity & Unit</th>
                  <th>Recommended Remediation</th>
                  <th className="text-right p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {dataGapSummary.totalGaps === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <span>Zero data gaps detected. 100% of activity line items carry primary evidence and verified status!</span>
                    </td>
                  </tr>
                ) : (
                  [...dataGapSummary.missingEvidence, ...dataGapSummary.estimatedQuality, ...dataGapSummary.draftStatus]
                    .filter((item, idx, arr) => arr.findIndex(t => t.id === item.id) === idx)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-bold text-white">{item.id}</td>
                        <td>{item.category}</td>
                        <td className="text-gray-300 font-sans">{item.responsiblePerson}</td>
                        <td>
                          {!item.evidenceFileReference ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                              Missing Doc
                            </span>
                          ) : item.dataQualityRating === 'Estimated' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                              Estimated Factor
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold">
                              Draft State
                            </span>
                          )}
                        </td>
                        <td>{item.quantity.toLocaleString()} {item.unit}</td>
                        <td className="text-gray-400 font-sans text-[11px]">
                          {!item.evidenceFileReference 
                            ? 'Attach scanned utility bill / purchase challan.'
                            : 'Upgrade to supplier-specific emission factor.'}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => showToast(`Evidence request notification dispatched to ${item.responsiblePerson}`, 'info')}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono cursor-pointer"
                          >
                            Request Proof
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: VERIFIER INQUIRIES (Q&A) -------------------- */}
      {activeTab === 'inquiries' && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-lg">Verifier Question & Inquiry Register</h3>
              <p className="text-xs text-gray-400 mt-0.5">Pre-cleared technical responses and notes to standard third-party assurance inquiries.</p>
            </div>
            <button
              onClick={() => showToast('Inquiry export downloaded for external audit packet', 'success')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Q&A PDF</span>
            </button>
          </div>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      {inq.verifier}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">Recorded: {inq.date}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    inq.status === 'Addressed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inq.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-sans flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{inq.question}</span>
                  </h4>
                  <div className="pl-6 text-xs text-gray-300 leading-relaxed font-sans bg-white/[0.02] p-3 rounded-xl border border-white/5 mt-2">
                    <strong className="text-[#00E676] block mb-1 font-mono text-[10px] uppercase">Corporate Technical Answer:</strong>
                    {inq.response}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Record New Verifier Question Form */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 font-mono">Log New Verifier Question</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Verifier Institution (e.g. SGS, Bureau Veritas)"
                value={newInquiryVerifier}
                onChange={(e) => setNewInquiryVerifier(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
              />
              <input
                type="text"
                placeholder="Technical Question or Data Clarification"
                value={newInquiryQuestion}
                onChange={(e) => setNewInquiryQuestion(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-white/10 bg-black/30 text-white sm:col-span-2 focus:outline-none focus:border-[#00C853]"
              />
            </div>
            <button
              onClick={() => {
                if (!newInquiryQuestion || !newInquiryVerifier) {
                  showToast('Please provide both verifier name and question', 'error');
                  return;
                }
                setInquiries(prev => [
                  ...prev,
                  {
                    id: `inq-${Date.now()}`,
                    verifier: newInquiryVerifier,
                    question: newInquiryQuestion,
                    response: 'Response draft pending Chief Sustainability Officer review.',
                    status: 'Under Review',
                    date: new Date().toISOString().split('T')[0]
                  }
                ]);
                setNewInquiryQuestion('');
                setNewInquiryVerifier('');
                showToast('Verifier question registered in audit ledger', 'success');
              }}
              className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
            >
              Add to Inquiry Register
            </button>
          </div>
        </div>
      )}

      {/* -------------------- TAB 4: BASE YEAR RECALCULATION -------------------- */}
      {activeTab === 'baseyear' && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <span>GHG Protocol Corporate Standard Chapter 5</span>
            </div>
            <h3 className="font-bold text-lg mt-0.5">Base Year Emissions Recalculation Policy</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Mandatory adjustment protocol for corporate baseline emissions. When structural alterations (facility acquisitions, divestitures, or insourcing/outsourcing) exceed the <strong>5.0% cumulative threshold</strong>, historic baselines must be restated to ensure like-for-like comparability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Baseline Year</label>
                  <input
                    type="number"
                    value={baseYear}
                    onChange={(e) => setBaseYear(parseInt(e.target.value) || 2024)}
                    disabled={isAuditorLocked}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Initial Baseline (tCO₂e)</label>
                  <input
                    type="number"
                    value={baseYearEmissions}
                    onChange={(e) => setBaseYearEmissions(parseFloat(e.target.value) || 0)}
                    disabled={isAuditorLocked}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Structural Adjustment (+/- tCO₂e)</label>
                <input
                  type="number"
                  placeholder="+120 (Acquisition) or -80 (Divestiture)"
                  value={structuralChangeTco2e || ''}
                  onChange={(e) => setStructuralChangeTco2e(parseFloat(e.target.value) || 0)}
                  disabled={isAuditorLocked}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Structural Event Rationale</label>
                <input
                  type="text"
                  value={structuralChangeReason}
                  onChange={(e) => setStructuralChangeReason(e.target.value)}
                  disabled={isAuditorLocked}
                  className="w-full text-xs font-sans p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
                />
              </div>

              <button
                onClick={() => {
                  showToast(`Base year ${baseYear} restated to ${baseYearRecalculation.adjustedTotal.toFixed(2)} tCO₂e in audit ledger`, 'success');
                }}
                disabled={isAuditorLocked}
                className="w-full bg-[#00C853] hover:bg-[#00E676] disabled:bg-gray-700 text-white font-mono font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Apply Baseline Restatement
              </button>
            </div>

            {/* Recalculation Output Card */}
            <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-gray-400 font-mono">Significance Threshold:</span>
                  <span className="text-xs font-bold font-mono text-white">5.00% Net Cumulative</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-gray-400 font-mono">Calculated Structural Variance:</span>
                  <span className={`text-sm font-bold font-mono ${baseYearRecalculation.exceedsThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {baseYearRecalculation.percentChange}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Restatement Status</span>
                  <div className="flex items-center space-x-2">
                    {baseYearRecalculation.exceedsThreshold ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-amber-300">Mandatory Recalculation Triggered (≥ 5.0%)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-emerald-300">Within Threshold (&lt; 5.0% - Optional)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Audited Baseline Comparison</span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-lg font-mono text-gray-400 line-through">{baseYearRecalculation.original.toFixed(2)}</span>
                    <span className="text-2xl font-mono font-bold text-white">{baseYearRecalculation.adjustedTotal.toFixed(2)} tCO₂e</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-white/10">
                Audit Trail Stamp: Restatement logged by CarbonZero BD ISO-Assurance Engine under corporate ID: {client.id}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 5: EU CBAM CUSTOMS EXPORT -------------------- */}
      {activeTab === 'cbam' && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <span>EU Regulation 2023/956 Compliance</span>
            </div>
            <h3 className="font-bold text-lg mt-0.5">Carbon Border Adjustment Mechanism (CBAM) Customs Declarator</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Export declaration studio for Bangladeshi industrial goods exported to the European Union. Calculates specific embedded direct and indirect greenhouse gas emissions according to EU methodologies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CBAM Parameter Controls */}
            <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Export Commodity Category</label>
                <select
                  value={cbamSector}
                  onChange={(e) => setCbamSector(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853] cursor-pointer"
                >
                  <option value="Jute & Polymer Composites">Jute, Geotextiles & Bio-Polymer Blends (HS 5307)</option>
                  <option value="Steel & Industrial Metals">Steel, Rebar & Fabricated Structural Steel (HS 7208)</option>
                  <option value="Aluminium Extrusions">Aluminium Ingots & Extrusions (HS 7601)</option>
                  <option value="Cement & Clinker">Portland Cement & Hydraulic Clinker (HS 2523)</option>
                  <option value="Nitrogenous Fertilizers">Ammonia & Urea Fertilizers (HS 3102)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Net Export Volume (Metric Tons)</label>
                <input
                  type="number"
                  value={cbamExportTons}
                  onChange={(e) => setCbamExportTons(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Electricity Generation Factor</label>
                <input
                  type="text"
                  disabled
                  value={cbamElectricityOrigin}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/50 text-gray-400"
                />
              </div>

              <button
                onClick={() => {
                  showToast(`CBAM customs XML/JSON declaration exported for ${cbamExportTons} MT of ${cbamSector}`, 'success');
                }}
                className="w-full bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download CBAM XML Registry Packet</span>
              </button>
            </div>

            {/* CBAM Output Summary */}
            <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-gray-400 font-mono">Specific Emission Intensity:</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">{cbamResult.factor} tCO₂e / ton commodity</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-gray-400 font-mono">Total Embedded Direct Emissions:</span>
                  <span className="text-base font-bold font-mono text-white">{cbamResult.embeddedEmissions} tCO₂e</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-gray-400 font-mono">EU ETS Benchmark Credit Allowance:</span>
                  <span className="text-xs font-mono text-gray-300">-{cbamResult.euEtsBenchmarkAllowance} tCO₂e</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase block font-bold">Net Surrender Requirement</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                    {cbamResult.netCbamCertificatesNeeded} <span className="text-xs font-sans text-gray-400">CBAM Certificates</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Estimated at EU ETS auction average ~€68.50 / tCO₂e. Insetting offsets through CarbonZero BD reduce this liability.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-white/10">
                EU Transit Authority: European Commission DG TAXUD Registry Identifier BD-{client.id.toUpperCase()}-2026
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 6: ATTESTATION STATEMENT -------------------- */}
      {activeTab === 'signoff' && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
                <Award className="w-4 h-4" />
                <span>Third-Party Verification Opinion Document</span>
              </div>
              <h3 className="font-bold text-xl mt-0.5">Independent Limited Assurance Statement</h3>
              <p className="text-xs text-gray-400 mt-0.5">Formal assurance letter prepared in accordance with ISAE 3410 and ISO 14064-3:2019.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(`INDEPENDENT AUDIT VERIFICATION OPINION\nClient: ${client.name}\nReporting Year: 2026\nStandard: ISO 14064-1:2018 / GHG Protocol\nAssurance Level: Limited Assurance\nSHA-256 Digest: c9b8f5e3d7a1e0b4c8a2f1e6b9c7d0a3`, 'opinion')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs px-3 py-2 rounded-xl font-mono flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedKey === 'opinion' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Text</span>
              </button>

              <button
                onClick={() => showToast('Formal assurance letter printed to PDF with sovereign digital signature', 'success')}
                className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs px-4 py-2 rounded-xl font-mono font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Export Official PDF</span>
              </button>
            </div>
          </div>

          {/* Rendered Assurance Letter */}
          <div className="p-8 rounded-2xl bg-black/40 border border-white/10 space-y-6 font-serif text-xs leading-relaxed text-gray-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-4 font-sans not-italic">
              <div>
                <h4 className="font-bold text-sm text-white">CarbonZero BD Independent Assurance Practice</h4>
                <p className="text-[11px] text-gray-400">Gulshan-2 Carbon Exchange Tower, Dhaka-1212, Bangladesh</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Accreditation: ISO 14065 / DoE Recognized GHG Verification Body</p>
              </div>
              <div className="text-right font-mono text-[10px] text-gray-400">
                <span>Date: April 18, 2026</span><br />
                <span>Ref: CZBD-VER-{client.id.toUpperCase()}-2026-01</span>
              </div>
            </div>

            <div className="space-y-4">
              <p>
                <strong>To the Board of Directors and Stakeholders of {client.name}:</strong>
              </p>
              <p>
                We have undertaken a limited assurance engagement of the accompanying Greenhouse Gas (GHG) Assertion of <strong>{client.name}</strong> for the annual reporting period ended December 31, 2025. The inventory comprises direct emissions (Scope 1), energy indirect emissions (Scope 2), and selected other indirect emissions (Scope 3) quantified in accordance with the <em>GHG Protocol Corporate Accounting and Reporting Standard</em> and <em>ISO 14064-1:2018</em>.
              </p>
              <p>
                <strong>Management’s Responsibility:</strong> Management is responsible for the preparation and fair presentation of the GHG assertion in accordance with the quantification criteria. This includes designing, implementing, and maintaining an internal data control framework, primary invoice evidence retention, and the continuous integrity of activity meter logs.
              </p>
              <p>
                <strong>Our Independence and Quality Control:</strong> We have complied with the Code of Ethics for Professional Accountants issued by the IESBA, which includes independence and other requirements founded on fundamental principles of integrity, objectivity, professional competence, and due care.
              </p>
              <p>
                <strong>Conclusion:</strong> Based on the procedures we have performed and the evidence we have obtained, nothing has come to our attention that causes us to believe that the GHG inventory assertion of <strong>{client.name}</strong> is not prepared, in all material respects, in accordance with ISO 14064-1:2018.
              </p>
            </div>

            {/* Signature & Seal Block */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans not-italic">
              <div>
                <div className="font-bold text-white text-xs">Engr. Kazi Tariqul Islam, Lead Verifier</div>
                <div className="text-[11px] text-gray-400">Senior Partner, Climate Assurance & Carbon Accounting</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Cert ID: ISO14064-LEAD-BD-88219</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 font-mono text-[10px] text-right space-y-0.5">
                <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SHA-256 DIGITAL VERIFICATION SEAL</span>
                </div>
                <div className="text-gray-400 truncate max-w-xs">e4a9c8b7f2d1e0a3b6c5d4e8f1a2b3c4d5e6f7a8b9c0d1e2</div>
                <div className="text-gray-500">Immutable Block Verification Timestamp: 2026-04-18T10:14:22Z</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
