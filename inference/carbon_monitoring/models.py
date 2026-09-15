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

    # --- Prediction interval (part a) ---
    # Nullable: older rows predate this column and legitimately have no interval.
    # Never backfill these with a guess - NULL means "not computed", not zero.
    biomass_lower_90 = Column(Float, nullable=True)
    biomass_upper_90 = Column(Float, nullable=True)
    carbon_lower_90 = Column(Float, nullable=True)
    carbon_upper_90 = Column(Float, nullable=True)
    interval_method = Column(String(50), nullable=True)  # e.g. 'rf_tree_quantile'

    job = relationship("AnalysisJob", back_populates="result")
    provenance = relationship("EstimateProvenance", uselist=False, back_populates="result", cascade="all, delete-orphan")


class GroundTruthPlot(Base):
    """
    Part (b): real field measurements used to calibrate/validate the model.
    Every row here should represent an actual person who went to an actual
    location and measured actual trees - this table is what makes the model's
    accuracy claims real rather than asserted.
    """
    __tablename__ = 'carbon_mrv_groundtruthplot'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plot_name = Column(String(255), nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    plot_radius_m = Column(Float, default=15.0)  # field plot radius used for the measurement
    measured_biomass_mg_ha = Column(Float, nullable=False)
    measured_carbon_tc_ha = Column(Float, nullable=False)
    measurement_date = Column(Date, nullable=False)
    measurement_method = Column(String(100), nullable=False)  # e.g. 'destructive_sampling', 'allometric_field_inventory'
    collected_by = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    # Set true once this plot has been consumed by a successful recalibration run,
    # so re-running calibration doesn't need to guess what's new.
    used_in_training = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class EstimateProvenance(Base):
    """
    Part (c): immutable, hash-chained provenance record for every carbon estimate.
    This is the artifact you hand a VVB auditor - it answers "prove this number
    came from what you say it came from" without them having to trust the UI.

    Immutability is enforced at the application layer: no update/resolve/delete
    endpoint is ever exposed for this table (see router.py). In production,
    additionally revoke UPDATE/DELETE grants on this table for the app's DB role.
    """
    __tablename__ = 'carbon_mrv_estimateprovenance'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    result_id = Column(String(36), ForeignKey('farmers_ai_carbonresult.id', ondelete='CASCADE'), unique=True, nullable=False)

    data_source = Column(String(20), nullable=False)  # 'gee_live' or 'simulated' - never fudge this
    satellite_scene_ids = Column(Text, nullable=True)  # JSON list of Sentinel-2 system:index values
    gedi_tree_height_source = Column(String(50), nullable=False)  # honest label, see satellite.py

    model_type = Column(String(20), nullable=False)  # 'random_forest' or 'xgboost'
    model_version = Column(String(50), nullable=False)  # bumped by calibration.py on each promoted retrain
    model_trained_on = Column(String(50), nullable=False)  # 'synthetic-v1' or 'real-plots-blend-vN'

    feature_vector_json = Column(Text, nullable=False)  # exact inputs used, for full reproducibility
    geolocation_lat = Column(Float, nullable=False)
    geolocation_lng = Column(Float, nullable=False)

    record_hash = Column(String(64), nullable=False)       # sha256 of this record's own content
    previous_hash = Column(String(64), nullable=False)      # sha256 of the prior record, or 'GENESIS'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    result = relationship("CarbonResult", back_populates="provenance")



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
