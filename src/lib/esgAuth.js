// OIDC sign-in & zero-friction ephemeral demo mode for the ESG workspace.
// Configure OIDC with VITE_OIDC_ISSUER, VITE_OIDC_CLIENT_ID and VITE_OIDC_AUDIENCE.
// When unauthenticated or unconfigured, an ephemeral demo session is provisioned
// without login/password prompts via the backend (/api/esg/demo/session), strictly
// preserving tenant isolation and segregation of duties.
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { clearEsgSession, setEsgSession } from './esgApi';

const issuer = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OIDC_ISSUER : undefined;
const clientId = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OIDC_CLIENT_ID : undefined;
const audience = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OIDC_AUDIENCE : undefined;
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FASTAPI_API_URL) || 'http://localhost:8000';

export const authConfigured = Boolean(issuer && clientId);
export const DEMO_SESSION_KEY = 'carbonos.esg.demo_session';

function safeStorage(fn) {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function getStoredDemoSession() {
  const raw = safeStorage(() => sessionStorage.getItem(DEMO_SESSION_KEY));
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s || !s.access_token) return null;
    if (s.expires_at && Math.floor(Date.now() / 1000) > s.expires_at) {
      safeStorage(() => sessionStorage.removeItem(DEMO_SESSION_KEY));
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveDemoSession(sessionData) {
  safeStorage(() => sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sessionData)));
}

export function clearStoredDemoSession() {
  safeStorage(() => sessionStorage.removeItem(DEMO_SESSION_KEY));
}

export async function requestDemoSession() {
  const res = await fetch(`${API_BASE}/api/esg/demo/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Demo session initialization failed (${res.status}): ${detail}`);
  }
  const data = await res.json();
  const sessionData = {
    ...data,
    active_persona: 'owner',
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
  };
  saveDemoSession(sessionData);
  return sessionData;
}

export async function resetDemoSession() {
  const current = getStoredDemoSession();
  const token = current?.access_token;
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/api/esg/demo/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const fresh = await res.json();
        const sessionData = {
          ...fresh,
          active_persona: 'owner',
          expires_at: Math.floor(Date.now() / 1000) + (fresh.expires_in || 3600),
        };
        saveDemoSession(sessionData);
        setEsgSession({ token: sessionData.access_token, organizationId: sessionData.tenant_id });
        return sessionData;
      }
    } catch {
      // fallback to requesting a new session if reset fails
    }
  }
  const newSession = await requestDemoSession();
  setEsgSession({ token: newSession.access_token, organizationId: newSession.tenant_id });
  return newSession;
}

export function switchDemoPersona(personaName) {
  const session = getStoredDemoSession();
  if (!session || !session.personas || !session.personas[personaName]) {
    throw new Error(`Invalid persona '${personaName}' or no active demo session.`);
  }
  session.active_persona = personaName;
  saveDemoSession(session);
  const personaToken = session.personas[personaName].token;
  setEsgSession({ token: personaToken, organizationId: session.tenant_id });
  return session;
}

export function isDemoActive() {
  return Boolean(getStoredDemoSession());
}

let manager = null;
function getManager() {
  if (!manager && authConfigured && typeof window !== 'undefined') {
    manager = new UserManager({
      authority: issuer,
      client_id: clientId,
      redirect_uri: `${window.location.origin}/platform/esg/callback`,
      post_logout_redirect_uri: `${window.location.origin}/platform/esg`,
      response_type: 'code',
      scope: 'openid profile email',
      extraQueryParams: audience ? { audience } : {},
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      automaticSilentRenew: true,
    });
    manager.events.addUserLoaded((user) => {
      clearStoredDemoSession();
      setEsgSession({ token: user.access_token });
    });
    manager.events.addUserSignedOut(() => clearEsgSession());
  }
  return manager;
}

// Returns {name, email, isDemo, activePersona, demoSession} of the signed-in user, or null.
export async function loadSession() {
  // Test-only hook, compiled out of production builds
  if (typeof window !== 'undefined' && import.meta.env?.VITE_E2E_TEST_HOOK === 'true' && window.__ESG_E2E_TOKEN__) {
    setEsgSession({ token: window.__ESG_E2E_TOKEN__ });
    return { name: 'E2E test user', email: null, isDemo: false };
  }

  // 1. Real OIDC user if active
  const m = getManager();
  if (m) {
    try {
      const user = await m.getUser();
      if (user && !user.expired) {
        clearStoredDemoSession();
        setEsgSession({ token: user.access_token });
        return {
          name: user.profile.name || user.profile.email || user.profile.sub,
          email: user.profile.email || null,
          isDemo: false,
        };
      }
    } catch {
      /* ignore and fall through to demo session */
    }
  }

  // 2. Demo session in sessionStorage
  let demo = getStoredDemoSession();
  if (!demo) {
    try {
      demo = await requestDemoSession();
    } catch (err) {
      console.warn('Could not auto-provision ESG demo session:', err);
      return null;
    }
  }

  if (demo) {
    const activePersona = demo.active_persona || 'owner';
    const activeToken = demo.personas?.[activePersona]?.token || demo.access_token;
    setEsgSession({ token: activeToken, organizationId: demo.tenant_id });
    const personaLabel = activePersona === 'reviewer' ? 'Demo Auditor (Reviewer)' : 'Demo Manager (Owner)';
    return {
      name: `${personaLabel}`,
      email: null,
      isDemo: true,
      activePersona,
      demoSession: demo,
    };
  }

  return null;
}

export const signIn = () => getManager()?.signinRedirect();

export async function signOut() {
  clearStoredDemoSession();
  clearEsgSession();
  const m = getManager();
  if (m) {
    try {
      await m.signoutRedirect();
      return;
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/platform/esg';
  }
}

export const completeSignIn = () => getManager().signinRedirectCallback();

