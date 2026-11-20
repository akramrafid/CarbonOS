import { useState, useEffect, useRef } from 'react';
import { getPrefersReducedMotion } from './motion';

/**
 * useRevealOnScroll (Phase 7.2)
 * - Reveals an element once via `IntersectionObserver` when it enters the viewport.
 * - Never delays above-the-fold content (`aboveFold = true` or already intersecting).
 * - Immediately reveals when `prefers-reduced-motion: reduce` is active.
 */
export function useRevealOnScroll({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  aboveFold = false,
  once = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => aboveFold || getPrefersReducedMotion());

  useEffect(() => {
    if (aboveFold || getPrefersReducedMotion()) {
      setIsVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      setIsVisible(true);
      return undefined;
    }

    // Never delay elements already above the fold on initial paint
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      if (once) return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, aboveFold, once]);

  return { ref, isVisible };
}

export default useRevealOnScroll;

