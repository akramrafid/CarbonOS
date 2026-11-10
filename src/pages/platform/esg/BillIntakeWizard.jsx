// Step-by-step utility bill intake wizard (Upload -> What we found -> Fill the gaps -> Confirm -> Result).
// Supports English and Bangla. Gaps form is dynamically generated from esg_bill_parameter
// covering missing_required, low_confidence, and unmapped_candidates only.
// Includes PDF bounding-box overlay preview and evidence retention controls.
import { useState, useEffect, useRef } from 'react';
import { Button, Input, Loading, Notice, Panel, Select, StatusBadge, Table, useAction, useEsgData } from './ui';
import { esgFetch, esgSend } from '../../../lib/esgApi';

const TEXTS = {
  en: {
    title: 'Utility Bill Intake Wizard',
    desc: 'Guided intake for Bangladesh utility bills. Detects layout, identifies missing fields, and allows manual review before posting.',
    langSwitch: 'বাংলায় দেখুন',
    step1: '1. Upload',
    step2: '2. What We Found',
    step3: '3. Fill the Gaps',
    step4: '4. Confirm',
    step5: '5. Result',
    facility: 'Facility',
    file: 'Utility Bill (PDF or image)',
    runOcr: 'Run OCR (Bengali + English) for scanned documents',
    uploadBtn: 'Upload & Analyze',
    profileDetected: 'Detected Profile',
    presentCount: 'Present Values',
    missingCount: 'Missing Required Fields',
    lowConfCount: 'Low Confidence Fields',
    unmappedCount: 'Unmapped Numbers',
    findingsTitle: 'Rules & Period Findings',
    blockersTitle: 'Calculation Blockers',
    noBlockers: 'No calculation blockers found. Ready for review.',
    btnNext: 'Next: Fill the Gaps',
    btnSkipToConfirm: 'Skip to Confirm',
    btnBack: 'Back',
    btnConfirm: 'Confirm & Post to Ledger',
    btnEnterValue: 'Save Value',
    field: 'Field',
    value: 'Value',
    unit: 'Unit',
    confidence: 'Confidence',
    status: 'Status',
    actions: 'Actions',
    source: 'Source',
    confirmAction: 'Confirm',
    correctAction: 'Correct',
    periodSelect: 'Select GHG Reporting Period to Post',
    postSuccess: 'Bill successfully posted to GHG Ledger as draft activity records.',
    newUpload: 'Upload Another Bill',
    missingNotice: 'The following required fields were missing from the bill. Please provide values printed on the document.',
    lowConfNotice: 'The following fields were extracted with low confidence. Please verify or correct them.',
    unmappedNotice: 'The following numbers were detected on the bill but not mapped to a known parameter.',
    docPreviewTitle: 'Evidence Document & Bounding Boxes',
    downloadDoc: 'Download Original PDF (SHA-256 Verified)',
    deleteDoc: 'Delete Retained Evidence',
    confirmDelete: 'Are you sure you want to permanently delete the retained source document from server storage?',
    docDeleted: 'Retained source document was permanently deleted from storage.',
    noDocRetained: 'Document retention is disabled (ESG_RETAIN_SOURCE_DOCUMENTS=false). In-memory parsing only.',
    btnEstimate: 'Run Indicative Estimate',
    btnEstimateRunning: 'Calculating Estimate…',
    indicativeHeading: 'Indicative Carbon Footprint (Solo / Screening)',
    indicativeDisclaimer: 'INDICATIVE ESTIMATE ONLY: Calculated deterministically on unposted values. Not audit-grade, not for registry use. A second user must approve ledger activities for compliance filing.',
    scope1Label: 'Scope 1 (Direct Fuel)',
    scope2LocLabel: 'Scope 2 Location-Based',
    scope2MktLabel: 'Scope 2 Market-Based',
    totalFootprintLabel: 'Total Carbon Footprint',
    provisionalBadge: 'PROVISIONAL FACTOR',
    indicativeBadge: 'INDICATIVE',
    linesTitle: 'Calculation Lines & Formulas',
    factorsTitle: 'Emission Factor Citations & Provenance',
    assumptionsTitle: 'Methodology & Assumptions',
    provisionalNotice: 'No approved grid factor found in ledger. A provisional factor proposal from the bd_grid pipeline is available:',
    optInProvisional: 'I acknowledge this is for indicative estimation only and agree to use the pending bd_grid provisional factor.',
    btnRunProvisional: 'Calculate with Provisional Factor',
    btnUpgradeAudit: 'Invite an Approver (Upgrade to Audit-Grade)',
    inviteApproverTitle: 'Invite a Secondary Approver (Dual Control)',
    inviteApproverDesc: 'Send an invitation token to a team member so they can review and approve these ledger activities under dual control.',
    approverEmail: 'Approver Email',
    approverRole: 'Role',
    btnSendInvite: 'Generate Invitation Token',
    tokenLabel: 'Share this secure invitation token with your approver:',
    tokenExpires: 'Expires at:'
  },
  bn: {
    title: 'ইউটিলিটি বিল ইনটেক উইজার্ড',
    desc: 'বাংলাদেশি ইউটিলিটি বিল প্রক্রিয়াকরণ ও তথ্য যাচাইকরণ। বিল শনাক্তকরণ, অনুপস্থিত ফিল্ড পূরণ এবং লেজারে পোস্টিং।',
    langSwitch: 'View in English',
    step1: '১. আপলোড',
    step2: '২. কী পাওয়া গেছে',
    step3: '৩. শূন্যস্থান পূরণ',
    step4: '৪. নিশ্চিতকরণ',
    step5: '৫. ফলাফল',
    facility: 'কারখানা / ফ্যাসিলিটি',
    file: 'ইউটিলিটি বিল (পিডিএফ বা ছবি)',
    runOcr: 'স্ক্যান করা ডকুমেন্টের জন্য ওসিআর (বাংলা + ইংরেজি) চালান',
    uploadBtn: 'আপলোড ও বিশ্লেষণ করুন',
    profileDetected: 'চিহ্নিত বিল প্রোফাইল',
    presentCount: 'প্রাপ্ত তথ্যের সংখ্যা',
    missingCount: 'অনুপস্থিত প্রয়োজনীয় ফিল্ড',
    lowConfCount: 'অস্পষ্ট তথ্য',
    unmappedCount: 'অচিহ্নিত সংখ্যা',
    findingsTitle: 'নিয়ম ও সময়সীমা পর্যবেক্ষণ',
    blockersTitle: 'হিসাব বাধার কারণসমূহ',
    noBlockers: 'কোনো হিসাব বাধা পাওয়া যায়নি। যাচাইকরণের জন্য প্রস্তুত।',
    btnNext: 'পরবর্তী: শূন্যস্থান পূরণ করুন',
    btnSkipToConfirm: 'সরাসরি নিশ্চিতকরণে যান',
    btnBack: 'পূর্ববর্তী ধাপ',
    btnConfirm: 'নিশ্চিত করুন এবং লেজারে যুক্ত করুন',
    btnEnterValue: 'সংরক্ষণ করুন',
    field: 'প্যারামিটার',
    value: 'মান',
    unit: 'একক',
    confidence: 'নির্ভুলতা',
    status: 'অবস্থা',
    actions: 'পদক্ষেপ',
    source: 'উৎস',
    confirmAction: 'নিশ্চিত করুন',
    correctAction: 'সংশোধন করুন',
    periodSelect: 'রিপোর্টিং পিরিয়ড নির্বাচন করুন',
    postSuccess: 'বিলটি সফলভাবে গ্রিনহাউজ গ্যাস লেজারে অ্যাক্টিভিটি হিসেবে যুক্ত করা হয়েছে।',
    newUpload: 'আরেকটি বিল আপলোড করুন',
    missingNotice: 'নিচের প্রয়োজনীয় তথ্যগুলো বিলে পাওয়া যায়নি। অনুগ্রহ করে বিলের মানটি প্রবেশ করান।',
    lowConfNotice: 'নিচের মানগুলো কম নির্ভুলতার সাথে পড়া হয়েছে। অনুগ্রহ করে যাচাই বা সংশোধন করুন।',
    unmappedNotice: 'নিচের সংখ্যাগুলো বিলে পাওয়া গেছে কিন্তু কোনো নির্দিষ্ট প্যারামিটারে যুক্ত করা হয়নি।',
    docPreviewTitle: 'প্রমাণপত্র ও শনাক্তকৃত বাউন্ডিং বক্স',
    downloadDoc: 'মূল পিডিএফ ডাউনলোড করুন (SHA-256 যাচাইকৃত)',
    deleteDoc: 'সংরক্ষিত প্রমাণপত্র মুছে ফেলুন',
    confirmDelete: 'আপনি কি নিশ্চিত যে সার্ভার থেকে মূল ডকুমেন্টটি স্থায়ীভাবে মুছে ফেলতে চান?',
    docDeleted: 'সংরক্ষিত মূল ডকুমেন্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে।',
    noDocRetained: 'ডকুমেন্ট সংরক্ষণ নিষ্ক্রিয় রয়েছে (ESG_RETAIN_SOURCE_DOCUMENTS=false)।',
    btnEstimate: 'সম্ভাব্য কার্বন হিসাব চালান',
    btnEstimateRunning: 'গণনা করা হচ্ছে…',
    indicativeHeading: 'সম্ভাব্য কার্বন নিঃসরণ (প্রাথমিক মূল্যায়ন)',
    indicativeDisclaimer: 'শুধুমাত্র প্রাথমিক অনুমানের জন্য: পোস্ট না করা তথ্যের উপর ভিত্তি করে গণনা করা হয়েছে। এটি অডিট-গ্রেড নয় এবং কার্বন রেজিস্ট্রি ব্যবহারের জন্য প্রযোজ্য নয়। নিয়মমাফিক ফাইলিংয়ের জন্য দ্বিতীয় ব্যবহারকারীর অনুমোদন প্রয়োজন।',
    scope1Label: 'স্কোপ ১ (সরাসরি জ্বালানি)',
    scope2LocLabel: 'স্কোপ ২ লোকেশন-ভিত্তিক',
    scope2MktLabel: 'স্কোপ ২ মার্কেট-ভিত্তিক',
    totalFootprintLabel: 'মোট কার্বন নিঃসরণ',
    provisionalBadge: 'প্রভিশনাল ফ্যাক্টর',
    indicativeBadge: 'সম্ভাব্য হিসাব',
    linesTitle: 'হিসাবের লাইন ও সূত্র',
    factorsTitle: 'নিঃসরণ ফ্যাক্টর ও তথ্যসূত্র',
    assumptionsTitle: 'পদ্ধতি ও অনুমানসমূহ',
    provisionalNotice: 'লেজারে কোনো অনুমোদিত গ্রিড ফ্যাক্টর নেই। বিডি-গ্রিড পাইপলাইনের একটি প্রভিশনাল ফ্যাক্টর প্রস্তাব প্রস্তুত রয়েছে:',
    optInProvisional: 'আমি স্বীকার করছি এটি কেবল প্রাথমিক অনুমানের জন্য এবং প্রভিশনাল গ্রিড ফ্যাক্টর ব্যবহারে সম্মত।',
    btnRunProvisional: 'প্রভিশনাল ফ্যাক্টর দিয়ে হিসাব করুন',
    btnUpgradeAudit: 'অনুমোদনকারীকে আমন্ত্রণ জানান (অডিট-গ্রেডে উন্নীত করুন)',
    inviteApproverTitle: 'দ্বিতীয় অনুমোদনকারীকে আমন্ত্রণ জানান (দ্বৈত নিয়ন্ত্রণ)',
    inviteApproverDesc: 'আপনার দলের অন্য একজন সদস্যকে আমন্ত্রণ টোকেন পাঠান যাতে তারা দ্বৈত নিয়ন্ত্রণের অধীনে এই লেজার অ্যাক্টিভিটিগুলো পর্যালোচনা ও অনুমোদন করতে পারেন।',
    approverEmail: 'অনুমোদনকারীর ইমেইল',
    approverRole: 'ভূমিকা / রোল',
    btnSendInvite: 'আমন্ত্রণ টোকেন তৈরি করুন',
    tokenLabel: 'আপনার অনুমোদনকারীর সাথে এই গোপন টোকেনটি শেয়ার করুন:',
    tokenExpires: 'মেয়াদ শেষ হবে:'
  }
};

// Interactive visual Bounding Box Overlay component
function BoundingBoxViewer({ present = [], lowConfidence = [], unmapped = [], activeField, onSelectField }) {
  // Page point dimensions (standard A4/Letter ~ 612 x 792 pt)
  const pageWidth = 612;
  const pageHeight = 792;

  return (
    <div className="relative border border-emerald/20 rounded-xl bg-forest/80 overflow-hidden p-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-mist px-2 pb-2 border-b border-emerald/10">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-emerald rounded-sm" /> Verified
          <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-sm ml-2" /> Low Confidence
          <span className="inline-block w-2.5 h-2.5 bg-blue-400 rounded-sm ml-2" /> Unmapped
        </span>
        <span>Page 1 Coordinate Map</span>
      </div>
      <div className="relative w-full aspect-[612/792] max-h-[500px] mx-auto bg-carbon/90 mt-2 rounded-lg border border-mist/20 overflow-hidden">
        <svg
          viewBox={`0 0 ${pageWidth} ${pageHeight}`}
          className="w-full h-full select-none"
        >
          {/* Subtle grid background to simulate bill structure */}
          <line x1="40" y1="80" x2="572" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="40" y1="200" x2="572" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="40" y1="400" x2="572" y2="400" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Render present fields */}
          {present.filter(p => p.bbox && p.bbox.length === 4).map((p, idx) => {
            const [x0, y0, x1, y1] = p.bbox;
            const w = Math.max(x1 - x0, 8);
            const h = Math.max(y1 - y0, 8);
            const isSelected = activeField === p.field;

            return (
              <g
                key={`p-${idx}`}
                className="cursor-pointer transition-all"
                onClick={() => onSelectField && onSelectField(p.field)}
              >
                <rect
                  x={x0}
                  y={y0}
                  width={w}
                  height={h}
                  fill={isSelected ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.15)'}
                  stroke={isSelected ? '#10b981' : 'rgba(52, 211, 153, 0.7)'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  rx="2"
                />
                <text
                  x={x0}
                  y={Math.max(y0 - 3, 10)}
                  fill="#34d399"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {p.field}
                </text>
              </g>
            );
          })}

          {/* Render low confidence fields */}
          {lowConfidence.filter(lc => lc.bbox && lc.bbox.length === 4).map((lc, idx) => {
            const [x0, y0, x1, y1] = lc.bbox;
            return (
              <g key={`lc-${idx}`} className="cursor-pointer">
                <rect
                  x={x0}
                  y={y0}
                  width={Math.max(x1 - x0, 8)}
                  height={Math.max(y1 - y0, 8)}
                  fill="rgba(251, 191, 36, 0.25)"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  rx="2"
                />
              </g>
            );
          })}

          {/* Render unmapped candidate numbers */}
          {unmapped.filter(u => u.bbox && u.bbox.length === 4).map((u, idx) => {
            const [x0, y0, x1, y1] = u.bbox;
            return (
              <g key={`u-${idx}`} className="cursor-pointer">
                <rect
                  x={x0}
                  y={y0}
                  width={Math.max(x1 - x0, 8)}
                  height={Math.max(y1 - y0, 8)}
                  fill="rgba(96, 165, 250, 0.2)"
                  stroke="#60a5fa"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function BillIntakeWizard({ facilities = [], periods = [] }) {
  const [lang, setLang] = useState('en');
  const t = TEXTS[lang];

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
      const res = await esgFetch('/api/esg/bills/upload', {
        method: 'POST',
        body: form,
      });
      return res;
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

  return (
    <Panel
      title={t.title}
      description={t.desc}
      actions={
        <Button
          variant="secondary"
          className="text-xs"
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
        >
          {t.langSwitch}
        </Button>
      }
    >
      {/* Step Navigation Bar */}
      <nav className="flex items-center justify-between border-b border-emerald/10 pb-4 overflow-x-auto text-xs font-mono">
        {[
          [1, t.step1],
          [2, t.step2],
          [3, t.step3],
          [4, t.step4],
          [5, t.step5],
        ].map(([s, label]) => (
          <button
            key={s}
            type="button"
            disabled={s > step && (!billId || (s === 4 && gaps?.missing_required?.length > 0))}
            onClick={() => setStep(s)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              step === s
                ? 'bg-emerald text-carbon font-semibold'
                : s < step
                ? 'text-emerald-400 hover:bg-emerald/10'
                : 'text-mist/40 cursor-not-allowed'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Step 1: Upload */}
      {step === 1 && (
        <form onSubmit={handleUpload} className="space-y-4 max-w-xl">
          <Notice error={uploadAction.error} message={uploadAction.message} />
          <Select
            label={t.facility}
            name="facility_id"
            required
            options={(facilities || []).map((f) => [f.id, f.name])}
          />
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-mist mb-1">
              {t.file}
            </label>
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              className="w-full text-sm text-registry file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-emerald/20 file:text-emerald-300 hover:file:bg-emerald/30"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-registry">
            <input type="checkbox" name="ocr" value="true" />
            <span>{t.runOcr}</span>
          </label>
          <Button type="submit" disabled={uploadAction.busy}>
            {uploadAction.busy ? 'Uploading & Analyzing…' : t.uploadBtn}
          </Button>
        </form>
      )}

      {/* Step 2: What We Found */}
      {step === 2 && (
        <div className="space-y-4">
          {gapsLoading ? (
            <p className="text-sm text-mist">Loading gap analysis…</p>
          ) : (
            <>
              {docNotice && <Notice message={docNotice} />}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-carbon/40 rounded-xl border border-emerald/10">
                  <div className="text-xs text-mist font-mono">{t.profileDetected}</div>
                  <div className="text-sm font-semibold text-emerald-400 mt-1">
                    {gaps?.profile_key || 'UNKNOWN'}
                  </div>
                </div>
                <div className="p-3 bg-carbon/40 rounded-xl border border-emerald/10">
                  <div className="text-xs text-mist font-mono">{t.presentCount}</div>
                  <div className="text-lg font-semibold text-registry mt-1">
                    {gaps?.present?.length || 0}
                  </div>
                </div>
                <div className="p-3 bg-carbon/40 rounded-xl border border-emerald/10">
                  <div className="text-xs text-mist font-mono">{t.missingCount}</div>
                  <div className="text-lg font-semibold text-amber-400 mt-1">
                    {gaps?.missing_required?.length || 0}
                  </div>
                </div>
                <div className="p-3 bg-carbon/40 rounded-xl border border-emerald/10">
                  <div className="text-xs text-mist font-mono">{t.lowConfCount}</div>
                  <div className="text-lg font-semibold text-red-400 mt-1">
                    {gaps?.low_confidence?.length || 0}
                  </div>
                </div>
              </div>

              {/* Document Retention & Visual Bounding Box Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-mist mb-2">
                    {t.presentCount}
                  </h3>
                  <Table
                    caption="Extracted bill values"
                    rows={gaps?.present || []}
                    rowKey="field"
                    columns={[
                      { key: 'field', label: t.field },
                      { key: 'value', label: t.value },
                      { key: 'unit', label: t.unit, render: (r) => r.unit || '—' },
                      {
                        key: 'confidence',
                        label: t.confidence,
                        render: (r) =>
                          r.confidence !== null ? `${Math.round(r.confidence * 100)}%` : '—',
                      },
                      {
                        key: 'status',
                        label: t.status,
                        render: (r) => <StatusBadge status={r.status?.toUpperCase()} />,
                      },
                    ]}
                  />

                  {/* Evidence retention actions */}
                  <div className="mt-4 p-3 bg-carbon/40 rounded-xl border border-emerald/10 space-y-2">
                    <div className="text-xs font-mono text-mist">Evidence Retention Status:</div>
                    {gaps?.has_source_document ? (
                      <div className="flex flex-wrap gap-2 items-center">
                        <a
                          href={`/api/esg/bills/${billId}/document`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald/20 text-emerald-300 font-mono text-xs hover:bg-emerald/30 transition-colors"
                        >
                          ↓ {t.downloadDoc}
                        </a>
                        <Button
                          variant="secondary"
                          className="text-xs text-red-300 hover:text-red-200 border-red-500/30"
                          onClick={handleDeleteDocument}
                        >
                          ✕ {t.deleteDoc}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-mist/60 italic">{t.noDocRetained}</p>
                    )}
                  </div>
                </div>

                {/* Visual Bounding Box Canvas */}
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-mist mb-2">
                    {t.docPreviewTitle}
                  </h3>
                  <BoundingBoxViewer
                    present={gaps?.present || []}
                    lowConfidence={gaps?.low_confidence || []}
                    unmapped={gaps?.unmapped_candidates || []}
                    activeField={activeField}
                    onSelectField={setActiveField}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={() => setStep(3)}>{t.btnNext}</Button>
                {(!gaps?.missing_required || gaps.missing_required.length === 0) && (
                  <Button variant="secondary" onClick={() => setStep(4)}>
                    {t.btnSkipToConfirm}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Fill the Gaps */}
      {step === 3 && (
        <div className="space-y-6">
          <Notice error={enterAction.error || reviewAction.error} />

          {/* Missing Required Fields Form */}
          {gaps?.missing_required && gaps.missing_required.length > 0 ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-amber-300">{t.missingNotice}</h3>
              <div className="space-y-3">
                {gaps.missing_required.map((f) => {
                  const labelText = f.label?.[lang] || f.label?.en || f.field;
                  return (
                    <form
                      key={f.field}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        handleEnterValue(f.field, data.get('val'), data.get('unit'));
                      }}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end"
                    >
                      <div className="sm:col-span-2">
                        <Input
                          label={labelText}
                          name="val"
                          type={f.type === 'date' ? 'date' : 'text'}
                          placeholder={`Enter ${labelText}`}
                          required
                        />
                      </div>
                      {f.allowed_units && f.allowed_units.length > 0 ? (
                        <Select
                          label={t.unit}
                          name="unit"
                          options={f.allowed_units.map((u) => [u, u])}
                        />
                      ) : (
                        <div />
                      )}
                      <Button type="submit" disabled={enterAction.busy} className="h-10">
                        {t.btnEnterValue}
                      </Button>
                    </form>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-xl text-xs text-emerald-300">
              ✓ All required fields are present and verified.
            </div>
          )}

          {/* Low Confidence Fields Review */}
          {gaps?.low_confidence && gaps.low_confidence.length > 0 && (
            <div className="p-4 bg-carbon/50 border border-emerald/10 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-mist">{t.lowConfNotice}</h3>
              <div className="space-y-2">
                {gaps.low_confidence.map((lc) => (
                  <form
                    key={lc.value_id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.currentTarget);
                      handleReviewValue(lc.value_id, 'correct', data.get('val'), data.get('unit'));
                    }}
                    className="flex flex-wrap items-center gap-3 p-2 bg-forest/40 rounded-lg text-sm"
                  >
                    <span className="font-mono text-xs text-mist w-32">{lc.field}:</span>
                    <input
                      name="val"
                      defaultValue={lc.value}
                      className="px-2 py-1 rounded bg-carbon border border-mist/30 text-registry text-sm"
                    />
                    <Button type="submit" variant="secondary" className="text-xs">
                      {t.correctAction}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => handleReviewValue(lc.value_id, 'confirm')}
                    >
                      {t.confirmAction}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}>
              {t.btnBack}
            </Button>
            <Button onClick={() => setStep(4)}>{t.btnNext}</Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
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

          {/* Phase 4: Indicative Estimation for Solo Users / Screening */}
          <div className="border border-emerald/20 bg-carbon/60 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-registry">{t.indicativeHeading}</h3>
                <p className="text-xs text-mist font-mono mt-0.5">Deterministic in-memory accounting without ledger mutation</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleRunEstimate()}
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
                  onClick={() => handleRunEstimate(true)}
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

                {/* Footprint Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-forest/60 rounded-xl border border-emerald/20">
                    <div className="text-[11px] font-mono text-mist uppercase">{t.totalFootprintLabel}</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {estimateData.emissions.total_tco2e} <span className="text-xs font-normal text-mist">tCO2e</span>
                    </div>
                  </div>
                  <div className="p-3 bg-forest/60 rounded-xl border border-emerald/20">
                    <div className="text-[11px] font-mono text-mist uppercase">{t.scope2LocLabel}</div>
                    <div className="text-lg font-bold text-registry mt-1">
                      {estimateData.emissions.scope2_location_tco2e} <span className="text-xs font-normal text-mist">tCO2e</span>
                    </div>
                  </div>
                  <div className="p-3 bg-forest/60 rounded-xl border border-emerald/20">
                    <div className="text-[11px] font-mono text-mist uppercase">{t.scope1Label}</div>
                    <div className="text-lg font-bold text-registry mt-1">
                      {estimateData.emissions.scope1_tco2e} <span className="text-xs font-normal text-mist">tCO2e</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Lines */}
                {estimateData.lines?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase text-mist">{t.linesTitle}</h4>
                    <div className="space-y-1.5 font-mono text-xs">
                      {estimateData.lines.map((ln, idx) => (
                        <div key={idx} className="p-2.5 bg-carbon/80 border border-emerald/10 rounded-lg flex flex-col sm:flex-row justify-between gap-1">
                          <span className="text-mist">{ln.formula}</span>
                          <span className="text-emerald-400 font-semibold">{ln.emissions_kg} kgCO2e</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations & Provenance */}
                {estimateData.factor_citations?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase text-mist">{t.factorsTitle}</h4>
                    <div className="space-y-1 font-mono text-[11px] text-mist/90 bg-carbon/50 p-2.5 rounded-lg border border-emerald/10">
                      {estimateData.factor_citations.map((c, idx) => (
                        <div key={idx} className="flex justify-between border-b border-emerald/5 last:border-0 py-1">
                          <span>{c.family} v{c.version} ({c.status})</span>
                          <span className="text-registry">{c.kgco2e_per_unit} kgCO2e/{c.unit} [{c.source_publisher}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upgrade to Audit Grade Button */}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    className="text-xs border-emerald/40 text-emerald-300"
                    onClick={() => setShowInviteModal(!showInviteModal)}
                  >
                    👥 {t.btnUpgradeAudit}
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
                  <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
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
            <Button variant="secondary" onClick={() => setStep(3)}>
              {t.btnBack}
            </Button>
            <Button
              onClick={handlePost}
              disabled={postAction.busy || !gaps?.ready_to_post || !selectedPeriod}
            >
              {postAction.busy ? 'Posting to Ledger…' : t.btnConfirm}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Result */}
      {step === 5 && (
        <div className="space-y-4 max-w-xl p-4 bg-emerald/10 border border-emerald/30 rounded-2xl">
          <h3 className="text-base font-semibold text-emerald-300">✓ {t.postSuccess}</h3>
          <p className="text-xs text-mist font-mono">
            Generated {postResult?.length || 0} DRAFT activity records in GHG ledger. Ready for secondary dual-control approval.
          </p>
          <Button
            onClick={() => {
              setBillId(null);
              setGaps(null);
              setPostResult(null);
              setStep(1);
            }}
          >
            {t.newUpload}
          </Button>
        </div>
      )}
    </Panel>
  );
}
