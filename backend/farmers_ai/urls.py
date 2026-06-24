from django.urls import path
from . import views

urlpatterns = [
    path('api/diagnose/', views.diagnose, name='diagnose'),
    path('api/journal/', views.get_journal, name='journal'),
    path('api/agronomist-review/<uuid:diagnosis_id>/', views.agronomist_review, name='agronomist_review'),
    path('api/weather/risk/<str:field_id>/', views.get_weather_risk, name='weather_risk'),
    path('api/mrv/carbon-health-trends/', views.get_carbon_health_trends, name='carbon_health_trends'),
    path('api/mrv/telemetry/save/', views.save_telemetry, name='save_telemetry'),
    path('api/mrv/telemetry/history/', views.get_telemetry_history, name='get_telemetry_history'),
]
