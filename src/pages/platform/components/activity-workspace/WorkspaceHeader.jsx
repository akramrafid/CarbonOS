import React from 'react';
import { ShieldCheck, Building, UserCheck, MapPin, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { fmt } from './activityData';

export function WorkspaceHeader({
  isLight = false,
  activeClient,
  totalEmissions,
  scopeTotals,
  evidenceCoverage,
  activitiesCount,
  onOpenAddModal,
  onExportCSV
}) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition-all relative overflow-hidden ${
        isLight ? 'bg-white border-border-subtle' : 'bg-bg-elevated border-border-subtle'
      }`}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO 14064-1 &amp; GHG Protocol Activity Data Center</span>
          </div>
          <h2
            className={`font-sans font-bold text-2xl sm:text-3xl mt-1 tracking-tight ${
              isLight ? 'text-fg-primary' : 'text-white'
            }`}
          >
            Activity Data &amp; Evidence Register
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-fg-secondary'
            }`}
          >
            Maintain tamper-evident activity records, emission factor version lineage, and cross-referenced primary evidence documents for{' '}
            <span className="font-bold text-accent">{activeClient.legalName}</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] font-mono">
            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-bg-surface border-border-subtle text-emerald-300'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-accent" />
              <span>Sector: <strong>{activeClient.sector}</strong></span>
            </span>

            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-bg-surface border-border-subtle text-emerald-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-accent" />
              <span>Assigned Lead: <strong>{activeClient.assignedAuditor}</strong></span>
            </span>

            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-bg-surface border-border-subtle text-emerald-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{activeClient.facilities?.length || 1} Registered Sites</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Activity Data</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-accent" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border-subtle/40">
        <StatCard
          title="Total Carbon Inventory"
          value={fmt(totalEmissions, 2)}
          unit="tCO₂e"
          subtitle={`${activitiesCount} Traceable Activities`}
        />

        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-bg-canvas border-border-subtle'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-fg-secondary block">Scope Breakdown</span>
          <div className="text-xs font-mono space-y-0.5 mt-1">
            <div className="flex justify-between">
              <span className="text-amber-400">Scope 1:</span>
              <span className="font-bold">{fmt(scopeTotals.s1, 1)} t</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400">Scope 2:</span>
              <span className="font-bold">{fmt(scopeTotals.s2, 1)} t</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Scope 3:</span>
              <span className="font-bold">{fmt(scopeTotals.s3, 1)} t</span>
            </div>
          </div>
        </div>

        <StatCard
          title="Evidence Ratio"
          value={`${evidenceCoverage}%`}
          unit="verified"
          subtitle="DESCO/DPDC, fuel & freight invoices"
          trend="up"
        />

        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-bg-canvas border-border-subtle'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-fg-secondary block">Assurance Level</span>
          <div className="flex items-center space-x-1.5 mt-1">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span className={`text-base font-sans font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              ISAE 3410
            </span>
          </div>
          <span className="text-[10px] text-accent mt-1 block">ISO 14064-1 Pre-Audit Ready</span>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
