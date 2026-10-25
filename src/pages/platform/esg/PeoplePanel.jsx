// Members, invitations and the audit trail.
import { useState } from 'react';
import { esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, Table, formValues, useAction, useEsgData } from './ui';

const ROLES = [
  ['data_contributor', 'Data contributor'], ['facility_manager', 'Facility manager'], ['auditor', 'Auditor / reviewer'],
  ['executive_viewer', 'Executive (read-only)'], ['esg_admin', 'ESG administrator'], ['org_owner', 'Organization owner'],
];

export function MembersPanel() {
  const members = useEsgData('/api/esg/members');
  const invitations = useEsgData('/api/esg/invitations');
  const action = useAction();
  const [link, setLink] = useState(null);

  const invite = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inv = await action.run(() => esgSend('POST', '/api/esg/invitations', formValues(form)), 'Invitation created.');
    if (inv) {
      setLink(`${window.location.origin}/platform/esg?invite=${encodeURIComponent(inv.token)}`);
      form.reset();
      invitations.reload();
    }
  };

  const change = (path, method, body, msg) => async () => {
    if (await action.run(() => esgSend(method, path, body), msg)) { members.reload(); invitations.reload(); }
  };

  return (
    <div className="space-y-6">
      <Notice error={action.error} message={action.message} />
      <Panel title="Members" description="Roles decide who can enter data, review, approve, lock and administer.">
        <Loading state={members} empty="No members.">
          <Table caption="Members" rows={members.data || []} columns={[
            { key: 'user_sub', label: 'User' },
            { key: 'role', label: 'Role', render: (m) => (
              <select aria-label={`Role for ${m.user_sub}`} defaultValue={m.role} className="rounded border border-mist/30 bg-carbon px-2 py-1 text-sm"
                onChange={(e) => change(`/api/esg/members/${m.id}`, 'PATCH', { role: e.target.value }, 'Role updated.')()}>
                {ROLES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>) },
            { key: 'remove', label: '', render: (m) => <Button variant="secondary" onClick={change(`/api/esg/members/${m.id}`, 'DELETE', undefined, 'Member removed.')}>Remove</Button> },
          ]} />
        </Loading>
      </Panel>
      <Panel title="Invitations" description="CarbonOS does not send email yet. Share the one-time link over a trusted channel; it only works for a signed-in user whose verified email matches.">
        <form onSubmit={invite} className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="Invite member">
          <Input label="Email" name="email" type="email" required maxLength={320} />
          <Select label="Role" name="role" options={ROLES} />
          <Button type="submit" disabled={action.busy}>Create invitation</Button>
        </form>
        {link && <p role="status" className="break-all rounded-lg border border-amber/40 bg-amber/10 p-3 font-mono text-xs text-amber-200">One-time link (shown once): {link}</p>}
        <Loading state={invitations} empty="No invitations.">
          <Table caption="Invitations" rows={invitations.data || []} columns={[
            { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'expires_at', label: 'Expires' },
            { key: 'state', label: 'State', render: (i) => (i.accepted_at ? 'Accepted' : i.revoked_at ? 'Revoked' : 'Pending') },
            { key: 'revoke', label: '', render: (i) => (!i.accepted_at && !i.revoked_at
              ? <Button variant="secondary" onClick={change(`/api/esg/invitations/${i.id}`, 'DELETE', undefined, 'Invitation revoked.')}>Revoke</Button> : null) },
          ]} />
        </Loading>
      </Panel>
    </div>
  );
}

export function AuditPanel() {
  const events = useEsgData('/api/esg/audit-events?limit=200');
  return (
    <Panel title="Audit trail" description="Append-only record of every change: who, what, when and why.">
      <Loading state={events} empty="No events yet.">
        <Table caption="Audit events" rows={events.data?.items || []} columns={[
          { key: 'created_at', label: 'When' }, { key: 'actor_sub', label: 'Who' }, { key: 'action', label: 'Action' },
          { key: 'entity_type', label: 'Entity' },
          { key: 'data', label: 'Details', render: (e) => <span className="font-mono text-[11px] text-mist">{e.data ? JSON.stringify(e.data).slice(0, 160) : ''}</span> },
        ]} />
      </Loading>
    </Panel>
  );
}
