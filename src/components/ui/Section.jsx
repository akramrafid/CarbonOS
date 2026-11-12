import React from 'react';

/**
 * Universal Section Container
 * Replaces unconstrained ad-hoc py-10 md:py-16/py-10 md:py-16 with structured design tokens:
 * - Brand mode: clamp(2.5rem, 5vw, 5rem) vertical rhythm
 * - Product mode: 16-24px dense module spacing
 * - Standard 12-column grid container with responsive gutters
 */
export function Section({
  children,
  mode = 'product', // 'brand' | 'product'
  className = '',
  id,
  as: Component = 'section',
  fullWidth = false,
  ...props
}) {
  const modePadding = mode === 'brand'
    ? 'py-10 md:py-16'
    : 'py-4 sm:py-6';

  const containerWidth = fullWidth
    ? 'w-full'
    : mode === 'brand'
      ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      : 'max-w-[1600px] mx-auto px-4 sm:px-6';

  return (
    <Component
      id={id}
      className={`w-full ${modePadding} ${className}`}
      {...props}
    >
      <div className={containerWidth}>
        {children}
      </div>
    </Component>
  );
}

/**
 * Universal Section Header
 * Left-aligned by default; centered only when centered=true (hero/empty states)
 */
export function SectionHeader({
  badge,
  title,
  subtitle,
  actions,
  centered = false,
  className = '',
  titleAs: TitleTag = 'h2'
}) {
  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6
        ${centered ? 'text-center items-center justify-center' : 'text-left'}
        ${className}
      `.trim()}
    >
      <div className={`flex flex-col gap-1.5 ${centered ? 'items-center max-w-2xl mx-auto' : 'max-w-3xl'}`}>
        {badge && <div className="mb-1">{badge}</div>}
        <TitleTag className="text-xl sm:text-2xl font-sans font-bold text-registry tracking-tight dark:text-fg-primary">
          {title}
        </TitleTag>
        {subtitle && (
          <p className="text-sm text-mist font-sans leading-relaxed dark:text-fg-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default Section;

