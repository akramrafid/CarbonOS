import { Link } from 'react-router-dom';
import CompanyPage from '../../components/CompanyPage';

export default function Careers() {
  return <CompanyPage
    label="Careers"
    title="Explore the work behind CarbonOS."
    intro="CarbonOS is a climate-technology project focused on source-linked ESG records, human review and traceable reporting. Learn about the product and its current engineering and research boundaries."
  >
    <section aria-labelledby="careers-status" className="rounded-xl border border-[var(--state-neutral-border)] bg-[var(--state-neutral-bg)] p-5 text-[var(--state-neutral-text)] sm:p-6">
      <h2 id="careers-status" className="text-2xl font-semibold">No confirmed vacancies published</h2>
      <p className="mt-3">There are no verified job descriptions or application destinations listed on this site. A role needs confirmed responsibilities, employment terms and a verified application channel before it can be published here.</p>
      <p className="mt-3">This page does not collect CVs, applications or personal contact information.</p>
    </section>

    <section aria-labelledby="careers-project">
      <h2 id="careers-project" className="text-2xl font-semibold text-registry sm:text-3xl">Get to know the project</h2>
      <ul className="mt-6 divide-y divide-mist/25 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-5 sm:px-6">
        <li className="py-5"><h3 className="text-lg font-semibold text-registry">Product & engineering</h3><p className="mt-2 text-[var(--color-text-secondary)]">Follow the implemented reporting workflow and see what a real deployment requires.</p><Link to="/technology" className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Explore the architecture <span aria-hidden="true" className="ml-2">→</span></Link></li>
        <li className="py-5"><h3 className="text-lg font-semibold text-registry">Climate accounting</h3><p className="mt-2 text-[var(--color-text-secondary)]">Review original framework sources and the calculation scope supported by the current prototype.</p><Link to="/company/framework-docs" className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Review standards & scope <span aria-hidden="true" className="ml-2">→</span></Link></li>
        <li className="py-5"><h3 className="text-lg font-semibold text-registry">Evidence & integration</h3><p className="mt-2 text-[var(--color-text-secondary)]">Inspect the actual API contract, authorization boundaries and a working evidence-query example.</p><Link to="/company/api-docs" className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-emerald underline underline-offset-4">Read the developer guide <span aria-hidden="true" className="ml-2">→</span></Link></li>
      </ul>
    </section>
  </CompanyPage>;
}
