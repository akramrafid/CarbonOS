// OIDC sign-in for the ESG workspace (Authorization Code + PKCE, provider-neutral).
// Configure with VITE_OIDC_ISSUER, VITE_OIDC_CLIENT_ID and, for providers that issue JWT access
// tokens per API (e.g. Auth0), VITE_OIDC_AUDIENCE. The API verifies the same tokens via JWKS.
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { clearEsgSession, setEsgSession } from './esgApi';

const issuer = import.meta.env.VITE_OIDC_ISSUER;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const audience = import.meta.env.VITE_OIDC_AUDIENCE;

export const authConfigured = Boolean(issuer && clientId);

let manager = null;
function getManager() {
  if (!manager && authConfigured) {
    manager = new UserManager({
      authority: issuer,
      client_id: clientId,
      redirect_uri: `${window.location.origin}/platform/esg/callback`,
      post_logout_redirect_uri: `${window.location.origin}/platform/esg`,
      response_type: 'code',
      scope: 'openid profile email',
      extraQueryParams: audience ? { audience } : {},
      // Session storage: cleared when the tab closes; tokens are never put in localStorage.
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      automaticSilentRenew: true,
    });
    manager.events.addUserLoaded((user) => setEsgSession({ token: user.access_token }));
    manager.events.addUserSignedOut(() => clearEsgSession());
  }
  return manager;
}

// Returns {name, email} of the signed-in user, or null.
export async function loadSession() {
  // Test-only hook, compiled out of production builds (VITE_E2E_TEST_HOOK is unset there).
  // It only supplies a token; the API still verifies it like any other.
  if (import.meta.env.VITE_E2E_TEST_HOOK === 'true' && window.__ESG_E2E_TOKEN__) {
    setEsgSession({ token: window.__ESG_E2E_TOKEN__ });
    return { name: 'E2E test user', email: null };
  }
  const m = getManager();
  if (!m) return null;
  const user = await m.getUser();
  if (!user || user.expired) return null;
  setEsgSession({ token: user.access_token });
  return { name: user.profile.name || user.profile.email || user.profile.sub, email: user.profile.email || null };
}

export const signIn = () => getManager()?.signinRedirect();

export async function signOut() {
  clearEsgSession();
  await getManager()?.signoutRedirect();
}

export const completeSignIn = () => getManager().signinRedirectCallback();
