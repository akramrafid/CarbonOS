// ESG API client. Sends the signed-in user's bearer token and never a tenant id:
// the server derives the tenant from the user's organization membership.

const BASE_URL = import.meta.env.VITE_FASTAPI_API_URL || 'http://localhost:8000';

let session = { token: null, organizationId: null };

// Called by the identity-provider integration after sign-in / org switch (P0-4).
export function setEsgSession({ token = null, organizationId = null } = {}) {
  session = { token, organizationId };
}

export class EsgApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function esgFetch(path, { headers = {}, ...options } = {}) {
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
      detail = (await res.json()).detail;
    } catch {
      /* non-JSON error body */
    }
    throw new EsgApiError(res.status, typeof detail === 'string' && detail ? detail : `ESG request failed (${res.status}).`);
  }
  return res.json();
}
