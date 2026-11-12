import React from 'react';
import { DEFAULT_ANALYSIS_HISTORY } from '../constants';
import { VerraControlBar } from './verra/VerraControlBar';
import { SpatialBoundaryCard } from './verra/SpatialBoundaryCard';
import { MultiPoolStockCard } from './verra/MultiPoolStockCard';
import { DynamicBaselineCard } from './verra/DynamicBaselineCard';
import { ConformalUncertaintyCard } from './verra/ConformalUncertaintyCard';
import { RemoteSensingCard } from './verra/RemoteSensingCard';
import { CryptographicLedgerCard } from './verra/CryptographicLedgerCard';
import { VvbAttestationCard } from './verra/VvbAttestationCard';
import { VerraSignModal } from './verra/VerraSignModal';

export function VerraAuditPanel(props) {
  const {
    isLight,
    isBn,
    t,
    selectedJob,
    setSelectedJob,
    analysisHistory = [],
    ledgerStatus = {},
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
    setShowPrivateKey,
    generatedPublicKey,
    provenanceSignatures,
    dashboardData
  } = props;

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
    <>
      <div className="space-y-6">
        {/* AUDITOR CONTROL BAR */}
        <VerraControlBar
          isLight={isLight}
          currentJob={currentJob}
          analysisHistory={analysisHistory}
          setSelectedJob={setSelectedJob}
          ledgerStatus={ledgerStatus}
          triggerDossierDownload={triggerDossierDownload}
        />

        {/* 7-SECTION AUDIT DOSSIER GRID (High-Density Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpatialBoundaryCard
            isLight={isLight}
            currentJob={currentJob}
            res={res}
            stratum={stratum}
            copyToClipboard={copyToClipboard}
          />

          <MultiPoolStockCard
            isLight={isLight}
            agb={agb}
            bgb={bgb}
            soc={soc}
            totalPools={totalPools}
            agbPct={agbPct}
            bgbPct={bgbPct}
            socPct={socPct}
          />

          <DynamicBaselineCard
            isLight={isLight}
            counterfactual={counterfactual}
            grossAdditionality={grossAdditionality}
            leakageBelt={leakageBelt}
            leakageRisk={leakageRisk}
            leakageDeduction={leakageDeduction}
            bufferPct={bufferPct}
            bufferWithheld={bufferWithheld}
            netCreditable={netCreditable}
          />

          <ConformalUncertaintyCard
            isLight={isLight}
            lower90={lower90}
            upper90={upper90}
            rme={rme}
            precisionDiscount={precisionDiscount}
            conservativeVolume={conservativeVolume}
          />

          <RemoteSensingCard isLight={isLight} />

          <CryptographicLedgerCard
            isLight={isLight}
            prov={prov}
            ledgerStatus={ledgerStatus}
            dashboardData={dashboardData}
            copyToClipboard={copyToClipboard}
            copiedHash={copiedHash}
            provenanceSignatures={provenanceSignatures || currentJob?.provenance_signatures || []}
            handleVerifyChain={handleVerifyChain}
            verifyingLedger={verifyingLedger}
            handleExportVM0047Bundle={handleExportVM0047Bundle}
            setShowSignModal={setShowSignModal}
          />

          <VvbAttestationCard isLight={isLight} />
        </div>
      </div>

      <VerraSignModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        isLight={isLight}
        selectedJob={selectedJob}
        generatedPublicKey={generatedPublicKey}
        copyToClipboard={copyToClipboard}
        signFormData={signFormData}
        setSignFormData={setSignFormData}
        handleGenerateKeypair={handleGenerateKeypair}
        generatingKeys={generatingKeys}
        showPrivateKey={showPrivateKey}
        setShowPrivateKey={setShowPrivateKey}
        handleSubmitSignature={handleSubmitSignature}
        signingLedger={signingLedger}
      />
    </>
  );
}

export default VerraAuditPanel;
