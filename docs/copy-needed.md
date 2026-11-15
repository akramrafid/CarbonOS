# Copy & Verified Links Needed (`docs/copy-needed.md`)

In accordance with the **Zero Invented Facts** rule and **Phase 5 (Footer)** requirements, `src/config/footer.config.js` includes **only** links that resolve to existing routes in `src/App.jsx`, and omits unverified contact emails, social media URLs, and newsletter endpoints.

Please review the items below and provide the official values you would like wired into `src/config/footer.config.js` and the company/legal pages.

---

## 1. Official Contact Email(s)
Currently set to `contact.email: null` in [`src/config/footer.config.js`](file:///c:/projects/CarbonOS/src/config/footer.config.js).
- **General / Partner Inquiries Email**: *(e.g., `hello@...` or `info@...`?)*
- **Enterprise ESG & Registry Support Email**: *(optional)*
- **Security / Vulnerability Disclosure Email**: *(optional)*
- **Physical Office Address (Dhaka / Bangladesh)**: *(optional — omit or include in footer?)*

---

## 2. Official Social Media Links
Currently set to `contact.socialLinks: []` in [`src/config/footer.config.js`](file:///c:/projects/CarbonOS/src/config/footer.config.js).
Please share the exact URLs for any official channels you want displayed in the footer:
- **LinkedIn**: *(URL or omit)*
- **GitHub**: *(URL or omit)*
- **X (Twitter)**: *(URL or omit)*
- **YouTube / Facebook**: *(URL or omit)*

---

## 3. Missing Standalone Pages & Existing Placeholder Copy
All 19 links in `src/config/footer.config.js` resolve to real routes in `src/App.jsx`. However, several legal/company pages either do not exist yet as routes or currently contain short placeholder copy:

### A. Existing Routes with Placeholder Copy (Need Approved Legal/Company Text)
1. **Privacy Policy (`/company/privacy` — [`src/pages/company/Privacy.jsx`](file:///c:/projects/CarbonOS/src/pages/company/Privacy.jsx))**:
   - Currently contains a 3-paragraph summary covering GIS/IoT data collection, MRV usage, and Bangladesh data residency.
   - **Needed**: Full counsel-approved Privacy Policy text, Data Protection Officer (DPO) contact details, and retention window specifics.
2. **Terms of Service (`/company/terms` — [`src/pages/company/Terms.jsx`](file:///c:/projects/CarbonOS/src/pages/company/Terms.jsx))**:
   - Currently contains a 3-paragraph summary covering acceptance of terms, registry integrity, and marketplace trading disclaimers.
   - **Needed**: Full counsel-approved Terms of Service, governing law / dispute resolution clause, and liability caps.
3. **About (`/company/about` — [`src/pages/company/About.jsx`](file:///c:/projects/CarbonOS/src/pages/company/About.jsx))**:
   - Currently contains a brief mission paragraph.
   - **Needed**: Verified founding story, leadership/advisory bios (if desired), and institutional partners.
4. **Careers (`/company/careers` — [`src/pages/company/Careers.jsx`](file:///c:/projects/CarbonOS/src/pages/company/Careers.jsx))**:
   - Currently lists 2 sample roles (`Senior Data Engineer`, `Carbon Policy Analyst`) with non-linked `Apply` buttons.
   - **Needed**: Real open positions and an application URL or `mailto:` destination.

### B. Unrouted Legal / Company Pages (Not Included in Footer Until Routed)
If you want any of the following pages created and added to the `Legal` or `Company` footer columns, please provide the copy or confirm if we should scaffold them:
- **Cookie Policy / Consent Preferences** (`/company/cookies`)
- **Security & Trust Center / dMRV Audit Attestations** (`/company/security`)
- **Data Processing Addendum (DPA)** (`/company/dpa`)
- **Contact / Request Demo Page** (`/company/contact`)

---

## 4. Newsletter & System Status Indicator
- **Newsletter Form**: Omitted (`features.hasNewsletterEndpoint: false`) because no backend newsletter subscription endpoint exists in FastAPI (`inference/`).
- **System Status Indicator**: Omitted (`features.hasLiveStatusEndpoint: false`) to avoid displaying a static/fake uptime badge. If you want the footer to poll `/health` when the backend is reachable, let us know.
