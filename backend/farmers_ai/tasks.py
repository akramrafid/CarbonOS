from celery import shared_task
from django.utils import timezone
import datetime
from .models import WeatherRiskSnapshot, Diagnosis
import random

@shared_task
def fetch_weather_and_compute_risk():
    """
    Nightly Celery beat task to compute disease risk based on forecast.
    Integrates with Open-Meteo and OpenWeatherMap Agro API.
    """
    print("Running nightly weather risk computation...")
    
    # 1. Fetch active fields from recent diagnoses
    recent_diagnoses = Diagnosis.objects.filter(
        created_at__gte=timezone.now() - datetime.timedelta(days=30)
    ).exclude(field_id__isnull=True)
    
    active_fields = list(set([d.field_id for d in recent_diagnoses if d.field_id]))
    
    # 2. For each field, fetch weather and compute risk
    for field_id in active_fields:
        # MOCK API Call to Open-Meteo / Agro API
        # Example logic: high humidity + moderate temp = blast risk for rice
        # In a real impl, we'd use requests.get() to Open-Meteo
        
        mock_humidity = random.uniform(60, 95)
        mock_temp = random.uniform(20, 35)
        
        risk_index = 0.0
        summary = "আবহাওয়া স্বাভাবিক। রোগের ঝুঁকি কম।"
        
        if mock_humidity > 85 and 25 < mock_temp < 30:
            risk_index = 0.85
            summary = "আগামী ২ দিন অতিরিক্ত আর্দ্রতার কারণে ব্লাস্ট বা ছত্রাকজনিত রোগের ঝুঁকি বেশি।"
        elif mock_humidity > 70:
            risk_index = 0.50
            summary = "মাঝারি আর্দ্রতা। নিয়মিত খেত পর্যবেক্ষণ করুন।"
            
        # 3. Save snapshot
        WeatherRiskSnapshot.objects.create(
            field_id=field_id,
            species='rice', # Assuming rice for MVP
            disease_risk_type='fungal',
            risk_index=risk_index,
            summary_bn=summary,
            valid_until=timezone.now() + datetime.timedelta(days=2)
        )
        
    print(f"Computed risk for {len(active_fields)} active fields.")
