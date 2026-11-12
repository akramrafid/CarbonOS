import React from 'react';
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fmt } from './activityData';

export function ActivitiesTableTab({
  isLight = false,
  filteredActivities,
  evidenceList,
  scopeFilter,
  setScopeFilter,
  facilityFilter,
  setFacilityFilter,
  qualityFilter,
  setQualityFilter,
  statusFilter,
  setStatusFilter,
  activeClient,
  onSelectEvidence
}) {
  return (
    <div>
      {/* Filter Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Scope</label>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
            }`}
          >
            <option value="all">All Scopes (1, 2, 3)</option>
            <option value="Scope 1">Scope 1 - Direct</option>
            <option value="Scope 2">Scope 2 - Grid Power</option>
            <option value="Scope 3">Scope 3 - Value Chain</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Facility / Site</label>
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
            }`}
          >
            <option value="all">All Facilities ({activeClient.facilities?.length || 1})</option>
            {activeClient.facilities?.map((f, i) => (
              <option key={i} value={f.name}>{f.name} ({f.location})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Data Quality</label>
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
            }`}
          >
            <option value="all">All Data Qualities</option>
            <option value="High">High (Metered / Invoiced)</option>
            <option value="Medium">Medium (Supplier Data)</option>
            <option value="Estimated">Estimated (Proxy Models)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#7C9A88] mb-1 font-bold">Audit Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full text-xs font-sans p-2 rounded-xl border focus:outline-none focus:border-[#00C853] cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#040906] border-[#152B1D] text-white'
            }`}
          >
            <option value="all">All Audit Statuses</option>
            <option value="Verified">Verified by Auditor</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Ready">Ready for Review</option>
            <option value="Draft">Draft Entry</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 w-full overflow-hidden">
        <div className="text-[11px] font-mono text-gray-500 dark:text-mist flex items-center justify-between pb-2 md:hidden">
          <span className="flex items-center gap-1">← Scroll table horizontally →</span>
          <span className="text-[10px]">1,100px wide</span>
        </div>
        <div className="w-full overflow-x-auto touch-pan-x rounded-xl border border-gray-200 dark:border-[#152B1D]">
          <table className="w-full text-left font-sans text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr
                className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                  isLight ? 'text-slate-500 border-slate-200 bg-slate-50/50' : 'text-[#7C9A88] border-[#152B1D] bg-[#040906]/60'
                }`}
              >
                <th className="py-3 px-3">Activity &amp; Scope</th>
                <th className="py-3 px-3">Site / Facility</th>
                <th className="py-3 px-3">Department &amp; Lead</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3">Factor Applied (Lineage)</th>
                <th className="py-3 px-3 text-right">Footprint</th>
                <th className="py-3 px-3">Evidence Ref</th>
                <th className="py-3 px-3 text-center">Quality</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isLight ? 'divide-slate-100 text-slate-800' : 'divide-[#152B1D]/40 text-slate-200'
              }`}
            >
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 font-sans">
                    No activity records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((row) => {
                  const linkedEvidence = evidenceList.find((e) => e.id === row.evidenceId);

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors group ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-[#00C853]/5'
                      }`}
                    >
                      {/* Activity & Scope */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              row.scopeGroup === 'Scope 1'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : row.scopeGroup === 'Scope 2'
                                ? 'bg-[#00C853]/10 text-[#00E676] border-[#00C853]/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {row.scope}
                          </span>
                          <span className="font-bold text-sm tracking-tight block">
                            {row.activityType}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5 ml-1">
                          {row.id} • {row.category}
                        </span>
                      </td>

                      {/* Site */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold block truncate max-w-[180px]">{row.siteId}</span>
                        <span className="text-[10px] text-gray-400 font-mono block">{row.siteLocation}</span>
                      </td>

                      {/* Department & Lead */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium block">{row.department}</span>
                        <span className="text-[10px] text-gray-400 font-sans block truncate max-w-[160px]">
                          {row.responsiblePerson}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className="font-bold text-sm">{fmt(row.quantity, 0)}</span>
                        <span className="text-[10px] text-gray-400 block">{row.unit}</span>
                      </td>

                      {/* Factor Lineage */}
                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        <span className="text-[#00C853] font-bold block">{row.kgCO2ePerUnit} kg/unit</span>
                        <span className="text-[9px] text-gray-400 block truncate max-w-[170px]" title={row.emissionFactorVersion}>
                          {row.emissionFactorId} ({row.emissionFactorVersion})
                        </span>
                      </td>

                      {/* Total Footprint */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className="font-bold text-sm text-[#00C853] block">
                          {fmt(row.tCO2e, 2)}
                        </span>
                        <span className="text-[9px] text-gray-400 block">tCO₂e</span>
                      </td>

                      {/* Evidence Ref */}
                      <td className="py-3.5 px-3">
                        {row.evidenceFileName ? (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => {
                              if (linkedEvidence) onSelectEvidence(linkedEvidence);
                            }}
                            leftIcon={<FileText className="w-3.5 h-3.5 text-[#00C853] shrink-0" />}
                            className="font-mono text-[11px] truncate max-w-[150px] p-0"
                          >
                            {row.evidenceFileName}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Missing Primary Evidence</span>
                          </span>
                        )}
                      </td>

                      {/* Data Quality */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            row.dataQualityRating === 'High'
                              ? 'bg-[#00C853]/15 text-[#00E676] border-[#00C853]/30'
                              : row.dataQualityRating === 'Medium'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {row.dataQualityRating}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center justify-center space-x-1 mx-auto w-fit ${
                            row.status === 'Verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : row.status === 'Reviewed'
                              ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                              : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {row.status === 'Verified' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          <span>{row.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ActivitiesTableTab;
