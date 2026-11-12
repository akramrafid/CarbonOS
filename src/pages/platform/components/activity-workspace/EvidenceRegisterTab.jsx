import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { fmt } from './activityData';

export function EvidenceRegisterTab({
  isLight = false,
  filteredEvidence,
  activities,
  onSelectEvidence
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidence.map((doc) => {
          const linkedCount = activities.filter((a) => a.evidenceId === doc.id).length;

          return (
            <div
              key={doc.id}
              onClick={() => onSelectEvidence(doc)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isLight
                  ? 'bg-slate-50/70 border-slate-200 hover:border-border-strong hover:bg-white'
                  : 'bg-bg-canvas border-border-subtle hover:border-border-strong/50 hover:bg-accent/5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent-hover">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 block">{doc.id}</span>
                      <h4
                        className={`font-sans font-bold text-sm truncate max-w-[280px] ${
                          isLight ? 'text-fg-primary' : 'text-white'
                        }`}
                      >
                        {doc.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {doc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-sans">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Issuer / Authority</span>
                    <span className="font-semibold block truncate">{doc.issuer}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Doc Number</span>
                    <span className="font-mono font-bold block truncate">{doc.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Audit Period</span>
                    <span className="font-mono block">{doc.period}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Recorded Spend</span>
                    <span className="font-mono font-bold text-accent block">
                      {doc.amountBdt > 0 ? `BDT ${fmt(doc.amountBdt, 0)}` : 'Internal Census'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                  {doc.notes}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/40 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <div className="flex items-center space-x-1 text-accent">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SHA-256 Verified</span>
                </div>
                <span className="text-gray-400">
                  Linked: <strong>{linkedCount} Activities</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EvidenceRegisterTab;
