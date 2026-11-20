import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useTransition,
} from 'react';
import {
  useLocation,
  useNavigationType,
  useOutlet,
} from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  computeRouteDirection,
  createRouteTransitionVariants,
} from '../../lib/motion';
import { useRoutePrefetcher } from '../../lib/routePrefetch';
import { findNavItemByRoute } from '../../config/nav.config';
import TopProgressBar from './TopProgressBar';
import PageSkeleton from './PageSkeleton';

const SCROLL_STORAGE_KEY = 'carbonos-scroll-positions';

function readScrollMap() {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveScrollPosition(key, pathname, y) {
  try {
    const map = readScrollMap();
    if (key) map[`key:${key}`] = y;
    if (pathname) map[`path:${pathname}`] = y;
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function getSavedScrollPosition(key, pathname) {
  const map = readScrollMap();
  if (key && typeof map[`key:${key}`] === 'number') {
    return map[`key:${key}`];
  }
  if (pathname && typeof map[`path:${pathname}`] === 'number') {
    return map[`path:${pathname}`];
  }
  return 0;
}

function formatFallbackTitle(pathname = '/') {
  if (pathname === '/') return 'Home';
  const navMatch = findNavItemByRoute(pathname);
  if (navMatch?.label) return navMatch.label;
  const lastSegment = pathname.split('/').filter(Boolean).pop() || 'Page';
  return lastSegment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Inner lifecycle helper rendered inside `<motion.div key={displayedLocation.pathname}>`
 * so its effect runs ONLY after `AnimatePresence mode="wait"` finishes exiting the previous
 * route and `<Suspense>` mounts the new route's DOM.
 */
function RouteMountEffect({
  displayedLocation,
  navigationType,
  containerRef,
  isInitialMountRef,
  isRestoringScrollRef,
  onAnnounce,
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      isRestoringScrollRef.current = false;
      return undefined;
    }

    // 1. Scroll restoration on POP (Back/Forward) vs scroll-to-top on new route
    const targetY =
      navigationType === 'POP'
        ? getSavedScrollPosition(displayedLocation.key, displayedLocation.pathname)
        : 0;

    window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });

    // 2. Focus primary <h1> and announce route change via aria-live once the new route DOM settles
    const syncScrollAndFocus = () => {
      window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
      isRestoringScrollRef.current = false;

      const rootEl = containerRef.current || document.querySelector('main') || document.body;
      const heading = rootEl ? rootEl.querySelector('h1') : null;
      const headingText = heading?.textContent?.trim();
      const pageTitle = headingText || formatFallbackTitle(displayedLocation.pathname);

      if (heading) {
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1');
          heading.classList.add('outline-none');
        }
        try {
          heading.focus({ preventScroll: true });
        } catch {}
      }

      if (typeof document !== 'undefined') {
        document.title = `${pageTitle} | Carbon Zero BD`;
      }
      onAnnounce(`Navigated to ${pageTitle}`);
    };

    const rafId = window.requestAnimationFrame(() => {
      syncScrollAndFocus();
    });
    const timerId = setTimeout(syncScrollAndFocus, 60);

    return () => {
      window.cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [
    displayedLocation.pathname,
    displayedLocation.key,
    navigationType,
    containerRef,
    isInitialMountRef,
    isRestoringScrollRef,
    onAnnounce,
  ]);

  return null;
}

/**
 * RouteTransitionOutlet (Phase 6)
 *
 * Wraps the content `<Outlet />` inside `MarketingLayout` and `DashboardLayout`:
 * - Only the content outlet transitions; the persistent shell stays mounted.
 * - Uses Framer Motion `AnimatePresence` (never combined with native View Transitions).
 * - Exit ~120ms, Enter ~220ms, 8px direction-aware vertical translate (fade-only under prefers-reduced-motion).
 * - Wraps route updates in `startTransition` to prevent blank flashes, paired with `TopProgressBar` (>150ms)
 *   and layout-matching `PageSkeleton`.
 * - Scrolls to top on new routes (`PUSH`/`REPLACE`) and restores scroll position on `POP` (Back/Forward).
 * - Moves focus to the page's primary `<h1>` and announces route changes via `aria-live="polite"`.
 */
export function RouteTransitionOutlet({ mode = 'dashboard' }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentOutlet = useOutlet();
  const prefersReducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  const [displayedLocation, setDisplayedLocation] = useState(location);
  const [displayedOutlet, setDisplayedOutlet] = useState(currentOutlet);
  const [direction, setDirection] = useState(1);
  const [announcement, setAnnouncement] = useState('');

  const prevLocationRef = useRef(location);
  const isInitialMountRef = useRef(true);
  const isRestoringScrollRef = useRef(false);
  const containerRef = useRef(null);

  // Activate link hover/focus & viewport-idle chunk prefetching
  useRoutePrefetcher(location.pathname);

  // Set manual history scrollRestoration so browser doesn't reset scrollY during AnimatePresence exit
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Track current window scroll position continuously for the active displayed route
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleScroll = () => {
      if (isRestoringScrollRef.current) return;
      if (location.pathname !== displayedLocation.pathname) return;
      saveScrollPosition(displayedLocation.key, displayedLocation.pathname, window.scrollY || 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, displayedLocation.key, displayedLocation.pathname]);

  // Transition outlet using React startTransition so previous view stays mounted until next chunk is ready
  useEffect(() => {
    if (location.pathname !== prevLocationRef.current.pathname) {
      isRestoringScrollRef.current = true;
      const nextDir = computeRouteDirection(
        prevLocationRef.current.pathname,
        location.pathname,
        navigationType
      );
      setDirection(nextDir);

      startTransition(() => {
        setDisplayedLocation(location);
        setDisplayedOutlet(currentOutlet);
      });

      prevLocationRef.current = location;
    } else if (currentOutlet !== displayedOutlet) {
      setDisplayedOutlet(currentOutlet);
    }
  }, [location, currentOutlet, navigationType, displayedOutlet]);

  const variants = createRouteTransitionVariants({
    direction,
    reducedMotion: Boolean(prefersReducedMotion),
  });

  return (
    <>
      {/* Slim Top Progress Bar (only visible if route transition or chunk load > 150ms) */}
      <TopProgressBar isPending={isPending} />

      {/* Screen-Reader Polite Route Change Announcer */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="route-announcer"
      >
        {announcement}
      </div>

      {/* Content Outlet Transition Container (Shell remains mounted outside this boundary) */}
      <div ref={containerRef} className="w-full flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={displayedLocation.pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex-1 flex flex-col min-w-0"
            data-route-path={displayedLocation.pathname}
            data-route-direction={direction}
          >
            <Suspense fallback={<PageSkeleton mode={mode} />}>
              <RouteMountEffect
                displayedLocation={displayedLocation}
                navigationType={navigationType}
                containerRef={containerRef}
                isInitialMountRef={isInitialMountRef}
                isRestoringScrollRef={isRestoringScrollRef}
                onAnnounce={setAnnouncement}
              />
              {displayedOutlet}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default RouteTransitionOutlet;
