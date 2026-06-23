from celery import shared_task
from django.utils import timezone
import datetime
import logging
from .models import WeatherRiskSnapshot, Diagnosis
from .risk_engine import calculate_disease_risk

logger = logging.getLogger(__name__)

def send_sms_alert(farmer_phone, message):
    """
    MOCK SMS GATEWAY: Simulates sending an SMS fallback for farmers without internet.
    """
    logger.info(f"[SMS DISPATCH] To: {farmer_phone} | Msg: {message}")
    # In production, integrate Twilio or local SMS provider here.

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
        try:
            # Get the most recent diagnosis for this field to determine species
            recent_diag = Diagnosis.objects.filter(field_id=field_id).order_by('-created_at').first()
            species = recent_diag.species.lower() if recent_diag else 'rice'
            
            # Default Bangladesh coordinates (in production, fetch from field polygon)
            lat = 23.6850
            lng = 90.3563
            
            risk_index, summary, disease_risk_type = calculate_disease_risk(lat, lng, species)
                
            # 3. Save snapshot
            WeatherRiskSnapshot.objects.create(
                field_id=field_id,
                species=species,
                disease_risk_type=disease_risk_type,
                risk_index=risk_index,
                summary_bn=summary,
                valid_until=timezone.now() + datetime.timedelta(days=2)
            )

            # Log high risk alerts (SMS integration placeholder)
            if risk_index > 0.8:
                logger.warning(f"HIGH RISK ALERT for field {field_id}: {disease_risk_type} risk={risk_index:.2f} - {summary}")

        except Exception as e:
            logger.error(f"Failed to fetch risk for {field_id}: {e}")
        
    print(f"Computed risk for {len(active_fields)} active fields.")
