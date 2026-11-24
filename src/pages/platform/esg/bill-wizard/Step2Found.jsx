import React, { useState } from 'react';
import { Button, Notice, StatusBadge, Table } from '../ui';
import { BoundingBoxViewer } from './BoundingBoxViewer';
import { esgDownloadBlob } from '../../../../lib/esgApi';

export function Step2Found({
  t,
  gaps,
  gapsLoading,
  docNotice,
  billId,
  activeField,
  setActiveField,
  onDeleteDocument,
  onNext,
  onSkipToConfirm
}) {
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  const handleDownloadDocument = async () => {
    if (!billId) return;
    setDownloadingDoc(true);
    try {
      const { blob, filename } = await esgDownloadBlob(`/api/esg/bills/${encodeURIComponent(billId)}/document`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `bill-${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Download failed (401/404 or offline)
    } finally {
      setDownloadingDoc(false);
    }
  };

  if (gapsLoading) {
    return <p className="text-sm text-mist">Loading gap analysis…</p>;
  }

  return (
    <div className="space-y-4">
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
                render: (r) => (r.confidence !== null ? `${Math.round(r.confidence * 100)}%` : '—')
              },
              {
                key: 'status',
                label: t.status,
                render: (r) => <StatusBadge status={r.status?.toUpperCase()} />
              }
            ]}
          />

          {/* Evidence retention actions */}
          <div className="mt-4 p-3 bg-carbon/40 rounded-xl border border-emerald/10 space-y-2">
            <div className="text-xs font-mono text-mist">Evidence Retention Status:</div>
            {gaps?.has_source_document ? (
              <div className="flex flex-wrap gap-2 items-center">
                {/* [COMMENTED OUT FOR PERSONAL REFERENCE — raw anchor omitted Bearer token -> always returned 401] */}
                <Button
                  type="button"
                  variant="secondary"
                  disabled={downloadingDoc}
                  onClick={handleDownloadDocument}
                  className="text-xs font-mono text-emerald-300"
                >
                  ↓ {downloadingDoc ? '...' : t.downloadDoc}
                </Button>
                <Button
                  variant="secondary"
                  className="text-xs text-red-300 hover:text-red-200 border-red-500/30"
                  onClick={onDeleteDocument}
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
        <Button onClick={onNext}>{t.btnNext}</Button>
        {(!gaps?.missing_required || gaps.missing_required.length === 0) && (
          <Button variant="secondary" onClick={onSkipToConfirm}>
            {t.btnSkipToConfirm}
          </Button>
        )}
      </div>
    </div>
  );
}

export default Step2Found;
