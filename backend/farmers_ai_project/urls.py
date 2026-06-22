from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/farmers-ai/', include('farmers_ai.urls')),
]
