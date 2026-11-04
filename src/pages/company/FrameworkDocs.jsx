import { Link } from 'react-router-dom';
import CompanyPage from '../../components/CompanyPage';

const references = [
  {
    title: 'GHG Protocol Corporate Standard',
    publisher: 'GHG Protocol',
    href: 'https://ghgprotocol.org/corporate-standard',
    description: 'Requirements and guidance for preparing a corporate greenhouse gas inventory. Corporate inventory accounting does not itself quantify project credits.',
  },
  {
    title: 'GHG Protocol Scope 2 Guidance',
    publisher: 'GHG Protocol',
    href: 'https://ghgprotocol.org/scope-2-guidance',
    description: 'Guidance for purchased energy accounting, including market-based instrument quality criteria. Consult the publisher for the current guidance and update process.',
  },
  {
    title: 'The Paris Agreement',
    publisher: 'UNFCCC',
    href: 'https://unfccc.int/process-and-meetings/the-paris-agreement',
    description: 'The UNFCCC overview of the international climate agreement. This reference does not establish a project authorization or national registry connection.',
  },
];

export default function FrameworkDocs() {
  return <CompanyPage
    label="Standards & scope"
    title="Reference frameworks. Explicit product limits."
    intro="Use the original publishers to review the frameworks behind climate reporting. CarbonOS provides a prototype evidence and calculation workflow; these references do not certify the product or grant regulatory approval."
  >
    <section aria-labelledby="framework-references">
      <h2 id="framework-references" className="text-2xl font-semibold text-registry sm:text-3xl">Read the published sources</h2>
      <ul className="mt-6 space-y-4">
        {references.map((reference) => <li key={reference.href} className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald">{reference.publisher}</p>
          <h3 className="mt-2 text-lg font-semibold text-registry">{reference.title}</h3>
          <p className="mt-3 text-[var(--color-text-secondary)]">{reference.description}</p>
          <a href={reference.href} className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Read {reference.title} on {reference.publisher} <span aria-hidden="true" className="ml-2 shrink-0">↗</span></a>
        </li>)}
      </ul>
      <p className="mt-5">These links open publisher pages, not CarbonOS-hosted PDFs. Check the applicable edition and requirements with a qualified reporting practitioner.</p>
    </section>

    <section aria-labelledby="framework-coverage" className="border-t border-mist/25 pt-9">
      <h2 id="framework-coverage" className="text-2xl font-semibold text-registry sm:text-3xl">Current calculation coverage</h2>
      <dl className="mt-6 space-y-5">
        <div><dt className="font-semibold text-registry">Scope 1</dt><dd className="mt-1">Fuel activity calculations for diesel, petrol, LPG, natural gas and furnace oil with applicable approved factors. Refrigerant mass balance, gas-specific handling and equipment lifecycle calculations are not included in this version.</dd></div>
        <div><dt className="font-semibold text-registry">Scope 2</dt><dd className="mt-1">Separate location-based and market-based electricity totals. Missing market inputs remain unavailable. Purchased steam currently has location-based coverage only; full contractual-instrument quality validation is not implemented.</dd></div>
        <div><dt className="font-semibold text-registry">Scope 3 and external assurance</dt><dd className="mt-1">Scope 3 is not included. Internal review and report locking do not establish external assurance or complete conformance with a reporting standard.</dd></div>
      </dl>
      <Link to="/technology" className="mt-5 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Explore the reporting architecture <span aria-hidden="true" className="ml-2">→</span></Link>
    </section>

    <aside aria-label="National policy and registry boundary" className="rounded-xl border border-[var(--state-neutral-border)] bg-[var(--state-neutral-bg)] p-5 text-[var(--state-neutral-text)]">
      <h2 className="text-xl font-semibold">National policy and registry access</h2>
      <p className="mt-3">No verified Bangladesh national-framework document or accreditation guide is published here. Confirm the current authority-issued documents and requirements for your project before relying on a regulatory claim.</p>
      <p className="mt-3">Registry research and sandbox responses do not establish official authorization, issued credits, a corresponding adjustment, transfer or retirement.</p>
      <Link to="/company/trust" className="mt-4 inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4">Review trust & data boundaries <span aria-hidden="true" className="ml-2">→</span></Link>
    </aside>
  </CompanyPage>;
}
