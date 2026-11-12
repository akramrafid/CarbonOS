import React from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AuditTrailDrawer({
  auditLog,
  onClose
}) {
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-[#050D07] space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <span className="text-xs font-mono font-bold uppercase text-[#00E676] flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Human-in-the-Loop Auditor Action Log (Immutable History)
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs h-auto min-h-0 py-1 px-2"
        >
          Close
        </Button>
      </div>

      {auditLog.length === 0 ? (
        <p className="text-xs text-gray-500 font-mono italic">
          No manual corrections made yet. Extracted values represent initial AI inference.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
          {auditLog.map((log, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between gap-1"
            >
              <div>
                <span className="text-[#00E676] font-bold">[{log.segmentName}]</span> {log.reason}
                <div className="text-gray-400 text-[10px]">
                  Changed {log.field}: <span className="line-through text-red-400">{log.oldValue}</span> →{' '}
                  <span className="text-emerald-300 font-bold">{log.newValue}</span>
                </div>
              </div>
              <div className="text-gray-500 text-[9px] shrink-0 text-right">
                <div>{log.auditor}</div>
                <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditTrailDrawer;
