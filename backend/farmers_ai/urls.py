from django.urls import path
from . import views

urlpatterns = [
    # Clean REST patterns mounted under /api/farmers-ai/
    path('diagnose/', views.diagnose, name='diagnose'),
    path('journal/', views.get_journal, name='journal'),
    path('agronomist-review/<uuid:diagnosis_id>/', views.agronomist_review, name='agronomist_review'),
    path('weather/risk/<str:field_id>/', views.get_weather_risk, name='weather_risk'),
    path('mrv/carbon-health-trends/', views.get_carbon_health_trends, name='carbon_health_trends'),
    path('mrv/telemetry/save/', views.save_telemetry, name='save_telemetry'),
    path('mrv/telemetry/history/', views.get_telemetry_history, name='get_telemetry_history'),

    # Backward compatibility aliases for clients expecting /api/farmers-ai/api/...
    path('api/diagnose/', views.diagnose, name='legacy_diagnose'),
    path('api/journal/', views.get_journal, name='legacy_journal'),
    path('api/agronomist-review/<uuid:diagnosis_id>/', views.agronomist_review, name='legacy_agronomist_review'),
    path('api/weather/risk/<str:field_id>/', views.get_weather_risk, name='legacy_weather_risk'),
    path('api/mrv/carbon-health-trends/', views.get_carbon_health_trends, name='legacy_carbon_health_trends'),
    path('api/mrv/telemetry/save/', views.save_telemetry, name='legacy_save_telemetry'),
    path('api/mrv/telemetry/history/', views.get_telemetry_history, name='legacy_get_telemetry_history'),
]
