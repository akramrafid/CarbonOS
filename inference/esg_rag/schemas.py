from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Citation(BaseModel):
    source: str
    page: Optional[int] = None
    section: Optional[str] = None
    snippet: str
    relevance_score: float

class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    is_demo: bool = False

class QueryRequest(BaseModel):
    # No tenant field: the tenant is derived from the authenticated membership.
    query: str = Field(..., min_length=1, max_length=2000)
    corpus: Optional[str] = "all" # regulatory, emission_factors, tenant_docs, or all
    top_k: Optional[int] = Field(5, ge=1, le=20)
    temperature: Optional[float] = 0.2

class QueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    citations: List[Citation] = []
    corpus: str
    model_used: str
    insufficient_data: bool = False
    latency_ms: float

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
    tenant_id: str
    parameters: Dict[str, float]
    details: List[ExtractedParameter]
    overall_confidence: Optional[float] = None
    extraction_method: str
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
