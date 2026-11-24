from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from farmers_ai import views as farmers_views


def api_health(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health, name='api_health'),
    path('api/farmers-ai/', include('farmers_ai.urls')),
    path('api/registry-bridge/', include('national_registry_bridge.urls')),
    # Direct alias for legacy frontend callers expecting /api/diagnose/
    path('api/diagnose/', farmers_views.diagnose, name='root_legacy_diagnose'),
]
