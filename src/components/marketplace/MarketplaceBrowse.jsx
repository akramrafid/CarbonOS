import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Info, 
  ChevronDown, 
  Grid, 
  List, 
  Leaf, 
  Sun, 
  Droplets, 
  Flame, 
  Factory, 
  Wind, 
  Award, 
  Zap, 
  AlertCircle, 
  Eye, 
  ShoppingCart, 
  Lock, 
  FileText, 
  X,
  Satellite,
  Compass,
  Building2,
  Calendar,
  CheckCheck
} from 'lucide-react';
import PurchaseConfirmModal from '../payments/PurchaseConfirmModal';
import { useTheme } from '../../context/ThemeContext';

export const MarketplaceBrowse = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Selected state
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [inspectCredit, setInspectCredit] = useState(null); // For MRV dossier modal
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedVintage, setSelectedVintage] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // 18 Verified High-Additionality Bangladesh Carbon Projects
  const [credits, setCredits] = useState([
    {
      id: 'BD-2026-CR-000142',
      type: 'Solar Irrigation Network',
      sector: 'Renewable Energy',
      sectorIcon: 'Sun',
      region: 'Khulna (Coastal Belt)',
      division: 'Khulna',
      tonnage: 1.4,
      pricePerTonne: 11000,
      price: 15400,
      status: 'AVAILABLE',
      farmer: 'Rahim Uddin (Coop #12)',
      farmerWallet: '01712-984521 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🛰️ Sentinel-2 NDVI Verified (+0.42)',
      coBenefits: 'Groundwater table restoration & zero-diesel pumping',
      sdgs: [1, 7, 13],
      coordinates: '22.8456° N, 89.5403° E',
      auditor: 'TÜV SÜD South Asia'
    },
    {
      id: 'BD-2026-CR-000188',
      type: 'Sundarbans Mangrove Blue Carbon',
      sector: 'Nature-Based',
      sectorIcon: 'Droplets',
      region: 'Sundarbans Delta',
      division: 'Khulna',
      tonnage: 3.2,
      pricePerTonne: 15000,
      price: 48000,
      status: 'AVAILABLE',
      farmer: 'Sundarbans Conservation Coop #4',
      farmerWallet: '01911-452398 (Nagad)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🛰️ Sentinel-1 SAR Canopy Radar Monitored',
      coBenefits: 'Cyclone storm surge buffer & Bengal tiger habitat',
      sdgs: [13, 14, 15],
      coordinates: '21.9497° N, 89.1833° E',
      auditor: 'Bureau Veritas India'
    },
    {
      id: 'BD-2026-CR-000199',
      type: 'Clean Cookstove Household Rollout',
      sector: 'Clean Cooking',
      sectorIcon: 'Flame',
      region: 'Sylhet Tea Estate Belt',
      division: 'Sylhet',
      tonnage: 0.8,
      pricePerTonne: 10625,
      price: 8500,
      status: 'AVAILABLE',
      farmer: 'Fatima Begum (Women Climate Group)',
      farmerWallet: '01815-339201 (bKash)',
      verification: 'Verra VCS (VM0007)',
      vintage: '2025',
      additionality: 'AA+ High Impact',
      mrvTelemetry: '📱 IoT Thermal Usage Sensor Live (99.2% Uptime)',
      coBenefits: '85% indoor particulate reduction & fuel savings',
      sdgs: [3, 5, 13],
      coordinates: '24.8949° N, 91.8687° E',
      auditor: 'SGS Bangladesh Ltd'
    },
    {
      id: 'BD-2026-CR-000204',
      type: 'Solar Cold Storage for Perishables',
      sector: 'Renewable Energy',
      sectorIcon: 'Sun',
      region: 'Mymensingh Agri Hub',
      division: 'Mymensingh',
      tonnage: 2.1,
      pricePerTonne: 15000,
      price: 31500,
      status: 'AVAILABLE',
      farmer: 'Hassan Kabir (Krishak Samity)',
      farmerWallet: '01622-881240 (Nagad)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '⚡ Inverter Smart Telemetry Synced',
      coBenefits: '40% vegetable post-harvest loss avoidance',
      sdgs: [2, 7, 12],
      coordinates: '24.7471° N, 90.4203° E',
      auditor: 'DNV GL Environment'
    },
    {
      id: 'BD-2026-CR-000210',
      type: 'Zigzag Hybrid Brick Kiln Transition',
      sector: 'Industrial Efficiency',
      sectorIcon: 'Factory',
      region: 'Gazipur Industrial Corridor',
      division: 'Dhaka',
      tonnage: 4.5,
      pricePerTonne: 15000,
      price: 67500,
      status: 'AVAILABLE',
      farmer: 'Aminul S. (Green Brick Alliance)',
      farmerWallet: '01713-772901 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2025',
      additionality: 'AA+ High Impact',
      mrvTelemetry: '🏭 CEMS Stack Continuous Emission Monitored',
      coBenefits: '60% black carbon soot elimination in Dhaka airshed',
      sdgs: [9, 11, 13],
      coordinates: '23.9999° N, 90.4203° E',
      auditor: 'TÜV SÜD South Asia'
    },
    {
      id: 'BD-2026-CR-000215',
      type: 'Dairy Manure Waste-to-Energy Biogas',
      sector: 'Industrial Efficiency',
      sectorIcon: 'Factory',
      region: 'Jessore Dairy Cluster',
      division: 'Khulna',
      tonnage: 1.8,
      pricePerTonne: 15000,
      price: 27000,
      status: 'AVAILABLE',
      farmer: 'Latifa Akhtar (Jessore Bio-Energy)',
      farmerWallet: '01918-662309 (Nagad)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🔥 Digital Methane Flowmeter IoT Synced',
      coBenefits: 'Organic bio-slurry fertilizer replacement',
      sdgs: [6, 7, 12],
      coordinates: '23.1664° N, 89.2081° E',
      auditor: 'Bureau Veritas India'
    },
    {
      id: 'BD-2026-CR-000221',
      type: 'AWD Rice Methane Mitigation',
      sector: 'Agriculture & AWD',
      sectorIcon: 'Leaf',
      region: 'Rangpur Boro Paddy Plain',
      division: 'Rangpur',
      tonnage: 1.2,
      pricePerTonne: 15000,
      price: 18000,
      status: 'AVAILABLE',
      farmer: 'Jahangir Mia (AWD Cluster #08)',
      farmerWallet: '01715-992014 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '💧 IoT Perforated Pipe Water Depth: -15cm AWD Confirmed',
      coBenefits: '35% irrigation diesel cut & 45% enteric methane cut',
      sdgs: [1, 2, 13],
      coordinates: '25.7439° N, 89.2752° E',
      auditor: 'DoE Bangladesh Accredited VVB'
    },
    {
      id: 'BD-2026-CR-000225',
      type: 'Chittagong Hill Tract Agroforestry',
      sector: 'Nature-Based',
      sectorIcon: 'Droplets',
      region: 'Chittagong Hill Tracts',
      division: 'Chittagong',
      tonnage: 5.6,
      pricePerTonne: 15000,
      price: 84000,
      status: 'AVAILABLE',
      farmer: 'Parbatya Indigenous Community Coop',
      farmerWallet: '01819-445012 (Nagad)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🛰️ Sentinel-2 Multispectral Biomass Index +0.58',
      coBenefits: 'Soil erosion protection & indigenous fruit sovereignty',
      sdgs: [1, 10, 15],
      coordinates: '22.3384° N, 92.2570° E',
      auditor: 'DNV GL Environment'
    },
    {
      id: 'BD-2026-CR-000230',
      type: 'RMG Factory Rooftop Solar Microgrid',
      sector: 'Renewable Energy',
      sectorIcon: 'Sun',
      region: 'Dhaka EPZ Zone',
      division: 'Dhaka',
      tonnage: 2.8,
      pricePerTonne: 15000,
      price: 42000,
      status: 'AVAILABLE',
      farmer: 'Metro Fabric Mills Ltd (Worker Green Fund)',
      farmerWallet: '01711-200938 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2025',
      additionality: 'AA+ High Impact',
      mrvTelemetry: '⚡ Scada API Grid Export Verified (REB Logged)',
      coBenefits: 'Clean energy displaced from heavy fuel oil generators',
      sdgs: [7, 8, 9],
      coordinates: '23.8103° N, 90.4125° E',
      auditor: 'TÜV SÜD South Asia'
    },
    {
      id: 'BD-2026-CR-000235',
      type: 'Community Biogas Digester & Waste',
      sector: 'Industrial Efficiency',
      sectorIcon: 'Factory',
      region: 'Kushtia Rural Cluster',
      division: 'Khulna',
      tonnage: 1.5,
      pricePerTonne: 15000,
      price: 22500,
      status: 'AVAILABLE',
      farmer: 'Rahimun Nessa (Women Bio-Coop)',
      farmerWallet: '01912-883019 (bKash)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🔥 Smart Gas Meter Direct Cloud Feed',
      coBenefits: 'Replaces firewood for 120 rural village homes',
      sdgs: [3, 5, 7],
      coordinates: '23.9015° N, 89.1205° E',
      auditor: 'Bureau Veritas India'
    },
    {
      id: 'BD-2026-CR-000240',
      type: 'Efficient Biomass Cookstoves Tier-4',
      sector: 'Clean Cooking',
      sectorIcon: 'Flame',
      region: 'Dinajpur Border District',
      division: 'Rangpur',
      tonnage: 0.9,
      pricePerTonne: 10555,
      price: 9500,
      status: 'AVAILABLE',
      farmer: 'Nargis Ara (Gram Unnayan)',
      farmerWallet: '01718-449102 (Nagad)',
      verification: 'Verra VCS (VM0007)',
      vintage: '2025',
      additionality: 'AA+ High Impact',
      mrvTelemetry: '📱 Mobile Barcode NFC Survey Verifiable',
      coBenefits: 'Saves 3 hours/day in firewood foraging for girls',
      sdgs: [4, 5, 13],
      coordinates: '25.6279° N, 88.6332° E',
      auditor: 'SGS Bangladesh Ltd'
    },
    {
      id: 'BD-2026-CR-000245',
      type: 'Solar Irrigation Deep-Tubewell Pump',
      sector: 'Renewable Energy',
      sectorIcon: 'Sun',
      region: 'Rajshahi Barind Tract',
      division: 'Rajshahi',
      tonnage: 1.6,
      pricePerTonne: 11000,
      price: 17600,
      status: 'AVAILABLE',
      farmer: 'Tariqul Islam (Barind Solar Coop)',
      farmerWallet: '01714-338290 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '⚡ Remote Telemetry Smart Metering Active',
      coBenefits: 'Groundwater replenishment sensor monitored',
      sdgs: [6, 7, 13],
      coordinates: '24.3745° N, 88.6042° E',
      auditor: 'DoE Bangladesh Accredited VVB'
    },
    {
      id: 'BD-2026-CR-000250',
      type: 'Coastal Cyclone Mangrove Afforestation',
      sector: 'Nature-Based',
      sectorIcon: 'Droplets',
      region: 'Cox\'s Bazar Coastal Belt',
      division: 'Chittagong',
      tonnage: 4.0,
      pricePerTonne: 15000,
      price: 60000,
      status: 'AVAILABLE',
      farmer: 'Coast Alliance Fisherman Association',
      farmerWallet: '01812-774019 (Nagad)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🛰️ Drone LiDAR High-Resolution Tree Biomass',
      coBenefits: 'Estuarine crab habitat & coastal surge embankment defense',
      sdgs: [13, 14, 15],
      coordinates: '21.4272° N, 92.0058° E',
      auditor: 'Bureau Veritas India'
    },
    {
      id: 'BD-2026-CR-000255',
      type: 'Muhuri Coastal Wind & Solar Hybrid',
      sector: 'Renewable Energy',
      sectorIcon: 'Wind',
      region: 'Feni Coastal Dam',
      division: 'Chittagong',
      tonnage: 6.5,
      pricePerTonne: 15000,
      price: 97500,
      status: 'AVAILABLE',
      farmer: 'Feni Green Power Worker Initiative',
      farmerWallet: '01817-991204 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '⚡ Grid Infeed SCADA Direct National Load Dispatch Log',
      coBenefits: 'Coastal renewable grid stability during low-tide monsoon',
      sdgs: [7, 9, 13],
      coordinates: '22.9408° N, 91.3996° E',
      auditor: 'TÜV SÜD South Asia'
    },
    {
      id: 'BD-2026-CR-000260',
      type: 'Off-Grid Solar Home Systems (SHS)',
      sector: 'Renewable Energy',
      sectorIcon: 'Sun',
      region: 'Barisal Riverine Islands',
      division: 'Barisal',
      tonnage: 1.1,
      pricePerTonne: 15000,
      price: 16500,
      status: 'AVAILABLE',
      farmer: 'Grameen Shakti Island Unit #21',
      farmerWallet: '01716-559102 (bKash)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2025',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '📱 GSM Battery Telemetry Live Pulse',
      coBenefits: 'Eliminates kerosene fumes in 240 riverine families',
      sdgs: [3, 7, 10],
      coordinates: '22.7010° N, 90.3535° E',
      auditor: 'DNV GL Environment'
    },
    {
      id: 'BD-2026-CR-000265',
      type: 'Municipal Solid Waste Composting',
      sector: 'Industrial Efficiency',
      sectorIcon: 'Factory',
      region: 'Narayanganj City Corporation',
      division: 'Dhaka',
      tonnage: 3.5,
      pricePerTonne: 15000,
      price: 52500,
      status: 'AVAILABLE',
      farmer: 'Clean City Green Waste Workers Coop',
      farmerWallet: '01913-228910 (Nagad)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2026',
      additionality: 'AA+ High Impact',
      mrvTelemetry: '⚖️ Municipal Weighbridge IoT Digital Ledger',
      coBenefits: 'Prevents open landfill methane fires & produces organic soil',
      sdgs: [11, 12, 13],
      coordinates: '23.6238° N, 90.5000° E',
      auditor: 'DoE Bangladesh Accredited VVB'
    },
    {
      id: 'BD-2026-CR-000270',
      type: 'Zero-Tillage Mustard & Maize Farm',
      sector: 'Agriculture & AWD',
      sectorIcon: 'Leaf',
      region: 'Comilla Agri Basin',
      division: 'Chittagong',
      tonnage: 1.3,
      pricePerTonne: 15000,
      price: 19500,
      status: 'AVAILABLE',
      farmer: 'Selim Hossain (Regenerative Farmers)',
      farmerWallet: '01811-662908 (bKash)',
      verification: 'Gold Standard (GS4GG)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '🛰️ Soil Organic Carbon Satellite Calibration',
      coBenefits: '30% soil moisture retention during dry winter season',
      sdgs: [2, 13, 15],
      coordinates: '23.4607° N, 91.1809° E',
      auditor: 'Bureau Veritas India'
    },
    {
      id: 'BD-2026-CR-000275',
      type: 'AWD Rice Field Methane Project',
      sector: 'Agriculture & AWD',
      sectorIcon: 'Leaf',
      region: 'Dinajpur Rice Basin',
      division: 'Rangpur',
      tonnage: 2.3,
      pricePerTonne: 15000,
      price: 34500,
      status: 'AVAILABLE',
      farmer: 'Mominul Huq (AWD Group #14)',
      farmerWallet: '01719-883491 (bKash)',
      verification: 'Verra VCS (VM0042)',
      vintage: '2026',
      additionality: 'AAA Sovereign Tier',
      mrvTelemetry: '💧 Field Perforated Tube Continuous Hydrology Sensor',
      coBenefits: 'Water table recharge & 50% nitrous oxide avoidance',
      sdgs: [1, 6, 13],
      coordinates: '25.6217° N, 88.6450° E',
      auditor: 'DoE Bangladesh Accredited VVB'
    }
  ]);

  // Sector list for filter tabs
  const sectors = [
    { key: 'ALL', label: 'All Projects', icon: Sparkles },
    { key: 'Agriculture & AWD', label: '🌾 AWD Rice Methane', icon: Leaf },
    { key: 'Nature-Based', label: '🌊 Blue Carbon & Mangrove', icon: Droplets },
    { key: 'Renewable Energy', label: '☀️ Solar & Clean Energy', icon: Sun },
    { key: 'Clean Cooking', label: '🍲 Clean Cookstoves', icon: Flame },
    { key: 'Industrial Efficiency', label: '🏭 Industry & Waste', icon: Factory }
  ];

  // Copy ID helper
  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setToastMessage(`Copied serial ID: ${id}`);
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2000);
  };

  // Filter & Search Logic
  const filteredCredits = useMemo(() => {
    return credits.filter(credit => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        credit.type.toLowerCase().includes(q) ||
        credit.farmer.toLowerCase().includes(q) ||
        credit.region.toLowerCase().includes(q) ||
        credit.id.toLowerCase().includes(q) ||
        credit.verification.toLowerCase().includes(q)
      );

      // Sector
      const matchesSector = selectedSector === 'ALL' || credit.sector === selectedSector;

      // Standard
      const matchesStandard = selectedStandard === 'ALL' || (
        selectedStandard === 'VERRA' ? credit.verification.includes('Verra') :
        selectedStandard === 'GOLD' ? credit.verification.includes('Gold Standard') :
        selectedStandard === 'DOE' ? credit.verification.includes('DoE') : true
      );

      // Region
      const matchesRegion = selectedRegion === 'ALL' || credit.division === selectedRegion;

      // Vintage
      const matchesVintage = selectedVintage === 'ALL' || credit.vintage === selectedVintage;

      return matchesSearch && matchesSector && matchesStandard && matchesRegion && matchesVintage;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'TONNAGE_DESC') return b.tonnage - a.tonnage;
      if (sortBy === 'NEWEST') return b.id.localeCompare(a.id);
      return 0; // FEATURED default
    });
  }, [credits, searchQuery, selectedSector, selectedStandard, selectedRegion, selectedVintage, sortBy]);

  // Bulk selection handling
  const handleToggleSelectBatch = (id) => {
    setSelectedBatchIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatchIds.length === filteredCredits.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(filteredCredits.map(c => c.id));
    }
  };

  // Calculate bulk summary
  const bulkSelectedCredits = useMemo(() => {
    return credits.filter(c => selectedBatchIds.includes(c.id));
  }, [credits, selectedBatchIds]);

  const bulkTotalTonnage = bulkSelectedCredits.reduce((acc, c) => acc + c.tonnage, 0).toFixed(1);
  const bulkTotalPrice = bulkSelectedCredits.reduce((acc, c) => acc + c.price, 0);

  // Purchase completion
  const handlePurchaseSuccess = (creditId) => {
    setCredits(prev => prev.map(c => 
      c.id === creditId ? { ...c, status: 'RETIRED' } : c
    ));
    setToastMessage(`Credit ${creditId} successfully retired and minted on the National Registry!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className={`pt-28 pb-20 px-4 sm:px-6 lg:px-12 w-full min-h-screen transition-colors duration-300 ${
      isLight ? 'bg-[#f2f3ee] text-[#181414]' : 'bg-[#040A06] text-white'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald text-carbon font-mono text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* ============================================================ */}
        {/* 1. HERO & MARKETPLACE BRAND HEADER                          */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl border p-8 md:p-12 transition-all duration-300">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest px-3 py-1 bg-emerald/10 border border-emerald/30 text-emerald rounded-full uppercase flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping mr-1"></span>
                  CARBON ZERO BD • SOVEREIGN CARBON REGISTRY
                </span>
                <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  Article 6.2 Aligned
                </span>
                <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  DoE Gazette S.R.O. 349
                </span>
              </div>

              <h1 className={`serif-drama text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] ${
                isLight ? 'text-[#181414]' : 'text-white'
              }`}>
                Institutional Carbon Marketplace
              </h1>

              <p className={`font-sans text-base sm:text-lg max-w-2xl leading-relaxed ${
                isLight ? 'text-[#413f3f]' : 'text-slate-300'
              }`}>
                Acquire verified, high-additionality carbon credits directly from Bangladesh's rural climate stewards. 
                Full on-chain telemetry, zero double-counting, and <strong className="text-emerald">97% direct liquidity</strong> disbursed to farmer mobile wallets.
              </p>
            </div>

            {/* Quick Guarantees Badge Group */}
            <div className={`p-4 rounded-2xl border flex flex-col space-y-2.5 shrink-0 text-xs ${
              isLight ? 'bg-white border-[#dbf0ea] shadow-sm' : 'bg-[#080F0B] border-emerald/20 shadow-xl'
            }`}>
              <div className="flex items-center space-x-2 text-emerald font-semibold">
                <CheckCircle2 size={16} />
                <span>97% Instant Mobile Banking Remittance</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <ShieldCheck size={16} className="text-amber-500" />
                <span>Verra VCS & Gold Standard Audited</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Zap size={16} className="text-cyan-400" />
                <span>Zero Brokerage / 0% Intermediary Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. REAL-TIME SPOT MARKET TICKER & TELEMETRY BAR             */}
        {/* ============================================================ */}
        <div className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-[#dbf0ea]' : 'bg-[#080F0B] border-white/10'
        }`}>
          {/* Scrolling Ticker Ribbon */}
          <div className={`px-4 py-2 border-b flex items-center space-x-6 overflow-x-auto text-[11px] font-mono no-scrollbar ${
            isLight ? 'bg-[#f2f3ee]/80 border-[#dbf0ea]' : 'bg-[#040A06] border-white/5'
          }`}>
            <span className="font-bold text-emerald shrink-0 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
              <span>LIVE SPOT TICKER:</span>
            </span>
            <div className="flex items-center space-x-6 shrink-0">
              <span className="text-slate-400">BD-SOLAR (VCU): <strong className="text-white">৳1,450/t</strong> <span className="text-emerald font-bold">▲+2.4%</span></span>
              <span className="text-slate-400">BD-MANGROVE (GS): <strong className="text-white">৳1,820/t</strong> <span className="text-emerald font-bold">▲+3.8%</span></span>
              <span className="text-slate-400">BD-AWD RICE (VCS): <strong className="text-white">৳1,250/t</strong> <span className="text-emerald font-bold">▲+1.5%</span></span>
              <span className="text-slate-400">BD-COOKSTOVE (VER): <strong className="text-white">৳980/t</strong> <span className="text-slate-400">▼-0.4%</span></span>
              <span className="text-slate-400">BD-BIOGAS (GS): <strong className="text-white">৳1,320/t</strong> <span className="text-emerald font-bold">▲+1.9%</span></span>
              <span className="text-slate-400">BD-BRICK KILN (VCS): <strong className="text-white">৳1,100/t</strong> <span className="text-emerald font-bold">▲+0.8%</span></span>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div className="p-4 sm:p-5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
                Verified Available Inventory
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-white">84,250</span>
                <span className="font-sans text-xs text-emerald font-semibold">tCO₂e</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Issued under MoEFCC Article 6
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
                Average Clean Settlement
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald">৳1,420</span>
                <span className="font-sans text-xs text-slate-400">/ tCO₂e</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                0% Platform Brokerage Mark-up
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
                Direct Farmer Disbursal
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-white">৳112.4M</span>
                <span className="font-sans text-xs text-emerald font-semibold">97% Rate</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Instant Mobile Wallet Remittance
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
                Smart Escrow Finality
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald">&lt; 6.8s</span>
                <span className="font-sans text-xs text-slate-400">Settle</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Automated Ledger Retires Batch
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. SECTOR PILL SELECTOR                                     */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {sectors.map(sec => {
            const isSelected = selectedSector === sec.key;
            return (
              <button
                key={sec.key}
                onClick={() => setSelectedSector(sec.key)}
                className={`px-4 py-2.5 rounded-xl font-sans text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 border ${
                  isSelected 
                    ? 'bg-emerald text-carbon border-emerald shadow-[0_0_15px_rgba(0,200,83,0.3)] font-bold' 
                    : isLight 
                      ? 'bg-white border-[#dbf0ea] text-[#413f3f] hover:border-emerald/40 hover:bg-slate-50' 
                      : 'bg-[#080F0B] border-white/10 text-slate-300 hover:border-emerald/30 hover:bg-white/5'
                }`}
              >
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 4. SEARCH, FILTER BAR & VIEW TOGGLE                          */}
        {/* ============================================================ */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          isLight ? 'bg-white border-[#dbf0ea]' : 'bg-[#080F0B] border-white/10'
        }`}>
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, farmer name, region, or serial ID (e.g. BD-2026-CR-000142)..."
              className={`w-full pl-10 pr-8 py-2.5 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:border-emerald ${
                isLight 
                  ? 'bg-[#f2f3ee] border-slate-200 text-[#181414] placeholder:text-slate-400' 
                  : 'bg-[#040A06] border-white/10 text-white placeholder:text-slate-500'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Standard Dropdown */}
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-emerald cursor-pointer ${
                isLight ? 'bg-[#f2f3ee] border-slate-200 text-[#181414]' : 'bg-[#040A06] border-white/10 text-slate-200'
              }`}
            >
              <option value="ALL">All Standards</option>
              <option value="VERRA">Verra VCS</option>
              <option value="GOLD">Gold Standard</option>
            </select>

            {/* Division Dropdown */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-emerald cursor-pointer ${
                isLight ? 'bg-[#f2f3ee] border-slate-200 text-[#181414]' : 'bg-[#040A06] border-white/10 text-slate-200'
              }`}
            >
              <option value="ALL">All Divisions</option>
              <option value="Khulna">Khulna Division</option>
              <option value="Rangpur">Rangpur Division</option>
              <option value="Chittagong">Chittagong Division</option>
              <option value="Dhaka">Dhaka Division</option>
              <option value="Sylhet">Sylhet Division</option>
              <option value="Rajshahi">Rajshahi Division</option>
              <option value="Barisal">Barisal Division</option>
              <option value="Mymensingh">Mymensingh Division</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-emerald cursor-pointer ${
                isLight ? 'bg-[#f2f3ee] border-slate-200 text-[#181414]' : 'bg-[#040A06] border-white/10 text-slate-200'
              }`}
            >
              <option value="FEATURED">Featured Offsets</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="TONNAGE_DESC">Volume: High to Low</option>
              <option value="NEWEST">Newest Minted</option>
            </select>

            {/* View Mode Toggle */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isLight ? 'bg-[#f2f3ee] border-slate-200' : 'bg-[#040A06] border-white/10'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-emerald text-carbon shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-emerald text-carbon shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Order Book Table View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <div>
            Showing <strong className="text-emerald">{filteredCredits.length}</strong> available carbon lots 
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </div>
          <div className="flex items-center space-x-3">
            <span>Minimum purchase: 0.1 tCO₂e</span>
            <span>•</span>
            <span className="text-emerald">Instant Retirement Available</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. VIEW MODE: GRID CARDS                                     */}
        {/* ============================================================ */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredits.map(credit => {
              const isAvailable = credit.status === 'AVAILABLE';
              const farmerRemittance = Math.round(credit.price * 0.97);

              return (
                <div 
                  key={credit.id}
                  className={`rounded-2xl border p-6 flex flex-col transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden ${
                    isLight 
                      ? 'bg-white border-[#dbf0ea] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-emerald/40' 
                      : 'bg-[#080F0B] border-white/10 hover:border-emerald/50 hover:shadow-[0_0_30px_rgba(0,200,83,0.1)]'
                  }`}
                >
                  {/* Top Ambient Highlight Banner */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        credit.verification.includes('Verra')
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {credit.verification}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        Vintage {credit.vintage}
                      </span>
                    </div>

                    {isAvailable ? (
                      <span className="flex items-center space-x-1.5 font-mono text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
                        <span>AVAILABLE</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                        RETIRED
                      </span>
                    )}
                  </div>

                  {/* Project Title & Serial */}
                  <div className="mb-3">
                    <h3 className={`font-sans font-bold text-xl leading-snug group-hover:text-emerald transition-colors ${
                      isLight ? 'text-[#181414]' : 'text-white'
                    }`}>
                      {credit.type}
                    </h3>
                    
                    <div className="flex items-center space-x-1.5 mt-1 font-mono text-[11px] text-slate-400">
                      <span>{credit.id}</span>
                      <button 
                        onClick={(e) => handleCopyId(e, credit.id)}
                        className="p-1 hover:text-emerald transition-colors" 
                        title="Copy Serial ID"
                      >
                        {copiedId === credit.id ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Producer & Origin with MapPin */}
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4 pb-3 border-b border-white/5">
                    <MapPin size={14} className="text-emerald shrink-0" />
                    <span className="truncate">{credit.region}</span>
                    <span>•</span>
                    <span className="truncate font-medium text-slate-300">{credit.farmer}</span>
                  </div>

                  {/* MRV Telemetry Tag */}
                  <div className={`p-2.5 rounded-lg border text-[11px] font-mono mb-4 flex items-center space-x-2 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#040A06] border-white/5 text-slate-300'
                  }`}>
                    <Satellite size={14} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{credit.mrvTelemetry}</span>
                  </div>

                  {/* UN SDG Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-5">
                    {credit.sdgs.map(sdg => (
                      <span 
                        key={sdg}
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald/10 text-emerald border border-emerald/20"
                      >
                        SDG {sdg}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono text-slate-500 ml-auto">
                      {credit.additionality}
                    </span>
                  </div>

                  {/* Financial Metrics Box */}
                  <div className={`mt-auto p-4 rounded-xl border mb-5 transition-colors ${
                    isLight 
                      ? 'bg-[#f2f3ee]/80 border-[#dbf0ea]' 
                      : 'bg-[#0D2B1A]/30 border-white/5'
                  }`}>
                    <div className="grid grid-cols-2 gap-3 mb-2.5">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 block mb-0.5">VOLUME</span>
                        <span className={`font-mono text-xl font-bold ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                          {credit.tonnage} <span className="text-xs font-sans text-slate-400">tCO₂e</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-slate-400 block mb-0.5">TOTAL SETTLEMENT</span>
                        <span className="font-mono text-xl font-bold text-emerald">
                          ৳{credit.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 97% Farmer Remittance Callout */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">97% Mobile Payout:</span>
                      <span className="font-bold text-emerald">৳{farmerRemittance.toLocaleString()} direct to wallet</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInspectCredit(credit)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-colors ${
                        isLight 
                          ? 'border-slate-300 text-slate-700 hover:bg-slate-100' 
                          : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <FileText size={13} />
                      <span>MRV Dossier</span>
                    </button>

                    <button
                      disabled={!isAvailable}
                      onClick={() => setSelectedCredit(credit)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm ${
                        isAvailable
                          ? 'bg-emerald text-carbon hover:bg-emerald/90 shadow-[0_0_15px_rgba(0,200,83,0.25)] hover:shadow-[0_0_20px_rgba(0,200,83,0.4)]'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      <ShoppingCart size={13} />
                      <span>{isAvailable ? 'Buy & Settle' : 'Retired'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. VIEW MODE: ORDER BOOK (TABLE VIEW)                        */}
        {/* ============================================================ */}
        {viewMode === 'table' && (
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isLight ? 'bg-white border-[#dbf0ea] shadow-sm' : 'bg-[#080F0B] border-white/10'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-mono text-[10px] text-slate-400 uppercase tracking-wider ${
                    isLight ? 'bg-[#f2f3ee]' : 'bg-[#040A06]'
                  }`}>
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox"
                        checked={selectedBatchIds.length === filteredCredits.length && filteredCredits.length > 0}
                        onChange={handleSelectAll}
                        className="rounded text-emerald focus:ring-emerald"
                      />
                    </th>
                    <th className="p-4">Serial ID</th>
                    <th className="p-4">Project Name</th>
                    <th className="p-4">Sector</th>
                    <th className="p-4">Standard</th>
                    <th className="p-4">Region / Farmer</th>
                    <th className="p-4 text-right">Available (tCO₂e)</th>
                    <th className="p-4 text-right">Total (৳)</th>
                    <th className="p-4 text-right">97% Remittance</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCredits.map(credit => {
                    const isSelected = selectedBatchIds.includes(credit.id);
                    const isAvailable = credit.status === 'AVAILABLE';
                    const farmerRemittance = Math.round(credit.price * 0.97);

                    return (
                      <tr 
                        key={credit.id}
                        className={`transition-colors hover:bg-emerald/5 ${
                          isSelected ? 'bg-emerald/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input 
                            type="checkbox"
                            disabled={!isAvailable}
                            checked={isSelected}
                            onChange={() => handleToggleSelectBatch(credit.id)}
                            className="rounded text-emerald focus:ring-emerald"
                          />
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {credit.id}
                        </td>
                        <td className="p-4 font-bold text-white">
                          <button 
                            onClick={() => setInspectCredit(credit)}
                            className="hover:text-emerald text-left font-sans font-bold"
                          >
                            {credit.type}
                          </button>
                        </td>
                        <td className="p-4 text-slate-400">
                          {credit.sector}
                        </td>
                        <td className="p-4 font-mono text-[10px]">
                          <span className={`px-2 py-0.5 rounded border ${
                            credit.verification.includes('Verra')
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {credit.verification}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">
                          <div>{credit.region}</div>
                          <div className="text-[10px] text-slate-500">{credit.farmer}</div>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-white">
                          {credit.tonnage}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald">
                          ৳{credit.price.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-mono text-[11px] text-slate-400">
                          ৳{farmerRemittance.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            disabled={!isAvailable}
                            onClick={() => setSelectedCredit(credit)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isAvailable
                                ? 'bg-emerald text-carbon hover:bg-emerald/90'
                                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isAvailable ? 'Buy' : 'Sold'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bulk Sticky Action Bar (When >= 1 item selected) */}
            {selectedBatchIds.length > 0 && (
              <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-30 ${
                isLight ? 'bg-white border-[#dbf0ea] shadow-lg' : 'bg-[#0D2B1A] border-emerald/30 shadow-2xl'
              }`}>
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-xs font-bold text-emerald bg-emerald/10 px-2.5 py-1 rounded">
                    {selectedBatchIds.length} Batches Selected
                  </span>
                  <span className="text-xs">
                    Total Volume: <strong className="text-white font-mono">{bulkTotalTonnage} tCO₂e</strong>
                  </span>
                  <span className="text-xs">
                    Total Cost: <strong className="text-emerald font-mono text-sm">৳{bulkTotalPrice.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedBatchIds([])}
                    className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => {
                      // Checkout first selected or combined batch
                      const first = credits.find(c => c.id === selectedBatchIds[0]);
                      if (first) {
                        setSelectedCredit({
                          ...first,
                          tonnage: parseFloat(bulkTotalTonnage),
                          price: bulkTotalPrice,
                          type: `Bulk Basket: ${selectedBatchIds.length} Projects (${first.type} + others)`
                        });
                      }
                    }}
                    className="px-6 py-2.5 bg-emerald text-carbon font-bold font-sans text-xs rounded-xl hover:bg-emerald/90 transition-all shadow-[0_0_20px_rgba(0,200,83,0.3)]"
                  >
                    Proceed to Bulk Checkout (৳{bulkTotalPrice.toLocaleString()})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* 7. MRV DOSSIER MODAL                                         */}
      {/* ============================================================ */}
      {inspectCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 my-8 relative shadow-2xl ${
            isLight ? 'bg-white border-[#dbf0ea]' : 'bg-[#080F0B] border-emerald/30'
          }`}>
            <button 
              onClick={() => setInspectCredit(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-[10px] text-emerald bg-emerald/10 px-2 py-0.5 rounded font-bold uppercase">
                CARBON ZERO BD • AUDIT DOSSIER
              </span>
              <span className="font-mono text-[10px] text-slate-400">Serial ID: {inspectCredit.id}</span>
            </div>

            <h2 className={`text-2xl font-bold mb-1 ${isLight ? 'text-[#181414]' : 'text-white'}`}>
              {inspectCredit.type}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Origin: {inspectCredit.region} • Producer: {inspectCredit.farmer}
            </p>

            <div className="space-y-4 text-xs">
              {/* Telemetry Block */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#040A06] border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 flex items-center space-x-1.5">
                    <Satellite size={13} />
                    <span>Remote Sensing & Ground Sensor Verification</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald">Audit Verified</span>
                </div>
                <p className="text-slate-300">{inspectCredit.mrvTelemetry}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                  <div>GPS Coordinates: <span className="text-white">{inspectCredit.coordinates}</span></div>
                  <div>Accredited Auditor: <span className="text-white">{inspectCredit.auditor}</span></div>
                </div>
              </div>

              {/* Additionality & Co-benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}>
                  <span className="font-mono text-[10px] text-slate-400 block mb-1">SOVEREIGN ADDITIONALITY</span>
                  <span className="font-bold text-sm text-emerald block">{inspectCredit.additionality}</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Projects exceed Bangladesh Baseline NDC 2021 criteria under Article 6.2 bilateral trade.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}>
                  <span className="font-mono text-[10px] text-slate-400 block mb-1">CO-BENEFITS</span>
                  <span className="text-[11px] text-slate-300 block">{inspectCredit.coBenefits}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className={`p-3.5 rounded-xl border flex justify-between items-center ${
                isLight ? 'bg-emerald/5 border-emerald/20' : 'bg-[#0D2B1A]/40 border-emerald/20'
              }`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">TOTAL LOT VALUATION</span>
                  <span className="text-lg font-bold text-emerald font-mono">
                    ৳{inspectCredit.price.toLocaleString()} ({inspectCredit.tonnage} tCO₂e)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">DIRECT FARMER WALLET</span>
                  <span className="text-xs font-mono font-bold text-white">{inspectCredit.farmerWallet}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => setInspectCredit(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close Dossier
              </button>
              <button
                onClick={() => {
                  const toBuy = inspectCredit;
                  setInspectCredit(null);
                  setSelectedCredit(toBuy);
                }}
                className="flex-1 py-2.5 bg-emerald text-carbon font-bold font-sans text-xs rounded-xl hover:bg-emerald/90 transition-all shadow-[0_0_20px_rgba(0,200,83,0.3)]"
              >
                Proceed to Purchase This Credit (৳{inspectCredit.price.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. PURCHASE & SETTLEMENT MODAL                               */}
      {/* ============================================================ */}
      {selectedCredit && (
        <PurchaseConfirmModal 
          credit={selectedCredit}
          creditId={selectedCredit.id} 
          onClose={() => setSelectedCredit(null)} 
          onPurchaseComplete={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default MarketplaceBrowse;
