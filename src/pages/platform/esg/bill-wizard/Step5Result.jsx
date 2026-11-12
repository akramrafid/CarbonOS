import React from 'react';
import { Button } from '../ui';

export function Step5Result({ t, postResult, onReset }) {
  return (
    <div className="space-y-4 max-w-xl p-4 bg-emerald/10 border border-emerald/30 rounded-2xl">
      <h3 className="text-base font-semibold text-emerald-300">✓ {t.postSuccess}</h3>
      <p className="text-xs text-mist font-mono">
        Generated {postResult?.length || 0} DRAFT activity records in GHG ledger. Ready for secondary dual-control approval.
      </p>
      <Button onClick={onReset}>
        {t.newUpload}
      </Button>
    </div>
  );
}

export default Step5Result;
