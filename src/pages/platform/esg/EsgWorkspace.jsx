// ESG workspace: sign-in, organization selection and the accounting workflow tabs.
// Role checks here only hide controls; the API enforces every permission.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { esgGet, esgSend, hasEsgToken, setEsgSession } from '../../../lib/esgApi';
import { authConfigured, completeSignIn, loadSession, signIn, signOut } from '../../../lib/esgAuth';
import { Button, Input, Notice, Panel, Select, useAction } from './ui';
import SetupPanel from './SetupPanel';
import FactorsPanel from './FactorsPanel';
import LedgerPanel from './LedgerPanel';
import ReportsPanel from './ReportsPanel';
import MetricsPanel from './MetricsPanel';
import DisclosuresPanel from './DisclosuresPanel';
import { AuditPanel, MembersPanel } from './PeoplePanel';

const PERMS = {
  org_owner: ['read', 'write', 'review', 'admin'], esg_admin: ['read', 'write', 'review', 'admin'],
  data_contributor: ['read', 'write'], facility_manager: ['read', 'write'], auditor: ['read', 'review'],
  executive_viewer: ['read'], supplier_collaborator: [],
};
const ORG_KEY = 'carbonos.esg.org';
const INVITE_KEY = 'carbonos.esg.invite';

function safeStorage(fn) {
  try { return fn(); } catch { return null; }
}

export default function EsgWorkspace() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [me, setMe] = useState(null);
  const [orgs, setOrgs] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [tab, setTab] = useState('setup');
  const [ref, setRef] = useState({ types: null, periods: null, facilities: null });
  const action = useAction();

  const [loadError, setLoadError] = useState(null);
  const loadOrgs = useCallback(async () => {
    let list;
    try {
      list = await esgGet('/api/esg/organizations');
    } catch (e) {
      setLoadError(e.message);
      return;
    }
    setOrgs(list);
    const saved = safeStorage(() => localStorage.getItem(ORG_KEY));
    const pick = list.find((o) => o.id === saved)?.id || list[0]?.id || null;
    setEsgSession({ organizationId: pick });
    setOrgId(pick);
  }, []);

  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get('invite');
    if (invite) safeStorage(() => sessionStorage.setItem(INVITE_KEY, invite));
    (async () => {
      let u = null;
      try { u = await loadSession(); } catch { u = null; }
      setUser(u);
      if (!u || !hasEsgToken()) return;
      setMe(await action.run(() => esgGet('/api/esg/me')));
      const pending = safeStorage(() => sessionStorage.getItem(INVITE_KEY));
      if (pending) {
        safeStorage(() => sessionStorage.removeItem(INVITE_KEY));
        window.history.replaceState(null, '', '/platform/esg');
        await action.run(() => esgSend('POST', '/api/esg/invitations/accept', { token: pending }),
          (r) => `You joined ${r.organization_name} as ${r.role}.`);
      }
      await loadOrgs();
    })();
  }, [loadOrgs]);

  const loadRef = useCallback(async () => {
    if (!orgId) return;
    const [types, periods, facilities] = await Promise.all([
      esgGet('/api/esg/activity-types'), esgGet('/api/esg/periods?limit=200'), esgGet('/api/esg/facilities?limit=200'),
    ].map((p) => p.catch(() => null)));
    setRef({ types, periods: periods?.items || [], facilities: facilities?.items || [] });
  }, [orgId]);
  // Refresh shared reference data on every tab change so new facilities/periods appear everywhere.
  useEffect(() => { loadRef(); }, [loadRef, tab]);

  const switchOrg = (id) => {
    setEsgSession({ organizationId: id });
    safeStorage(() => localStorage.setItem(ORG_KEY, id));
    setOrgId(id);
    setTab('setup');
  };

  const createOrg = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const org = await action.run(() => esgSend('POST', '/api/esg/organizations', { name: f.get('name'), is_demo: f.get('is_demo') === 'on' }),
      'Organization created. You are its owner.');
    if (org) { safeStorage(() => localStorage.setItem(ORG_KEY, org.id)); await loadOrgs(); }
  };

  const shell = (children) => (
    <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-28 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-emerald">CarbonOS ESG</p>
          <h1 className="font-serif text-4xl text-registry">GHG accounting workspace</h1>
        </div>
        {user && <div className="flex items-center gap-3 text-sm text-mist">{user.name}<Button variant="secondary" onClick={signOut}>Sign out</Button></div>}
      </header>
      <Notice error={action.error || loadError} message={action.message} />
      {children}
    </main>
  );

  if (user === undefined) return shell(<p role="status" className="text-mist">Loading…</p>);

  if (!user) {
    return shell(
      <Panel title="Sign in" description="The ESG workspace holds your organization's accounting records and requires an account.">
        {authConfigured
          ? <Button onClick={signIn}>Sign in</Button>
          : <p className="text-sm text-amber-300">Sign-in is not configured for this deployment (set VITE_OIDC_ISSUER and VITE_OIDC_CLIENT_ID). No data is shown without authentication.</p>}
      </Panel>,
    );
  }

  if (orgs && orgs.length === 0) {
    return shell(
      <Panel title="Create your organization" description="You become its owner and can invite colleagues afterwards.">
        <form onSubmit={createOrg} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Input label="Organization name" name="name" required maxLength={200} />
          <label className="flex items-center gap-2 text-sm text-mist"><input type="checkbox" name="is_demo" /> Demo workspace (sample data only)</label>
          <Button type="submit" disabled={action.busy}>Create organization</Button>
        </form>
      </Panel>,
    );
  }

  const org = orgs?.find((o) => o.id === orgId);
  if (!org) return shell(<p role="status" className="text-mist">Loading organizations…</p>);
  const perms = PERMS[org.role] || [];
  const can = { write: perms.includes('write'), review: perms.includes('review'), admin: perms.includes('admin') };
  const tabs = [
    ['setup', 'Setup'], ['factors', 'Emission factors'], ['ledger', 'Activity ledger'], ['metrics', 'E/S/G metrics'], ['reports', 'Calculation & reports'], ['disclosures', 'Disclosures'],
    ...(can.admin ? [['members', 'Members']] : []), ...(can.review ? [['audit', 'Audit trail']] : []),
  ];

  return shell(
    <>
      <div className="flex flex-wrap items-end gap-4">
        {orgs.length > 1
          ? <div className="w-72"><Select label="Organization" value={orgId} onChange={(e) => switchOrg(e.target.value)} options={orgs.map((o) => [o.id, o.name])} /></div>
          : <p className="text-lg text-registry">{org.name}</p>}
        <span className="rounded bg-mist/15 px-2 py-1 font-mono text-[11px] text-mist">Role: {org.role}</span>
        {org.is_demo && <span className="rounded bg-amber/20 px-2 py-1 font-mono text-[11px] text-amber-300">DEMO WORKSPACE — NOT PRODUCTION DATA</span>}
      </div>
      <nav aria-label="ESG workspace sections" className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)} aria-current={tab === key ? 'page' : undefined}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${tab === key ? 'bg-emerald text-carbon' : 'border border-mist/30 text-registry'}`}>
            {label}
          </button>
        ))}
      </nav>
      <div key={orgId + tab}>
        {tab === 'setup' && <SetupPanel canAdmin={can.admin} />}
        {tab === 'factors' && <FactorsPanel canAdmin={can.admin} me={me?.sub} types={ref.types} />}
        {tab === 'ledger' && <LedgerPanel me={me?.sub} can={can} types={ref.types} periods={ref.periods} facilities={ref.facilities} />}
        {tab === 'reports' && <ReportsPanel me={me?.sub} can={can} periods={ref.periods} facilities={ref.facilities} onPeriodsChanged={loadRef} />}
        {tab === 'metrics' && <MetricsPanel me={me?.sub} can={can} periods={ref.periods} facilities={ref.facilities} />}
        {tab === 'disclosures' && <DisclosuresPanel me={me?.sub} can={can} periods={ref.periods} />}
        {tab === 'members' && <MembersPanel />}
        {tab === 'audit' && <AuditPanel />}
      </div>
    </>,
  );
}

export function EsgCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  useEffect(() => {
    completeSignIn().then(() => navigate('/platform/esg', { replace: true }), (e) => setError(e.message));
  }, [navigate]);
  return (
    <main className="mx-auto max-w-xl px-4 pt-32">
      {error ? <p role="alert" className="text-red-300">Sign-in failed: {error}</p> : <p role="status" className="text-mist">Completing sign-in…</p>}
    </main>
  );
}
