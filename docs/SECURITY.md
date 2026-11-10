# CarbonOS Security Architecture & Cryptographic Controls

**Effective Date:** 2026-11-10  
**Status:** Enforced  
**Reference:** Verification Follow-Up Task 7  

---

## 1. Storage Encryption at Rest & Key Management

### Cryptographic Scheme: AES-256-GCM
- **Cipher:** Authenticated Encryption with Associated Data (AEAD) via `cryptography.hazmat.primitives.ciphers.aead.AESGCM`.
- **Key Derivation:** 256-bit key derived via `hashlib.sha256(ESG_STORAGE_ENCRYPTION_KEY.encode("utf-8")).digest()`.
- **Nonce Generation:** Every individual write generates a cryptographically secure, random 96-bit (12-byte) nonce via `os.urandom(12)`. Nonce reuse is mathematically impossible across writes.
- **Payload Layout:** Stored file binary layout is strictly `[12-byte Nonce] + [Ciphertext] + [16-byte GCM Authentication Tag]`.
- **Fail-Closed Verification:** On read, if the file is under 28 bytes or if the 16-byte authentication tag does not verify, `read_document()` returns `None`. Zero unauthenticated bytes are ever released, and the system **never falls back to unauthenticated ciphers such as CBC**.

### Production Fail-Fast Requirement
- When `ESG_ENV=production` or `ENVIRONMENT=production` and `ESG_RETAIN_SOURCE_DOCUMENTS=true`:
  - If `ESG_STORAGE_ENCRYPTION_KEY` is unset or empty, `save_document()` immediately raises `RuntimeError("ESG_STORAGE_ENCRYPTION_KEY must be configured in production environment when document retention is enabled")`.
  - The application strictly refuses to store unencrypted customer utility documents on disk in production environments.

### Key Rotation Procedure
To rotate the storage encryption key without downtime or data loss:
1. **Primary & Secondary Key Envelopes:**
   - Deploy the new primary key as `ESG_STORAGE_ENCRYPTION_KEY`.
   - Configure previous keys in `ESG_STORAGE_ENCRYPTION_KEYS_PREVIOUS` (comma-separated list).
2. **Decryption Fallback:**
   - `read_document()` attempts decryption using the primary key first.
   - If authentication fails, it iterates through `ESG_STORAGE_ENCRYPTION_KEYS_PREVIOUS` until a valid key decrypts and verifies the AEAD tag.
3. **Batch Re-encryption:**
   - Execute the re-encryption utility (`scripts/reencrypt_storage.py`) in the background. It reads each stored document, decrypts it using its legacy key, generates a fresh random 12-byte nonce, and re-encrypts under the current primary key.
4. **Decommissioning:**
   - Once all documents have been re-encrypted, remove `ESG_STORAGE_ENCRYPTION_KEYS_PREVIOUS` from the runtime environment.

---

## 2. API Authorization & Access Boundaries

| Endpoint | Unauthenticated | Read-Only Role (`executive_viewer`) | Cross-Tenant Request (Tenant B $\to$ Tenant A) |
| :--- | :--- | :--- | :--- |
| `GET /api/esg/bills/{bill_id}/gaps` | `401 Unauthorized` | `200 OK` (Allowed) | `404 Not Found` (Strictly Isolated) |
| `POST /api/esg/bills/{bill_id}/values` | `401 Unauthorized` | `403 Forbidden` (`write` required) | `404 Not Found` (Strictly Isolated) |
| `POST /api/esg/bills/{bill_id}/estimate` | `401 Unauthorized` | `200 OK` (Screening/Read) | `404 Not Found` (Strictly Isolated) |
| `GET /api/esg/bills/{bill_id}/document` | `401 Unauthorized` | `200 OK` (Allowed) | `404 Not Found` (Strictly Isolated) |
| `POST /api/esg/invitations` | `401 Unauthorized` | `403 Forbidden` (`admin` required) | `403 Forbidden` / `404 Not Found` |

---

## 3. Vulnerability Analysis: Multi-Account Self-Approval Bypass

### Audit Finding
In `inference/esg_rag/ledger.py`, dual-approval checks verify:
```python
if rec.created_by == principal.sub:
    raise DomainError("FORBIDDEN", "Author cannot approve their own activity")
```
and
```python
if run.created_by == principal.sub:
    raise DomainError("FORBIDDEN", "Preparer cannot lock their own calculation run")
```
An administrator (`user-alice`) can invite an alternate personal or corporate email (`alice-alt@example.com`) via `POST /api/esg/invitations` with role `esg_admin`. When Alice logs in using that second identity (having `sub="alice-second-id"`), the application treats `alice-second-id` as an independent user. Because `rec.created_by ("admin-a") != principal.sub ("alice-second-id")`, **the single physical person successfully approves their own activities and locks their own accounting periods**.

This vulnerability was proven and confirmed by test `test_multi_account_self_approval_vulnerability` in `tests/test_esg_authorization.py`.

### Proposed Controls (Do Not Implement Yet)
1. **Corporate Domain Matching & Whitelisting:**
   - Restrict invitations to email addresses sharing the verified organization domain (e.g., `@dexterity.com`), completely rejecting public webmail domains (`@gmail.com`, `@yahoo.com`, `@outlook.com`).
2. **Enterprise IdP / SCIM SSO Provisioning:**
   - In production, disable self-serve token invitations. Provision memberships exclusively via corporate Identity Providers (SAML 2.0 / OIDC with SCIM), enforcing Single Identity per employee.
3. **Invitation Ancestry / Anti-Collusion Constraint:**
   - Enforce that a user cannot approve records created by the user who invited them, nor can a user approve records created by their invitees (`rec.created_by != inv.invited_by`).
4. **Session / Device Fingerprint Correlation:**
   - Correlate client IP, TLS JA3/JA4 fingerprint, and browser device signatures. If the record author and the approver share identical fingerprints within a 24-hour window, flag for external audit or require step-up MFA.
