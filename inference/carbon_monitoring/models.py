from sqlalchemy import Column, String, Float, Boolean, DateTime, Date, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class AnalysisJob(Base):
    __tablename__ = 'farmers_ai_analysisjob'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    status = Column(String(50), default='pending')
    polygon_geojson = Column(Text, nullable=False)
    analysis_type = Column(String(50), default='ndvi')
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    processing_time = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    result = relationship("CarbonResult", uselist=False, back_populates="job", cascade="all, delete-orphan")
    layers = relationship("SatelliteLayer", back_populates="job", cascade="all, delete-orphan")
    reports = relationship("CarbonReport", back_populates="job", cascade="all, delete-orphan")


class CarbonResult(Base):
    __tablename__ = 'farmers_ai_carbonresult'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey('farmers_ai_analysisjob.id', ondelete='CASCADE'), unique=True, nullable=False)
    estimated_biomass = Column(Float, nullable=False)
    estimated_carbon = Column(Float, nullable=False)
    tonnes_co2e = Column(Float, nullable=False)
    avg_ndvi = Column(Float, nullable=False)
    forest_area_ha = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    satellite_sources = Column(String(255), default='Sentinel-2')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("AnalysisJob", back_populates="result")


class SatelliteLayer(Base):
    __tablename__ = 'farmers_ai_satellitelayer'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey('farmers_ai_analysisjob.id', ondelete='CASCADE'), nullable=False)
    layer_type = Column(String(50), nullable=False)
    layer_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("AnalysisJob", back_populates="layers")


class UploadedBoundary(Base):
    __tablename__ = 'farmers_ai_uploadedboundary'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    boundary_data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class CarbonReport(Base):
    __tablename__ = 'farmers_ai_carbonreport'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey('farmers_ai_analysisjob.id', ondelete='CASCADE'), nullable=False)
    project_name = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)
    file_path = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("AnalysisJob", back_populates="reports")


class CarbonAlert(Base):
    __tablename__ = 'farmers_ai_carbonalert'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    message = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
