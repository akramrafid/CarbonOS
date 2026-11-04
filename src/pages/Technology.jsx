import { Link } from 'react-router-dom';
import CompanyPage from '../components/CompanyPage';

const workflow = [
  ['Source evidence', 'Upload readable documents or enter activity data. Keep the source reference and review extracted quantities before using them.'],
  ['Human review', 'Contributors prepare activity records. A different authorized reviewer approves them before calculation.'],
  ['Deterministic calculation', 'Calculate Scope 1 and separate Scope 2 totals from approved quantities, applicable factors and the reporting boundary. Missing market inputs remain unavailable.'],
  ['Reproducible reporting', 'A separate approver locks an unchanged calculation. Export the stored report with factor versions, formulas and a content fingerprint.'],
];

export default function Technology() {
  return <CompanyPage
    label="Technology & deployment"
    title="Follow the evidence through every layer."
    intro="CarbonOS connects source documents, reviewed activity data and traceable emissions reports. The factory ESG workflow is available to evaluate with synthetic data; research modules and deployment requirements are described separately below."
  >
    <aside aria-label="Current deployment status" className="rounded-xl border border-[var(--state-warning-border)] bg-[var(--state-warning-bg)] p-5 text-[var(--state-warning-text)]">
      <p className="font-semibold">Prototype, with explicit limits</p>
      <p className="mt-2">This page describes implemented workflows and requirements. It is not a live infrastructure status page. No deployed sensor network, operating throughput, issued credits, revenue or official certification is established here.</p>
    </aside>

    <section aria-labelledby="technology-workflow">
      <h2 id="technology-workflow" className="text-2xl font-semibold text-registry sm:text-3xl">The reporting architecture</h2>
      <ol className="mt-7 grid gap-5 sm:grid-cols-2">
        {workflow.map(([title, description], index) => <li key={title} className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-5 sm:p-6">
          <span aria-hidden="true" className="font-mono text-sm text-emerald">0{index + 1}</span>
          <h3 className="mt-3 text-lg font-semibold text-registry">{title}</h3>
          <p className="mt-2 text-[var(--color-text-secondary)]">{description}</p>
        </li>)}
      </ol>
      <p className="mt-5">Calculations use explicit arithmetic, not an AI-generated emissions total. A reviewed report is an internal inventory; external assurance remains a separate process.</p>
    </section>

    <section aria-labelledby="technology-evidence" className="border-t border-mist/25 pt-9">
      <div className="grid gap-7 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-emerald">Evidence assistant</p>
          <h2 id="technology-evidence" className="mt-3 text-2xl font-semibold text-registry">Inspect the source behind an answer.</h2>
          <p className="mt-4">Search authorized indexed documents, inspect cited passages and compare two selected documents independently. Download the answer record with its sources and generation mode.</p>
        </div>
        <div className="rounded-xl border border-[var(--state-neutral-border)] bg-[var(--state-neutral-bg)] p-5 text-[var(--state-neutral-text)]">
          <p className="font-semibold">Optional AI assistance</p>
          <p className="mt-2">Model-assisted answering and extraction require operator configuration. Retrieval scores are not accuracy probabilities. Unsupported questions can return insufficient evidence; extracted values still need human review.</p>
          <Link to="/platform/esg?view=evidence" className="mt-4 inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4">Open the evidence assistant <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </div>
    </section>

    <section aria-labelledby="technology-research" className="border-t border-mist/25 pt-9">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald">Research modules</p>
      <h2 id="technology-research" className="mt-3 text-2xl font-semibold text-registry sm:text-3xl">Satellite analysis needs its own evidence.</h2>
      <p className="mt-4">The carbon-monitoring module includes satellite scene discovery, analysis provenance and research model paths. Availability depends on the configured services and input data. A catalogue connector or model implementation does not establish a calibrated field result.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-5">
          <h3 className="text-lg font-semibold text-registry">Observed, inferred or simulated?</h3>
          <p className="mt-2 text-[var(--color-text-secondary)]">Check scene identifiers, acquisition dates, observation labels and model provenance on each analysis. Simulated imagery and formula estimates must not be presented as satellite observations or verified carbon stocks.</p>
          <Link to="/carbon-monitoring" className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Explore carbon-monitoring research <span aria-hidden="true" className="ml-2">→</span></Link>
        </article>
        <article className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-5">
          <h3 className="text-lg font-semibold text-registry">Field telemetry is unavailable</h3>
          <p className="mt-2 text-[var(--color-text-secondary)]">No authenticated live sensor gateway is connected to this showcase. A field deployment needs device calibration, authorized ingestion, monitoring and data-quality checks before sensor readings support a carbon claim.</p>
        </article>
      </div>
    </section>

    <section aria-labelledby="technology-readiness" className="border-t border-mist/25 pt-9">
      <h2 id="technology-readiness" className="text-2xl font-semibold text-registry sm:text-3xl">What a business pilot needs</h2>
      <ul className="mt-5 list-disc space-y-3 pl-5 marker:text-emerald">
        <li>Configured identity, organization roles and secure data storage, with tested backups and recovery.</li>
        <li>Approved factor sources, reporting boundaries and a methodology review by a qualified GHG practitioner.</li>
        <li>Agreed document permissions, retention and external AI processing terms before using real business data.</li>
        <li>Representative documents and field measurements for any claimed extraction, retrieval or prediction quality.</li>
        <li>External registry access and official receipts before any issuance or retirement claim.</li>
      </ul>
      <Link to="/company/trust" className="mt-5 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Review trust & data boundaries <span aria-hidden="true" className="ml-2">→</span></Link>
    </section>
  </CompanyPage>;
}
