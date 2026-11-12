import { useState, useMemo, useEffect } from 'react';
import { CLIENT_PROFILES } from '../../clientProfiles';
import { generateClientActivityData } from './activityData';

export function useActivityWorkspaceState(activeClientId = 'revoo-ev') {
  const activeClient = useMemo(() => {
    return CLIENT_PROFILES.find((c) => c.id === activeClientId) || CLIENT_PROFILES[0];
  }, [activeClientId]);

  const { activities: initialActivities, evidenceList: initialEvidence } = useMemo(() => {
    return generateClientActivityData(activeClient);
  }, [activeClient]);

  const [activities, setActivities] = useState(initialActivities);
  const [evidenceList, setEvidenceList] = useState(initialEvidence);

  useEffect(() => {
    const data = generateClientActivityData(activeClient);
    setActivities(data.activities);
    setEvidenceList(data.evidenceList);
  }, [activeClient]);

  const [activeTab, setActiveTab] = useState('activities');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: '',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    facility: activeClient?.facilities?.[0]?.name || 'Facility 1',
    department: 'Operations',
    quantity: '',
    unit: 'Liters',
    factorValue: '2.68',
    responsiblePerson: '',
    dataQuality: 'High'
  });

  const totalEmissions = useMemo(() => {
    return activities.reduce((sum, item) => sum + (parseFloat(item.tCO2e) || 0), 0);
  }, [activities]);

  const scopeTotals = useMemo(() => {
    const s1 = activities.filter((a) => a.scopeGroup === 'Scope 1').reduce((s, a) => s + (parseFloat(a.tCO2e) || 0), 0);
    const s2 = activities.filter((a) => a.scopeGroup === 'Scope 2').reduce((s, a) => s + (parseFloat(a.tCO2e) || 0), 0);
    const s3 = activities.filter((a) => a.scopeGroup === 'Scope 3').reduce((s, a) => s + (parseFloat(a.tCO2e) || 0), 0);
    return { s1, s2, s3 };
  }, [activities]);

  const evidenceCoverage = useMemo(() => {
    const withEvidence = activities.filter((a) => a.evidenceId && a.status === 'Verified').length;
    return Math.round((withEvidence / (activities.length || 1)) * 100);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
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
    return evidenceList.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [evidenceList, searchQuery]);

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivity.activityType || !newActivity.quantity) {
      alert('Please provide activity description and quantity.');
      return;
    }

    const qty = parseFloat(newActivity.quantity) || 0;
    const factor = parseFloat(newActivity.factorValue) || 1.0;
    const tCO2e = parseFloat(((qty * factor) / 1000).toFixed(2));

    const record = {
      id: `ACT-${activeClient.id.toUpperCase().slice(0, 4)}-${String(activities.length + 1).padStart(3, '0')}`,
      period: 'FY 2026',
      month: '2026-06',
      siteId: newActivity.facility,
      siteLocation: 'Bangladesh',
      department: newActivity.department,
      activityType: newActivity.activityType,
      scope: newActivity.scope,
      scopeGroup: newActivity.scope.includes('Scope 1') ? 'Scope 1' : newActivity.scope.includes('Scope 2') ? 'Scope 2' : 'Scope 3',
      category: newActivity.category,
      quantity: qty,
      unit: newActivity.unit,
      emissionFactorId: `EF-CUSTOM-${Date.now().toString().slice(-4)}`,
      emissionFactorVersion: 'v2026.1 (User Specified)',
      kgCO2ePerUnit: factor,
      tCO2e: tCO2e,
      formula: `Qty (${newActivity.unit}) × ${factor} kg CO₂e/${newActivity.unit} ÷ 1000`,
      dataSource: 'Manual Corporate Ledger Entry',
      evidenceId: null,
      evidenceFileName: null,
      dataQualityRating: newActivity.dataQuality,
      status: 'Ready',
      responsiblePerson: newActivity.responsiblePerson || 'Assigned Officer'
    };

    setActivities((prev) => [record, ...prev]);
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

  const handleExportCSV = () => {
    const headers = [
      'Activity ID', 'Month', 'Site / Facility', 'Department', 'Activity Type',
      'Category', 'Scope', 'Quantity', 'Unit', 'EF ID', 'EF Version',
      'kg CO2e/Unit', 'Total tCO2e', 'Formula', 'Data Source',
      'Evidence Ref', 'Data Quality', 'Verification Status', 'Responsible Person'
    ];

    const rows = activities.map((a) => [
      `"${a.id}"`, `"${a.month}"`, `"${a.siteId}"`, `"${a.department}"`, `"${a.activityType}"`,
      `"${a.category}"`, `"${a.scope}"`, a.quantity, `"${a.unit}"`, `"${a.emissionFactorId}"`,
      `"${a.emissionFactorVersion}"`, a.kgCO2ePerUnit, a.tCO2e, `"${a.formula}"`, `"${a.dataSource}"`,
      `"${a.evidenceFileName || 'Missing'}"`, `"${a.dataQualityRating}"`, `"${a.status}"`, `"${a.responsiblePerson}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeClient.id}_Activity_Data_ISO14064_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    activeClient,
    activities,
    evidenceList,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    scopeFilter,
    setScopeFilter,
    qualityFilter,
    setQualityFilter,
    statusFilter,
    setStatusFilter,
    facilityFilter,
    setFacilityFilter,
    selectedEvidence,
    setSelectedEvidence,
    isAddModalOpen,
    setIsAddModalOpen,
    newActivity,
    setNewActivity,
    totalEmissions,
    scopeTotals,
    evidenceCoverage,
    filteredActivities,
    filteredEvidence,
    handleCreateActivity,
    handleExportCSV
  };
}
