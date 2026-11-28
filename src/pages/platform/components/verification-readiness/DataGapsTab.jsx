import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';

export function DataGapsTab({
  isLight = false,
  dataGapSummary,
  showToast
}) {
  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 bg-bg-surface border-border-subtle"
    >
      <div>
          <h3 className="font-bold text-lg text-fg-primary flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <span>Evidence &amp; Data Gap Analysis Report</span>
          </h3>
            <p className="text-xs text-fg-secondary mt-0.5">
              Identifies activity line items that lack verified primary invoices, rely on estimated secondary factors, or remain in unverified draft state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Missing Document References"
              value={dataGapSummary.missingEvidence.length}
              trend="down"
              subtitle="Activity lines without upload challan or bill reference"
            />
            <StatCard
              title="Estimated Quality Records"
              value={dataGapSummary.estimatedQuality.length}
              trend="neutral"
              subtitle="Entries relying on spend-based or distance approximations"
            />
            <StatCard
              title="Draft Verification Status"
              value={dataGapSummary.draftStatus.length}
              trend="neutral"
              subtitle="Items pending initial internal audit sign-off"
            />
          </div>

          {/* Actionable Data Gaps Table */}
            <div className="border border-border-subtle rounded-2xl overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-bg-elevated/60 border-b border-border-subtle text-fg-secondary font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3.5">Activity ID</th>
                      <th>Category</th>
                      <th>Responsible Person</th>
                      <th>Issue / Gap Type</th>
                      <th>Quantity &amp; Unit</th>
                      <th>Recommended Remediation</th>
                      <th className="text-right p-3.5">Action</th>
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-border-subtle font-mono text-xs">
                      {dataGapSummary.totalGaps === 0 ? (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-fg-secondary">
                              <CheckCircle2 className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
                              <span>Zero data gaps detected. 100% of activity line items carry primary evidence and verified status!</span>
                            </td>
                        </tr>
                      ) : (
                        [...dataGapSummary.missingEvidence, ...dataGapSummary.estimatedQuality, ...dataGapSummary.draftStatus]
                          .filter((item, idx, arr) => arr.findIndex((t) => t.id === item.id) === idx)
                          .map((item) => (
                              <tr key={item.id} className="hover:bg-bg-elevated/40">
                                <td className="p-3.5 font-bold text-fg-primary">{item.id}</td>
                                <td className="text-fg-primary">{item.category}</td>
                                <td className="text-fg-secondary font-sans">{item.responsiblePerson}</td>
                                <td>
                                  {!item.evidenceFileName ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 font-bold">
                                        Missing Doc
                                      </span>
                                      ) : item.dataQualityRating === 'Estimated' ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 font-bold">
                                          Estimated Factor
                                        </span>
                                        ) : (
                                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-bold">
                                            Draft State
                                          </span>
                      )}
                                        </td>
                                          <td className="text-fg-primary">{Number(item.quantity || 0).toLocaleString()} {item.unit}</td>
                                          <td className="text-fg-secondary font-sans text-[11px]">
                                            {!item.evidenceFileName
                                              ? 'Attach scanned utility bill / purchase challan.'
                                              : 'Upgrade to supplier-specific emission factor.'}
                                          </td>
                                          <td className="p-3.5 text-right">
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              onClick={() => showToast(`Evidence request notification dispatched to ${item.responsiblePerson}`, 'info')}
                                              className="text-[10px] font-mono py-1 px-2.5"
                                            >
                                              Request Proof
                                            </Button>
                                          </td>
                                        </tr>
                                        ))
            )}
                                      </tbody>
                                    </table>
      </div>
                              </div>
                              );
}

                              export default DataGapsTab;
