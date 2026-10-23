// ESG API client. Sends the signed-in user's bearer token and never a tenant id:
// the server derives the tenant from the user's organization membership.

const BASE_URL = import.meta.env.VITE_FASTAPI_API_URL || 'http://localhost:8000';

let session = { token: null, organizationId: null };

// Called by esgAuth after sign-in / token renewal and by the organization switcher.
export function setEsgSession({ token = session.token, organizationId = session.organizationId } = {}) {
  session = { token, organizationId };
}

export function clearEsgSession() {
  session = { token: null, organizationId: null };
}

export const hasEsgToken = () => Boolean(session.token);

export class EsgApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { headers = {}, ...options } = {}) {
  if (!session.token) {
    throw new EsgApiError(401, 'Sign in to an organization to use the ESG workspace.');
  }
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${session.token}`,
        ...(session.organizationId ? { 'X-Organization-Id': session.organizationId } : {}),
      },
    });
  } catch {
    throw new EsgApiError(0, 'ESG service is unreachable.');
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = typeof body.detail === 'string' ? body.detail
        : Array.isArray(body.detail) ? body.detail.map((d) => `${(d.loc || []).slice(-1)[0]}: ${d.msg}`).join('; ') : '';
    } catch {
      /* non-JSON error body */
    }
    throw new EsgApiError(res.status, detail || `ESG request failed (${res.status}).`);
  }
  return res;
}

export async function esgFetch(path, options) {
  const res = await request(path, options);
  return res.status === 204 ? null : res.json();
}

export const esgGet = (path) => esgFetch(path);

export const esgSend = (method, path, body) => esgFetch(path, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

// Authenticated download (exports): returns the body text and the server's content hash.
export async function esgDownload(path) {
  const res = await request(path);
  return { text: await res.text(), sha256: res.headers.get('X-Content-SHA256') };
}
