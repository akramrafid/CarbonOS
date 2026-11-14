import React from 'react';

/**
 * Universal Responsive Grid Primitive (Phase 3: Card Clipping Remediation)
 * Solves card clipping and horizontal blowout at the architectural root:
 * - Fluid auto-fit columns: repeat(auto-fit, minmax(min(100%, var(--min-col)), 1fr))
 * - Auto-adapting container query context (@container)
 * - Strict min-w-0 on all flex/grid cells
 * - Responsive gap scale adhering to 4px rhythm tokens
 */
export const Grid = React.forwardRef(function Grid(
  {
    children,
    minCol = '280px',
    gap = 'gap-4 sm:gap-6',
    cols = null, // Optional explicit column override: e.g. 2, 3, 4
    className = '',
    as: Component = 'div',
    ...props
  },
  ref
) {
  const explicitCols = cols
    ? {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
      }[cols] || ''
    : '';

  const dynamicStyle = !cols
    ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minCol}), 1fr))`
      }
    : undefined;

  return (
    <Component
      ref={ref}
      className={`
        grid w-full min-w-0 @container
        ${gap}
        ${explicitCols}
        ${className}
      `.trim()}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Grid;

