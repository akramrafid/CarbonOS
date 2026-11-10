# CarbonOS (Carbon Zero) — Data Handling & Privacy Policy

**Effective Date:** 2026-11-07  
**System:** CarbonOS ESG Utility Ingestion & Ledger Engine  
**Compliance Standards:** Bangladesh Data Protection Guidelines, ISO 14064-3, GHG Protocol Corporate Standard, GDPR Principles.

---

## 1. Executive Summary & Privacy-First Architecture

Carbon Zero processes sensitive enterprise utility bills (electricity, natural gas, captive diesel receipts, generator logs, water withdrawal records) for industrial and commercial facilities in Bangladesh.

### Core Privacy Guarantees
1. **Local-Only Processing**: PDF parsing (`pdfplumber`) and optical character recognition (`pytesseract` with `ben+eng`) run strictly inside the local deployment environment. Documents, invoices, and sensitive operational figures are **never** transmitted to external cloud OCR APIs, third-party LLMs, or public services.
2. **Deterministic Computation**: Calculations run in deterministic Python. The LLM never computes emissions, fills numbers, or stores confidential invoice text.
3. **Zero Secret / Document Text Logging**: Application logs and transcripts strictly forbid logging secrets, raw document text, or personally identifiable information.

---

## 2. Evidence Retention Policy (`ESG_RETAIN_SOURCE_DOCUMENTS`)

### Default Configuration: `ESG_RETAIN_SOURCE_DOCUMENTS=false`

> [!IMPORTANT]
> **FLAGGED FOR DECISION: Current Default is `false`**  
> By default, CarbonOS operates under a **zero-retention** model:
> - The uploaded PDF/image file is parsed entirely in-memory.
> - The file's cryptographic hash (`SHA-256`), word-level bounding boxes (`bbox`), and normalized numbers are extracted and stored.
> - The source binary file is **immediately discarded** from memory and is **never written to disk**.
>
> **Implications of the Default (`false`):**
> - *Privacy Benefit:* Minimal data liability. A security breach of the server storage cannot compromise raw utility bill images or confidential customer billing histories.
> - *Auditing Trade-off:* If a third-party assurance auditor (e.g., UNFCCC, Gold Standard, Verra, or ISO 14064 verifier) demands visual inspection of the original PDF document rather than the cryptographic SHA-256 seal and extracted line-item coordinates, the original file cannot be re-downloaded.

### Enabling Retention (`ESG_RETAIN_SOURCE_DOCUMENTS=true`)
When evidence retention is required for compliance or verification:
- Set environment variable `ESG_RETAIN_SOURCE_DOCUMENTS=true`.
- Uploaded source documents are saved to tenant-scoped, content-addressed storage.

---

## 3. Storage Architecture & Tenant Isolation

When retention is enabled:
- **Tenant-Scoped Paths:** Documents are partitioned strictly by organization identifier:
  ```
  uploads/<tenant_id>/<sha256>.pdf
  ```
- **Path Traversal Protection:** Tenant IDs and SHA-256 hashes are strictly sanitized to alphanumeric, dash, and underscore characters before path resolution.
- **Content-Addressed Deduplication:** The storage filename is the cryptographic `SHA-256` of the file contents. Redundant uploads of identical files consume zero additional storage.
- **Encryption at Rest:**
  - If `ESG_STORAGE_ENCRYPTION_KEY` is configured in the environment, all retained documents are encrypted using AES symmetric encryption (`Fernet`) before being written to disk.
  - Raw binary files on disk cannot be read without the runtime encryption key.
  - The API automatically decrypts and streams the original document over authenticated TLS connections.

---

## 4. Access Control & Immutable Audit Trail

Document access is enforced at the API boundary:
- **Tenant Authorization:** Callers must present a valid JWT bearer token and be an active member of the tenant organization (`esg_membership`). Cross-tenant access attempts immediately fail with `404 Not Found` (preventing tenant enumeration).
- **Audit Logging:** Every document action generates an append-only, tamper-evident record in `esg_audit_event`:
  - `bill_document.retain`: Triggered upon initial upload and storage, recording document SHA-256 and timestamp.
  - `bill_document.read`: Triggered whenever an authorized user views or downloads the source PDF.
  - `bill_document.delete`: Triggered when a document is permanently erased.

---

## 5. Right to Erasure & Compliance Deletion

Under privacy regulations and enterprise data governance:
- **Hard Erasure Endpoint:** `DELETE /api/esg/bills/{bill_id}/document`
- **Behavior:**
  - Permanently unlinks and deletes `uploads/<tenant_id>/<sha256>.pdf` from physical storage.
  - Future download requests return `404 Not Found`.
  - The bill's extracted figures, GHG ledger postings, and cryptographic seal remain intact for accounting integrity, but the underlying source document file is purged.
  - Deletion event is logged to `esg_audit_event` with caller identity and timestamp.

---

## 6. Verification Checklist for Operators

| Setting / Variable | Recommended Production Value | Description |
| :--- | :---: | :--- |
| `ESG_RETAIN_SOURCE_DOCUMENTS` | `false` (default) or `true` | Set `true` only if third-party auditors require original PDF retention. |
| `ESG_STORAGE_ENCRYPTION_KEY` | 32-byte high-entropy string | Enables AES encryption at rest for all retained files. |
| `ESG_UPLOADS_DIR` | Dedicated secured mount point | Path to tenant uploads directory (restricted OS filesystem permissions). |
| `ESG_ACCESS_MODE` | `protected` | Enforces mandatory JWT authentication and tenant membership. |
