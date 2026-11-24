from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework import status
from django.conf import settings as django_settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
import os
import requests
from .models import Diagnosis, WeatherRiskSnapshot, AgronomistReview, CarbonTelemetry
from django.db.models import Count, Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .risk_engine import calculate_disease_risk

_BASE_INF = os.getenv("INFERENCE_SERVICE_URL") or os.getenv("FASTAPI_URL") or "http://127.0.0.1:8000"
FASTAPI_URL = _BASE_INF.rstrip("/") if _BASE_INF.rstrip("/").endswith("/predict") else f"{_BASE_INF.rstrip('/')}/predict"
MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024


class AuthRateThrottle(AnonRateThrottle):
    scope = 'auth'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def diagnose(request):
    # Phase 9: Broadcast processing status scoped to authenticated user
    channel_layer = get_channel_layer()
    ws_group = f"inference_updates_user_{request.user.id}"
    if channel_layer:
        try:
            async_to_sync(channel_layer.group_send)(
                ws_group,
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

    if getattr(image, "size", 0) > MAX_IMAGE_UPLOAD_BYTES:
        return Response({"error": "Image file exceeds maximum limit of 10MB."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

    try:
        image_bytes = image.read(MAX_IMAGE_UPLOAD_BYTES + 1)
        if len(image_bytes) > MAX_IMAGE_UPLOAD_BYTES:
            return Response({"error": "Image file exceeds maximum limit of 10MB."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        # Forward the image to the FastAPI service with verified authorization header (never forge operator token)
        files = {'image': (image.name, image_bytes, image.content_type or 'image/jpeg')}
        data = {'species': species}
        headers = {}
        client_auth = request.headers.get("Authorization")
        service_token = os.getenv("INTERNAL_INFERENCE_BEARER_TOKEN", "").strip()
        if client_auth and client_auth.startswith("Bearer "):
            headers["Authorization"] = client_auth
        elif service_token:
            headers["Authorization"] = f"Bearer {service_token}"
        else:
            # [COMMENTED OUT FOR PERSONAL REFERENCE — hardcoded fallback minted operator access on inference service]
            # headers["Authorization"] = "Bearer demo-token-operator"
            return Response({"error": "Missing Authorization bearer token for inference service."}, status=status.HTTP_401_UNAUTHORIZED)
        
        fastapi_response = requests.post(FASTAPI_URL, files=files, data=data, headers=headers, timeout=20)
        
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

        # Phase 11.2 & Scenario E: Prohibit untrained inference
        if result.get("status") == "MODEL_UNAVAILABLE":
            diag = Diagnosis.objects.create(
                species=result.get('species', species),
                disease="Diagnosis Unavailable",
                confidence=0.0,
                severity="unknown",
                needs_agronomist_review=True,
                field_id=field_id,
                model_version=request.data.get('model_version', 'v1.0.0-unavailable'),
                treatment_shown=result.get('message_bn', 'মডেল অনুপলব্ধ। কৃষি কর্মকর্তার পরামর্শ নিন।'),
                weather_snapshot=weather_snapshot
            )
            contract_payload = {
                'status': 'MODEL_UNAVAILABLE',
                'diagnosis_id': str(diag.id),
                'species': diag.species,
                'disease': 'Diagnosis Unavailable',
                'confidence': 0.0,
                'severity': 'unknown',
                'needs_agronomist_review': True,
                'heatmap_url': None,
                'treatment_plan': {
                    'text_bn': result.get('message_bn', 'বর্তমানে স্বয়ংক্রিয় রোগ নির্ণয় মডেল অনুপলব্ধ। অনুগ্রহ করে অভিজ্ঞ কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।'),
                    'voice_url': None
                },
                'weather_risk': {
                    'index': 0.0,
                    'summary_bn': "আবহাওয়া ঝুঁকি স্বাভাবিক",
                    'valid_until': None
                }
            }
            return Response(contract_payload, status=status.HTTP_200_OK)

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
        # host = request.get_host()  # [COMMENTED OUT FOR PERSONAL REFERENCE — Host header interpolation + dead HTTP audio link removed]
        
        # Calculate dynamic weather risk using device current coordinates (gps_lat, gps_lng)
        risk_index = 0.0
        summary_bn = "আবহাওয়া তথ্য নেই"
        
        if gps_lat and gps_lng:
            try:
                risk_index, summary_bn, _ = calculate_disease_risk(float(gps_lat), float(gps_lng), diag.species)
            except Exception:
                pass
        elif weather_snapshot:
            risk_index = weather_snapshot.risk_index
            summary_bn = weather_snapshot.summary_bn

        contract_payload = {
            'diagnosis_id': str(diag.id),
            'species': diag.species,
            'disease': diag.disease,
            'confidence': diag.confidence,
            'severity': diag.severity,
            # 'needs_agronomist_review': diag.confidence < 80.0,  # [COMMENTED OUT FOR PERSONAL REFERENCE — confidence is normalized 0..1]
            'needs_agronomist_review': diag.confidence < 0.80,
            'heatmap_url': result.get('heatmap_url'),
            'treatment_plan': {
                'text_bn': "জৈব পদ্ধতি: আক্রান্ত পাতা পুড়িয়ে ফেলুন এবং নিম পাতার নির্যাস ব্যবহার করুন।",
                # 'voice_url': f"http://{host}/media/voice/treatment_dummy.mp3"
                'voice_url': None
            },
            'weather_risk': {
                'index': risk_index,
                'summary_bn': summary_bn,
                'valid_until': weather_snapshot.valid_until if weather_snapshot else None
            }
        }
        
        # Phase 9: Broadcast done status to authenticated user group
        if channel_layer:
            try:
                async_to_sync(channel_layer.group_send)(
                    ws_group,
                    {'type': 'send_status', 'status': 'done'}
                )
            except Exception:
                pass
            
        return Response(contract_payload, status=status.HTTP_200_OK)
        
    except requests.exceptions.RequestException:
        return Response({"error": "Failed to connect to inference service."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_journal(request):
    """
    Returns a list of past diagnoses for the current farmer/field.
    Acts as a crop health journal showing diagnosis history.
    """
    field_id = request.query_params.get('field_id', None)
    try:
        limit = max(1, min(int(request.query_params.get('limit', 20)), 100))
    except (TypeError, ValueError):
        return Response({"error": "limit must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
    
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
@permission_classes([IsAdminUser])
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


@api_view(['GET'])
def get_current_weather(request):
    """
    Proxy weather endpoint with caching (10 minutes) and Open-Meteo fallback.
    Prevents leaking third-party API keys to client-side bundles.
    """
    location = request.query_params.get('location', 'Dhaka').strip()
    lat = request.query_params.get('lat')
    lon = request.query_params.get('lon')

    cache_key = f"weather_current_{location.lower()}_{lat}_{lon}"
    cached_data = None
    try:
        from django.core.cache import cache
        cached_data = cache.get(cache_key)
    except Exception:
        pass

    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    CITY_COORDS = {
        "dhaka": {"lat": 23.8103, "lon": 90.4125},
        "rajshahi": {"lat": 24.3636, "lon": 88.6241},
        "sylhet": {"lat": 24.8949, "lon": 91.8687},
        "chittagong": {"lat": 22.3569, "lon": 91.7832},
        "khulna": {"lat": 22.8456, "lon": 89.5403},
        "barisal": {"lat": 22.7010, "lon": 90.3535},
        "rangpur": {"lat": 25.7439, "lon": 89.2752},
        "mymensingh": {"lat": 24.7471, "lon": 90.4203},
    }

    selected_coords = CITY_COORDS.get(location.lower(), {"lat": 23.8103, "lon": 90.4125})
    try:
        resolved_lat = float(lat) if lat is not None and lat != "" else selected_coords["lat"]
        resolved_lon = float(lon) if lon is not None and lon != "" else selected_coords["lon"]
    except (TypeError, ValueError):
        return Response({"error": "Invalid lat/lon coordinates"}, status=status.HTTP_400_BAD_REQUEST)
    if not (-90.0 <= resolved_lat <= 90.0 and -180.0 <= resolved_lon <= 180.0):
        return Response({"error": "Coordinates out of valid latitude/longitude bounds"}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.getenv("OPENWEATHER_API_KEY", "")
    weather_payload = None

    # 1. Try OpenWeatherMap if key is configured
    if api_key:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={resolved_lat}&lon={resolved_lon}&units=metric&appid={api_key}"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                weather_payload = {
                    "temp": round(data['main']['temp']),
                    "humidity": data['main']['humidity'],
                    "description": data['weather'][0]['description'],
                    "icon": data['weather'][0]['icon'],
                    "wind": data.get('wind', {}).get('speed', 0),
                    "source": "OpenWeather API (Proxied)",
                }
        except Exception as e:
            print(f"[Weather Proxy] OpenWeatherMap request failed: {e}")

    # 2. Fallback to Open-Meteo (free, keyless, reliable)
    if not weather_payload:
        try:
            meteo_url = f"https://api.open-meteo.com/v1/forecast?latitude={resolved_lat}&longitude={resolved_lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto"
            resp = requests.get(meteo_url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                w_code = current.get("weather_code", 0)
                desc = "Clear sky" if w_code == 0 else "Partly cloudy" if w_code < 4 else "Overcast" if w_code < 50 else "Rain"
                icon_code = "01d" if w_code == 0 else "02d" if w_code < 4 else "04d" if w_code < 50 else "10d"
                weather_payload = {
                    "temp": round(current.get("temperature_2m", 28)),
                    "humidity": current.get("relative_humidity_2m", 65),
                    "description": desc,
                    "icon": icon_code,
                    "wind": current.get("wind_speed_10m", 2.5),
                    "source": "Open-Meteo (Keyless Fallback)",
                }
        except Exception as e:
            print(f"[Weather Proxy] Open-Meteo request failed: {e}")

    # 3. Static baseline fallback if offline
    if not weather_payload:
        weather_payload = {
            "temp": 28,
            "humidity": 68,
            "description": "partly cloudy",
            "icon": "02d",
            "wind": 3.2,
            "source": "Historical Regional Baseline (Offline)",
        }

    try:
        from django.core.cache import cache
        cache.set(cache_key, weather_payload, timeout=600)
    except Exception:
        pass

    return Response(weather_payload, status=status.HTTP_200_OK)



# --- Phase 1.3: Secure Server-Side Farmer Authentication ---
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register_farmer(request):
    """
    Registers a farmer account with secure salted password hashing (PBKDF2/argon2).
    Sets secure session cookie and returns profile metadata (no passwords or hashes).
    """
    name = request.data.get('name', '').strip()
    phone = request.data.get('phone', '').strip()
    password = request.data.get('password', '')
    language = request.data.get('language', 'bn')

    if not name or not phone or not password:
        return Response({"error": "name, phone, and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(password)
    except DjangoValidationError as exc:
        return Response({"error": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(username=phone).first()
    if user:
        return Response({"error": "An account with this phone number already exists"}, status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(username=phone, password=password, first_name=name)
    user.save()

    # Log in user to establish secure server-side session
    login(request, user)
    request.session['farmer_language'] = language
    request.session.modified = True

    return Response({
        "status": "success",
        "profile": {
            "name": name,
            "phone": phone,
            "language": language,
            "registered_at": user.date_joined.isoformat(),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_farmer(request):
    """
    Authenticates a farmer using phone number and password.
    """
    phone = request.data.get('phone', '').strip()
    password = request.data.get('password', '')

    if not phone or not password:
        return Response({"error": "phone and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=phone, password=password)
    if not user:
        return Response({"error": "Invalid phone number or password"}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    return Response({
        "status": "success",
        "profile": {
            "name": user.first_name,
            "phone": user.username,
            "language": request.session.get('farmer_language', 'bn'),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_farmer_me(request):
    """
    Returns current authenticated farmer profile from session.
    """
    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "profile": {
                "name": request.user.first_name,
                "phone": request.user.username,
                "language": request.session.get('farmer_language', 'bn'),
            }
        }, status=status.HTTP_200_OK)
    return Response({"authenticated": False}, status=status.HTTP_200_OK)


@api_view(['POST'])
def logout_farmer(request):
    """
    Clears session and logs out farmer.
    """
    logout(request)
    return Response({"status": "success", "message": "Logged out successfully"}, status=status.HTTP_200_OK)
