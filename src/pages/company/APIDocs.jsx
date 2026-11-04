import { Link } from 'react-router-dom';
import CompanyPage from '../../components/CompanyPage';

const endpoints = [
  ['GET', '/api/esg/documents', 'Read', 'List documents visible to the caller.'],
  ['POST', '/api/esg/query', 'Read', 'Ask an evidence question; optional document_ids restrict the source scope.'],
  ['POST', '/api/esg/activities', 'Write', 'Create a draft activity record. This does not approve it.'],
  ['POST', '/api/esg/periods/{id}/calculate', 'Write', 'Calculate from eligible approved records and retain exceptions.'],
  ['POST', '/api/esg/periods/{id}/lock', 'Admin, separate approver', 'Lock an unchanged, unblocked calculation prepared by another user.'],
  ['GET', '/api/esg/snapshots/{id}/export?format=json', 'Read', 'Export an authorized stored snapshot; CSV is also supported.'],
];

const queryExample = `curl --request POST "$CARBONOS_API_URL/api/esg/query" \\
  --header "Authorization: Bearer $CARBONOS_ACCESS_TOKEN" \\
  --header "X-Organization-Id: $CARBONOS_ORGANIZATION_ID" \\
  --header "Content-Type: application/json" \\
  --data '{"query":"What does the uploaded policy say about boiler inspections?","corpus":"tenant_docs"}'`;

export default function APIDocs() {
  return <CompanyPage
    label="Developer guide"
    title="Integrate the working ESG workflow."
    intro="The ESG API supports authorized document retrieval, reviewed activity records, deterministic calculation and stored report exports. Use the contract for the deployed version when building an integration."
  >
    <section aria-labelledby="api-access">
      <h2 id="api-access" className="text-2xl font-semibold text-registry sm:text-3xl">Access follows your organization roles</h2>
      <p className="mt-4">Protected ESG routes require a bearer JWT from the configured identity provider and a valid organization membership. Roles are checked on the server. Select an organization you belong to with the X-Organization-Id header when your account has more than one membership.</p>
      <p className="mt-4">Obtain the API base URL and authorized credentials from your deployment operator. This showcase does not issue production API keys or provision a service account. Keep tokens out of shared examples, URLs and source control.</p>
      <a href="https://github.com/akramrafid/CarbonOS/blob/Asif/docs/esg/API_CONTRACTS.md" className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Read the versioned API contract on GitHub <span aria-hidden="true" className="ml-2 shrink-0">↗</span></a>
    </section>

    <section aria-labelledby="api-endpoints" className="border-t border-mist/25 pt-9">
      <h2 id="api-endpoints" className="text-2xl font-semibold text-registry sm:text-3xl">Implemented endpoint examples</h2>
      <p className="mt-4">This is a selection of the ESG contract. It is not a promise of live IoT ingestion or an official registry API.</p>
      <ul className="mt-6 divide-y divide-mist/25 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-5 sm:px-6">
        {endpoints.map(([method, path, permission, description]) => <li key={path} className="py-5 [overflow-wrap:anywhere]">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2"><span className="font-mono text-xs font-semibold text-emerald">{method}</span><code className="text-sm text-registry">{path}</code></div>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p>
          <p className="mt-2 text-xs text-mist">Permission: {permission}</p>
        </li>)}
      </ul>
    </section>

    <section aria-labelledby="api-example" className="border-t border-mist/25 pt-9">
      <h2 id="api-example" className="text-2xl font-semibold text-registry sm:text-3xl">Try an authorized evidence query</h2>
      <p className="mt-4">Set the three shell variables below to your deployment URL, access token and organization ID. Upload a readable sample policy first. This example asks a question; it does not approve data, create credits or change the inventory.</p>
      <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4 text-xs leading-relaxed text-[var(--color-text-secondary)] [overflow-wrap:anywhere] sm:p-6"><code>{queryExample}</code></pre>
      <p className="mt-4">Responses include the actual answer mode, source citations and an insufficient-evidence state. Model-assisted answering is optional and requires operator configuration; a retrieval score is not a probability of correctness.</p>
      <Link to="/platform/esg?view=evidence" className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Explore the evidence workspace <span aria-hidden="true" className="ml-2">→</span></Link>
    </section>

    <aside aria-label="Integration boundaries" className="rounded-xl border border-[var(--state-neutral-border)] bg-[var(--state-neutral-bg)] p-5 text-[var(--state-neutral-text)]">
      <h2 className="text-xl font-semibold">Review gates remain part of the API</h2>
      <p className="mt-3">Contributors cannot approve their own activity records. Report locking requires a separate approver, unchanged inputs and no blocking exceptions. Automation must preserve those controls.</p>
      <p className="mt-3">Expect explicit authentication, permission, validation and state-conflict errors. Read the contract for request fields, pagination, report schema versions and error handling before connecting real business data.</p>
      <Link to="/company/trust" className="mt-4 inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4">Review trust & data boundaries <span aria-hidden="true" className="ml-2">→</span></Link>
    </aside>
  </CompanyPage>;
}
