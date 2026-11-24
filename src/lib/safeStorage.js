/**
 * safeStorage.js
 * Defensive wrappers around browser Web Storage (localStorage / sessionStorage),
 * centralized session/draft cleanup on logout, and CSV formula-injection neutralization.
 */

const SENSITIVE_STORAGE_PREFIXES = [
  'carbonos_esg',
  'carbon_verra_',
  'carbonos_activity_',
  'carbonos_gis_',
  'carbonos_registry_',
  'carbonos_route_scroll',
];

const SENSITIVE_STORAGE_KEYS = [
  'carbonos_jwt',
  'carbonos_telemetry_history',
  'carbonos_user_harvests',
  'carbonos_saved_projects',
  'esg_auth_token',
  'esg_session',
];

export function safeGetItem(key, fallback = null, storageType = 'local') {
  try {
    if (typeof window === 'undefined') return fallback;
    const store = storageType === 'session' ? window.sessionStorage : window.localStorage;
    if (!store) return fallback;
    const val = store.getItem(key);
    return val === null ? fallback : val;
  } catch {
    return fallback;
  }
}

export function safeSetItem(key, value, storageType = 'local') {
  try {
    if (typeof window === 'undefined') return false;
    const store = storageType === 'session' ? window.sessionStorage : window.localStorage;
    if (!store) return false;
    store.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key, storageType = 'local') {
  try {
    if (typeof window === 'undefined') return false;
    const store = storageType === 'session' ? window.sessionStorage : window.localStorage;
    if (!store) return false;
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeGetJson(key, fallback = null, storageType = 'local') {
  const raw = safeGetItem(key, null, storageType);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function safeSetJson(key, value, storageType = 'local') {
  try {
    return safeSetItem(key, JSON.stringify(value), storageType);
  } catch {
    return false;
  }
}

export function clearAllUserStorage() {
  if (typeof window === 'undefined') return;
  for (const storeName of ['localStorage', 'sessionStorage']) {
    try {
      const store = window[storeName];
      if (!store) continue;
      for (const k of SENSITIVE_STORAGE_KEYS) {
        store.removeItem(k);
      }
      const keysToRemove = [];
      for (let i = 0; i < store.length; i += 1) {
        const k = store.key(i);
        if (k && SENSITIVE_STORAGE_PREFIXES.some((p) => k.startsWith(p))) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        store.removeItem(k);
      }
    } catch {
      // Ignore storage restrictions (e.g. private browsing / sandboxed iframe)
    }
  }
}

export function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  const formulaSafe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  if (/[",\n\r]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }
  return formulaSafe;
}
