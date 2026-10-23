# CarbonOS Bangladesh — Data Authenticity & Simulation Register (Phase Zero)

**Document Ref:** `docs/audit/DATA-AUTHENTICITY-REGISTER.md`  
**Audit Date:** 2026-10-24  
**Auditor:** Remote Sensing Scientist & Scientific Integrity Lead  

---

## 1. Operating Principle & Strict Mandate

> **NON-NEGOTIABLE PRINCIPLE:** Every consequential output must be either genuinely computed and supported by evidence, explicitly marked as an estimate, or clearly labeled as simulated. Never fabricate carbon credits, regulatory approvals, satellite observations, customer relationships, payment confirmations, scientific validation, certifications, or operational statistics.

This register catalogs all locations where synthetic, randomized, or simulated data is generated, stored, or rendered, ensuring that no simulation can accidentally appear to end-users or enterprise auditors as real operational results.

---

## 2. Register of Simulated & Mock Data Locations

| ID | Subsystem | Code Location | Observed Simulation Behavior | User Perception Risk | Required Remediation & Machine-Readable Tag |
|---|---|---|---|---|---|
| **DAR-01** | National Registry Bridge | `backend/national_registry_bridge/registry_client.py:260-271` | When `sandbox_mode=True`, returns `"status": "ACCEPTED"`, `"message": "MRV monitoring report validated and ingested into National Registry ledger."`, and simulated submission ID `SUB-BD-...`. | **HIGH**: User or regulator might believe a carbon project was officially accepted by Bangladesh Department of Environment. | Change status to `"status": "SANDBOX_ACCEPTED"`; add `"data_origin": "simulation"`, `"is_official_government_approval": False`, and `"simulated_environment": "DOE_SANDBOX_V2"`. |
| **DAR-02** | IoT Sensor Telemetry | `src/components/LiveMetrics.jsx:120-130` | If direct Blynk polling fails, sets `temp: 29.2, hum: 68.5, air: 114, co2: 424` with message `"Displaying verified local sensor cache."` | **MEDIUM**: Users assume live hardware readings or real cached sensor packets when data is hardcoded fallback. | Update message to `"Hardware Gateway Offline — Reference Baseline (Simulated)"`; add `is_simulated: true` to state and render yellow SIMULATION badge. |
| **DAR-03** | Satellite dMRV Inference | `inference/carbon_monitoring/router.py:260-275` | Uses `random.random() < 0.20` for disturbance detection and generates synthetic Sentinel-2 band arrays when Copernicus STAC is unreachable. | **HIGH**: An enterprise might report synthetic satellite vegetation measurements as verified ground-truth biomass. | Tag all synthetic tensor calculations with metadata: `data_origin = "synthetic_spectral_grid"`, `copernicus_available = False`, `is_empirical_measurement = False`. |
| **DAR-04** | Carbon Credit Marketplace | `src/pages/Marketplace.jsx:110-180` | "Buy Credits" button generates client-side UUID, decrements local inventory, and displays "Purchase Complete! Certificate Issued" without contacting a bank or payment processor. | **HIGH**: Enterprise buyers might claim carbon offsets purchased on a demo interface as real corporate retirements. | Add permanent top warning banner: `"DEMO / SANDBOX MARKETPLACE — ALL TRANSACTIONS ARE SIMULATED. NO REAL FUNDS ARE DEBITED AND NO REGISTERED CREDITS ARE ISSUED."` Require transaction status: `SIMULATED_RESERVATION`. |
| **DAR-05** | Smallholder Farmer Payouts | `src/pages/farmers-ai/DiagnosisResult.jsx`, `FarmerJournal.jsx` | Shows mock bKash mobile money payout notifications ("৳ 4,500 transferred to 017XXXXXX") for AWD carbon credit yield. | **CRITICAL**: Promising real money or asserting that funds were disbursed when no banking API was invoked. | Ensure payout state reads `SANDBOX_SIMULATED_ACCRUAL`; add clear disclaimer in Bangla: `"এটি একটি প্রদর্শনী সিমুলেশন। প্রকৃত ব্যাংক বা বিকাশ অ্যাকাউন্টে কোনো টাকা পাঠানো হয়নি।"`. |
| **DAR-06** | Ed25519 Cryptographic Keys | `src/pages/platform/CarbonMonitoring.jsx` | Historically generated random mock hex strings or ephemeral Ed25519 keys in browser local storage. | **MEDIUM**: Simulated signature text could be confused with a cryptographically verified server-side provenance chain. | Key generation moved strictly to backend HSM/server environment; verify public key ownership against server-side ledger. |
| **DAR-07** | ESG Utility Bill OCR | `src/pages/platform/ESGReporting.jsx:140-195` | Simulated OCR extraction extracts pre-baked DPDC / TITAS gas consumption figures when LLM fails or sample bill is uploaded. | **MEDIUM**: User may commit pre-baked demonstration numbers into corporate GHG inventory. | Require explicit human reviewer verification step (`is_verified_by_reviewer: false`) before committing values to the emissions ledger. |
| **DAR-08** | Regulatory Accreditation Claims | `src/pages/Home.jsx:220-290` | Marketing copy mentions "DoE Approved", "Verra Certified dMRV", "SREDA Verified". | **HIGH**: Regulatory and commercial legal misrepresentation. | Clarify copy: "Designed in alignment with Bangladesh DoE Grid Emission Factor (0.550 kg/kWh) and Verra VM0042 methodology principles. Sandbox pilot demonstration." |

---

## 3. Enforcement Guidelines for All Engineers

1. **Standard Serialization Header for All API Responses:**
   Every API endpoint returning non-empirical data must include:
   ```json
   {
     "data_origin": "simulation",
     "is_simulated": true,
     "simulation_disclaimer": "This data was generated in a local sandbox environment and does not represent empirical field measurements or legal credit issuance."
   }
   ```

2. **Frontend UI Badge Protocol:**
   Any UI view rendering data with `data_origin === "simulation"` or `is_simulated === true` must display the standard CarbonOS Simulation Tag:
   ```jsx
   <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
     SIMULATED SANDBOX DATA
   </span>
   ```
