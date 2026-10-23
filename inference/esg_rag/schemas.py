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
    source_page: Optional[int] = 1
    raw_snippet: str
    confidence: float

class CategoryMetric(BaseModel):
    id: str
    name: str
    icon: Optional[str] = "zap"
    spend_bdt: float
    carbon_kg: float
    carbon_tonnes: float
    percentage: float
    scope: str
    unit: str
    quantity: float
    emission_factor: float
    factor_citation: str
    status: Optional[str] = "verified"

class TopImpactCategory(BaseModel):
    rank: int
    id: str
    name: str
    carbon_kg: float
    carbon_tonnes: float
    percentage: float

class ExtractionResponse(BaseModel):
    filename: str
    tenant_id: str
    parameters: Dict[str, float]
    details: List[ExtractedParameter]
    overall_confidence: float
    audit_seal: bool
    verified_at: str
    summary: str
    total_footprint_kg: Optional[float] = None
    total_footprint_tonnes: Optional[float] = None
    total_spend_bdt: Optional[float] = None
    trend_vs_last_month: Optional[float] = -8.0
    categories: Optional[List[CategoryMetric]] = None
    top_impact_categories: Optional[List[TopImpactCategory]] = None
    quick_tips: Optional[List[str]] = None

class EmissionFactorItem(BaseModel):
    id: str
    category: str
    fuel_or_activity: str
    region: str
    factor_value: float
    unit: str
    source_citation: str
    confidence_rating: str
