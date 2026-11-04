"""SQL document visibility shared by retrieval, inspection and evidence references."""
from sqlalchemy import or_
from .config import CORPUS_TENANT_DOCS, GLOBAL_CORPUS_OWNER
from .models import ESGDocument


def visible_document_filter(organization_id):
    clauses = [(ESGDocument.corpus == corpus) & (ESGDocument.tenant_id == owner)
               for corpus, owner in GLOBAL_CORPUS_OWNER.items()]
    if organization_id and str(organization_id).strip():
        clauses.append((ESGDocument.corpus == CORPUS_TENANT_DOCS) & (ESGDocument.tenant_id == organization_id))
    return or_(False, *clauses)
