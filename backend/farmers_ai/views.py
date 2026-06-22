from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import requests
from .models import Diagnosis

FASTAPI_URL = "http://127.0.0.1:8001/predict"

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def diagnose(request):
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
        
        # Save basic diagnosis to DB
        Diagnosis.objects.create(
            species=result.get('species', species),
            disease=result.get('disease', 'unknown'),
            confidence=result.get('confidence', 0.0),
            severity=result.get('severity', 'unknown'),
            needs_agronomist_review=result.get('needs_agronomist_review', False),
            field_id=field_id
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Failed to connect to inference service: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
