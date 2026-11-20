"""
Tenant-scoped, content-addressed evidence retention for utility bills.
Storage path: uploads/<tenant_id>/<sha256>.pdf
Gated behind ESG_RETAIN_SOURCE_DOCUMENTS (default: False).
Optional encryption at rest via ESG_STORAGE_ENCRYPTION_KEY.
"""
import base64
import hashlib
import os
from pathlib import Path
from typing import Optional

UPLOADS_DIR = Path(os.getenv("ESG_UPLOADS_DIR", Path(__file__).resolve().parent.parent / "uploads"))


def is_retention_enabled() -> bool:
    """True if source document retention is explicitly enabled via ESG_RETAIN_SOURCE_DOCUMENTS."""
    return os.getenv("ESG_RETAIN_SOURCE_DOCUMENTS", "false").lower() in ("true", "1", "yes")


def _get_aes_gcm():
    """Derives a 256-bit AES-GCM cipher from ESG_STORAGE_ENCRYPTION_KEY.
    In production environments, fails fast if the key is missing or invalid.
    """
    key = os.getenv("ESG_STORAGE_ENCRYPTION_KEY")
    is_prod = os.getenv("ESG_ENV") == "production" or os.getenv("ENVIRONMENT") == "production"
    if not key:
        if is_prod and is_retention_enabled():
            raise RuntimeError("ESG_STORAGE_ENCRYPTION_KEY must be configured in production environment when document retention is enabled")
        return None
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        key_bytes = hashlib.sha256(key.encode("utf-8")).digest()
        return AESGCM(key_bytes)
    except Exception as e:
        if is_prod:
            raise RuntimeError(f"Failed to initialize AES-GCM encryption in production: {e}")
        return None


def get_tenant_dir(tenant_id: str) -> Path:
    # Sanitize tenant_id to prevent path traversal
    safe_tenant = "".join(c for c in str(tenant_id) if c.isalnum() or c in ("-", "_"))
    if not safe_tenant or safe_tenant in (".", ".."):
        raise ValueError(f"Invalid tenant_id: {tenant_id}")
    tenant_dir = (UPLOADS_DIR / safe_tenant).resolve()
    base_dir = UPLOADS_DIR.resolve()
    if not tenant_dir.is_relative_to(base_dir):
        raise ValueError(f"Path traversal detected in tenant_id: {tenant_id}")
    return tenant_dir


import re as _re

_SHA256_RE = _re.compile(r"^[0-9a-f]{64}$")


def get_document_path(tenant_id: str, sha256: str) -> Path:
    # [COMMENTED OUT FOR PERSONAL REFERENCE — stripping non-alnum without length/hex validation allowed short/malformed path names]
    # safe_sha = "".join(c for c in sha256 if c.isalnum())
    # if not safe_sha:
    #     raise ValueError(f"Invalid sha256: {sha256}")
    normalized_sha = (sha256 or "").strip().lower()
    if not _SHA256_RE.fullmatch(normalized_sha):
        raise ValueError(f"Invalid sha256: {sha256}")
    tenant_dir = get_tenant_dir(tenant_id).resolve()
    base_dir = UPLOADS_DIR.resolve()
    if not tenant_dir.is_relative_to(base_dir):
        raise ValueError(f"Path traversal detected in tenant_id: {tenant_id}")
    doc_path = (tenant_dir / f"{normalized_sha}.pdf").resolve()
    if not doc_path.is_relative_to(tenant_dir):
        raise ValueError(f"Path traversal detected in sha256: {sha256}")
    return doc_path


def save_document(tenant_id: str, data: bytes, sha256: Optional[str] = None) -> Optional[Path]:
    """Saves document bytes content-addressed by SHA-256 under uploads/<tenant_id>/<sha256>.pdf.
    Encrypts at rest via AES-256-GCM if ESG_STORAGE_ENCRYPTION_KEY is set.
    Each write uses a fresh, random 12-byte nonce.
    Returns the file Path if saved, or None if retention is disabled.
    """
    if not is_retention_enabled():
        return None
    if sha256 is None:
        sha256 = hashlib.sha256(data).hexdigest()
    tenant_dir = get_tenant_dir(tenant_id)
    tenant_dir.mkdir(parents=True, exist_ok=True)
    file_path = get_document_path(tenant_id, sha256)

    payload = data
    aes = _get_aes_gcm()
    if aes:
        nonce = os.urandom(12)  # Unique 96-bit nonce
        aad = f"{file_path.parent.name}:{file_path.stem}".encode("utf-8")
        # ct = aes.encrypt(nonce, data, None)  # [COMMENTED OUT FOR PERSONAL REFERENCE — no AAD bound ciphertext to tenant/document]
        ct = aes.encrypt(nonce, data, aad)
        payload = nonce + ct

    file_path.write_bytes(payload)
    return file_path


def read_document(tenant_id: str, sha256: str) -> Optional[bytes]:
    """Reads and decrypts document bytes for the given tenant and sha256.
    Fails closed (returns None) on tampering, invalid key, or corrupted payload.
    Never falls back to CBC or returns unverified raw bytes.
    """
    try:
        file_path = get_document_path(tenant_id, sha256)
    except ValueError:
        return None

    if not file_path.exists():
        # [COMMENTED OUT FOR PERSONAL REFERENCE — prefix globbing could match unintended documents on short/colliding prefixes]
        # prefix = sha256[:12]
        # try:
        #     matches = list(get_tenant_dir(tenant_id).glob(f"{prefix}*.pdf"))
        #     if matches:
        #         file_path = matches[0]
        #     else:
        #         return None
        # except ValueError:
        #     return None
        return None

    raw = file_path.read_bytes()
    aes = _get_aes_gcm()
    if aes:
        if len(raw) < 28:  # 12-byte nonce + 16-byte GCM auth tag
            return None  # Fail closed on truncated file
        nonce = raw[:12]
        ct = raw[12:]
        aad = f"{file_path.parent.name}:{file_path.stem}".encode("utf-8")
        try:
            # return aes.decrypt(nonce, ct, None)  # [COMMENTED OUT FOR PERSONAL REFERENCE — unbound AAD]
            return aes.decrypt(nonce, ct, aad)
        except Exception:
            # FAIL CLOSED: Authentication failed or corrupted payload
            return None
    return raw


def delete_document(tenant_id: str, sha256: str) -> bool:
    """Hard-deletes document for compliance / right-to-erasure requests."""
    file_path = get_document_path(tenant_id, sha256)
    deleted = False
    if file_path.exists():
        file_path.unlink()
        deleted = True
    # [COMMENTED OUT FOR PERSONAL REFERENCE — prefix globbing could delete unrelated tenant files]
    # prefix = sha256[:12]
    # matches = list(get_tenant_dir(tenant_id).glob(f"{prefix}*.pdf"))
    # for m in matches:
    #     m.unlink()
    #     deleted = True
    return deleted


def document_exists(tenant_id: str, sha256: str) -> bool:
    file_path = get_document_path(tenant_id, sha256)
    if file_path.exists():
        return True
    # [COMMENTED OUT FOR PERSONAL REFERENCE — prefix globbing removed]
    # prefix = sha256[:12]
    # return bool(list(get_tenant_dir(tenant_id).glob(f"{prefix}*.pdf")))
    return False
