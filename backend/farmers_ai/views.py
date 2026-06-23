from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import requests
from .models import Diagnosis, WeatherRiskSnapshot, AgronomistReview
from django.db.models import Count, Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

FASTAPI_URL = "http://127.0.0.1:8001/predict"

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def diagnose(request):
    # Phase 9: Broadcast processing status
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            'inference_updates',
            {'type': 'send_status', 'status': 'processing'}
        )

    image = request.FILES.get('image')
    species = request.data.get('species')
    field_id = request.data.get('field_id')
    gps_lat = request.data.get('gps_lat')
    gps_lng = request.data.get('gps_lng')

    if not image or not species:
        return Response({"error": "image and species are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Forward the image to the FastAPI service
        files = {'image': (image.name, image.read(), image.content_type)}
        data = {'species': species}
        
        fastapi_response = requests.post(FASTAPI_URL, files=files, data=data)
        
        if fastapi_response.status_code != 200:
            return Response({"error": "Inference service error"}, status=status.HTTP_502_BAD_GATEWAY)
            
        result = fastapi_response.json()
        
        # Find latest weather snapshot for this field
        from django.utils import timezone
        from .models import WeatherRiskSnapshot
        weather_snapshot = None
        if field_id:
            weather_snapshot = WeatherRiskSnapshot.objects.filter(
                field_id=field_id,
                valid_until__gte=timezone.now()
            ).order_by('-created_at').first()

        # Save basic diagnosis to DB
        diag = Diagnosis.objects.create(
            species=result.get('species', species),
            disease=result.get('disease', 'unknown'),
            confidence=result.get('confidence', 0.0),
            severity=result.get('severity', 'unknown'),
            needs_agronomist_review=result.get('needs_agronomist_review', False),
            field_id=field_id,
            model_version=request.data.get('model_version', 'v1.0.0-cloud'),
            treatment_shown=request.data.get('treatment_shown', 'Client rendered treatment for: ' + result.get('disease', 'unknown')),
            weather_snapshot=weather_snapshot
        )
        
        # Inject weather risk for frontend display
        # Phase 10: Structuring exact API contract payload
        contract_payload = {
            'diagnosis_id': str(diag.id),
            'species': diag.species,
            'disease': diag.disease,
            'confidence': diag.confidence,
            'severity': diag.severity,
            'needs_agronomist_review': diag.confidence < 80.0,
            'heatmap_url': result.get('heatmap_url', f"/media/heatmaps/{diag.id}.png"), 
            'treatment_plan': {
                'text_bn': "জৈব পদ্ধতি: আক্রান্ত পাতা পুড়িয়ে ফেলুন এবং নিম পাতার নির্যাস ব্যবহার করুন।", # Mock organic baseline
                'voice_url': "http://localhost:8000/media/voice/treatment_dummy.mp3" # Mock voice fallback
            },
            'weather_risk': {
                'index': weather_snapshot.risk_index if weather_snapshot else 0.0,
                'summary_bn': weather_snapshot.summary_bn if weather_snapshot else 'আবহাওয়া তথ্য নেই',
                'valid_until': weather_snapshot.valid_until if weather_snapshot else None
            }
        }
        
        # Phase 9: Broadcast done status
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                'inference_updates',
                {'type': 'send_status', 'status': 'done'}
            )
            
        return Response(contract_payload, status=status.HTTP_200_OK)
        
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Failed to connect to inference service: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
def get_weather_risk(request, field_id):
    snapshot = WeatherRiskSnapshot.objects.filter(field_id=field_id).order_by('-created_at').first()
    if snapshot:
        return Response({
            "field_id": snapshot.field_id,
            "species": snapshot.species,
            "disease_risk_type": snapshot.disease_risk_type,
            "risk_index": snapshot.risk_index,
            "summary_bn": snapshot.summary_bn,
            "valid_until": snapshot.valid_until
        }, status=status.HTTP_200_OK)
    return Response({"error": "No risk data found for this field."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_carbon_health_trends(request):
    """
    Returns aggregated health trends for Tier B carbon-asset trees (Mango, Jackfruit, Guava, Citrus).
    Used by the MRV Dashboard to verify long-term carbon stock health.
    """
    tier_b_species = ['mango', 'jackfruit', 'guava', 'citrus']
    
    trends = Diagnosis.objects.filter(species__in=tier_b_species).values('region').annotate(
        total_diagnoses=Count('id'),
        at_risk=Count('id', filter=Q(carbon_asset_risk=True))
    )
    
    # Calculate percentages
    result = []
    for t in trends:
        total = t['total_diagnoses']
        at_risk = t['at_risk']
        percentage = (at_risk / total * 100) if total > 0 else 0
        result.append({
            "region": t['region'],
            "total_diagnoses": total,
            "at_risk_count": at_risk,
            "risk_percentage": round(percentage, 2)
        })
        
    return Response(result, status=status.HTTP_200_OK)
