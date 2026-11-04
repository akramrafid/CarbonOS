from pydantic import BaseModel, Field, field_validator
from typing import Annotated, List, Optional, Dict, Any, Literal

class Citation(BaseModel):
    source: str
    page: Optional[int] = None
    section: Optional[str] = None
    snippet: str
    relevance_score: float
    document_id: str = ''
    chunk_id: str = ''
    content_sha256: str = ''
    source_status: str = 'UNREVIEWED'

class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    is_demo: bool = False

class QueryRequest(BaseModel):
    # No tenant field: the tenant is derived from the authenticated membership.
    query: str = Field(..., min_length=1, max_length=2000)
    corpus: Optional[Literal['all', 'regulatory', 'emission_factors', 'tenant_docs']] = "all"
    top_k: Optional[int] = Field(5, ge=1, le=20)
    temperature: Optional[float] = 0.2
    document_ids: Optional[List[Annotated[str, Field(min_length=1, max_length=36)]]] = Field(None, min_length=1, max_length=2)

    @field_validator('document_ids')
    @classmethod
    def distinct_document_ids(cls, value):
        if value is not None and (len(value) != len(set(value)) or any(item != item.strip() for item in value)):
            raise ValueError('Choose distinct document identifiers without whitespace')
        return value

class QueryResponse(BaseModel):
    query_id: str = ''
    document_ids: Optional[List[str]] = None
    query: str
    answer: str
    confidence: float
    citations: List[Citation] = []
    corpus: str
    model_used: str
    insufficient_data: bool = False
    latency_ms: float
    answer_mode: str = 'retrieval_only'
    retrieval_method: str = 'bm25_vector_rrf'
    candidate_count: int = 0
    candidate_limit_reached: bool = False
    score_kind: str = 'ranking_score_not_probability'
    review_required: bool = True

class IngestResponse(BaseModel):
    document_id: str
    filename: str
    corpus: str
    chunks_created: int
    tenant_id: str
    duplicate: bool = False
    message: str

class ExtractedParameter(BaseModel):
    param_name: str # e.g. diesel, electricity, etc.
    value: float
    unit: str
    scope: str # Scope 1, Scope 2, Scope 3
    source_page: Optional[int] = None
    raw_snippet: str
    # Extraction-model confidence only (None for rule-based matches). Never a verification score.
    confidence: Optional[float] = None

class ExtractionResponse(BaseModel):
    filename: str
    document_id: Optional[str] = None  # stored source document (None for pasted text)
    tenant_id: str
    parameters: Dict[str, float]
    details: List[ExtractedParameter]
    overall_confidence: Optional[float] = None
    extraction_method: str
    model_used: Optional[str] = None
    extracted_at: str
    summary: str
    review_status: str = "REVIEW_REQUIRED"

class EmissionFactorItem(BaseModel):
    id: str
    category: str
    fuel_or_activity: str
    region: str
    factor_value: float
    unit: str
    source_citation: str
    confidence_rating: str
