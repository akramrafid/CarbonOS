import { useEffect } from 'react';

/**
 * Route Chunk Prefetch Registry & Engine (Phase 6)
 *
 * Capabilities:
 * - Maps internal routes to their dynamic chunk import loaders.
 * - Prefetches route chunks on link hover (`mouseover`) and keyboard focus (`focusin`).
 * - Prefetches visible internal links when they enter the viewport during browser idle time
 *   (`IntersectionObserver` + `requestIdleCallback`).
 * - Tracks in-flight chunk loads so `TopProgressBar` can show a slim top bar ONLY when a load
 *   exceeds 150ms.
 */

export const ROUTE_CHUNK_LOADERS = {
  // Marketing & Brand Pages
  '/': () => import('../pages/Home'),
  '/how-it-works': () => import('../pages/HowItWorks'),
  '/technology': () => import('../pages/Technology'),

  // Sector Pages
  '/sectors/solar-irrigation': () => import('../pages/sectors/SolarIrrigation'),
  '/sectors/rice-methane': () => import('../pages/sectors/RiceMethane'),
  '/sectors/clean-cookstoves': () => import('../pages/sectors/CleanCookstoves'),
  '/sectors/waste-to-energy': () => import('../pages/sectors/WasteToEnergy'),
  '/sectors/mangrove-carbon': () => import('../pages/sectors/MangroveCarbon'),
  '/sectors/brick-kilns': () => import('../pages/sectors/BrickKilns'),

  // Company & Edge Pages
  '/company/about': () => import('../pages/company/About'),
  '/company/framework-docs': () => import('../pages/company/FrameworkDocs'),
  '/company/api-docs': () => import('../pages/company/APIDocs'),
  '/company/careers': () => import('../pages/company/Careers'),
  '/company/privacy': () => import('../pages/company/Privacy'),
  '/company/terms': () => import('../pages/company/Terms'),
  '/forbidden': () => import('../pages/Forbidden'),
  '/unauthorized': () => import('../pages/Forbidden'),

  // Product / Dashboard Pages
  '/platform/project-onboarding': () => import('../pages/platform/ProjectOnboarding'),
  '/platform/mrv-dashboard': () => import('../pages/platform/MRVDashboard'),
  '/platform/carbon-registry': () => import('../pages/platform/CarbonRegistry'),
  '/carbon-registry': () => import('../pages/platform/CarbonRegistry'),
  '/platform/verification-workflow': () => import('../pages/platform/VerificationWorkflow'),
  '/platform/marketplace': () => import('../components/marketplace/MarketplaceBrowse'),
  '/platform/ai-detection': () => import('../pages/platform/AIDetection'),
  '/platform/saas-dashboard': () => import('../pages/platform/SaaSDashboard'),
  '/platform/saas': () => import('../pages/platform/SaaSDashboard'),
  '/esg': () => import('../pages/platform/SaaSDashboard'),
  '/platform/esg': () => import('../pages/platform/esg/EsgWorkspace'),
  '/platform/esg/callback': () => import('../pages/platform/esg/EsgWorkspace'),
  '/platform/impact': () => import('../pages/platform/Impact'),
  '/carbon-monitoring': () => import('../pages/platform/CarbonMonitoring'),

  // Farmer's AI & HarvestGuard
  '/farmers-ai': () => import('../pages/farmers-ai/FarmersAILanding'),
  '/farmers-ai/camera': () => import('../pages/farmers-ai/CameraCapture'),
  '/farmers-ai/result': () => import('../pages/farmers-ai/DiagnosisResult'),
  '/harvestguard/dashboard': () => import('../pages/farmers-ai/HarvestGuardDashboard'),
  '/harvestguard/register-batch': () => import('../pages/farmers-ai/BatchRegistration'),
  '/harvestguard/risk-analysis/:batchId': () => import('../components/farmers-ai/WeatherRiskWidget'),
  '/harvestguard/risk-map': () => import('../components/farmers-ai/LocalRiskMap'),

  // Direct Farmer Ledger
  '/dashboard/farmer': () => import('../components/dashboard/FarmerCreditsWidget'),
  '/dashboard/farmer/earnings': () => import('../pages/platform/FarmerEarnings'),
};

const prefetchedRoutes = new Set();
const inFlightPromises = new Map();
const visibleLoadingRoutes = new Set();
const loadingListeners = new Set();

function notifyListeners() {
  const isBusy = visibleLoadingRoutes.size > 0;
  loadingListeners.forEach((fn) => {
    try {
      fn(isBusy);
    } catch {}
  });
}

/**
 * Subscribe to route chunk loading state changes.
 */
export function subscribeRouteLoading(listener) {
  loadingListeners.add(listener);
  return () => {
    loadingListeners.delete(listener);
  };
}

/**
 * Normalizes an href or pathname to match keys in `ROUTE_CHUNK_LOADERS`.
 */
export function normalizeRoutePath(rawHref) {
  if (!rawHref || typeof rawHref !== 'string') return null;

  try {
    let pathname = rawHref;
    if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
      if (typeof window !== 'undefined' && !rawHref.startsWith(window.location.origin)) {
        return null;
      }
      pathname = new URL(rawHref).pathname;
    } else {
      pathname = rawHref.split('?')[0].split('#')[0];
    }

    if (!pathname.startsWith('/')) return null;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.replace(/\/+$/, '');
    }

    if (ROUTE_CHUNK_LOADERS[pathname]) {
      return pathname;
    }

    if (pathname.startsWith('/harvestguard/risk-analysis/')) {
      return '/harvestguard/risk-analysis/:batchId';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the given route's chunk has already been prefetched.
 */
export function isRoutePrefetched(rawHref) {
  const key = normalizeRoutePath(rawHref);
  return Boolean(key && prefetchedRoutes.has(key));
}

/**
 * Prefetches the JS chunk for a given internal route path.
 * Safe and idempotent; returns a Promise resolving to the module or null.
 */
export function prefetchRoute(rawHref, options = {}) {
  const key = normalizeRoutePath(rawHref);
  if (!key) return Promise.resolve(null);

  const notify = options?.notify !== false;

  if (prefetchedRoutes.has(key)) {
    return Promise.resolve(null);
  }

  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key);
  }

  const loader = ROUTE_CHUNK_LOADERS[key];
  if (typeof loader !== 'function') {
    return Promise.resolve(null);
  }

  if (notify) {
    visibleLoadingRoutes.add(key);
    notifyListeners();
  }

  const promise = Promise.resolve()
    .then(() => loader())
    .then((mod) => {
      prefetchedRoutes.add(key);
      return mod;
    })
    .catch(() => null)
    .finally(() => {
      inFlightPromises.delete(key);
      visibleLoadingRoutes.delete(key);
      if (notify) notifyListeners();
    });

  inFlightPromises.set(key, promise);
  return promise;
}

/**
 *Schedules work during browser idle time with fallback for environments lacking requestIdleCallback.
 */
function scheduleIdle(callback) {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const timer = setTimeout(callback, 120);
  return () => clearTimeout(timer);
}

/**
 * React hook that activates:
 * 1. Link hover (`mouseover`) and keyboard focus (`focusin`) chunk prefetching.
 * 2. Viewport intersection (`IntersectionObserver` + `requestIdleCallback`) chunk prefetching.
 */
export function useRoutePrefetcher(currentPathname) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    const handleTrigger = (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      const anchor = target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        prefetchRoute(href);
      }
    };

    document.addEventListener('mouseover', handleTrigger, { passive: true });
    document.addEventListener('focusin', handleTrigger, { passive: true });

    let observer = null;
    const cancelPendingIdle = [];

    if (typeof window.IntersectionObserver === 'function') {
      observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const anchor = entry.target;
            observer.unobserve(anchor);
            const href = anchor.getAttribute('href');
            if (href && href.startsWith('/')) {
              const cancel = scheduleIdle(() => {
                // Background viewport prefetches must not flash TopProgressBar
                prefetchRoute(href, { notify: false });
              });
              cancelPendingIdle.push(cancel);
            }
          });
        },
        { rootMargin: '120px' }
      );

      const observeLinks = () => {
        const anchors = document.querySelectorAll('a[href^="/"]');
        anchors.forEach((a) => observer.observe(a));
      };

      const cancelInit = scheduleIdle(observeLinks);
      cancelPendingIdle.push(cancelInit);
    }

    return () => {
      document.removeEventListener('mouseover', handleTrigger);
      document.removeEventListener('focusin', handleTrigger);
      if (observer) {
        observer.disconnect();
      }
      cancelPendingIdle.forEach((cancel) => {
        try {
          cancel();
        } catch {}
      });
    };
  }, [currentPathname]);
}

export default prefetchRoute;

