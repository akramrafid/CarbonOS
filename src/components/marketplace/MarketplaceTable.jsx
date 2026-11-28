import React from 'react';
import { Button } from '@/components/ui/Button';

export function MarketplaceTable({
  isLight = false,
  credits,
  selectedBatchIds,
  onToggleSelectBatch,
  onSelectAll,
  onInspectCredit,
  onSelectCredit,
  bulkTotalTonnage,
  bulkTotalPrice,
  onClearBulkSelection,
  onProceedBulkCheckout
}) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors ${isLight ? 'bg-white border-border-strong shadow-sm' : 'bg-bg-canvas border-white/10'
        }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr
              className="border-b border-border-subtle font-mono text-[10px] text-fg-secondary uppercase tracking-wider bg-bg-elevated/60"
            >
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedBatchIds.length === credits.length && credits.length > 0}
                  onChange={onSelectAll}
                  aria-label="Select all available credits"
                  className="rounded text-accent focus:ring-accent cursor-pointer"
                />
              </th>
              <th className="p-4">Serial ID</th>
              <th className="p-4">Project Name</th>
              <th className="p-4">Sector</th>
              <th className="p-4">Standard</th>
              <th className="p-4">Region / Farmer</th>
              <th className="p-4 text-right">Available (tCO₂e)</th>
              <th className="p-4 text-right">Total (৳)</th>
              <th className="p-4 text-right">97% Remittance</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-border-subtle">
              {credits.map((credit) => {
                const isSelected = selectedBatchIds.includes(credit.id);
                const isAvailable = credit.status === 'AVAILABLE';
                const farmerRemittance = Math.round(credit.price * 0.97);

                return (
                  <tr
                    key={credit.id}
                  className={`transition-colors hover:bg-accent/5 ${isSelected ? 'bg-accent/10' : ''
                      }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        disabled={!isAvailable}
                        checked={isSelected}
                        onChange={() => onToggleSelectBatch(credit.id)}
                        aria-label={`Select ${credit.id}`}
                        className="rounded text-accent focus:ring-accent cursor-pointer"
                      />
                    </td>
                      <td className="p-4 font-mono text-[11px] text-fg-secondary">
                        {credit.id}
                      </td>
                        <td className="p-4 font-bold text-fg-primary">
                          <button
                            type="button"
                            onClick={() => onInspectCredit(credit)}
                            className="hover:text-accent text-left font-sans font-bold cursor-pointer"
                          >
                            {credit.type}
                          </button>
                        </td>
                        <td className="p-4 text-fg-secondary">{credit.sector}</td>
                        <td className="p-4 font-mono text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded border ${credit.verification.includes('Verra')
                                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20'
                              }`}
                          >
                            {credit.verification}
                          </span>
                        </td>
                          <td className="p-4 text-fg-primary">
                            <div>{credit.region}</div>
                            <div className="text-[10px] text-fg-muted">{credit.farmer}</div>
                          </td>
                            <td className="p-4 text-right font-mono font-bold text-fg-primary">
                              {credit.tonnage}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-emerald">
                              ৳{credit.price.toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-mono text-[11px] text-slate-400">
                              ৳{farmerRemittance.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                variant={isAvailable ? 'secondary' : 'ghost'}
                                size="sm"
                                disabled={!isAvailable}
                                onClick={() => onSelectCredit(credit)}
                                className="py-1 px-3 text-xs"
                              >
                                {isAvailable ? 'Buy' : 'Sold'}
                              </Button>
                            </td>
                          </tr>
                          );
            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Bulk Sticky Action Bar */}
                    {selectedBatchIds.length > 0 && (
                      <div
                        className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-30 ${isLight ? 'bg-white border-border-strong shadow-lg' : 'bg-bg-surface border-emerald/30 shadow-2xl'
                          }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-xs font-bold text-emerald bg-emerald/10 px-2.5 py-1 rounded">
                            {selectedBatchIds.length} Batches Selected
                          </span>
                          <span className="text-xs">
                            Total Volume: <strong className="text-white font-mono">{bulkTotalTonnage} tCO₂e</strong>
                          </span>
                          <span className="text-xs">
                            Total Cost: <strong className="text-emerald font-mono text-sm">৳{bulkTotalPrice.toLocaleString()}</strong>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearBulkSelection}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Clear Selection
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={onProceedBulkCheckout}
                            className="font-sans text-xs"
                          >
                            Proceed to Bulk Checkout (৳{bulkTotalPrice.toLocaleString()})
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

export default MarketplaceTable;
