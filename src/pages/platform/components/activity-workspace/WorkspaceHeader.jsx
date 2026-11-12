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
        isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
      }`}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C853]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO 14064-1 &amp; GHG Protocol Activity Data Center</span>
          </div>
          <h2
            className={`font-sans font-bold text-2xl sm:text-3xl mt-1 tracking-tight ${
              isLight ? 'text-[#0F2417]' : 'text-white'
            }`}
          >
            Activity Data &amp; Evidence Register
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-[#7C9A88]'
            }`}
          >
            Maintain tamper-evident activity records, emission factor version lineage, and cross-referenced primary evidence documents for{' '}
            <span className="font-bold text-[#00C853]">{activeClient.legalName}</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] font-mono">
            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B2114] border-[#174D2B] text-emerald-300'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-[#00C853]" />
              <span>Sector: <strong>{activeClient.sector}</strong></span>
            </span>

            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B2114] border-[#174D2B] text-emerald-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#00C853]" />
              <span>Assigned Lead: <strong>{activeClient.assignedAuditor}</strong></span>
            </span>

            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B2114] border-[#174D2B] text-emerald-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#00C853]" />
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
            <Download className="w-4 h-4 text-[#00C853]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#152B1D]/40">
        <StatCard
          title="Total Carbon Inventory"
          value={fmt(totalEmissions, 2)}
          unit="tCO₂e"
          subtitle={`${activitiesCount} Traceable Activities`}
        />

        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-[#7C9A88] block">Scope Breakdown</span>
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
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-[#7C9A88] block">Assurance Level</span>
          <div className="flex items-center space-x-1.5 mt-1">
            <ShieldCheck className="w-5 h-5 text-[#00C853]" />
            <span className={`text-base font-sans font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              ISAE 3410
            </span>
          </div>
          <span className="text-[10px] text-[#00C853] mt-1 block">ISO 14064-1 Pre-Audit Ready</span>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
