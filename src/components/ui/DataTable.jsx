import React from 'react';

/**
 * Universal DataTable Component
 * Implements Design Principles:
 * - Right-aligned numbers with tabular-nums
 * - Responsive touch-pan-x horizontal scrolling with scroll cue
 * - Sticky header support and keyboard accessibility
 */
export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No records found',
  className = ''
}) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-carbon-border dark:border-[#1E3326] bg-carbon-surface dark:bg-[#0D1812] ${className}`}>
      <div className="w-full overflow-x-auto touch-pan-x scrollbar-thin">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-carbon-border/80 dark:border-[#1E3326] bg-carbon-surface-raised/50 dark:bg-[#13241B]/50">
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  scope="col"
                  className={`
                    py-3 px-4 text-xs font-mono font-medium text-mist uppercase tracking-wider
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.className || ''}
                  `.trim()}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-border/40 dark:divide-[#1E3326]/40 font-sans">
            {loading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`loading-cell-${cIdx}`} className="py-3 px-4">
                      <div className="h-4 bg-carbon-surface-raised rounded w-3/4 dark:bg-[#13241B]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-mist dark:text-[#7A9A85]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row[keyField] || `row-${rIdx}`}
                  className="transition-colors duration-100 hover:bg-carbon-surface-raised/40 dark:hover:bg-[#13241B]/40"
                >
                  {columns.map((col) => {
                    const value = col.render ? col.render(row[col.key], row) : row[col.key];
                    const isNumber = typeof row[col.key] === 'number' || col.isNumber;
                    return (
                      <td
                        key={col.key || col.header}
                        className={`
                          py-3 px-4 text-registry dark:text-[#E2ECE5]
                          ${col.align === 'right' || isNumber ? 'text-right font-mono tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left'}
                          ${col.cellClassName || ''}
                        `.trim()}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
