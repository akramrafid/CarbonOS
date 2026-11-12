import { useState, useMemo } from 'react';
import { CLIENT_PROFILES } from '../../clientProfiles';
import { generateClientActivityData } from '../activity-workspace/activityData';

export const INITIAL_CHECKLIST = [
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
    description: 'Location-based reporting with an approved grid-average factor (none approved yet) plus market-based contractual instruments where they exist.',
    owner: 'Lead ESG Controller',
    status: 'Needs Review',
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
];

export const INITIAL_INQUIRIES = [
  {
    id: 'inq-1',
    verifier: 'SGS / Bureau Veritas Assurance Team',
    question: 'What is the institutional basis for the Scope 2 electricity grid factor in Bangladesh?',
    response: 'No official Bangladesh grid factor has been located. The 0.550 kg CO₂e/kWh shown earlier was a CDM combined margin with an unlocated citation and has been withdrawn. CarbonOS derives a DRAFT grid-average factor from BPDB annual-report data; it is used only after a second person approves it.',
    status: 'Open',
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
];

export function useVerificationReadinessState(activeClientId = 'polyjute', showToast = () => {}) {
  const [activeTab, setActiveTab] = useState('checklist');
  const [isAuditorLocked, setIsAuditorLocked] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const client = useMemo(() => {
    return CLIENT_PROFILES.find((c) => c.id === activeClientId) || CLIENT_PROFILES[0];
  }, [activeClientId]);

  const clientActivity = useMemo(() => {
    return generateClientActivityData(client);
  }, [client]);

  const [baseYear, setBaseYear] = useState(client.baselineYear || 2024);
  const [baseYearEmissions, setBaseYearEmissions] = useState(
    client.emissionsBreakdown
      ? client.emissionsBreakdown.scope1 + client.emissionsBreakdown.scope2 + (client.emissionsBreakdown.scope3 || 0)
      : 1250.0
  );
  const [structuralChangeTco2e, setStructuralChangeTco2e] = useState(0);
  const [structuralChangeReason, setStructuralChangeReason] = useState('Acquisition of auxiliary processing plant');

  const [cbamSector, setCbamSector] = useState(
    client.sector?.includes('Packaging') ? 'Jute & Polymer Composites' : 'Steel & Industrial Metals'
  );
  const [cbamExportTons, setCbamExportTons] = useState(1500);
  const [cbamElectricityOrigin] = useState('National grid (grid-average factor pending approval)');

  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [newInquiryQuestion, setNewInquiryQuestion] = useState('');
  const [newInquiryVerifier, setNewInquiryVerifier] = useState('');

  const handleToggleChecklistStatus = (id) => {
    if (isAuditorLocked) {
      showToast('Workspace is in Auditor View Lock mode. Status cannot be modified.', 'error');
      return;
    }
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === 'Verified' ? 'Needs Review' : item.status === 'Needs Review' ? 'Ready' : 'Verified';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    showToast('Checklist item status updated', 'success');
  };

  const handleAddInquiry = () => {
    if (!newInquiryQuestion || !newInquiryVerifier) {
      showToast('Please provide both verifier name and question', 'error');
      return;
    }
    setInquiries((prev) => [
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
  };

  const readinessStats = useMemo(() => {
    const verifiedCount = checklist.filter((i) => i.status === 'Verified').length;
    const readyCount = checklist.filter((i) => i.status === 'Ready').length;
    const score = Math.round(((verifiedCount * 1.0 + readyCount * 0.5) / checklist.length) * 100);
    return { verifiedCount, readyCount, total: checklist.length, score };
  }, [checklist]);

  const dataGapSummary = useMemo(() => {
    const acts = clientActivity?.activities || [];
    const missingEvidence = acts.filter((a) => !a.evidenceFileName);
    const estimatedQuality = acts.filter((a) => a.dataQualityRating === 'Estimated');
    const draftStatus = acts.filter((a) => a.status === 'Draft');

    return {
      missingEvidence,
      estimatedQuality,
      draftStatus,
      totalGaps: missingEvidence.length + estimatedQuality.length + draftStatus.length
    };
  }, [clientActivity]);

  const baseYearRecalculation = useMemo(() => {
    const currentAdjusted = baseYearEmissions + structuralChangeTco2e;
    const percentChange =
      baseYearEmissions > 0 ? ((structuralChangeTco2e / baseYearEmissions) * 100).toFixed(2) : '0.00';
    const exceedsThreshold = Math.abs(parseFloat(percentChange)) >= 5.0;

    return {
      original: baseYearEmissions,
      adjustment: structuralChangeTco2e,
      adjustedTotal: currentAdjusted,
      percentChange,
      exceedsThreshold
    };
  }, [baseYearEmissions, structuralChangeTco2e]);

  const cbamResult = useMemo(() => {
    let factor = 1.85;
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

  return {
    activeTab,
    setActiveTab,
    isAuditorLocked,
    setIsAuditorLocked,
    copiedKey,
    client,
    baseYear,
    setBaseYear,
    baseYearEmissions,
    setBaseYearEmissions,
    structuralChangeTco2e,
    setStructuralChangeTco2e,
    structuralChangeReason,
    setStructuralChangeReason,
    cbamSector,
    setCbamSector,
    cbamExportTons,
    setCbamExportTons,
    cbamElectricityOrigin,
    checklist,
    inquiries,
    newInquiryQuestion,
    setNewInquiryQuestion,
    newInquiryVerifier,
    setNewInquiryVerifier,
    handleToggleChecklistStatus,
    handleAddInquiry,
    readinessStats,
    dataGapSummary,
    baseYearRecalculation,
    cbamResult,
    copyToClipboard
  };
}
