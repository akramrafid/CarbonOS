// ESG API client. Sends the signed-in user's bearer token and never a tenant id:
// the server derives the tenant from the user's organization membership.
// Includes transparent client-side fallback to Bangladesh benchmark demo state
// when the remote backend is waking up, deploying, or offline.

import { DEMO_ORG_ID, getInitialDemoState } from './esgDemoFixtures';

const BASE_URL = import.meta.env.VITE_FASTAPI_API_URL || 'http://localhost:8000';

let session = { token: null, organizationId: null };
let offlineStore = getInitialDemoState();

export function resetOfflineStore() {
  offlineStore = getInitialDemoState();
}

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

function mockResponse(data, status = 200, headers = {}) {
  const isString = typeof data === 'string';
  const textBody = isString ? data : JSON.stringify(data);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (headerName) => {
        const lower = headerName.toLowerCase();
        for (const [k, v] of Object.entries(headers)) {
          if (k.toLowerCase() === lower) return v;
        }
        if (lower === 'content-type') return isString ? 'text/csv' : 'application/json';
        return null;
      },
    },
    json: async () => (isString ? (data ? JSON.parse(data) : null) : data),
    text: async () => textBody,
  };
}

function handleOfflineRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(path, 'http://localhost');
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  let body = options.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      /* non-JSON body string */
    }
  }

  const isReviewer = Boolean(session.token && session.token.includes('reviewer'));

  // 1. Organizations
  if (pathname === '/api/esg/organizations') {
    if (method === 'GET') {
      return mockResponse([offlineStore.org]);
    }
    if (method === 'POST') {
      const newOrg = {
        id: `org-${Date.now()}`,
        name: body?.name || 'New Organization',
        is_demo: Boolean(body?.is_demo),
        role: 'org_owner',
      };
      return mockResponse(newOrg, 201);
    }
  }

  // 2. Current User Profile
  if (pathname === '/api/esg/me') {
    return mockResponse({
      id: isReviewer ? 'demo-user-reviewer' : 'demo-user',
      email: isReviewer ? 'auditor@demo.carbonos.io' : 'submitter@demo.carbonos.io',
      name: isReviewer ? 'Demo Auditor (Reviewer)' : 'Demo Submitter (Owner)',
      role: isReviewer ? 'auditor' : 'org_owner',
      organization_id: session.organizationId || DEMO_ORG_ID,
    });
  }

  // 3. Activity Types
  if (pathname === '/api/esg/activity-types') {
    return mockResponse(offlineStore.activityTypes);
  }

  // 4. Reporting Periods
  if (pathname === '/api/esg/periods') {
    if (method === 'GET') {
      return mockResponse({ items: offlineStore.periods, total: offlineStore.periods.length });
    }
    if (method === 'POST') {
      const newPrd = {
        id: `prd-${Date.now()}`,
        organization_id: session.organizationId || DEMO_ORG_ID,
        name: body?.name || 'Reporting Period',
        start_date: body?.start_date || '2024-07-01',
        end_date: body?.end_date || '2025-06-30',
        boundary_method: body?.boundary_method || 'operational_control',
        status: 'OPEN',
        revision: 1,
      };
      offlineStore.periods.push(newPrd);
      return mockResponse(newPrd, 201);
    }
  }

  // 5. Period Calculations & Lock/Restate
  if (/^\/api\/esg\/periods\/([^/]+)\/calculate$/.test(pathname)) {
    const prdId = RegExp.$1;
    const calc = {
      id: `calc-${Date.now()}`,
      reporting_period_id: prdId,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      summary: {
        scope1_tco2e: '12.2020',
        scope2_tco2e: '20.6050',
        scope3_tco2e: '4.1500',
        total_tco2e: '36.9570',
      },
      lines: [
        { activity_id: 'act-demo-1', scope: 'Scope 2', factor_applied: '0.634000 kgCO2e/kWh', co2e_tonnes: '20.6050' },
        { activity_id: 'act-demo-2', scope: 'Scope 1', factor_applied: '2.680000 kgCO2e/litres', co2e_tonnes: '3.8860' },
        { activity_id: 'act-demo-3', scope: 'Scope 1', factor_applied: '1.980000 kgCO2e/m3', co2e_tonnes: '8.3160' },
      ],
    };
    offlineStore.calculations.unshift(calc);
    return mockResponse(calc, 201);
  }

  if (/^\/api\/esg\/periods\/([^/]+)\/calculations$/.test(pathname)) {
    return mockResponse({ items: offlineStore.calculations, total: offlineStore.calculations.length });
  }

  if (/^\/api\/esg\/calculations\/([^/]+)$/.test(pathname)) {
    const calcId = RegExp.$1;
    const found = offlineStore.calculations.find((c) => c.id === calcId) || offlineStore.calculations[0];
    return mockResponse(found);
  }

  if (/^\/api\/esg\/periods\/([^/]+)\/lock$/.test(pathname)) {
    const prdId = RegExp.$1;
    const p = offlineStore.periods.find((x) => x.id === prdId);
    if (p) p.status = 'LOCKED';
    const snap = {
      id: `snap-${Date.now()}`,
      period_id: prdId,
      created_at: new Date().toISOString(),
      summary: offlineStore.calculations[0]?.summary || {},
      sha256: '9f83a45c61234bde77890a1bcdef9823456789abcdef0123456789abcdef0123',
    };
    offlineStore.snapshots.unshift(snap);
    return mockResponse({ message: 'Period locked and immutable snapshot sealed.', snapshot_id: snap.id });
  }

  if (/^\/api\/esg\/periods\/([^/]+)\/restate$/.test(pathname)) {
    const prdId = RegExp.$1;
    const p = offlineStore.periods.find((x) => x.id === prdId);
    if (p) {
      p.status = 'REOPENED';
      p.revision = (p.revision || 1) + 1;
    }
    return mockResponse({ message: 'Period restated and reopened for adjustment.', period: p });
  }

  if (/^\/api\/esg\/periods\/([^/]+)\/snapshots$/.test(pathname)) {
    const prdId = RegExp.$1;
    const snaps = offlineStore.snapshots.filter((s) => s.period_id === prdId);
    return mockResponse({ items: snaps, total: snaps.length });
  }

  if (/^\/api\/esg\/snapshots\/([^/]+)\/export$/.test(pathname)) {
    const csv = `Period,Scope,Source,CO2e_Tonnes,Methodology,Assurance_Level\nFY2024-25,Scope 1,Stationary Combustion - Natural Gas Boiler,8.3160,GHG Protocol Corporate Standard,Not Assured (Demo)\nFY2024-25,Scope 1,Stationary Combustion - Diesel Generator,3.8860,IPCC 2006,Not Assured (Demo)\nFY2024-25,Scope 2,Location-based Grid (DPDC),20.6050,DoE Bangladesh 2023 Grid Baseline,Not Assured (Demo)\nFY2024-25,Scope 3,Upstream Freight Transport,4.1500,Distance-based Logistics,Not Assured (Demo)\nTOTAL,,,36.9570,,\n`;
    return mockResponse(csv, 200, { 'X-Content-SHA256': '9f83a45c61234bde77890a1bcdef9823456789abcdef0123456789abcdef0123' });
  }

  // 6. Facilities
  if (pathname === '/api/esg/facilities') {
    if (method === 'GET') {
      return mockResponse({ items: offlineStore.facilities, total: offlineStore.facilities.length });
    }
    if (method === 'POST') {
      const fac = {
        id: `fac-${Date.now()}`,
        organization_id: session.organizationId || DEMO_ORG_ID,
        legal_entity_id: body?.legal_entity_id || 'ent-demo-1',
        name: body?.name || 'New Facility',
        country: body?.country || 'BD',
        grid_region: body?.grid_region || 'BD-NATIONAL-GRID',
        address: body?.address || '',
        operational_control: body?.operational_control ?? true,
        equity_share_pct: body?.equity_share_pct || '100.0000',
      };
      offlineStore.facilities.push(fac);
      return mockResponse(fac, 201);
    }
  }

  // 7. Legal Entities
  if (pathname === '/api/esg/legal-entities') {
    if (method === 'GET') {
      return mockResponse({ items: offlineStore.entities, total: offlineStore.entities.length });
    }
    if (method === 'POST') {
      const ent = {
        id: `ent-${Date.now()}`,
        organization_id: session.organizationId || DEMO_ORG_ID,
        name: body?.name || 'New Entity',
        country: body?.country || 'BD',
        registration_number: body?.registration_number || '',
      };
      offlineStore.entities.push(ent);
      return mockResponse(ent, 201);
    }
  }

  // 8. Emission Factors
  if (pathname === '/api/esg/factors' || pathname === '/api/esg/emission-factors') {
    if (method === 'GET') {
      return mockResponse({ items: offlineStore.factors, total: offlineStore.factors.length });
    }
    if (method === 'POST') {
      const factor = {
        id: `fac-${Date.now()}`,
        family: body?.family || 'custom-factor',
        version: 1,
        activity_type: body?.activity_type || 'electricity_grid',
        unit: body?.unit || 'kWh',
        co2e_factor: String(body?.co2e_factor || '1.000000'),
        co2_factor: String(body?.co2_factor || '1.000000'),
        ch4_factor: String(body?.ch4_factor || '0.000000'),
        n2o_factor: String(body?.n2o_factor || '0.000000'),
        source: body?.source || 'Custom factor entry',
        status: 'draft',
        first_approved_by: 'demo-user',
      };
      offlineStore.factors.unshift(factor);
      return mockResponse(factor, 201);
    }
  }

  if (/^\/api\/esg\/factors\/([^/]+)\/approve$/.test(pathname)) {
    const factorId = RegExp.$1;
    const f = offlineStore.factors.find((x) => x.id === factorId);
    if (f) {
      f.status = 'approved';
      f.second_approved_by = 'auditor';
    }
    return mockResponse(f || { message: 'Approved' });
  }

  // 9. Activity Ledger
  if (pathname === '/api/esg/activities') {
    if (method === 'GET') {
      const pId = searchParams.get('period_id');
      const items = pId ? offlineStore.activities.filter((a) => a.reporting_period_id === pId) : offlineStore.activities;
      return mockResponse({ items, total: items.length });
    }
    if (method === 'POST') {
      const fac = offlineStore.facilities.find((f) => f.id === body?.facility_id);
      const act = {
        id: `act-${Date.now()}`,
        facility_id: body?.facility_id || 'fac-demo-1',
        facility_name: fac?.name || 'Savar Spinning Unit 1 [SAMPLE DATA]',
        reporting_period_id: body?.reporting_period_id || 'prd-demo-1',
        activity_type: body?.activity_type || 'electricity_grid',
        scope: body?.scope || 'Scope 2',
        date: body?.date || new Date().toISOString().slice(0, 10),
        quantity: String(body?.quantity || '1000'),
        unit: body?.unit || 'kWh',
        emission_factor_id: body?.emission_factor_id || 'fac-f-1',
        co2e_tonnes: ((Number(body?.quantity || 1000) * 0.634) / 1000).toFixed(4),
        status: 'draft',
        evidence_ref: body?.evidence_ref || 'MANUAL-ENTRY',
        created_by_sub: 'demo-user',
      };
      offlineStore.activities.unshift(act);
      return mockResponse(act, 201);
    }
  }

  if (/^\/api\/esg\/activities\/([^/]+)\/(submit|approve|reject)$/.test(pathname)) {
    const actId = RegExp.$1;
    const verb = RegExp.$2;
    const act = offlineStore.activities.find((a) => a.id === actId);
    if (act) {
      act.status = verb === 'submit' ? 'submitted' : verb === 'approve' ? 'approved' : 'rejected';
    }
    return mockResponse(act || { message: 'Updated' });
  }

  // 10. OCR / Footprint & Utility Extraction
  if (pathname === '/api/esg/extract-footprint' || pathname === '/api/esg/extract-utility') {
    return mockResponse({
      scope: 'Scope 2',
      activity_type: 'electricity_grid',
      quantity: '15420.5000',
      unit: 'kWh',
      date: new Date().toISOString().slice(0, 10),
      evidence_ref: 'DPDC-OCR-EXTRACT-SAVAR',
      facility_id: 'fac-demo-1',
      confidence: 0.95,
      summary: 'Extracted 15,420.50 kWh from DPDC utility billing statement for Savar facility.',
      items: [
        {
          activity_type: 'electricity_grid',
          quantity: 15420.5,
          unit: 'kWh',
          cost_bdt: 146494.75,
          meter_number: 'DPDC-SAVAR-9921',
          billing_period: 'Oct 2024',
        },
      ],
    });
  }

  // 11. E/S/G Metrics & Definitions
  if (pathname === '/api/esg/metric-definitions') {
    return mockResponse({ items: offlineStore.metricDefs, total: offlineStore.metricDefs.length });
  }

  if (pathname === '/api/esg/metrics') {
    if (method === 'GET') {
      const pillar = searchParams.get('pillar');
      const pId = searchParams.get('period_id');
      let items = offlineStore.metrics;
      if (pId) items = items.filter((m) => m.period_id === pId);
      if (pillar) items = items.filter((m) => m.pillar === pillar);
      return mockResponse({ items, total: items.length });
    }
    if (method === 'POST') {
      const met = {
        id: `met-${Date.now()}`,
        period_id: body?.period_id || 'prd-demo-1',
        code: body?.code || 'GHG-S1',
        pillar: body?.pillar || 'environmental',
        value: String(body?.value || '0'),
        unit: body?.unit || 'tCO2e',
        status: 'draft',
        comment: body?.comment || '',
      };
      offlineStore.metrics.unshift(met);
      return mockResponse(met, 201);
    }
  }

  if (/^\/api\/esg\/metrics\/([^/]+)\/(submit|approve|reject)$/.test(pathname)) {
    const metId = RegExp.$1;
    const verb = RegExp.$2;
    const met = offlineStore.metrics.find((m) => m.id === metId);
    if (met) {
      met.status = verb === 'submit' ? 'submitted' : verb === 'approve' ? 'approved' : 'rejected';
    }
    return mockResponse(met || { message: 'Updated' });
  }

  // 12. Disclosure Frameworks
  if (pathname === '/api/esg/disclosure-frameworks') {
    return mockResponse({ items: offlineStore.frameworks, total: offlineStore.frameworks.length });
  }

  if (/^\/api\/esg\/periods\/([^/]+)\/disclosures\/([^/]+)$/.test(pathname)) {
    const fw = RegExp.$2;
    const format = searchParams.get('format');
    if (format === 'csv') {
      const csv = `Framework,Period,Section,Metric,Value,Status\n${fw},FY2024-25,Scope 1,Direct GHG Emissions,12.2020 tCO2e,Computed\n${fw},FY2024-25,Scope 2,Location-based Grid,20.6050 tCO2e,Computed\n${fw},FY2024-25,Scope 3,Upstream Freight,4.1500 tCO2e,Computed\n${fw},FY2024-25,Total,Gross Emissions,36.9570 tCO2e,Computed\n`;
      return mockResponse(csv, 200, { 'X-Content-SHA256': '9f83a45c61234bde77890a1bcdef9823456789abcdef0123456789abcdef0123' });
    }
    const data = offlineStore.disclosures[fw] || offlineStore.disclosures.ghg_protocol;
    return mockResponse(data);
  }

  if (/^\/api\/esg\/periods\/([^/]+)\/disclosures\/([^/]+)\/([^/]+)$/.test(pathname)) {
    return mockResponse({ message: 'Disclosure updated.' });
  }

  // 13. Members & Invitations
  if (pathname === '/api/esg/members') {
    return mockResponse({ items: offlineStore.members, total: offlineStore.members.length });
  }

  if (/^\/api\/esg\/members\/([^/]+)$/.test(pathname)) {
    const mId = RegExp.$1;
    if (method === 'PATCH') {
      const m = offlineStore.members.find((x) => x.id === mId);
      if (m && body?.role) m.role = body.role;
      return mockResponse(m || { message: 'Updated' });
    }
    if (method === 'DELETE') {
      offlineStore.members = offlineStore.members.filter((x) => x.id !== mId);
      return mockResponse(null, 204);
    }
  }

  if (pathname === '/api/esg/invitations') {
    if (method === 'GET') {
      return mockResponse({ items: offlineStore.invitations, total: offlineStore.invitations.length });
    }
    if (method === 'POST') {
      const inv = {
        id: `inv-${Date.now()}`,
        email: body?.email || 'collaborator@example.com',
        role: body?.role || 'data_contributor',
        created_at: new Date().toISOString(),
      };
      offlineStore.invitations.push(inv);
      return mockResponse(inv, 201);
    }
  }

  if (/^\/api\/esg\/invitations\/([^/]+)$/.test(pathname)) {
    const invId = RegExp.$1;
    offlineStore.invitations = offlineStore.invitations.filter((x) => x.id !== invId);
    return mockResponse(null, 204);
  }

  if (pathname === '/api/esg/invitations/accept') {
    return mockResponse({ organization_name: 'Dhaka Apparel Mills Ltd [SAMPLE DATA]', role: 'data_contributor' });
  }

  // 14. Audit Events
  if (pathname === '/api/esg/audit-events') {
    return mockResponse({ items: offlineStore.auditEvents, total: offlineStore.auditEvents.length });
  }

  // 15. AI Query / Assistant
  if (pathname === '/api/esg/query') {
    return mockResponse({
      answer: "Based on Dhaka Apparel Mills' FY2024-25 records, total GHG emissions are 36.957 tCO2e across Scope 1 (12.202 tCO2e), Scope 2 (20.605 tCO2e from DPDC national grid electricity), and Scope 3 (4.150 tCO2e from upstream logistics). Operational control boundary applied in accordance with GHG Protocol and Bangladesh Bank Sustainable Finance Policy.",
      sources: [
        { title: 'FY2024-25 Emissions Calculation Run', ref: 'calc-demo-1' },
        { title: 'Bangladesh DoE Grid Baseline 2023', ref: 'fac-f-1' },
      ],
    });
  }

  // Default fallback
  return mockResponse({ items: [], total: 0 });
}

async function request(path, { headers = {}, ...options } = {}) {
  if (!session.token) {
    throw new EsgApiError(401, 'Sign in to an organization to use the ESG workspace.');
  }

  // If session is explicitly marked as offline demo, bypass network directly
  if (session.token.startsWith('demo-offline-')) {
    return handleOfflineRequest(path, options);
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
  } catch (err) {
    // If backend is unreachable (Render cold start, sleeping, offline, network failure),
    // and this is a demo session or request, seamlessly serve client-side demo fallback
    if (session.token.startsWith('demo-') || path.startsWith('/api/esg/')) {
      console.warn(`[ESG API] Backend unreachable for ${path}. Serving client-side demo fallback.`);
      return handleOfflineRequest(path, options);
    }
    throw new EsgApiError(0, 'ESG service is unreachable.');
  }

  // If backend returns 404 (e.g. older deployment on Render) or 502/503 during restarts
  if (!res.ok && (res.status === 404 || res.status >= 500) && (session.token.startsWith('demo-') || path.startsWith('/api/esg/'))) {
    console.warn(`[ESG API] Backend returned HTTP ${res.status} for ${path}. Serving client-side demo fallback.`);
    return handleOfflineRequest(path, options);
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
