/**
 * CarbonOS Motion System
 * Standardized durations, easings, and accessible motion variants.
 * Compliant with WCAG 2.2 Criterion 2.3.3 (Animation from Interactions).
 */

export const DURATIONS = {
  instant: 0.1,  // 100ms
  fast: 0.2,     // 200ms
  normal: 0.3,   // 300ms
  slow: 0.5,     // 500ms
};

export const EASINGS = {
  enter: [0, 0, 0.2, 1],         // ease-out: enter viewport
  exit: [0.4, 0, 1, 1],          // ease-in: leave viewport
  move: [0.4, 0, 0.2, 1],        // ease-in-out: move across layout
  spring: { type: "spring", stiffness: 350, damping: 25 }, // haptic feedback
};

/**
 * Returns true if the user has requested reduced motion.
 */
export const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Safe Framer Motion container variants supporting stagger and reduced motion.
 */
export const createContainerVariants = (staggerDelay = 0.15) => {
  const isReduced = getPrefersReducedMotion();
  if (isReduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
    };
  }

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };
};

/**
 * Safe Framer Motion item variants (opacity + subtle transform only, no layout reflow).
 */
export const createItemVariants = (yOffset = 16) => {
  const isReduced = getPrefersReducedMotion();
  if (isReduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
    };
  }

  return {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DURATIONS.normal,
        ease: EASINGS.enter,
      },
    },
  };
};

/**
 * Page transition variant. Subtle fade with slight vertical shift.
 */
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.enter },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATIONS.fast, ease: EASINGS.exit },
  },
};

