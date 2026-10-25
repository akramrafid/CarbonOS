# CarbonOS ESG SaaS — External Approvals & Regulatory Gate Register

**Notice:** This document explicitly tracks regulatory, scientific, and operational gates required before live commercial client confidential data processing. Software completeness does not substitute for qualified human assurance.

---

## 1. Required External Approvals & Pre-Requisites

| Gate ID | Domain | Prerequisite Description | Gate Status | Required Action / Approver |
|---|---|---|---|---|
| **GATE-AUTH-01** | **Identity Provider** | Integration of enterprise OIDC identity provider (Okta, Keycloak, Microsoft Entra ID) with multi-factor authentication (MFA) and verified organizational domains. | **PENDING OIDC CONFIGURATION** | Enterprise client IT administrator must provision client ID, secrets, and JWKS URI. |
| **GATE-SCI-02** | **Scientific Methodology Review** | Independent validation of decimal arithmetic calculation formulas, GWP indices (IPCC AR5 vs AR6), and Bangladesh grid emission factor application by a qualified GHG inventory practitioner (e.g. ISO 14064 lead verifier). | **PENDING QUALIFIED REVIEW** | Certified environmental engineering audit firm must review and sign off on methodology. |
| **GATE-REG-03** | **Regulatory Accreditation** | Formal registration or recognition of calculation models with Bangladesh Department of Environment (DoE) and Sustainable and Renewable Energy Development Authority (SREDA). | **PENDING REGULATORY LIAISON** | Corporate legal & regulatory team. |
| **GATE-LEGAL-04** | **Data Privacy & Tenancy DPA** | Data Processing Agreement (DPA) governing utility invoice storage, telemetry logs, and tenant isolation guarantees under the Bangladesh Cyber Security Act and GDPR. | **PENDING LEGAL SIGN-OFF** | Corporate legal counsel. |
| **GATE-SEC-05** | **Independent Penetration Test** | Third-party grey-box web application penetration testing covering tenancy leakage, IDOR, SSRF, and file upload safety. | **PENDING EXTERNAL AUDIT** | CREST-accredited cybersecurity testing agency. |

---

## 2. Prohibition of Misleading Claims

To ensure compliance with anti-greenwashing regulations and professional engineering standards:
1. **No False Certifications:** The platform must never print labels such as "ISO 14064 Certified", "DoE Approved", or "Audited & Assured" on any report or dashboard view unless formal third-party assurance has occurred and is documented.
2. **Demo Mode Watermark:** In `ESG_ACCESS_MODE=isolated_demo`, all views, screens, and downloadable reports must display the persistent label:  
   `DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED`
3. **Segregation of Duties:** Demo persona switching simulates dual control for testability, but reports generated in demo mode must state `Dual-control simulated via demo persona switching; not an independent human verification`.
