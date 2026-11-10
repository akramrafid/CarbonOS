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


def _get_fernet():
    key = os.getenv("ESG_STORAGE_ENCRYPTION_KEY")
    if not key:
        return None
    try:
        from cryptography.fernet import Fernet
        if len(key) == 32:
            key_b64 = base64.urlsafe_b64encode(key.encode("utf-8")).decode("utf-8")
        elif len(key) == 44 and key.endswith("="):
            key_b64 = key
        else:
            key_b64 = base64.urlsafe_b64encode(hashlib.sha256(key.encode("utf-8")).digest()).decode("utf-8")
        return Fernet(key_b64.encode("utf-8"))
    except Exception:
        return None


def get_tenant_dir(tenant_id: str) -> Path:
    # Sanitize tenant_id to prevent path traversal
    safe_tenant = "".join(c for c in str(tenant_id) if c.isalnum() or c in ("-", "_"))
    return UPLOADS_DIR / safe_tenant


def get_document_path(tenant_id: str, sha256: str) -> Path:
    safe_sha = "".join(c for c in sha256 if c.isalnum())
    return get_tenant_dir(tenant_id) / f"{safe_sha}.pdf"


def save_document(tenant_id: str, data: bytes, sha256: Optional[str] = None) -> Optional[Path]:
    """Saves document bytes content-addressed by SHA-256 under uploads/<tenant_id>/<sha256>.pdf.
    Encrypts at rest if ESG_STORAGE_ENCRYPTION_KEY is set.
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
    f = _get_fernet()
    if f:
        payload = f.encrypt(data)

    file_path.write_bytes(payload)
    return file_path


def read_document(tenant_id: str, sha256: str) -> Optional[bytes]:
    """Reads and decrypts document bytes for the given tenant and sha256."""
    file_path = get_document_path(tenant_id, sha256)
    if not file_path.exists():
        prefix = sha256[:12]
        matches = list(get_tenant_dir(tenant_id).glob(f"{prefix}*.pdf"))
        if matches:
            file_path = matches[0]
        else:
            return None

    raw = file_path.read_bytes()
    f = _get_fernet()
    if f:
        try:
            return f.decrypt(raw)
        except Exception:
            return raw
    return raw


def delete_document(tenant_id: str, sha256: str) -> bool:
    """Hard-deletes document for compliance / right-to-erasure requests."""
    file_path = get_document_path(tenant_id, sha256)
    deleted = False
    if file_path.exists():
        file_path.unlink()
        deleted = True
    prefix = sha256[:12]
    matches = list(get_tenant_dir(tenant_id).glob(f"{prefix}*.pdf"))
    for m in matches:
        m.unlink()
        deleted = True
    return deleted


def document_exists(tenant_id: str, sha256: str) -> bool:
    file_path = get_document_path(tenant_id, sha256)
    if file_path.exists():
        return True
    prefix = sha256[:12]
    return bool(list(get_tenant_dir(tenant_id).glob(f"{prefix}*.pdf")))
