from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import requests
from .models import Diagnosis, WeatherRiskSnapshot, AgronomistReview, CarbonTelemetry
from django.db.models import Count, Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .risk_engine import calculate_disease_risk

FASTAPI_URL = "http://127.0.0.1:8001/predict"

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def diagnose(request):
    # Phase 9: Broadcast processing status
    channel_layer = get_channel_layer()
    if channel_layer:
        try:
            async_to_sync(channel_layer.group_send)(
                'inference_updates',
                {'type': 'send_status', 'status': 'processing'}
            )
        except Exception:
            pass  # WebSocket broadcast is best-effort

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
        
        # Phase 10: Structuring exact API contract payload
        host = request.get_host()
        
        # Calculate dynamic weather risk using device current coordinates (gps_lat, gps_lng)
        risk_index = 0.0
        summary_bn = "আবহাওয়া তথ্য নেই"
        
        if gps_lat and gps_lng:
            try:
                risk_index, summary_bn, _ = calculate_disease_risk(float(gps_lat), float(gps_lng), diag.species)
            except Exception as e:
                print(f"Error calculating dynamic risk: {e}")
        elif weather_snapshot:
            risk_index = weather_snapshot.risk_index
            summary_bn = weather_snapshot.summary_bn

        contract_payload = {
            'diagnosis_id': str(diag.id),
            'species': diag.species,
            'disease': diag.disease,
            'confidence': diag.confidence,
            'severity': diag.severity,
            'needs_agronomist_review': diag.confidence < 80.0,
            'heatmap_url': result.get('heatmap_url', f"/media/heatmaps/{diag.id}.png"), 
            'treatment_plan': {
                'text_bn': "জৈব পদ্ধতি: আক্রান্ত পাতা পুড়িয়ে ফেলুন এবং নিম পাতার নির্যাস ব্যবহার করুন।",
                'voice_url': f"http://{host}/media/voice/treatment_dummy.mp3"
            },
            'weather_risk': {
                'index': risk_index,
                'summary_bn': summary_bn,
                'valid_until': weather_snapshot.valid_until if weather_snapshot else None
            }
        }
        
        # Phase 9: Broadcast done status
        if channel_layer:
            try:
                async_to_sync(channel_layer.group_send)(
                    'inference_updates',
                    {'type': 'send_status', 'status': 'done'}
                )
            except Exception:
                pass
            
        return Response(contract_payload, status=status.HTTP_200_OK)
        
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Failed to connect to inference service: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
def get_journal(request):
    """
    Returns a list of past diagnoses for the current farmer/field.
    Acts as a crop health journal showing diagnosis history.
    """
    field_id = request.query_params.get('field_id', None)
    limit = int(request.query_params.get('limit', 20))
    
    queryset = Diagnosis.objects.all().order_by('-created_at')
    if field_id:
        queryset = queryset.filter(field_id=field_id)
    
    diagnoses = queryset[:limit]
    
    journal_entries = []
    for d in diagnoses:
        entry = {
            'diagnosis_id': str(d.id),
            'species': d.species,
            'disease': d.disease,
            'confidence': d.confidence,
            'severity': d.severity,
            'carbon_asset_risk': d.carbon_asset_risk,
            'created_at': d.created_at.isoformat(),
            'field_id': d.field_id,
            'needs_agronomist_review': d.needs_agronomist_review,
        }
        # Include agronomist review if exists
        try:
            review = d.agronomist_review
            entry['agronomist_review'] = {
                'agronomist_id': review.agronomist_id,
                'verified_disease': review.verified_disease,
                'review_notes': review.review_notes,
                'reviewed_at': review.reviewed_at.isoformat(),
            }
        except AgronomistReview.DoesNotExist:
            entry['agronomist_review'] = None
            
        journal_entries.append(entry)
    
    return Response({
        'count': len(journal_entries),
        'entries': journal_entries
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def agronomist_review(request, diagnosis_id):
    """
    Allows an agronomist to submit a review/correction for a diagnosis.
    """
    try:
        diagnosis = Diagnosis.objects.get(id=diagnosis_id)
    except Diagnosis.DoesNotExist:
        return Response({"error": "Diagnosis not found"}, status=status.HTTP_404_NOT_FOUND)
    
    agronomist_id = request.data.get('agronomist_id')
    verified_disease = request.data.get('verified_disease')
    confidence_override = request.data.get('confidence_override')
    review_notes = request.data.get('review_notes', '')
    
    if not agronomist_id or not verified_disease:
        return Response(
            {"error": "agronomist_id and verified_disease are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    review, created = AgronomistReview.objects.update_or_create(
        diagnosis=diagnosis,
        defaults={
            'agronomist_id': agronomist_id,
            'verified_disease': verified_disease,
            'confidence_override': confidence_override,
            'review_notes': review_notes,
        }
    )
    
    # Update the diagnosis review flag
    diagnosis.needs_agronomist_review = False
    diagnosis.save()
    
    return Response({
        'status': 'reviewed',
        'diagnosis_id': str(diagnosis.id),
        'verified_disease': review.verified_disease,
        'reviewed_at': review.reviewed_at.isoformat(),
    }, status=status.HTTP_200_OK)

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

@api_view(['POST'])
def save_telemetry(request):
    """
    Saves a new Carbon Monitor telemetry reading to the database.
    """
    try:
        temp = float(request.data.get('temperature'))
        hum = float(request.data.get('humidity'))
        air = int(request.data.get('air_quality'))
        co2 = int(request.data.get('co2'))
        
        reading = CarbonTelemetry.objects.create(
            temperature=temp,
            humidity=hum,
            air_quality=air,
            co2=co2
        )
        return Response({
            "status": "success",
            "id": str(reading.id),
            "timestamp": reading.timestamp.isoformat()
        }, status=status.HTTP_201_CREATED)
    except (TypeError, ValueError) as e:
        return Response({"error": "Invalid data format or missing parameters"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_telemetry_history(request):
    """
    Returns the history of Carbon Monitor telemetry readings (max 50, newest first).
    """
    readings = CarbonTelemetry.objects.all().order_by('-timestamp')[:50]
    result = []
    for r in readings:
        result.append({
            "id": str(r.id),
            "timestamp": r.timestamp.isoformat(),
            "temperature": r.temperature,
            "humidity": r.humidity,
            "air_quality": r.air_quality,
            "co2": r.co2
        })
    return Response(result, status=status.HTTP_200_OK)

