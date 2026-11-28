import React, { useEffect, useRef, useState } from 'react';
import { getPrefersReducedMotion } from '../../lib/motion';

/**
 * Reusable smooth numeric count-up display with tabular alignment.
 * Animates both on initial scroll-into-view and when `value` updates.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 700,
  prefix = '',
  suffix = '',
  className = '',
  formatLocale = true,
}) {
  const numValue = Number(value);
  const isValid = Number.isFinite(numValue);
  const [display, setDisplay] = useState(() => (isValid ? numValue : 0));
  const [hasEntered, setHasEntered] = useState(() => getPrefersReducedMotion());
  const elRef = useRef(null);
  const prevRef = useRef(isValid ? numValue : 0);

  useEffect(() => {
    const el = elRef.current;
    if (!el || hasEntered) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prevRef.current = 0;
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEntered]);

  useEffect(() => {
    if (!isValid) return undefined;
    if (getPrefersReducedMotion() || !hasEntered) {
      setDisplay(numValue);
      prevRef.current = numValue;
      return undefined;
    }

    const startVal = prevRef.current;
    const endVal = numValue;
    if (startVal === endVal) return undefined;

    let rafId = null;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplay(current);
      if (t < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setDisplay(endVal);
        prevRef.current = endVal;
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [numValue, isValid, hasEntered, duration]);

  if (!isValid) {
    return <span ref={elRef} className={className}>--</span>;
  }

  const formatted = formatLocale
    ? display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : display.toFixed(decimals);

  return (
    <span ref={elRef} className={`tabular-nums ${className}`.trim()}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default AnimatedNumber;
