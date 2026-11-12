import React from 'react';
import { Button, Input, Notice, Select } from '../ui';

export function Step3FillGaps({
  t,
  lang,
  gaps,
  enterAction,
  reviewAction,
  onEnterValue,
  onReviewValue,
  onBack,
  onNext
}) {
  return (
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
                    onEnterValue(f.field, data.get('val'), data.get('unit'));
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
                  onReviewValue(lc.value_id, 'correct', data.get('val'), data.get('unit'));
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
                  onClick={() => onReviewValue(lc.value_id, 'confirm')}
                >
                  {t.confirmAction}
                </Button>
              </form>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack}>
          {t.btnBack}
        </Button>
        <Button onClick={onNext}>{t.btnNext}</Button>
      </div>
    </div>
  );
}

export default Step3FillGaps;
