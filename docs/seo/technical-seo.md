# Technical SEO contract — current implementation

Date: 2026-11-04. Source: `src/App.jsx` PageMetadata and `index.html`. A deployed canonical domain has not been verified. Do not invent canonical URLs, company schema, contact details or public customer evidence.

## Public route matrix

| Route | Intent / visible content | Title | Index policy | Conversion |
|---|---|---|---|---|
| `/` | Evidence-led factory ESG prototype; Carbon evidence H1 | CarbonOS / evidence-led reporting for Bangladesh | index, follow | ESG demo / local pilot plan |
| `/how-it-works` | Source → review → calculate → lock workflow | How it works / CarbonOS | index, follow | Demo |
| `/company/about` | CarbonOS scope and project purpose | About / CarbonOS | index, follow | Demo / pilot plan |
| `/company/trust` | Traceability, actual controls and release limits | Trust & data / CarbonOS | index, follow | Demo / data-use notes |
| `/company/privacy` | Prototype data path and weather/provider processing | Prototype data use / CarbonOS | index, follow | Understand before upload |
| `/company/terms` | Prototype service limitations | Prototype service status / CarbonOS | index, follow | Understand commitments |
| `/platform/esg` and all research/workspace routes | Authorized data / research UI | ESG workspace or generic prototype fallback | client noindex, follow | Authorized workspace |
| Unknown routes | Visible Page not found and home recovery | Generic CarbonOS fallback | client noindex, follow | Home |

App metadata uses a vertical-bar separator. Primary public pages use CompanyPage/route H1s; legacy pages still need heading and metadata review. Additional company API/framework/career routes are research content with generic fallback and noindex. Alias `/platform/saas` redirects to ESG. Registry alias remains reachable; no official registry-role inference.

## Rendering and crawlability

Current delivery is a client-rendered Vite SPA. The static HTML has default metadata and an empty root; meaningful route content requires JavaScript. No SSR/SSG route HTML is implemented. SPA 404 UI does not establish a server HTTP 404; deployment fallback/status handling requires host configuration. Private data is API-authorized; noindex is a crawl hint, never an access control. Server X-Robots-Tag/header protection remains a deployment task.

## Metadata, canonical and social

Primary routes update title, description, Open Graph and Twitter title/description in PageMetadata. `index.html` supplies the defaults. No verified canonical host, og:url, production canonical tags or social-card image is configured. There is no hreflang strategy; navigation is EN/BN but full translated body copy/metadata is incomplete. Avoid duplicate indexing of query variants; production canonical policy should strip non-content workspace/UTM parameters after a verified host is supplied. Image/social-preview validation remains open.

## Sitemap and robots

No production sitemap or robots.txt is currently generated. Once the public host is verified, generate absolute canonical URLs for the six primary routes listed above, exclude private/workspace routes, configure crawler directives and verify actual HTTP status/fallback behavior. Until then this is a recorded deployment gap, not a fake sitemap link. No claim of crawl/indexability verification is made.

## JSON-LD

No organization/product/FAQ JSON-LD is installed or validated. Do not add certifications, customer reviews, offers, address, public email or official approval structured data without visible verified facts. Future structured data must match the shipped public content and deployed identity.

## Acceptance evidence and decision

`tests/e2e/product-site.spec.ts` checks company titles, current client indexing hints and workspace metadata. This is browser-level evidence only; it does not prove search-engine indexing or social unfurl behavior. Full crawl/canonical/sitemap/social/heading/locale review is OPEN (B01/L01/L02). Performance budgets and measurements are recorded separately; no fabricated Web Vitals numbers are used.
