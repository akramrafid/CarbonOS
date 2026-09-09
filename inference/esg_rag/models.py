from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from carbon_monitoring.database import Base
import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class ESGDocument(Base):
    __tablename__ = 'esg_rag_document'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(100), nullable=False, default="default_tenant", index=True)
    corpus = Column(String(50), nullable=False, index=True) # regulatory, emission_factors, tenant_docs
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), default="text")
    file_size = Column(Integer, default=0)
    checksum = Column(String(64), nullable=True) # SHA-256
    chunk_count = Column(Integer, default=0)
    meta_info = Column(JSON, nullable=True) # author, jurisdiction, year, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chunks = relationship("ESGChunk", back_populates="document", cascade="all, delete-orphan")


class ESGChunk(Base):
    __tablename__ = 'esg_rag_chunk'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey('esg_rag_document.id', ondelete='CASCADE'), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String(255), nullable=True)
    vector_id = Column(String(100), nullable=True) # ChromaDB ID reference
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("ESGDocument", back_populates="chunks")


class ESGQueryLog(Base):
    __tablename__ = 'esg_rag_querylog'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(100), nullable=False, default="default_tenant", index=True)
    corpus = Column(String(50), nullable=False)
    query_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    citations = Column(JSON, nullable=True)
    retrieved_chunk_ids = Column(JSON, nullable=True)
    latency_ms = Column(Float, default=0.0)
    llm_model = Column(String(50), default="gemini-2.5-flash")
    verified_by_audit = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class EmissionFactorRecord(Base):
    __tablename__ = 'esg_emission_factors'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(50), nullable=False) # scope1, scope2, scope3
    fuel_or_activity = Column(String(100), nullable=False, index=True)
    region = Column(String(100), default="Bangladesh")
    factor_value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False) # kg CO2e / Liter, kg CO2e / kWh, etc.
    source_citation = Column(String(255), nullable=False) # e.g. DoE Bangladesh Grid EF 2023, IPCC AR6
    year = Column(Integer, default=2024)
    confidence_rating = Column(String(20), default="Tier 2 - National")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
