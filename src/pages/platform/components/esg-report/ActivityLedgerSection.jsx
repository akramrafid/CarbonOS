import React from 'react';

export function ActivityLedgerSection({ activities, fmt }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#00C853] font-bold">
        <span className="w-2 h-2 rounded-full bg-[#00C853]" />
        <span>Appendices • Complete Activity & Evidence Ledger</span>
      </div>

      <div className="p-3 sm:p-5 rounded-2xl bg-black/30 border border-[#152B1D] space-y-3 w-full overflow-hidden">
        <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pb-1 md:hidden">
          <span>← Scroll report table horizontally →</span>
          <span className="text-[10px]">700px</span>
        </div>
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full text-left font-sans text-xs min-w-[700px]">
            <thead>
              <tr className="text-gray-400 border-b border-[#152B1D] pb-2 font-mono uppercase text-[10px]">
                <th className="py-2">Activity Ref</th>
                <th>Source / Description</th>
                <th>Scope</th>
                <th>Quantity</th>
                <th>Primary Evidence File</th>
                <th className="text-right">tCO₂e</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152B1D]/40">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-mono text-[11px] text-gray-400">{a.id}</td>
                  <td className="font-semibold text-white">{a.activityType}</td>
                  <td>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      a.scopeGroup === 'Scope 1' ? 'text-amber-400' : a.scopeGroup === 'Scope 2' ? 'text-emerald-400' : 'text-purple-400'
                    }`}>
                      {a.scope}
                    </span>
                  </td>
                  <td className="font-mono">{fmt(a.quantity, 0)} {a.unit}</td>
                  <td className="font-mono text-[11px] text-gray-300 truncate max-w-[200px]">
                    {a.evidenceFileName || <span className="text-amber-400">Missing doc</span>}
                  </td>
                  <td className="text-right font-mono font-bold text-[#00C853]">{fmt(a.tCO2e, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ActivityLedgerSection;
