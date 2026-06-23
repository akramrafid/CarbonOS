from django.contrib import admin
from .models import Diagnosis, WeatherRiskSnapshot

@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('id', 'species', 'disease', 'confidence', 'severity', 'needs_agronomist_review', 'carbon_asset_risk', 'created_at')
    list_filter = ('needs_agronomist_review', 'carbon_asset_risk', 'species', 'severity')
    search_fields = ('field_id', 'disease')
    list_editable = ('needs_agronomist_review',) # Allows quick toggle by agronomist

@admin.register(WeatherRiskSnapshot)
class WeatherRiskSnapshotAdmin(admin.ModelAdmin):
    list_display = ('field_id', 'species', 'disease_risk_type', 'risk_index', 'valid_until', 'created_at')
    list_filter = ('species', 'disease_risk_type')
    