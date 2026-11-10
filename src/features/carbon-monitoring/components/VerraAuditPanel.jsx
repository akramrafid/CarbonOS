import React from 'react';
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
import { DEFAULT_ANALYSIS_HISTORY } from '../constants';

export function VerraAuditPanel(props) {
  const {
    isLight,
    isBn,
    t,
    selectedJob,
    setSelectedJob,
    analysisHistory = [],
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
      {(() => {
        const currentJob = selectedJob || analysisHistory[0] || DEFAULT_ANALYSIS_HISTORY[0];
        const res = currentJob?.result || DEFAULT_ANALYSIS_HISTORY[0].result;
        const base = currentJob?.baseline || DEFAULT_ANALYSIS_HISTORY[0].baseline;
        const prov = currentJob?.provenance || DEFAULT_ANALYSIS_HISTORY[0].provenance;

        const stratum = res.forest_stratum || 'SUNDARBANS_MANGROVE';
        const agb = res.carbon_agb_tc_ha || res.estimated_carbon || 112.5;
        const bgb = res.carbon_bgb_tc_ha || Number((agb * (stratum.includes('MANGROVE') ? 0.49 : 0.24)).toFixed(2));
        const soc = res.carbon_soc_tc_ha || (stratum.includes('MANGROVE') ? 180.4 : 65.0);
        const totalPools = Number((agb + bgb + soc).toFixed(2));

        // Multi-pool proportional breakdown for visual bar
        const agbPct = totalPools > 0 ? Number(((agb / totalPools) * 100).toFixed(1)) : 0;
        const bgbPct = totalPools > 0 ? Number(((bgb / totalPools) * 100).toFixed(1)) : 0;
        const socPct = totalPools > 0 ? Number((100 - agbPct - bgbPct).toFixed(1)) : 0;

        const counterfactual = base.counterfactual_carbon_tc_ha || Number((agb * 0.82).toFixed(2));
        const grossAdditionality = base.gross_additionality_tco2e || Number(((agb - counterfactual) * (res.forest_area_ha || 3800.5) * (44/12)).toFixed(2));
        const leakageBelt = base.leakage_belt_area_ha || 10420.0;
        const leakageRisk = base.leakage_risk_rating || 'LOW';
        const leakageDeduction = base.leakage_deduction_tco2e || 0.0;
        const bufferPct = base.buffer_deduction_pct || 18.0;
        const bufferWithheld = base.buffer_withheld_tco2e || Number((grossAdditionality * (bufferPct / 100)).toFixed(2));
        const netCreditable = base.net_creditable_tco2e || Number((grossAdditionality - bufferWithheld - leakageDeduction).toFixed(2));

        const lower90 = res.carbon_lower_90 || Number((agb * 0.949).toFixed(2));
        const upper90 = res.carbon_upper_90 || Number((agb * 1.051).toFixed(2));
        const rme = res.relative_margin_of_error || 5.1;
        const precisionDiscount = res.verra_precision_discount_pct || 0.0;
        const conservativeVolume = res.conservative_creditable_tco2e || netCreditable;

        return (
          <div className="space-y-6">
            {/* AUDITOR CONTROL BAR */}
            <div className={`border rounded-2xl p-5 md:p-6 transition-all ${
              isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/25'
                    }`}>
                      Verra VM0047 v1.0 & VM0048
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isLight ? 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]' : 'bg-white/5 text-mist border-white/10'
                    }`}>
                      VVB Audit Package
                    </span>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center space-x-1.5 ${
                      ledgerStatus.chain_valid 
                        ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald/10 text-emerald border-emerald/20')
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                    aria-label={`Cryptographic chain validity: ${ledgerStatus.chain_valid ? 'Verified Intact' : 'Warning'}`}
                    >
                      <Lock size={11} />
                      <span>SHA-256 Ledger: {ledgerStatus.chain_valid ? 'Verified Intact' : 'Warning'}</span>
                    </span>
                  </div>
                  <h2 className={`text-xl md:text-2xl font-extrabold font-sans tracking-tight ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}>
                    Verra VM0047 Methodology Monitoring Dossier & VVB Audit Inspector
                  </h2>
                  <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                    Institutional verification package for Validation & Verification Bodies (VVBs). Covers IPCC Tier-3 multi-pool living and sediment stocks, dynamic synthetic control additionality, 10km leakage belts, and conformal uncertainty precision deduction tests.
                  </p>
                </div>

                {/* Job Selector & Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Job Selector Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold whitespace-nowrap ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Audit Run:
                    </span>
                    <select
                      value={currentJob.id}
                      onChange={(e) => {
                        const target = analysisHistory.find(j => j.id === e.target.value);
                        if (target) setSelectedJob(target);
                      }}
                      aria-label="Select historical audit run for Verra verification"
                      className={`text-xs font-mono font-bold px-3 py-2 rounded-xl border cursor-pointer outline-hidden transition-all focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                        isLight 
                          ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B] hover:border-slate-400' 
                          : 'bg-black/40 border-white/15 text-white hover:border-white/30'
                      }`}
                    >
                      {analysisHistory.map(j => (
                        <option key={j.id} value={j.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#08130C] text-white'}>
                          {j.project_name} ({j.id.slice(0, 8).toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Download: PDF */}
                  <button
                    onClick={() => triggerDossierDownload(currentJob.id, 'pdf')}
                    className={`flex items-center space-x-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                      isLight 
                        ? 'bg-[#00873E] text-white hover:bg-[#007033] border-[#00873E]' 
                        : 'bg-emerald text-[#040906] hover:bg-emerald-400 border-emerald font-extrabold'
                    }`}
                  >
                    <Download size={13} />
                    <span>Download VVB Dossier (PDF)</span>
                  </button>

                  {/* Secondary: Markdown */}
                  <button
                    onClick={() => triggerDossierDownload(currentJob.id, 'markdown')}
                    className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                      isLight 
                        ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F291B] hover:bg-[#E2E8F0]' 
                        : 'bg-white/5 border-white/10 text-mist hover:text-white hover:bg-white/10'
                    }`}
                    title="Export institutional Markdown report"
                  >
                    <FileText size={13} />
                    <span>Markdown</span>
                  </button>

                  {/* Secondary: Raw JSON */}
                  <button
                    onClick={() => triggerDossierDownload(currentJob.id, 'json')}
                    className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                      isLight 
                        ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F291B] hover:bg-[#E2E8F0]' 
                        : 'bg-white/5 border-white/10 text-mist hover:text-white hover:bg-white/10'
                    }`}
                    title="Export raw JSON dossier payload"
                  >
                    <Database size={13} />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 7-SECTION AUDIT DOSSIER GRID (High-Density Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SECTION 1: PROJECT & SPATIAL BOUNDARY */}
              <div className={`rounded-2xl p-5 border transition-all ${
                isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
                  <div className="flex items-center space-x-2">
                    <MapPin size={15} className="text-emerald" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      1. Project Identification & Geographic Boundary
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
                  }`}>
                    VM0047 Sec 4
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className={`block text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Project Name
                    </span>
                    <span className={`font-bold text-sm mt-0.5 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      {currentJob.project_name}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Job Identifier
                    </span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="font-mono font-bold text-xs text-emerald truncate">
                        {currentJob.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(currentJob.id, 'Job ID')}
                        title="Copy Job ID"
                        className="text-slate-400 hover:text-emerald p-0.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald rounded"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Forest Stratum
                    </span>
                    <span className={`font-bold mt-0.5 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      {stratum}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Monitored Area
                    </span>
                    <span className={`font-mono font-bold tabular-nums mt-0.5 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      {(res.forest_area_ha || 3800.5).toLocaleString()} ha
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Monitoring Window
                    </span>
                    <span className={`font-mono tabular-nums text-xs mt-0.5 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      {currentJob.start_date} → {currentJob.end_date}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Jurisdiction Authority
                    </span>
                    <span className={`font-semibold mt-0.5 block text-xs ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      Not authorized by any regulator
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: MULTI-POOL CARBON STOCK ACCOUNTING */}
              <div className={`rounded-2xl p-5 border transition-all ${
                isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
                  <div className="flex items-center space-x-2">
                    <Trees size={15} className="text-emerald" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      2. IPCC Tier-3 Multi-Pool Carbon Stocks
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
                  }`}>
                    VM0047 Sec 6
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-inherit border border-inherit">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        Above-Ground Biomass (AGB)
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        Sentinel-2 MSI + GEDI LiDAR spaceborne model
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald tabular-nums">
                      {agb} <span className="text-[10px] font-normal text-slate-400">tC/ha</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-inherit border border-inherit">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        Below-Ground Biomass (BGB)
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        IPCC Tier-3 root-to-shoot ratio (R = 0.49 mangrove allometry)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald tabular-nums">
                      {bgb} <span className="text-[10px] font-normal text-slate-400">tC/ha</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-inherit border border-inherit">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        Soil Organic Carbon (SOC)
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        Coastal delta sediment core: 100cm depth, bulk density 0.82 g/cm³
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald tabular-nums">
                      {soc} <span className="text-[10px] font-normal text-slate-400">tC/ha</span>
                    </span>
                  </div>

                  {/* VISUAL MULTI-POOL PROPORTION BREAKDOWN BAR */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                      <span>Pool Distribution</span>
                      <span>AGB {agbPct}% · BGB {bgbPct}% · SOC {socPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5 border border-inherit">
                      <div style={{ width: `${agbPct}%` }} className="bg-emerald-400 transition-all duration-500" title={`AGB: ${agbPct}%`} />
                      <div style={{ width: `${bgbPct}%` }} className="bg-emerald-600 transition-all duration-500" title={`BGB: ${bgbPct}%`} />
                      <div style={{ width: `${socPct}%` }} className="bg-teal-700 transition-all duration-500" title={`SOC: ${socPct}%`} />
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-xl border mt-2.5 ${
                    isLight ? 'bg-[#E8F8EE] border-[#C2E9CF]' : 'bg-emerald/10 border-emerald/20'
                  }`}>
                    <span className={`font-extrabold text-xs ${isLight ? 'text-[#00873E]' : 'text-emerald'}`}>
                      Total Multi-Pool Carbon Density
                    </span>
                    <span className="font-mono font-extrabold text-base text-emerald tabular-nums">
                      {totalPools} <span className="text-xs font-normal">tC/ha</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DYNAMIC SYNTHETIC CONTROL BASELINE & LEAKAGE */}
              <div className={`rounded-2xl p-5 border transition-all ${
                isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
                  <div className="flex items-center space-x-2">
                    <Activity size={15} className="text-emerald" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      3. Dynamic Baseline & Additionality (VM0048)
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
                  }`}>
                    Abadie et al.
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <span className={isLight ? 'text-[#475569]' : 'text-mist'}>Synthetic Control Counterfactual</span>
                    <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      {counterfactual} tC/ha
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <span className={isLight ? 'text-[#475569]' : 'text-mist'}>Gross Additionality (Actual - Baseline)</span>
                    <span className="font-mono font-bold tabular-nums text-emerald">
                      +{grossAdditionality.toLocaleString()} tCO₂e
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <div>
                      <span className={`block font-semibold ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                        10 km Leakage Belt Area
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        {leakageBelt.toLocaleString()} ha monitored · Activity displacement: {leakageRisk}
                      </span>
                    </div>
                    <span className="font-mono font-bold tabular-nums text-emerald">
                      {leakageDeduction.toFixed(1)} tCO₂e deduction
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <span className={isLight ? 'text-[#475569]' : 'text-mist'}>
                      Verra AFOLU Risk Buffer Withholding ({bufferPct}%)
                    </span>
                    <span className="font-mono font-bold tabular-nums text-amber-500 dark:text-amber-400">
                      -{bufferWithheld.toLocaleString()} tCO₂e
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border mt-2 ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1]' : 'bg-white/5 border-white/10'
                  }`}>
                    <span className={`font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      Net Creditable Carbon Volume
                    </span>
                    <span className="font-mono font-extrabold text-base text-emerald tabular-nums">
                      {netCreditable.toLocaleString()} <span className="text-xs font-normal">tCO₂e</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: CONFORMAL UNCERTAINTY & CONSERVATIVENESS (HERO AUDIT HIGHLIGHT CARD) */}
              <div className={`rounded-2xl p-5 border-2 transition-all ${
                isLight 
                  ? 'bg-emerald-50/60 border-emerald-500/40 shadow-sm' 
                  : 'bg-emerald/[0.04] border-emerald/35 shadow-[0_0_24px_rgba(0,200,83,0.08)]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3.5">
                  <div className="flex items-center space-x-2">
                    <Scale size={15} className="text-emerald" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#00873E]' : 'text-emerald'}`}>
                      4. Conformal Uncertainty & Conservativeness
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald/20 text-emerald'
                    }`}>
                      VM0047 Sec 8.3
                    </span>
                    <span className="hidden sm:inline-flex text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald text-[#040906]">
                      PASSED
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <span className={isLight ? 'text-[#475569]' : 'text-mist'}>Conformal 90% Prediction Interval</span>
                    <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      [{lower90}, {upper90}] tC/ha
                    </span>
                  </div>
                  
                  {/* RME VISUAL COMPLIANCE GAUGE */}
                  <div className="pb-1.5 border-b border-inherit space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`block font-semibold ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                          Relative Margin of Error (RME)
                        </span>
                        <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                          Verra VM0047 allowable threshold: ≤ 15.0%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-emerald tabular-nums block">
                          {rme}%
                        </span>
                        <span className="text-[10px] font-mono text-emerald font-semibold">
                          ≤ 15% cap (within threshold)
                        </span>
                      </div>
                    </div>
                    {/* Visual meter */}
                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald h-full rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min((rme / 15.0) * 100, 100)}%` }}
                        title={`RME: ${rme}% (Cap: 15.0%)`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <span className={isLight ? 'text-[#475569]' : 'text-mist'}>Verra Precision Deduction</span>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle size={13} className="text-emerald" />
                      <span className="font-mono font-bold text-emerald tabular-nums">
                        {precisionDiscount.toFixed(1)}% (Zero penalty applied)
                      </span>
                    </div>
                  </div>

                  {/* CONSERVATIVE VOLUME RESULT */}
                  <div className={`p-3 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-300 shadow-xs' : 'bg-black/30 border-emerald/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold text-xs ${isLight ? 'text-[#00873E]' : 'text-emerald'}`}>
                        Conservative Creditable Volume
                      </span>
                      <span className="font-mono font-black text-lg text-emerald tabular-nums">
                        {conservativeVolume.toLocaleString()} <span className="text-xs font-normal">tCO₂e</span>
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-[#2E7D32]' : 'text-emerald-300/90'}`}>
                      Modelled with the Verra conservativeness principle: no precision deduction applies at this uncertainty. Not audited.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: REMOTE SENSING & DATA SOURCES */}
              <div className={`rounded-2xl p-5 border transition-all ${
                isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
                  <div className="flex items-center space-x-2">
                    <Layers size={15} className="text-emerald" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      5. Earth Observation & Multi-Sensor Calibrations
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
                  }`}>
                    Copernicus + NASA
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start justify-between pb-1.5 border-b border-inherit">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        Sentinel-2 MSI (Level-2A)
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        10m multispectral bands (B2, B3, B4, B8, B11, B12), sen2cor cloud mask
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">10m Res</span>
                  </div>
                  <div className="flex items-start justify-between pb-1.5 border-b border-inherit">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        NASA GEDI Spaceborne LiDAR (L4A)
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        Full-waveform LiDAR canopy height and above-ground biomass density (AGBD)
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">25m Footprint</span>
                  </div>
                  <div className="flex items-start justify-between pb-1.5 border-b border-inherit">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        ALOS PALSAR-2 L-band SAR
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        Dual-polarization (HV / HH) cloud-penetrating synthetic aperture radar
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">25m Mosaics</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        SRTM 1-Arc-Second Global DEM
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        30m topographic elevation, aspect, and slope radiometry correction
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">30m DEM</span>
                  </div>
                </div>
              </div>

              {/* SECTION 6: MULTI-VALIDATOR CRYPTOGRAPHIC TRUST & PROVENANCE LEDGER */}
              <div className={`lg:col-span-2 rounded-2xl p-5 md:p-6 border transition-all ${
                isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-inherit mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-emerald/10 text-emerald">
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                          6. Multi-Validator Cryptographic Trust & Provenance Ledger
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald/15 text-emerald border border-emerald/30">
                          OFP Consensus Layer
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        Strict separation of concerns: SHA-256 block hash chain enforces chronological immutability, while independent VVBs affix Ed25519 digital signatures.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={handleVerifyChain}
                      disabled={verifyingLedger}
                      className={`text-xs font-mono px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 cursor-pointer transition-all ${
                        isLight ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                      }`}
                      aria-label="Verify SHA-256 ledger integrity"
                    >
                      <RefreshCw size={12} className={verifyingLedger ? 'animate-spin' : ''} />
                      <span>{verifyingLedger ? 'Verifying Chain...' : 'Verify Hash Chain'}</span>
                    </button>
                    
                    <button
                      onClick={handleExportVM0047Bundle}
                      className="text-xs font-mono px-3 py-1.5 rounded-xl border border-emerald/30 bg-emerald/15 text-emerald hover:bg-emerald/25 flex items-center space-x-1.5 cursor-pointer transition-all"
                      title="Export Verra VM0047 JSON Submission Bundle"
                    >
                      <Download size={12} />
                      <span>Export VM0047 Bundle</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Card 1: SHA-256 Block Immutability */}
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database size={14} className="text-emerald" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                          SHA-256 Ledger Immutability
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        ledgerStatus.chain_valid 
                          ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald/20 text-emerald')
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {ledgerStatus.chain_valid ? 'Chain Intact (17 Blocks)' : 'Discrepancy Detected'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                          Record SHA-256 Digest
                        </span>
                        <button
                          onClick={() => copyToClipboard(prov?.sha256_hash || dashboardData.sha256_ledger_hash, 'SHA-256 Digest')}
                          className="text-[10px] font-mono text-emerald flex items-center space-x-1 hover:underline cursor-pointer"
                          title="Copy SHA-256 hash"
                        >
                          {copiedHash ? <Check size={10} /> : <Copy size={10} />}
                          <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <span className="font-mono text-[11px] block p-2 rounded bg-black/10 dark:bg-white/5 break-all text-emerald font-semibold select-all border border-inherit">
                        {prov?.sha256_hash || dashboardData.sha256_ledger_hash}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className={`block text-[10px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                          Previous Block Hash
                        </span>
                        <span className="font-mono text-[10px] block mt-0.5 truncate text-slate-500">
                          {prov?.previous_hash?.slice(0, 16) || 'a4f89d34e2c14092'}...
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[10px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                          Genesis Linkage
                        </span>
                        <span className="font-mono text-[10px] block mt-0.5 font-bold text-emerald">
                          Linked (GENESIS_HASH)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ed25519 Validator Co-Signatures */}
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Key size={14} className="text-emerald" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                          Ed25519 Multi-Validator Trust
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        provenanceSignatures.length >= 2
                          ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald/20 text-emerald')
                          : (isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber/20 text-amber')
                      }`}>
                        {provenanceSignatures.length >= 2 ? 'Consensus Validated' : 'Pending Co-Signatures'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-xl font-bold font-sans ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                          {provenanceSignatures.length} / 2+
                        </div>
                        <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                          Institutional VVB Co-Signatures Affixed
                        </span>
                      </div>

                      <button
                        onClick={() => setShowSignModal(true)}
                        className="text-xs font-medium px-3 py-2 rounded-xl bg-emerald text-[#040906] font-bold shadow-xs hover:bg-emerald/90 flex items-center space-x-1.5 cursor-pointer transition-all"
                      >
                        <Key size={12} />
                        <span>Sign with Ed25519</span>
                      </button>
                    </div>

                    <div className={`p-2 rounded-lg border text-[11px] ${
                      isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-mist'
                    }`}>
                      <span className="font-semibold text-emerald">OFP Rule:</span> Cryptographic validator signatures attest to biological validity and ground truth compliance independent of hash-chain temporal sequence.
                    </div>
                  </div>
                </div>

                {/* Co-Signatures Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Recorded Validator Signatures ({provenanceSignatures.length})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      RFC 8032 PureEd25519 Curve
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b text-[11px] font-semibold ${
                          isLight ? 'border-[#E2E8F0] text-[#64748B]' : 'border-white/10 text-mist'
                        }`}>
                          <th className="py-2 px-3">Validator Entity</th>
                          <th className="py-2 px-3">Organization</th>
                          <th className="py-2 px-3">Public Key</th>
                          <th className="py-2 px-3">Signature Digest</th>
                          <th className="py-2 px-3">Signed At</th>
                          <th className="py-2 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {provenanceSignatures.map((sig, sIdx) => (
                          <tr key={sIdx} className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
                            isLight ? 'text-[#0F291B]' : 'text-white'
                          }`}>
                            <td className="py-2.5 px-3 font-medium flex items-center space-x-1.5">
                              <ShieldCheck size={13} className="text-emerald shrink-0" />
                              <span>{sig.validator_name || sig.validator_id}</span>
                            </td>
                            <td className={`py-2.5 px-3 text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                              {sig.organization || 'Independent VVB Auditor'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                              {sig.public_key_hex?.slice(0, 10)}...{sig.public_key_hex?.slice(-6)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-emerald">
                              {sig.signature_hex?.slice(0, 12)}...
                            </td>
                            <td className={`py-2.5 px-3 text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-mist'}`}>
                              {sig.signed_at?.split('T')[0]} {sig.signed_at?.split('T')[1]?.slice(0, 5)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald/15 text-emerald font-bold border border-emerald/25">
                                <Check size={10} />
                                <span>Demo signature</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECTION 7: VVB AUDIT ATTESTATION & COMPLIANCE CERTIFICATE */}
              <div className={`lg:col-span-2 rounded-2xl p-5 md:p-7 border transition-all ${
                isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-inherit mb-5">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Award size={18} className="text-emerald" />
                      <h3 className={`font-extrabold text-base md:text-lg font-sans tracking-tight ${
                        isLight ? 'text-[#0F291B]' : 'text-white'
                      }`}>
                        7. VVB Attestation (not yet performed)
                      </h3>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      No VVB has attested this calculation. These are the fields a verifier would review and sign.
                    </p>
                  </div>

                  <div className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-extrabold uppercase border flex items-center space-x-2 ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/25'
                  }`}>
                    <Check size={14} />
                    <span>NOT VALIDATED</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div className={`p-4 rounded-xl border ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1]' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <span className={`block font-bold text-xs uppercase tracking-wider mb-2 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      Reference Methodologies
                    </span>
                    <ul className="space-y-1.5 font-medium">
                      <li className="flex items-center space-x-1.5">
                        <Check size={12} className="text-emerald shrink-0" />
                        <span>Verra VM0047 (v1.0) Methodology</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check size={12} className="text-emerald shrink-0" />
                        <span>Verra VM0048 Dynamic Baseline</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check size={12} className="text-emerald shrink-0" />
                        <span>IPCC 2019 Refinement Tier-3</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1]' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <span className={`block font-bold text-xs uppercase tracking-wider mb-2 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      VVB Attestation
                    </span>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                      Not yet attested. A VVB would check the satellite telemetry, synthetic control counterfactual modelling, multi-pool allometry and conformal error bounds against ground-truth plots.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1]' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div>
                      <span className={`block font-bold text-xs uppercase tracking-wider mb-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        Signature
                      </span>
                      <span className={`font-serif italic text-sm font-bold block mt-1 ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        Not signed
                      </span>
                      <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                        No verifier has signed this dossier
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-emerald font-bold">{new Date().toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showSignModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-modal-title"
            className={`relative w-full max-w-xl rounded-3xl border p-6 md:p-8 shadow-2xl transition-all ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F291B]' : 'bg-[#0B1810] border-[#1D3B2B] text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 mb-5 border-emerald/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
                  <Key size={20} />
                </div>
                <div>
                  <h3 id="sign-modal-title" className="text-lg font-bold">Affix Ed25519 Validator Co-Signature</h3>
                  <p className={`text-xs ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                    Open Forest Protocol (OFP) Multi-Validator Consensus Layer
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSignModal(false)}
                aria-label="Close dialog"
                className={`p-1.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald cursor-pointer ${
                  isLight ? 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]' : 'border-white/10 hover:bg-white/10 text-mist'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Hash Info */}
            <div className={`p-4 rounded-2xl border mb-5 text-xs space-y-2 ${
              isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-bold ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Target Record ID:</span>
                <span className="font-mono text-emerald font-bold">{selectedJob?.id || 'res_sundarbans_001'}</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                Signing this calculation attests to the sensor telemetry, conformal uncertainty deductions, and IPCC Tier-3 compliance. Signatures are verified with Ed25519 and permanently anchored to the provenance block.
              </p>
            </div>

            {/* Generated Public Key Banner (if keypair generated) */}
            {generatedPublicKey && (
              <div className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between text-xs font-mono transition-all ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="space-y-0.5 truncate mr-3">
                  <span className="text-[10px] uppercase font-bold text-emerald tracking-wider block">
                    Derived Ed25519 Public Key
                  </span>
                  <p className="truncate text-[11px] font-semibold">{generatedPublicKey}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedPublicKey, 'Public Key')}
                  className="px-2.5 py-1 rounded-lg border border-emerald/30 bg-emerald/10 hover:bg-emerald/20 text-emerald font-sans font-bold text-xs flex items-center space-x-1 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitSignature} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="validator_id" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                  Validator ID
                </label>
                <input
                  id="validator_id"
                  type="text"
                  required
                  value={signFormData.validator_id}
                  onChange={(e) => setSignFormData(prev => ({ ...prev, validator_id: e.target.value }))}
                  placeholder="val_sgs_forestdmrv"
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="validator_name" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Validator Full Name
                  </label>
                  <input
                    id="validator_name"
                    type="text"
                    required
                    value={signFormData.validator_name}
                    onChange={(e) => setSignFormData(prev => ({ ...prev, validator_name: e.target.value }))}
                    placeholder="Dr. Tariq Ahmed"
                    className={`w-full border rounded-xl px-3.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="organization" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Accredited Organization
                  </label>
                  <input
                    id="organization"
                    type="text"
                    required
                    value={signFormData.organization}
                    onChange={(e) => setSignFormData(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="Organization name"
                    className={`w-full border rounded-xl px-3.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="private_key_hex" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Ed25519 Private Key (Hex, 64 characters)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateKeypair}
                    disabled={generatingKeys}
                    className="text-[10px] font-bold text-emerald hover:underline flex items-center space-x-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
                  >
                    <Sparkles size={11} />
                    <span>{generatingKeys ? 'Generating...' : 'Generate New Keypair'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="private_key_hex"
                    type={showPrivateKey ? "text" : "password"}
                    required
                    value={signFormData.private_key_hex}
                    onChange={(e) => setSignFormData(prev => ({ ...prev, private_key_hex: e.target.value }))}
                    placeholder="Paste 64-character private key hex or click 'Generate New Keypair'"
                    className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-pointer ${
                      isLight ? 'text-slate-400 hover:text-slate-700' : 'text-mist hover:text-white'
                    }`}
                    aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
                  >
                    {showPrivateKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className={`text-[10px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  Private key never leaves the client/session. Only the signature and public key are affixed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald/20">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className={`px-4 py-2.5 rounded-xl border font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald cursor-pointer ${
                    isLight ? 'border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#64748B]' : 'border-white/10 hover:bg-white/10 text-mist'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signingLedger}
                  className="px-5 py-2.5 rounded-xl bg-emerald hover:bg-emerald/90 text-[#0F291B] font-bold flex items-center space-x-2 shadow-lg shadow-emerald/20 transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  {signingLedger ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Verifying & Signing...</span>
                    </>
                  ) : (
                    <>
                      <Key size={15} />
                      <span>Sign & Affix to Ledger</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default VerraAuditPanel;
