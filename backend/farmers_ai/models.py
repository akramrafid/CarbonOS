from django.db import models
import uuid

class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    species = models.CharField(max_length=100)
    disease = models.CharField(max_length=100)
    confidence = models.FloatField()
    severity = models.CharField(max_length=50)
    needs_agronomist_review = models.BooleanField(default=False)
    field_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Phase V2: Carbon Asset Risk (For Tier B fruit trees)
    carbon_asset_risk = models.BooleanField(default=False, help_text="True if a Tier B tree has moderate/severe disease")
    region = models.CharField(max_length=100, default="unknown", help_text="Upazila/Region for MRV aggregation")
    
    # Phase V5: Auditability
    model_version = models.CharField(max_length=50, default="v1.0.0-int8")
    treatment_shown = models.TextField(blank=True, null=True)
    weather_snapshot = models.ForeignKey('WeatherRiskSnapshot', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.species} - {self.disease} ({self.created_at.date()})"
        
    def save(self, *args, **kwargs):
        # Auto-flag carbon asset risk for Tier B species
        tier_b_species = ['mango', 'jackfruit', 'guava', 'citrus']
        if self.species.lower() in tier_b_species and self.severity in ['moderate', 'severe']:
            self.carbon_asset_risk = True
        super().save(*args, **kwargs)

class WeatherRiskSnapshot(models.Model):
    field_id = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    disease_risk_type = models.CharField(max_length=100) # e.g. "fungal_blast"
    risk_index = models.FloatField(help_text="0.0 to 1.0")
    summary_bn = models.TextField(help_text="Bangla summary of the weather risk")
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.field_id} - Risk: {self.risk_index} ({self.valid_until.date()})"

class CropImage(models.Model):
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='images')
    s3_key = models.CharField(max_length=255, help_text="Mock S3 object key")
    upload_timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.s3_key

class TreatmentRecommendation(models.Model):
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='treatments')
    treatment_type = models.CharField(max_length=50, choices=[('organic', 'Organic'), ('chemical', 'Chemical')])
    instructions_bn = models.TextField()
    dosage_info = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.treatment_type} for {self.diagnosis.id}"

class AgronomistReview(models.Model):
    diagnosis = models.OneToOneField(Diagnosis, on_delete=models.CASCADE, related_name='agronomist_review')
    agronomist_id = models.CharField(max_length=100)
    verified_disease = models.CharField(max_length=100)
    confidence_override = models.FloatField(blank=True, null=True)
    review_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.agronomist_id} for {self.diagnosis.id}"

class CarbonTelemetry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    humidity = models.FloatField()
    air_quality = models.IntegerField()
    co2 = models.IntegerField()

    def __str__(self):
        return f"Telemetry at {self.timestamp} - Temp: {self.temperature}, CO2: {self.co2}"


class AnalysisJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=50, default='pending')  # pending, running, completed, failed
    polygon_geojson = models.TextField()  # Store boundary geojson text
    analysis_type = models.CharField(max_length=50, default='ndvi')  # ndvi, evi, forest_cover, carbon_heatmap
    start_date = models.DateField()
    end_date = models.DateField()
    processing_time = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.id} ({self.status})"


class CarbonResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(AnalysisJob, on_delete=models.CASCADE, related_name='result')
    estimated_biomass = models.FloatField()  # Mg/ha
    estimated_carbon = models.FloatField()   # tC/ha
    tonnes_co2e = models.FloatField()       # tCO2e
    avg_ndvi = models.FloatField()
    forest_area_ha = models.FloatField()
    confidence = models.FloatField()         # 0.0 - 1.0
    satellite_sources = models.CharField(max_length=255, default='Sentinel-2')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Carbon Result for Job {self.job.id}"


class SatelliteLayer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(AnalysisJob, on_delete=models.CASCADE, related_name='layers')
    layer_type = models.CharField(max_length=50)  # ndvi, evi, ndwi, forest_mask, carbon_heatmap
    layer_url = models.TextField()  # Can be local path or GEE asset URL
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.layer_type} layer for Job {self.job.id}"


class UploadedBoundary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)  # geojson, kml
    boundary_data = models.TextField()  # geojson string
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CarbonReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(AnalysisJob, on_delete=models.CASCADE, related_name='reports')
    project_name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50)  # pdf, csv, geojson
    file_path = models.TextField()  # location on disk
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project_name} - {self.report_type}"


class CarbonAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    alert_type = models.CharField(max_length=100)  # forest_loss, rapid_decline, illegal_logging, fire_risk, flood_risk
    severity = models.CharField(max_length=50)  # info, warning, critical
    location_lat = models.FloatField()
    location_lng = models.FloatField()
    message = models.TextField()
    suggested_action = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alert_type} ({self.severity}) - {self.created_at.date()}"


