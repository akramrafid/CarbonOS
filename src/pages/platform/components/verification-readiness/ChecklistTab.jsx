import React from 'react';
import { Button } from '@/components/ui/Button';

export function ChecklistTab({
  isLight = false,
  checklist,
  onToggleStatus
}) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
        isLight ? 'bg-white border-border-subtle' : 'bg-bg-elevated border-border-subtle'
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-lg">ISO 14064-1 &amp; GHG Protocol Assurance Verification Checklist</h3>
          <p className="text-xs text-gray-400 mt-0.5">8-point mandatory criteria for limited and reasonable assurance verification.</p>
        </div>
        <div className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
          Click status pill to toggle review state
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
          >
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent-hover border border-border-strong/30 font-bold">
                  {item.code}
                </span>
                <h4 className="font-bold text-sm text-white">{item.title}</h4>
                <span className="text-[10px] text-gray-500 font-mono">({item.requiredForAssurance})</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.description}</p>
              <div className="flex items-center space-x-4 text-[10px] text-gray-400 font-mono pt-1">
                <span>Owner: <strong className="text-gray-300">{item.owner}</strong></span>
                <span>Evidence Ref: <strong className="text-emerald-400">{item.evidenceRef}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onToggleStatus(item.id)}
                className="font-mono text-xs"
              >
                {item.status}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChecklistTab;
