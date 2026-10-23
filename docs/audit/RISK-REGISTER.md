# CarbonOS Bangladesh — Risk Register & Mitigation Strategy (Phase Zero)

**Document Ref:** `docs/audit/RISK-REGISTER.md`  
**Audit Date:** 2026-10-24  
**Risk & Compliance Lead:** Principal Site Reliability Engineer & Compliance Officer  

---

## 1. Risk Matrix & Scoring Framework

- **Risk Score** = Impact (1-5) × Likelihood (1-5)
- **Score 15 - 25:** Critical Risk (Immediate P0 engineering action required)
- **Score 8 - 14:** High / Moderate Risk (P1 scheduled remediation)
- **Score 1 - 7:** Low Risk (Monitored / Technical debt backlog)

---

## 2. Active Risk Register

| Risk ID | Category | Description | Impact (1-5) | Likelihood (1-5) | Risk Score | Mitigation Strategy & Ownership | Status |
|---|---|---|---|---|---|---|---|
| **RSK-01** | **Security** | Hardcoded Blynk IoT token in frontend bundle (`MRVDashboard.jsx:148`, `LiveMetrics.jsx:69`) allows unauthorized hardware tampering or telemetry spoofing. | 5 | 5 | **25 (Critical)** | Remove token from source code immediately; route telemetry through backend proxy; notify project owner to reset device auth token in Blynk Console. | **MITIGATION IN PROGRESS** |
| **RSK-02** | **Compliance** | National Registry Bridge sandbox mode returns `"status": "ACCEPTED"`, creating false perception of official DoE Bangladesh government approval. | 5 | 4 | **20 (Critical)** | Enforce strict status hierarchy: `SANDBOX_ACCEPTED` vs `PRODUCTION_ACCEPTED`. Add mandatory `data_origin = "simulation"` tag on all mock responses. | **MITIGATION IN PROGRESS** |
| **RSK-03** | **Integration** | Service port inversion in `farmers_ai/views.py:12` (points to 8001 instead of 8000) causes 100% failure rate for cloud crop diagnostic requests. | 4 | 5 | **20 (Critical)** | Correct `FASTAPI_URL` to point to port 8000; align frontend default ports; add automated contract regression test. | **MITIGATION IN PROGRESS** |
| **RSK-04** | **Privacy** | Vector search in ChromaDB without mandatory `tenant_id` filter could expose confidential ESG bills and facility footprints to competing enterprises. | 5 | 3 | **15 (Critical)** | Enforce `where={"tenant_id": current_tenant}` filter at the repository query boundary; reject any RAG query lacking an authenticated tenant identifier. | **PLANNED P0** |
| **RSK-05** | **Legal** | Marketing copy or UI claims of "Verra Certified" or "DoE Approved" could trigger regulatory scrutiny or legal sanctions for greenwashing. | 5 | 3 | **15 (Critical)** | Audit all public copy to clarify that CarbonOS implements methodology alignment (e.g., VM0042, DoE 0.550 kg/kWh) as a software pilot, not a certifying body. | **PLANNED P0** |
| **RSK-06** | **Scientific** | Satellite vegetation pipeline generating synthetic spectral bands during Copernicus outage without explicit disclosure to enterprise ESG auditors. | 4 | 3 | **12 (High)** | Mark all synthetic calculations with `data_origin = "synthetic_spectral_grid"` and render visible simulation badges on map overlays. | **PLANNED P1** |
| **RSK-07** | **Operational** | SQLite single-writer lock contention during concurrent enterprise utility bill OCR and telemetry streaming leading to 500 server crashes. | 3 | 4 | **12 (High)** | Support PostgreSQL connection string via `DATABASE_URL` (`dj_database_url`) and provide connection pooling instructions. | **PLANNED P1** |
| **RSK-08** | **Integrity** | Fallback sensor readings in `LiveMetrics.jsx` labeled as "verified local sensor cache", misleading users about hardware status. | 3 | 4 | **12 (High)** | Relabel fallback banner to "Hardware Gateway Offline — Reference Baseline (Simulated)". | **MITIGATION IN PROGRESS** |
| **RSK-09** | **Financial** | Marketplace demo allows purchasing carbon credits and displays fake certificates without bank escrow or legal retirement validation. | 4 | 2 | **8 (Moderate)** | Display permanent demo sandbox warning banner and restrict purchase button to `SIMULATED_RESERVATION`. | **PLANNED P1** |
