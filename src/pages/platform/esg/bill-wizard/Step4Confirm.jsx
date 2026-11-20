import React from 'react';
import { Button, Input, Notice, Select } from '../ui';
import { HowCalculatedPanel } from './HowCalculatedPanel';

export function Step4Confirm({
  t,
  gaps,
  selectedPeriod,
  setSelectedPeriod,
  periods = [],
  postAction,
  estimateAction,
  inviteAction,
  estimateData,
  allowProvisional,
  setAllowProvisional,
  showInviteModal,
  setShowInviteModal,
  inviteResult,
  onRunEstimate,
  onSendInvite,
  onPost,
  onBack
}) {
  return (
    <div className="space-y-4 max-w-xl">
      <Notice error={postAction.error} message={postAction.message} />

      {/* Blockers Check */}
      {gaps?.calc_blockers && gaps.calc_blockers.length > 0 ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
          <h3 className="text-sm font-semibold text-red-300">{t.blockersTitle}</h3>
          <ul className="list-disc list-inside text-xs text-red-200/90 space-y-1">
            {gaps.calc_blockers.map((b) => (
              <li key={b} className="font-mono">
                {b}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-xl text-xs text-emerald-300">
          {t.noBlockers}
        </div>
      )}

      {/* Period selector */}
      <Select
        label={t.periodSelect}
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        required
        options={(periods || []).map((p) => [p.id, `${p.name} (${p.start_date} to ${p.end_date})`])}
      />

      {/* Indicative Estimation for Solo Users / Screening */}
      <div className="border border-emerald/20 bg-carbon/60 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-registry">{t.indicativeHeading}</h3>
            <p className="text-xs text-mist font-mono mt-0.5">Deterministic in-memory accounting without ledger mutation</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => onRunEstimate()}
            disabled={estimateAction.busy}
            className="text-xs"
          >
            {estimateAction.busy ? t.btnEstimateRunning : t.btnEstimate}
          </Button>
        </div>

        <Notice error={estimateAction.error} />

        {/* Missing Grid Factor / Provisional Offer */}
        {estimateData?.calc_blockers?.includes('MISSING_GRID_AVERAGE_FACTOR') && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3 text-xs">
            <p className="text-amber-300 font-semibold">{t.provisionalNotice}</p>
            {estimateData.provisional_factor && (
              <div className="font-mono bg-forest/80 p-2.5 rounded-lg border border-amber-500/20 text-mist space-y-1">
                <div><span className="text-amber-200">Proposal:</span> {estimateData.provisional_factor.family} v{estimateData.provisional_factor.version}</div>
                <div><span className="text-amber-200">Factor:</span> {estimateData.provisional_factor.kgco2e_per_unit} kgCO2e/kWh ({estimateData.provisional_factor.method}, AR6)</div>
                <div><span className="text-amber-200">Uncertainty:</span> ±{estimateData.provisional_factor.uncertainty_pct}% | <span className="text-amber-200">Vintage:</span> {estimateData.provisional_factor.vintage}</div>
              </div>
            )}
            <label className="flex items-start gap-2 text-mist cursor-pointer">
              <input
                type="checkbox"
                checked={allowProvisional}
                onChange={(e) => setAllowProvisional(e.target.checked)}
                className="mt-0.5"
              />
              <span>{t.optInProvisional}</span>
            </label>
            <Button
              onClick={() => onRunEstimate(true)}
              disabled={estimateAction.busy || !allowProvisional}
              className="text-xs"
            >
              {t.btnRunProvisional}
            </Button>
          </div>
        )}

        {/* Calculated Indicative Results */}
        {estimateData?.emissions && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 font-mono">
              ⚠ {t.indicativeDisclaimer}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {t.indicativeBadge}
              </span>
              {estimateData.flags?.includes('PROVISIONAL_FACTOR') && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {t.provisionalBadge}
                </span>
              )}
            </div>

            {/* Phase 7: Animated Footprint Metrics, Bar Breakdown & Expandable Formula Panel */}
            <HowCalculatedPanel estimateData={estimateData} t={t} />

            {/* Upgrade to Audit Grade Button */}
            <div className="pt-2">
              <Button
                variant="secondary"
                className="text-xs border-emerald/40 text-emerald-300"
                onClick={() => setShowInviteModal(!showInviteModal)}
              >
                {t.btnUpgradeAudit}
              </Button>
            </div>
          </div>
        )}

        {/* Invite Approver Drawer / Form */}
        {showInviteModal && (
          <div className="p-4 bg-forest/90 border border-emerald/30 rounded-xl space-y-3">
            <h4 className="text-sm font-semibold text-emerald-300">{t.inviteApproverTitle}</h4>
            <p className="text-xs text-mist">{t.inviteApproverDesc}</p>
            <Notice error={inviteAction.error} />
            {inviteResult ? (
              <div className="p-3 bg-carbon/80 border border-emerald/20 rounded-lg space-y-2 text-xs font-mono">
                <div className="text-emerald-400 font-semibold">✓ Invitation created for {inviteResult.email}</div>
                <div className="text-mist">{t.tokenLabel}</div>
                <div className="p-2 bg-forest rounded border border-emerald/30 text-registry select-all break-all">
                  {inviteResult.token}
                </div>
                <div className="text-[10px] text-mist/70">{t.tokenExpires} {inviteResult.expires_at}</div>
              </div>
            ) : (
              <form onSubmit={onSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <Input label={t.approverEmail} name="email" type="email" required placeholder="colleague@company.com" />
                <Select label={t.approverRole} name="role" defaultValue="esg_admin" options={[['esg_admin', 'ESG Admin'], ['org_owner', 'Org Owner'], ['auditor', 'Auditor']]} />
                <Button type="submit" disabled={inviteAction.busy} className="h-10 text-xs">
                  {inviteAction.busy ? 'Generating…' : t.btnSendInvite}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onBack}>
          {t.btnBack}
        </Button>
        <Button
          onClick={onPost}
          disabled={postAction.busy || !gaps?.ready_to_post || !selectedPeriod}
        >
          {postAction.busy ? 'Posting to Ledger…' : t.btnConfirm}
        </Button>
      </div>
    </div>
  );
}

export default Step4Confirm;
