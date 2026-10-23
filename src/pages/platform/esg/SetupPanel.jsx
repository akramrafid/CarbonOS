// Organization structure: legal entities, facilities (control / equity for the boundary) and reporting periods.
import { esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, StatusBadge, Table, formValues, useAction, useEsgData } from './ui';

const BOUNDARIES = [
  ['operational_control', 'Operational control'],
  ['financial_control', 'Financial control'],
  ['equity_share', 'Equity share'],
];

export default function SetupPanel({ canAdmin }) {
  const entities = useEsgData('/api/esg/legal-entities?limit=200');
  const facilities = useEsgData('/api/esg/facilities?limit=200');
  const periods = useEsgData('/api/esg/periods?limit=200');
  const action = useAction();

  const submit = (path, reload, transform = (v) => v) => async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const ok = await action.run(() => esgSend('POST', path, transform(formValues(form))), 'Saved.');
    if (ok) { form.reset(); reload(); }
  };

  const entityOptions = (entities.data?.items || []).map((le) => [le.id, le.name]);
  const entityName = Object.fromEntries(entityOptions);

  return (
    <div className="space-y-6">
      <Notice error={action.error} message={action.message} />

      <Panel title="Legal entities" description="Registered companies in the group. Facilities belong to a legal entity.">
        <Loading state={entities} empty="No legal entities yet.">
          <Table caption="Legal entities" rows={entities.data?.items || []} columns={[
            { key: 'name', label: 'Name' }, { key: 'country', label: 'Country' },
            { key: 'registration_number', label: 'Registration no.' },
          ]} />
        </Loading>
        {canAdmin && (
          <form onSubmit={submit('/api/esg/legal-entities', entities.reload)} className="grid gap-3 sm:grid-cols-4 sm:items-end">
            <Input label="Name" name="name" required maxLength={200} />
            <Input label="Country (ISO-2)" name="country" required pattern="[A-Z]{2}" placeholder="BD" />
            <Input label="Registration no." name="registration_number" maxLength={100} />
            <Button type="submit" disabled={action.busy}>Add legal entity</Button>
          </form>
        )}
      </Panel>

      <Panel title="Facilities" description="Sites whose activity data you record. Control and equity determine inclusion under each boundary method.">
        <Loading state={facilities} empty="No facilities yet. Add a legal entity first.">
          <Table caption="Facilities" rows={facilities.data?.items || []} columns={[
            { key: 'name', label: 'Facility' },
            { key: 'legal_entity_id', label: 'Legal entity', render: (f) => entityName[f.legal_entity_id] || f.legal_entity_id },
            { key: 'grid_region', label: 'Factor region' },
            { key: 'operational_control', label: 'Op. control', render: (f) => (f.operational_control ? 'Yes' : 'No') },
            { key: 'financial_control', label: 'Fin. control', render: (f) => (f.financial_control ? 'Yes' : 'No') },
            { key: 'equity_share_pct', label: 'Equity %' },
          ]} />
        </Loading>
        {canAdmin && entityOptions.length > 0 && (
          <form onSubmit={submit('/api/esg/facilities', facilities.reload, (v) => ({
            ...v, operational_control: v.operational_control === 'true', financial_control: v.financial_control === 'true',
          }))} className="grid gap-3 sm:grid-cols-3 sm:items-end">
            <Select label="Legal entity" name="legal_entity_id" required options={entityOptions} />
            <Input label="Facility name" name="name" required maxLength={200} />
            <Input label="Country (ISO-2)" name="country" required pattern="[A-Z]{2}" placeholder="BD" />
            <Input label="Factor region" name="grid_region" required maxLength={50} hint="Must match the region of the factors you approve." />
            <Select label="Operational control" name="operational_control" options={[['true', 'Yes'], ['false', 'No']]} />
            <Select label="Financial control" name="financial_control" options={[['true', 'Yes'], ['false', 'No']]} />
            <Input label="Equity share %" name="equity_share_pct" type="number" min="0" max="100" step="0.0001" defaultValue="100" />
            <Button type="submit" disabled={action.busy}>Add facility</Button>
          </form>
        )}
      </Panel>

      <Panel title="Reporting periods" description="Each period fixes its organizational boundary method. Locked periods can only change through a restatement.">
        <Loading state={periods} empty="No reporting periods yet.">
          <Table caption="Reporting periods" rows={periods.data?.items || []} columns={[
            { key: 'name', label: 'Period' }, { key: 'start_date', label: 'Start' }, { key: 'end_date', label: 'End' },
            { key: 'boundary_method', label: 'Boundary', render: (p) => BOUNDARIES.find(([k]) => k === p.boundary_method)?.[1] },
            { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
            { key: 'revision', label: 'Revision' },
          ]} />
        </Loading>
        {canAdmin && (
          <form onSubmit={submit('/api/esg/periods', periods.reload)} className="grid gap-3 sm:grid-cols-5 sm:items-end">
            <Input label="Name" name="name" required maxLength={100} placeholder="FY2025" />
            <Input label="Start date" name="start_date" type="date" required />
            <Input label="End date" name="end_date" type="date" required />
            <Select label="Boundary method" name="boundary_method" options={BOUNDARIES} />
            <Button type="submit" disabled={action.busy}>Add period</Button>
          </form>
        )}
      </Panel>
    </div>
  );
}
