from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Citation(BaseModel):
    source: str
    page: Optional[int] = None
    section: Optional[str] = None
    snippet: str
    relevance_score: float

class QueryRequest(BaseModel):
    query: str
    corpus: Optional[str] = "all" # regulatory, emission_factors, tenant_docs, or all
    tenant_id: Optional[str] = "default_tenant"
    top_k: Optional[int] = 5
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
    message: str

class ExtractedParameter(BaseModel):
    param_name: str # e.g. diesel, electricity, etc.
    value: float
    unit: str
    scope: str # Scope 1, Scope 2, Scope 3
    source_page: Optional[int] = 1
    raw_snippet: str
    confidence: float

class ExtractionResponse(BaseModel):
    filename: str
    tenant_id: str
    parameters: Dict[str, float]
    details: List[ExtractedParameter]
    overall_confidence: float
    audit_seal: bool
    verified_at: str
    summary: str

class EmissionFactorItem(BaseModel):
    id: str
    category: str
    fuel_or_activity: str
    region: str
    factor_value: float
    unit: str
    source_citation: str
    confidence_rating: str
