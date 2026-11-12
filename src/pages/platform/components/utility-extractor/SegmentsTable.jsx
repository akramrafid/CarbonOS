import React from 'react';
import { Sparkles, Lock, AlertTriangle, Edit3, Check, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export function SegmentsTable({
  isLight = false,
  segments,
  auditSeal,
  onOpenEdit,
  onToggleReject
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-sans font-bold text-base">
            Detected Utility Segments ({segments.length} Line Items)
          </h3>
        </div>

        <div className="text-[11px] font-mono text-gray-400 flex items-center space-x-2">
          {auditSeal ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-accent-hover border border-emerald-500/40 flex items-center gap-1 font-bold">
              <Lock className="w-3 h-3" />
              {auditSeal}
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Pending Auditor Sign-Off
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-xs font-sans">
          <thead
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isLight ? 'bg-bg-muted text-gray-600' : 'bg-bg-canvas text-gray-400'
            }`}
          >
            <tr>
              <th className="p-3.5">Segment &amp; Utility Type</th>
              <th className="p-3.5">Scope</th>
              <th className="p-3.5">Extracted Quantity</th>
              <th className="p-3.5">DoE Factor &amp; Citation</th>
              <th className="p-3.5 text-right">Emissions (tCO₂e)</th>
              <th className="p-3.5 text-right">Billed Cost</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Auditor Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {segments.map((seg, idx) => {
              const isRejected = seg.status === 'REJECTED_BY_AUDITOR';
              const isCorrected = seg.status === 'CORRECTED_BY_AUDITOR';

              return (
                <tr
                  key={idx}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    isRejected ? 'opacity-40 bg-red-950/10' : ''
                  }`}
                >
                  <td className="p-3.5">
                    <div
                      className={`font-bold flex items-center space-x-2 ${
                        isRejected ? 'line-through text-gray-500' : 'text-white'
                      }`}
                    >
                      <span>{seg.name}</span>
                      {isCorrected && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Edited
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 block">{seg.type}</span>
                    <span className="text-[9px] text-gray-500 italic block mt-0.5 truncate max-w-xs">
                      {seg.snippet}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        seg.scope.includes('Scope 1')
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : seg.scope.includes('Scope 2')
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {seg.scope}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono font-bold">
                    {Number(seg.qty || 0).toLocaleString()}{' '}
                    <span className="text-gray-400 font-normal text-[10px]">{seg.unit}</span>
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <div className="font-mono text-[11px] text-emerald-400 font-semibold">
                      {seg.factor == null ? 'Factor required' : `${seg.factor} kgCO₂e/${seg.unit}`}
                    </div>
                    <div className="text-[9px] text-gray-400 truncate">{seg.citation}</div>
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-sm">
                    <span
                      className={
                        isRejected
                          ? 'line-through text-gray-500'
                          : seg.emissions_t < 0
                          ? 'text-emerald-400'
                          : 'text-white'
                      }
                    >
                      {seg.emissions_t == null ? '—' : `${seg.emissions_t.toFixed(2)} t`}
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-mono text-gray-300">
                    ৳{Number(seg.cost_bdt || 0).toLocaleString()}
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        isRejected
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : isCorrected
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-accent/15 text-accent-hover border-border-strong/30'
                      }`}
                    >
                      {isRejected ? 'REJECTED' : isCorrected ? 'MODIFIED' : 'AI EXTRACTED'}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <IconButton
                        icon={<Edit3 className="w-3.5 h-3.5 text-amber-400" />}
                        aria-label="Correct line-item parameters"
                        onClick={() => onOpenEdit(seg, idx)}
                        className="min-h-[32px] min-w-[32px] p-1.5"
                      />
                      <IconButton
                        icon={isRejected ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        )}
                        aria-label={isRejected ? 'Restore line-item' : 'Reject line-item'}
                        onClick={() => onToggleReject(idx)}
                        className="min-h-[32px] min-w-[32px] p-1.5"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SegmentsTable;
