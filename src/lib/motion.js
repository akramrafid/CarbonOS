/**
 * CarbonOS Motion System (Phase 6 & Phase 7)
 * Standardized durations, easings, spring presets, and accessible motion variants.
 * Compliant with WCAG 2.2 Criterion 2.3.3 (Animation from Interactions).
 *
 * Rules Enforced:
 * - Animate transform and opacity only (plus stroke-dashoffset or clip-path for SVG draws).
 * - UI feedback <= 300ms; explanatory sequences <= 800ms and skippable.
 * - Stagger <= 50ms (0.05s), capped at 8 items (`MAX_STAGGER_ITEMS = 8`).
 * - Reduced motion (`prefers-reduced-motion: reduce`): fades only, count-ups jump to final value.
 */

export const PAGE_TRANSITION_MECHANISM = 'framer-motion-animate-presence';

export const DURATIONS = {
  instant: 0.1,    // 100ms
  fast: 0.2,       // 200ms (legacy compatibility)
  base: 0.22,      // 220ms (Phase 7 base)
  normal: 0.3,     // 300ms (legacy compatibility)
  slow: 0.5,       // 500ms (legacy compatibility)
  narrative: 0.6,  // 600ms (Phase 7 narrative)
  pageExit: 0.12,  // 120ms (Phase 6 exit)
  pageEnter: 0.22, // 220ms (Phase 6 enter)
};

/**
 * Phase 7.1 Canonical Duration Tokens (in seconds and milliseconds)
 */
export const MOTION_DURATIONS = {
  instant: 0.1,      // 100ms
  fast: 0.15,        // 150ms
  base: 0.22,        // 220ms
  slow: 0.32,        // 320ms
  narrative: 0.6,    // 600ms
  instantMs: 100,
  fastMs: 150,
  baseMs: 220,
  slowMs: 320,
  narrativeMs: 600,
};

export const PAGE_TRANSITION_TIMING = {
  exitMs: 120,
  enterMs: 220,
  exitSec: 0.12,
  enterSec: 0.22,
  translatePx: 8,
  progressDelayMs: 150,
};

export const EASINGS = {
  enter: [0, 0, 0.2, 1],            // ease-out: enter viewport
  exit: [0.4, 0, 1, 1],             // ease-in: leave viewport
  move: [0.4, 0, 0.2, 1],           // ease-in-out: move across layout
  pageOut: [0.22, 1, 0.36, 1],      // standard cubic-bezier(0.22, 1, 0.36, 1)
  easeOut: [0.22, 1, 0.36, 1],      // Phase 7 standard ease-out
  easeIn: [0.4, 0, 1, 1],           // Phase 7 ease-in
  easeInOut: [0.4, 0, 0.2, 1],      // Phase 7 ease-in-out
  spring: { type: 'spring', stiffness: 350, damping: 25 }, // haptic feedback
};

/**
 * Phase 7.1 Spring Presets
 */
export const SPRING_PRESETS = {
  snappy: { type: 'spring', stiffness: 420, damping: 28, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 220, damping: 26, mass: 1.0 },
};

export const MAX_STAGGER_DELAY_SEC = 0.05; // 50ms max per item
export const MAX_STAGGER_ITEMS = 8;        // Cap stagger at 8 items

/**
 * Returns true if the user has requested reduced motion.
 */
export const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Computes semantic depth of a route path for direction-aware transitions.
 */
export const getRouteDepth = (pathname = '/') => {
  const clean = String(pathname || '/').replace(/\/+$/, '') || '/';
  if (clean === '/') return 0;
  return clean.split('/').filter(Boolean).length;
};

/**
 * Computes transition direction (+1 forward/deeper, -1 backward/shallower or POP).
 */
export const computeRouteDirection = (prevPath = '/', nextPath = '/', navigationType = 'PUSH') => {
  if (navigationType === 'POP') {
    return -1;
  }
  const prevDepth = getRouteDepth(prevPath);
  const nextDepth = getRouteDepth(nextPath);
  if (nextDepth < prevDepth) {
    return -1;
  }
  return 1;
};

/**
 * Phase 6 Direction-Aware Page Transition Variants:
 * - Exit: ~120ms (0.12s), opacity 0 + 8px directional translate
 * - Enter: ~220ms (0.22s), opacity 1 + 8px directional translate -> 0
 * - Reduced Motion: fade only (0px translate)
 */
export const createRouteTransitionVariants = ({
  direction = 1,
  reducedMotion = getPrefersReducedMotion(),
} = {}) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: PAGE_TRANSITION_TIMING.enterSec, ease: EASINGS.pageOut },
      },
      exit: {
        opacity: 0,
        transition: { duration: PAGE_TRANSITION_TIMING.exitSec, ease: EASINGS.exit },
      },
    };
  }

  const sign = direction >= 0 ? 1 : -1;
  const offset = PAGE_TRANSITION_TIMING.translatePx * sign;

  return {
    initial: {
      opacity: 0,
      y: offset,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: PAGE_TRANSITION_TIMING.enterSec,
        ease: EASINGS.pageOut,
      },
    },
    exit: {
      opacity: 0,
      y: -offset,
      transition: {
        duration: PAGE_TRANSITION_TIMING.exitSec,
        ease: EASINGS.exit,
      },
    },
  };
};

/**
 * Helper for low-risk shared-element transitions (`layoutId`) between list and detail views.
 */
export const getSharedElementLayoutId = (scope, id) => {
  if (!scope || id === undefined || id === null) return undefined;
  return `carbonos-shared-${scope}-${id}`;
};

/**
 * Phase 7.1 Bounded Stagger Container Variants:
 * Enforces stagger <= 50ms (0.05s) and caps total stagger delay at `MAX_STAGGER_ITEMS` (8 items).
 */
export const createContainerVariants = (staggerDelay = 0.04) => {
  const isReduced = getPrefersReducedMotion();
  if (isReduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.fast } },
    };
  }

  const boundedStagger = Math.min(Math.max(0, staggerDelay), MAX_STAGGER_DELAY_SEC);

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: boundedStagger,
        delayChildren: 0.04,
      },
    },
  };
};

/**
 * Returns bounded stagger delay (in seconds) for an item index `idx`, capped at 8 items.
 */
export const getBoundedStaggerDelay = (idx = 0, stepSec = 0.04) => {
  if (getPrefersReducedMotion()) return 0;
  const clampedStep = Math.min(Math.max(0, stepSec), MAX_STAGGER_DELAY_SEC);
  const clampedIndex = Math.min(Math.max(0, idx), MAX_STAGGER_ITEMS - 1);
  return Number((clampedIndex * clampedStep).toFixed(3));
};

/**
 * Safe Framer Motion item variants (opacity + subtle transform only, no layout reflow).
 */
export const createItemVariants = (yOffset = 12) => {
  const isReduced = getPrefersReducedMotion();
  if (isReduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.fast } },
    };
  }

  return {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.base,
        ease: EASINGS.easeOut,
      },
    },
  };
};

/**
 * Page transition variant. Subtle fade with 8px vertical shift (220ms enter, 120ms exit).
 */
export const pageVariants = {
  initial: { opacity: 0, y: PAGE_TRANSITION_TIMING.translatePx },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: PAGE_TRANSITION_TIMING.enterSec, ease: EASINGS.pageOut },
  },
  exit: {
    opacity: 0,
    y: -PAGE_TRANSITION_TIMING.translatePx,
    transition: { duration: PAGE_TRANSITION_TIMING.exitSec, ease: EASINGS.exit },
  },
};

/**
 * Parses a formatted string or number (e.g. "৳412.8M", "42,850", 1250.5)
 * into prefix, numeric value, decimal places, commas flag, and suffix.
 */
export function parseTickerValue(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const str = String(raw);
    const decimals = str.includes('.') ? str.split('.')[1].length : 0;
    return {
      isNumeric: true,
      prefix: '',
      number: raw,
      decimals,
      useCommas: false,
      suffix: '',
      rawText: str,
    };
  }

  const text = String(raw ?? '');
  const match = text.match(/^([^0-9+-]*?)([+-]?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { isNumeric: false, rawText: text };
  }

  const [, prefix, numPart, suffix] = match;
  const cleanNum = numPart.replace(/,/g, '');
  const parsed = Number.parseFloat(cleanNum);
  if (!Number.isFinite(parsed)) {
    return { isNumeric: false, rawText: text };
  }

  const decimals = cleanNum.includes('.') ? cleanNum.split('.')[1].length : 0;
  const useCommas = numPart.includes(',');

  return {
    isNumeric: true,
    prefix,
    number: parsed,
    decimals,
    useCommas,
    suffix,
    rawText: text,
  };
}

export function formatTickerNumber(val, { decimals = 0, useCommas = false, prefix = '', suffix = '' }) {
  const fixed = Number(val).toFixed(decimals);
  if (!useCommas) {
    return `${prefix}${fixed}${suffix}`;
  }
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${prefix}${decPart !== undefined ? `${withCommas}.${decPart}` : withCommas}${suffix}`;
}
