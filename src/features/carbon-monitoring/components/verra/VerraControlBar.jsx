import React from 'react';
import { Download, FileText, Database, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function VerraControlBar({
  isLight,
  currentJob,
  analysisHistory = [],
  setSelectedJob,
  ledgerStatus,
  triggerDossierDownload
}) {
  return (
    <div className={`border rounded-2xl p-5 md:p-6 transition-all ${
      isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
    }`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
              isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/25'
            }`}>
              Verra VM0047 v1.0 & VM0048
            </span>
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isLight ? 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]' : 'bg-white/5 text-mist border-white/10'
            }`}>
              VVB Audit Package
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center space-x-1.5 ${
              ledgerStatus.chain_valid 
                ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald/10 text-emerald border-emerald/20')
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
            aria-label={`Cryptographic chain validity: ${ledgerStatus.chain_valid ? 'Verified Intact' : 'Warning'}`}
            >
              <Lock size={11} />
              <span>SHA-256 Ledger: {ledgerStatus.chain_valid ? 'Verified Intact' : 'Warning'}</span>
            </span>
          </div>
          <h2 className={`text-xl md:text-2xl font-extrabold font-sans tracking-tight ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}>
            Verra VM0047 Methodology Monitoring Dossier & VVB Audit Inspector
          </h2>
          <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
            Institutional verification package for Validation & Verification Bodies (VVBs). Covers IPCC Tier-3 multi-pool living and sediment stocks, dynamic synthetic control additionality, 10km leakage belts, and conformal uncertainty precision deduction tests.
          </p>
        </div>

        {/* Job Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Job Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold whitespace-nowrap ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
              Audit Run:
            </span>
            <select
              value={currentJob?.id}
              onChange={(e) => {
                const target = analysisHistory.find(j => j.id === e.target.value);
                if (target) setSelectedJob(target);
              }}
              aria-label="Select historical audit run for Verra verification"
              className={`text-xs font-mono font-bold px-3 py-2 rounded-xl border cursor-pointer outline-hidden transition-all focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                isLight 
                  ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B] hover:border-slate-400' 
                  : 'bg-black/40 border-white/15 text-white hover:border-white/30'
              }`}
            >
              {analysisHistory.map(j => (
                <option key={j.id} value={j.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#08130C] text-white'}>
                  {j.project_name} ({j.id.slice(0, 8).toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Primary Download: PDF */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => triggerDossierDownload(currentJob?.id, 'pdf')}
            className="flex items-center space-x-2 text-xs font-bold px-3.5 py-2"
          >
            <Download size={13} />
            <span>Download VVB Dossier (PDF)</span>
          </Button>

          {/* Secondary: Markdown */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => triggerDossierDownload(currentJob?.id, 'markdown')}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2"
            title="Export institutional Markdown report"
          >
            <FileText size={13} />
            <span>Markdown</span>
          </Button>

          {/* Secondary: Raw JSON */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => triggerDossierDownload(currentJob?.id, 'json')}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2"
            title="Export raw JSON dossier payload"
          >
            <Database size={13} />
            <span>JSON</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VerraControlBar;
