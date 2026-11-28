// ESG workspace: sign-in, organization selection and the accounting workflow tabs.
// Role checks here only hide controls; the API enforces every permission.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { esgGet, esgSend, hasEsgToken, resetOfflineStore, setEsgSession } from '../../../lib/esgApi';
import { authConfigured, completeSignIn, createLocalOfflineDemoSession, loadSession, resetDemoSession, saveDemoSession, signIn, signOut, switchDemoPersona } from '../../../lib/esgAuth';
import { Button, Input, Notice, Panel, Select, useAction } from './ui';
import OverviewPanel from './OverviewPanel';
import EvidenceAssistantPanel from './EvidenceAssistantPanel';
import SetupPanel from './SetupPanel';
import FactorsPanel from './FactorsPanel';
import LedgerPanel from './LedgerPanel';
import ReportsPanel from './ReportsPanel';
import MetricsPanel from './MetricsPanel';
import DisclosuresPanel from './DisclosuresPanel';
import BillAnalysisPanel from './BillAnalysisPanel';
import { AuditPanel, MembersPanel } from './PeoplePanel';
import { Tabs } from '../../../components/ui/Tabs';
import { PageHeader } from '../../../components/ui/PageHeader';

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
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out / offline
  const [me, setMe] = useState(null);
  const [orgs, setOrgs] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [tab, setTab] = useState('overview');
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

  const refreshAll = useCallback(async () => {
    let u = null;
    try { u = await loadSession(); } catch { u = null; }
    setUser(u);
    if (!u || !hasEsgToken()) return;
    try {
      setMe(await esgGet('/api/esg/me'));
      await loadOrgs();
    } catch (e) {
      setLoadError(e.message);
    }
  }, [loadOrgs]);

  const [pendingInvite, setPendingInvite] = useState(null);

  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get('invite');
    if (invite) {
      safeStorage(() => sessionStorage.setItem(INVITE_KEY, invite));
      window.history.replaceState(null, '', '/platform/esg');
    }
    (async () => {
      let u = null;
      try { u = await loadSession(); } catch { u = null; }
      setUser(u);
      if (!u || !hasEsgToken()) return;
      setMe(await action.run(() => esgGet('/api/esg/me')));
      // Require explicit user confirmation before accepting organization invitations
      const pending = safeStorage(() => sessionStorage.getItem(INVITE_KEY));
      if (pending) {
        setPendingInvite(pending);
      }
      await loadOrgs();
    })();
  }, [loadOrgs]);

  const handleConfirmInvite = async () => {
    if (!pendingInvite) return;
    const token = pendingInvite;
    safeStorage(() => sessionStorage.removeItem(INVITE_KEY));
    setPendingInvite(null);
    await action.run(
      () => esgSend('POST', '/api/esg/invitations/accept', { token }),
      (r) => `You joined ${r.organization_name} as ${r.role}.`
    );
    await loadOrgs();
  };

  const handleDismissInvite = () => {
    safeStorage(() => sessionStorage.removeItem(INVITE_KEY));
    setPendingInvite(null);
  };

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
    setTab('overview');
  };

  const createOrg = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const org = await action.run(() => esgSend('POST', '/api/esg/organizations', { name: f.get('name'), is_demo: f.get('is_demo') === 'on' }),
      'Organization created. You are its owner.');
    if (org) { safeStorage(() => localStorage.setItem(ORG_KEY, org.id)); await loadOrgs(); }
  };

  const handlePersonaChange = async (newPersona) => {
    try {
      switchDemoPersona(newPersona);
      await refreshAll();
      await loadRef();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleResetDemo = async () => {
    await action.run(async () => {
      resetOfflineStore();
      await resetDemoSession();
      await refreshAll();
      await loadRef();
    }, 'Demo workspace successfully reset to initial benchmark state.');
  };

  const shell = (children) => (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title="GHG accounting workspace"
        badge="CarbonOS ESG"
        secondaryActions={
          user ? (
            <div className="flex items-center gap-3 text-sm text-mist">
              <span>{user.name}</span>
              <Button variant="secondary" onClick={signOut}>Sign out</Button>
            </div>
          ) : null
        }
      />
      <Notice error={action.error || loadError} message={action.message} />
      {pendingInvite && (
          <aside aria-label="Pending organization invitation" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-fg-primary font-medium">
              You have a pending organization invitation link. Accept to join the organization?
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleConfirmInvite} disabled={action.busy}>Accept Invitation</Button>
              <Button size="sm" variant="secondary" onClick={handleDismissInvite} disabled={action.busy}>Dismiss</Button>
            </div>
          </aside>
      )}
          {children}
        </div>
      );

      if (user === undefined) return shell(<p role="status" className="text-fg-secondary">Loading workspace…</p>);

      if (!user) {
    return shell(
      <Panel title="ESG Workspace Offline" description="Unable to connect to the remote ESG cloud service.">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            The remote API server ({import.meta.env?.VITE_FASTAPI_API_URL || 'https://carbonos-inference.onrender.com'}) is currently cold-starting or unreachable.
          </p>
            <p className="mt-2 text-xs text-fg-secondary">
              You can immediately launch the interactive client-side demo workspace with Bangladesh manufacturing benchmark data, dual-control persona switching, and GHG Protocol calculation engine.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  const demo = createLocalOfflineDemoSession();
                  saveDemoSession(demo);
                  await refreshAll();
                  await loadRef();
                }}
              >
                Launch Demo Workspace
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>Retry remote connection</Button>
              {authConfigured && <Button variant="secondary" onClick={signIn}>Sign in with SSO</Button>}
            </div>
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
          const can = {write: perms.includes('write'), review: perms.includes('review'), admin: perms.includes('admin') };
          const tabGroups = [
          {
            id: 'overview-intake',
          label: 'Overview & Intake',
          tabs: [
          {id: 'overview', label: 'Overview' },
          {id: 'bills', label: 'Bill Intake & Analysis' },
          {id: 'setup', label: 'Setup' },
          ],
    },
          {
            id: 'accounting-factors',
          label: 'Accounting & Factors',
          tabs: [
          {id: 'ledger', label: 'Activity Ledger' },
          {id: 'factors', label: 'Emission Factors' },
          {id: 'metrics', label: 'E/S/G Metrics' },
          {id: 'reports', label: 'Calculations & Reports' },
          {id: 'disclosures', label: 'Disclosures' },
          ],
    },
          {
            id: 'rag-evidence',
          label: 'RAG Evidence AI',
          tabs: [{id: 'evidence', label: 'Evidence AI & Compare' }],
    },
          ...(can.admin || can.review
          ? [{
            id: 'governance',
          label: 'Governance',
          tabs: [
          ...(can.admin ? [{id: 'members', label: 'Members' }] : []),
          ...(can.review ? [{id: 'audit', label: 'Audit trail' }] : []),
          ],
        }]
          : []),
          ];

          return shell(
    <>
            {(user?.isDemo || org.is_demo) && (
                <aside aria-label="Demo notice" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                              DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED
                            </span>
                              <span className="font-mono text-[11px] text-amber-800/80 dark:text-amber-200/80">
                                {user?.isOfflineDemo ? 'Interactive client-side evaluation' : 'Ephemeral zero-friction evaluation'}
                              </span>
                              {user?.isOfflineDemo && (
                  <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Offline Resilient
                  </span>
                )}
              </div>
              <p className="text-fg-secondary">
                Synthetic Bangladesh spinning & manufacturing benchmarks. Backend tenant isolation and segregation of duties are strictly enforced.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-fg-secondary">Dual-control persona:</span>
              <Tabs
                tabs={[
                  { id: 'owner', label: 'Submitter (Owner)' },
                  { id: 'reviewer', label: 'Auditor (Reviewer)' }
                ]}
                activeTab={user?.activePersona === 'reviewer' ? 'reviewer' : 'owner'}
                onChange={handlePersonaChange}
                size="sm"
              />
              <Button variant="secondary" onClick={handleResetDemo} disabled={action.busy}>
                Reset demo data
              </Button>
            </div>
          </div>
                        </aside>
      )}

                        <div className="flex flex-wrap items-end gap-4">
                          {orgs.length > 1
                          ? <div className="w-full sm:w-72"><Select label="Organization" value={orgId} onChange={(e) => switchOrg(e.target.value)} options={orgs.map((o) => [o.id, o.name])} /></div>
                          : <p className="text-lg text-fg-primary">{org.name}</p>}
                          <span className="rounded bg-bg-muted px-2 py-1 font-mono text-[11px] text-fg-secondary">Role: {org.role}</span>
                          {org.is_demo && !user?.isDemo && (
          <span className="rounded bg-amber-500/20 px-2 py-1 font-mono text-[11px] text-amber-800 dark:text-amber-300">DEMO WORKSPACE — NOT PRODUCTION DATA</span>
                          )}
                        </div>

                          <nav aria-label="ESG workspace sections" data-internal-nav="true" className="w-full">
                            <Tabs
                              groups={tabGroups}
                              activeTab={tab}
                              onChange={setTab}
                            />
                          </nav>
                          <div key={orgId + tab}>
                            {tab === 'overview' && (
                              <OverviewPanel
                                periods={ref.periods}
                                facilities={ref.facilities}
                                onNavigateTab={setTab}
                                isDemoWorkspace={Boolean(user?.isDemo || org.is_demo)}
                              />
                            )}
                            {tab === 'setup' && <SetupPanel canAdmin={can.admin} />}
                            {tab === 'factors' && <FactorsPanel canAdmin={can.admin} me={me?.sub} types={ref.types} />}
                            {tab === 'ledger' && <LedgerPanel me={me?.sub} can={can} types={ref.types} periods={ref.periods} facilities={ref.facilities} />}
                            {tab === 'reports' && <ReportsPanel me={me?.sub} can={can} periods={ref.periods} facilities={ref.facilities} onPeriodsChanged={loadRef} />}
                            {tab === 'metrics' && <MetricsPanel me={me?.sub} can={can} periods={ref.periods} facilities={ref.facilities} />}
                            {tab === 'bills' && <BillAnalysisPanel facilities={ref.facilities} periods={ref.periods} />}
                            {tab === 'disclosures' && <DisclosuresPanel me={me?.sub} can={can} periods={ref.periods} />}
                            {tab === 'evidence' && <EvidenceAssistantPanel canWrite={can.write} />}
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
                        <div className="mx-auto max-w-xl px-4 pt-16">
                          {error ? <p role="alert" className="text-red-700 dark:text-red-300">Sign-in failed: {error}</p> : <p role="status" className="text-fg-secondary">Completing sign-in…</p>}
                        </div>
                        );
}
