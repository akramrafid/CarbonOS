import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LOGO_ASSETS = {
  light: { src: '/logo-light.png', width: 921, height: 203 },
  dark: { src: '/logo-dark.png', width: 921, height: 203 },
  'mark-light': { src: '/logo-mark-light.png', width: 219, height: 219 },
  'mark-dark': { src: '/logo-mark-dark.png', width: 219, height: 219 },
};

/**
 * Renders the official CarbonZero logo (green for light surfaces, white for dark surfaces)
 * with an optional BD registry badge and intrinsic dimensions to prevent layout shift.
 */
const BrandLogo = ({
  variant = 'auto',
  heightClass = 'h-6 sm:h-7',
  showBdBadge = true,
  badgeClassName = '',
  alt = 'CarbonZero BD',
  className = '',
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  let resolvedKey = variant;
  if (variant === 'auto') {
    resolvedKey = isLight ? 'light' : 'dark';
  } else if (variant === 'mark') {
    resolvedKey = isLight ? 'mark-light' : 'mark-dark';
  }

  const asset = LOGO_ASSETS[resolvedKey] || LOGO_ASSETS.dark;

  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0 ${className}`}>
      <img
        src={asset.src}
        alt={alt}
        width={asset.width}
        height={asset.height}
        decoding="async"
        className={`${heightClass} w-auto object-contain select-none shrink-0`}
      />
      {showBdBadge && (
        <span
          className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase leading-none shrink-0 whitespace-nowrap border ${
            resolvedKey === 'light' || resolvedKey === 'mark-light'
              ? 'bg-accent/10 border-accent/25 text-accent'
              : 'bg-emerald/15 border-emerald/30 text-emerald'
          } ${badgeClassName}`}
        >
          BD
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
