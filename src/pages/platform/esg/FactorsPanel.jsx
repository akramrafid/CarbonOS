// Emission factor registry: cited, versioned factors approved by a second person. CarbonOS ships none.
import { esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, StatusBadge, Table, formValues, useAction, useEsgData } from './ui';

export default function FactorsPanel({ canAdmin, me, types }) {
  const factors = useEsgData('/api/esg/factors?limit=200');
  const action = useAction();
  const inventory = types?.inventory || [];

  const create = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const v = formValues(form);
    const type = inventory.find((t) => t.activity_type === v.activity_type);
    const body = { ...v, unit: type?.canonical_unit, source_year: Number(v.source_year),
                   method: type?.scope === '1' ? 'direct' : v.method };
    if (await action.run(() => esgSend('POST', '/api/esg/factors', body), 'Factor saved as DRAFT. A second admin must approve it.')) {
      form.reset();
      factors.reload();
    }
  };

  const approve = async (id) => {
    if (await action.run(() => esgSend('POST', `/api/esg/factors/${id}/approve`), 'Factor approved.')) factors.reload();
  };

  return (
    <Panel
      title="Emission factors"
      description="Every factor carries its publisher, document and year and must be approved by someone other than its author. Approved factors never change; a new publication is a new version."
    >
      <Notice error={action.error} message={action.message} />
      <Loading state={factors} empty="No factors yet. CarbonOS does not ship default factors: add the factors your organization has sourced.">
        <Table caption="Emission factors" rows={factors.data?.items || []} columns={[
          { key: 'family', label: 'Factor', render: (f) => <span className="font-mono text-xs">{f.family.split(':').slice(1).join(':')} v{f.version}</span> },
          { key: 'activity_type', label: 'Activity' },
          { key: 'kgco2e_per_unit', label: 'kgCO₂e / unit', render: (f) => `${f.kgco2e_per_unit} / ${f.unit}` },
          { key: 'method', label: 'Method' },
          { key: 'region', label: 'Region' },
          { key: 'source_publisher', label: 'Source', render: (f) => (
            <span>{f.source_publisher} — {f.source_document} ({f.source_year}){f.source_table_ref ? `, ${f.source_table_ref}` : ''}
              {f.is_custom && <span className="ml-1 rounded bg-amber/15 px-1 font-mono text-[10px] text-amber-300">CUSTOM</span>}</span>
          ) },
          { key: 'gwp_basis', label: 'GWP' },
          { key: 'status', label: 'Status', render: (f) => <StatusBadge status={f.status} /> },
          { key: 'actions', label: '', render: (f) => (canAdmin && f.status === 'DRAFT' && f.created_by !== me
            ? <Button variant="secondary" onClick={() => approve(f.id)} disabled={action.busy}>Approve</Button> : null) },
        ]} />
      </Loading>
      {canAdmin && (
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="New emission factor">
          <Input label="Factor family" name="family" required pattern="[A-Za-z0-9._\-]+" hint="Same family = new version" />
          <Select label="Activity" name="activity_type" options={inventory.map((t) => [t.activity_type, `${t.activity_type} (Scope ${t.scope}, per ${t.canonical_unit})`])} />
          <Select label="Scope 2 method" name="method" hint="Ignored for Scope 1 (direct)" options={[['location', 'Location-based'], ['market', 'Market-based']]} />
          <Input label="kgCO₂e per canonical unit" name="kgco2e_per_unit" type="number" min="0" step="any" required />
          <Input label="Region" name="region" required hint="Matched to facility factor region" />
          <Select label="GWP basis" name="gwp_basis" options={[['AR5', 'IPCC AR5'], ['AR6', 'IPCC AR6'], ['AR4', 'IPCC AR4']]} />
          <Input label="Valid from" name="valid_from" type="date" required />
          <Input label="Valid to" name="valid_to" type="date" />
          <Input label="Publisher" name="source_publisher" required maxLength={200} />
          <Input label="Document" name="source_document" required maxLength={300} />
          <Input label="Table / page ref" name="source_table_ref" maxLength={200} />
          <Input label="Source year" name="source_year" type="number" min="1990" max="2100" required />
          <Input label="Source URL" name="source_url" type="url" maxLength={500} />
          <Button type="submit" disabled={action.busy}>Save draft factor</Button>
        </form>
      )}
    </Panel>
  );
}
