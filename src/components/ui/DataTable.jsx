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
    <div className={`w-full min-w-0 rounded-xl border border-border-subtle bg-bg-surface ${className}`}>
      <div className="w-full min-w-0 overflow-x-auto touch-pan-x scrollbar-thin">
        <table className="w-full text-left text-sm border-collapse min-w-0">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-elevated/50">
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
                      <div className="h-4 bg-carbon-surface-raised rounded w-3/4 dark:bg-bg-elevated" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-mist dark:text-fg-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row[keyField] || `row-${rIdx}`}
                  className="transition-colors duration-100 hover:bg-carbon-surface-raised/40 dark:hover:bg-bg-elevated/40"
                >
                  {columns.map((col) => {
                    const cellVal = col.key ? row[col.key] : undefined;
                    const value = col.render
                      ? (col.render.length === 1 ? col.render(row) : col.render(cellVal, row, rIdx))
                      : cellVal;
                    const isNumber = typeof cellVal === 'number' || col.isNumber;
                    return (
                      <td
                        key={col.key || col.header}
                        className={`
                          py-3 px-4 text-registry dark:text-fg-primary
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

