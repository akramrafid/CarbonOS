import React from 'react';
import { FileCheck, History } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export function ExtractorHeader({
  isLight = false,
  activeClient,
  isSimulationMode,
  auditLogLength,
  showAuditDrawer,
  setShowAuditDrawer,
  scope1Total,
  scope2Total,
  scope2Missing,
  grandTotal,
  grandCost,
  activeSegmentsCount,
  totalSegmentsCount
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-accent/20 border border-border-strong/40 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-accent" />
            </div>
            <h2 className="font-sans font-bold text-xl lg:text-2xl tracking-tight">
              Universal Utility Segment Extractor &amp; Human-in-the-Loop Review
            </h2>
            {isSimulationMode ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                SANDBOX / PREVIEW MODE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/20 text-accent-hover border border-border-strong/40">
                LIVE PARSER ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-sans max-w-2xl">
            Parses complex industrial PDF utility statements and separates every granular segment. All line-items require{' '}
            <strong className="text-white">human auditor verification and audit trail logging</strong> before being sealed into the enterprise emissions ledger.
          </p>
        </div>

        {/* Client Active Context Badge & Audit Log Button */}
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAuditDrawer(!showAuditDrawer)}
            className="flex items-center space-x-1.5 font-mono text-xs"
          >
            <History className="w-3.5 h-3.5 text-accent" />
            <span>Audit Trail ({auditLogLength})</span>
          </Button>

          <div
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border ${
              isLight ? 'bg-bg-muted border-border-subtle' : 'bg-bg-canvas border-border-subtle'
            }`}
          >
            <div
              className={`h-9 px-2.5 rounded-xl flex items-center justify-center shrink-0 min-w-[65px] max-w-[85px] ${
                activeClient.logoTheme === 'dark'
                  ? 'bg-bg-surface border border-border-strong ring-1 ring-emerald-500/20'
                  : 'bg-white border border-slate-200'
              }`}
            >
              <img src={activeClient.logo} alt={activeClient.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider">Active Client Ledger</div>
              <div className="font-sans font-bold text-xs">{activeClient.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoice Footprint"
          value={scope2Missing ? '—' : grandTotal.toFixed(2)}
          unit="tCO₂e"
          subtitle={`${activeSegmentsCount} Active Segments (${totalSegmentsCount - activeSegmentsCount} Rejected)`}
          trend={scope2Missing ? 'neutral' : 'up'}
        />

        <StatCard
          title="Scope 1 Direct Combustion"
          value={scope1Total.toFixed(2)}
          unit="tCO₂e"
          subtitle="Captive genset, natural gas & ETP"
        />

        <StatCard
          title="Scope 2 Grid & Steam"
          value={scope2Missing ? '—' : scope2Total.toFixed(2)}
          unit="tCO₂e"
          subtitle="Off-peak, peak & steam net of solar"
        />

        <StatCard
          title="Total Billed Expenditure"
          value={`৳${(grandCost / 100000).toFixed(2)}`}
          unit="Lakh BDT"
          subtitle={`~$${(grandCost / 120).toFixed(0)} USD`}
        />
      </div>
    </div>
  );
}

export default ExtractorHeader;
