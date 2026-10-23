# CarbonOS Bangladesh — National Carbon Registry Readiness & Bridge Report

**Document Ref:** `docs/transformation/REGISTRY-READINESS.md`  
**Subsystem:** National Registry Bridge & International Export Gateway  
**Status:** `AUDITED_AND_HARDENED_IN_SANDBOX`  
**Latest Baseline Commit:** `61e1263`  

---

## 1. Registry Bridge Architecture (`backend/national_registry_bridge/`)

The National Carbon Registry Bridge serves as the sovereign integration gateway between enterprise monitoring projects in Bangladesh and national/international carbon accounting authorities.

### 1.1 Supported Export Standards
1. **Article 6.2 ITMO (Internationally Transferred Mitigation Outcomes):**
   - Implements structured bilateral transfer manifests with Corresponding Adjustments (CA) tracking.
   - Prevents double-claiming between host and buyer national inventories under UNFCCC rules.
2. **Joint Crediting Mechanism (JCM):**
   - Bilateral documentation format compliant with Bangladesh-Japan environmental cooperation frameworks.
3. **Verra VM0047 ARR Methodology:**
   - Digital submission payloads capturing verified aboveground biomass gains, buffer deductions, and project boundaries.

---

## 2. Rigorous Status Lifecycle & Non-Negotiable Invariants

To prevent confusing developer tests or sandbox simulations with genuine government approvals, CarbonOS strictly enforces unambiguous lifecycle states:

```
[ LOCAL_DRAFT ]
       │  (Project developer drafts monitoring and allometric data)
       ▼
[ SANDBOX_SUBMITTED ] ──── (Developer testing environment)
       │
       ▼
[ SANDBOX_ACCEPTED ]  ──── (Explicitly tagged: data_origin="simulation", NOTICE displayed)
       │
═══════╪═════════════════════════════════════════════════════════════════════════════
       │  (Production Gate: Authenticated credentials, signed dMRV provenance,
       │   third-party validation & Ministry authorization required)
       ▼
[ PRODUCTION_SUBMITTED ]
       │
  ┌────┴──────────────────────────┐
  ▼                               ▼
[ REJECTED ]            [ PRODUCTION_ACCEPTED ]
                                  │
                                  ▼
                            [ VERIFIED ]
                                  │
                                  ▼
                            [ RETIRED ]
```

---

## 3. Remediated Sandbox Vulnerability

- **Previous Hazard:** In `backend/national_registry_bridge/views.py`, mock bridge submissions returned:
  `{"status": "ACCEPTED", "transaction_hash": "0x4f...9a"}`
  This created a dangerous impression that an official government carbon credit had been minted or approved.
- **Hardening Applied (Commit `a509358`):**
  - Updated status to `SANDBOX_ACCEPTED`.
  - Injected mandatory metadata: `"data_origin": "simulation"`.
  - Added explicit legal notice:
    `"notice": "Simulated local sandbox record. Not an official UNFCCC or Bangladesh Ministry approval."`
  - Tagged transaction hash with `SANDBOX-MOCK-TX-...`.
- **Test Evidence:** Verified in `backend/national_registry_bridge/tests.py` and `tests/test_dmrv_v2.py`.

---

## 4. Operational & Legal Constraints

1. **Authorization Boundary:** CarbonOS does NOT represent itself as the sovereign Government of Bangladesh or the Ministry of Environment, Forest and Climate Change (MoEFCC).
2. **Third-Party Validation:** Carbon credits cannot transition to `VERIFIED` without an authenticated, cryptographic signature from an accredited Designated Operational Entity (DOE) / VVB auditor.
3. **Double Counting Prevention:** All credits retired on the platform must be marked with permanent serial numbers preventing re-listing or secondary sale.
