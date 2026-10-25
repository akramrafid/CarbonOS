# CarbonOS ESG SaaS — Reporting Framework Mapping (GRI & IFRS S1/S2)

**Version:** 2026.1  
**Standards Covered:**
- **GRI Standards:** GRI 302 (Energy), GRI 303 (Water and Effluents), GRI 305 (Emissions), GRI 403 (Occupational Health & Safety), GRI 205 (Anti-corruption)
- **IFRS S1 / IFRS S2:** General Requirements for Disclosure of Sustainability-related Financial Information & Climate-related Disclosures

---

## 1. GRI Standards Disclosure Mapping

| GRI Standard | Disclosure Code | Disclosure Title | CarbonOS Data Source & Formula | Required Evidence Documents | Compliance & Assurance Status |
|---|---|---|---|---|---|
| **GRI 302** | **302-1** | Energy consumption within the organization | Sum of fuel consumption (Diesel, Natural Gas) in Joules + Purchased Grid Electricity in Joules | BPDB / DESCO monthly invoices; Generator logbooks | **VERIFIED DATA / NOT ASSURED** |
| **GRI 302** | **302-2** | Energy consumption outside of the organization | Scope 3 Cat 4 upstream transportation energy; Category 6 travel fuel | Freight consignment notes; Carrier bills | **DATA GAP / PARTIAL** |
| **GRI 303** | **303-3** | Water withdrawal by source | Deep Tubewell groundwater extraction + WASA municipal water supply ($m^3$) | WASA water bill; Flow meter telemetry log | **VERIFIED DATA / NOT ASSURED** |
| **GRI 305** | **305-1** | Direct (Scope 1) GHG emissions | Stationary combustion + Mobile combustion in $tCO_2e$ using DoE / IPCC factors | Fuel delivery challans; Fuel analysis certificate | **VERIFIED DATA / NOT ASSURED** |
| **GRI 305** | **305-2** | Energy indirect (Scope 2) GHG emissions | Location-based grid emissions ($0.637 kgCO_2e/kWh$) and Market-based net-metering contracts | Official utility billing statements; SREDA solar net-metering agreement | **VERIFIED DATA / NOT ASSURED** |
| **GRI 305** | **305-3** | Other indirect (Scope 3) GHG emissions | Supported categories (Cat 1, Cat 4, Cat 5, Cat 6) with declared estimation tiers | Freight logs, ETP discharge reports, travel vouchers | **PARTIAL / NOT ASSURED** |
| **GRI 403** | **403-9** | Work-related injuries | Lost Time Injury Frequency Rate (LTIFR) = $\frac{\text{Lost Time Injuries} \times 1,000,000}{\text{Total Hours Worked}}$ | Factory accident register; HR work hours report | **VERIFIED BENCHMARK** |
| **GRI 205** | **205-2** | Communication and training on anti-corruption | Percentage of governance body members and employees trained on anti-bribery policies | HR compliance attendance register; Signed policy declarations | **VERIFIED BENCHMARK** |

---

## 2. IFRS S2 Climate-Related Disclosures

| Pillar | IFRS S2 Paragraph | Requirement Summary | CarbonOS Implementation & Traceability |
|---|---|---|---|
| **Governance** | Paras 5–7 | Governance processes, controls and procedures used to monitor and manage climate risks | Audit log tracks two-person review, approvals, and timestamped changes by authenticated actors. |
| **Strategy** | Paras 8–22 | Strategy for managing climate-related risks and opportunities | Facility-level emissions breakdown allows identification of thermal and electric decarbonization opportunities. |
| **Risk Management** | Paras 23–26 | Process to identify, assess, prioritize and monitor climate risks | Automated variance and anomaly detection highlights consumption surges across reporting periods. |
| **Metrics & Targets** | Paras 27–37 | Gross Scope 1, Scope 2 location-based, and Scope 2 market-based greenhouse gas emissions | Decimal calculation engine provides exact trace formula from activity invoice through factor to line item result. |

---

## 3. Evidence Gap Tracking & Limitations

- **No Self-Assurance:** CarbonOS generates structured data and evidence packages for independent third-party assurance practitioners. Software does not certify or assure regulatory compliance.
- **Data Gap Flags:** Where a mandatory disclosure requirement lacks supporting evidence documents, CarbonOS displays `DATA GAP — NOT REPORTED` rather than estimating or interpolating values without authorization.
