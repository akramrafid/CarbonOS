import { useState, useEffect } from 'react';
import { Button, Panel, useAction } from './ui';
import { esgFetch, esgSend } from '../../../lib/esgApi';
import { TEXTS as WIZARD_TEXTS } from './bill-wizard/wizardTexts';
import { Step1Upload } from './bill-wizard/Step1Upload';
import { Step2Found } from './bill-wizard/Step2Found';
import { Step3FillGaps } from './bill-wizard/Step3FillGaps';
import { Step4Confirm } from './bill-wizard/Step4Confirm';
import { Step5Result } from './bill-wizard/Step5Result';

export default function BillIntakeWizard({ facilities = [], periods = [] }) {
  const [lang, setLang] = useState('en');
  const t = WIZARD_TEXTS[lang];

  const [step, setStep] = useState(1);
  const [billId, setBillId] = useState(null);
  const [gaps, setGaps] = useState(null);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]?.id || '');
  const [postResult, setPostResult] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [docNotice, setDocNotice] = useState(null);

  const uploadAction = useAction();
  const enterAction = useAction();
  const reviewAction = useAction();
  const postAction = useAction();
  const deleteDocAction = useAction();
  const estimateAction = useAction();
  const inviteAction = useAction();

  const [estimateData, setEstimateData] = useState(null);
  const [allowProvisional, setAllowProvisional] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  // Phase 4: Indicative estimate handler
  const handleRunEstimate = async (overrideProv) => {
    const prov = overrideProv !== undefined ? overrideProv : allowProvisional;
    await estimateAction.run(async () => {
      const res = await esgSend('POST', `/api/esg/bills/${billId}/estimate`, {
        allow_provisional: prov,
        boundary_method: 'operational_control'
      });
      setEstimateData(res);
    });
  };

  // Phase 4: Secondary approver invitation handler
  const handleSendInvite = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const role = data.get('role');
    await inviteAction.run(async () => {
      const res = await esgSend('POST', '/api/esg/invitations', { email, role });
      setInviteResult(res);
    });
  };

  // Load gaps whenever billId changes
  const loadGaps = async (id) => {
    if (!id) return;
    setGapsLoading(true);
    try {
      const data = await esgFetch(`/api/esg/bills/${id}/gaps`);
      setGaps(data);
    } catch (e) {
      console.error('Failed to load gaps:', e);
    } finally {
      setGapsLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      loadGaps(billId);
    }
  }, [billId]);

  // Step 1: Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await uploadAction.run(async () => {
      return await esgFetch('/api/esg/bills/upload', {
        method: 'POST',
        body: form,
      });
    });

    if (result && result.id) {
      setBillId(result.id);
      setStep(2);
    }
  };

  // Step 3: Enter missing field value
  const handleEnterValue = async (fieldKey, value, unit) => {
    await enterAction.run(async () => {
      await esgSend('POST', `/api/esg/bills/${billId}/values`, {
        parameter_key: fieldKey,
        value: String(value).trim(),
        unit: unit || null,
        comment: 'Entered via guided intake wizard',
      });
      await loadGaps(billId);
    });
  };

  // Step 3: Confirm or correct a low confidence value
  const handleReviewValue = async (valueId, action, value, unit) => {
    await reviewAction.run(async () => {
      await esgSend('POST', `/api/esg/bill-values/${valueId}/${action}`, {
        value: action === 'correct' ? String(value).trim() : undefined,
        unit: action === 'correct' ? unit || undefined : undefined,
      });
      await loadGaps(billId);
    });
  };

  // Step 4: Post bill to ledger
  const handlePost = async () => {
    if (!selectedPeriod) return;
    const result = await postAction.run(async () => {
      return await esgSend('POST', `/api/esg/bills/${billId}/post`, {
        period_id: selectedPeriod,
      });
    });
    if (result) {
      setPostResult(result);
      setStep(5);
    }
  };

  // Evidence deletion handler (GDPR erasure)
  const handleDeleteDocument = async () => {
    if (!window.confirm(t.confirmDelete)) return;
    await deleteDocAction.run(async () => {
      await esgSend('DELETE', `/api/esg/bills/${billId}/document`);
      setDocNotice(t.docDeleted);
      await loadGaps(billId);
    });
  };

  const handleReset = () => {
    setBillId(null);
    setGaps(null);
    setPostResult(null);
    setStep(1);
  };

  // Phase 7: Real state-driven field completion & 6-stage semantic stepper
  const presentCount = gaps?.present?.length || 0;
  const missingCount = gaps?.missing_required?.length || 0;
  const lowConfCount = gaps?.low_confidence?.length || 0;
  const totalFieldsCount = presentCount + missingCount;
  const isScanning = uploadAction.busy || gapsLoading;
  const isCalculating = estimateAction.busy || postAction.busy;

  const semanticStageIndex = postResult || step === 5
    ? 5
    : isCalculating
      ? 4
      : step === 3 || missingCount > 0 || lowConfCount > 0
        ? (step >= 3 ? 3 : 2)
        : isScanning
          ? 1
          : billId
            ? 2
            : 0;

  const SEMANTIC_STAGES = [
    'Uploaded',
    'Reading',
    'Gaps found',
    'Needs your input',
    'Calculating',
    'Result',
  ];

  return (
    <Panel
      title={t.title}
      description={t.desc}
      actions={
        <div className="flex items-center gap-2">
          {billId && totalFieldsCount > 0 && (
            <span
              className="px-2.5 py-1 rounded-full bg-emerald/15 border border-emerald/30 text-emerald-300 font-mono text-xs tabular-nums"
              data-testid="esg-fields-progress"
            >
              {presentCount}/{totalFieldsCount} fields complete
            </span>
          )}
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          >
            {t.langSwitch}
          </Button>
        </div>
      }
    >
      {/* Phase 7: 6-Stage Real State Semantic Stepper + Scan Shimmer */}
      <div className="space-y-2" data-testid="esg-semantic-stepper">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-[11px] font-mono">
          {SEMANTIC_STAGES.map((stageLabel, idx) => {
            const isDone = idx < semanticStageIndex;
            const isCurrent = idx === semanticStageIndex;
            return (
              <div
                key={stageLabel}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-colors ${isCurrent
                    ? 'bg-emerald/15 border-emerald/50 text-emerald-300 font-semibold'
                    : isDone
                      ? 'bg-forest/50 border-emerald/20 text-registry'
                      : 'bg-carbon/40 border-mist/10 text-mist/60'
                  }`}
              >
                <span className="truncate">{stageLabel}</span>
                <span className="ml-1 text-[10px]">
                  {isDone ? '✓' : isCurrent ? '●' : `${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>

        {isScanning && (
          <div
            role="status"
            aria-live="polite"
            className="w-full h-1.5 rounded-full bg-forest overflow-hidden"
            data-testid="esg-scan-shimmer"
          >
            <div className="h-full w-2/3 bg-emerald animate-pulse rounded-full" />
          </div>
        )}
      </div>

      {/* Step Navigation Bar */}
        <nav data-internal-nav="true" className="flex items-center justify-between gap-2 border-b border-border-subtle pb-4 overflow-x-auto text-xs font-mono">
          {[
            [1, t.step1],
            [2, t.step2],
            [3, t.step3],
            [4, t.step4],
            [5, t.step5],
          ].map(([s, label]) => (
            <Button
              key={s}
              type="button"
              variant={step === s ? 'secondary' : 'ghost'}
              size="sm"
              disabled={s > step && (!billId || (s === 4 && gaps?.missing_required?.length > 0))}
              onClick={() => setStep(s)}
              className={`text-xs font-mono ${step === s ? 'border-emerald-500/50 text-emerald-700 dark:text-emerald-300' : ''}`}
            >
              {label}
            </Button>
          ))}
        </nav>

        {/* Step Components */}
        {step === 1 && (
          <Step1Upload
            t={t}
            facilities={facilities}
            uploadAction={uploadAction}
            onUpload={handleUpload}
          />
        )}

        {step === 2 && (
          <Step2Found
            t={t}
            gaps={gaps}
            gapsLoading={gapsLoading}
            docNotice={docNotice}
            billId={billId}
            activeField={activeField}
            setActiveField={setActiveField}
            onDeleteDocument={handleDeleteDocument}
            onNext={() => setStep(3)}
            onSkipToConfirm={() => setStep(4)}
          />
        )}

        {step === 3 && (
          <Step3FillGaps
            t={t}
            lang={lang}
            gaps={gaps}
            enterAction={enterAction}
            reviewAction={reviewAction}
            onEnterValue={handleEnterValue}
            onReviewValue={handleReviewValue}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <Step4Confirm
            t={t}
            gaps={gaps}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            periods={periods}
            postAction={postAction}
            estimateAction={estimateAction}
            inviteAction={inviteAction}
            estimateData={estimateData}
            allowProvisional={allowProvisional}
            setAllowProvisional={setAllowProvisional}
            showInviteModal={showInviteModal}
            setShowInviteModal={setShowInviteModal}
            inviteResult={inviteResult}
            onRunEstimate={handleRunEstimate}
            onSendInvite={handleSendInvite}
            onPost={handlePost}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <Step5Result
            t={t}
            postResult={postResult}
            onReset={handleReset}
          />
        )}
    </Panel>
  );
}
