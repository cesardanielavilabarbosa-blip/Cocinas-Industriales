from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LecturaViewSet

# Router para registrar el ViewSet
router = DefaultRouter()
router.register(r'lecturas', LecturaViewSet, basename='lectura')

urlpatterns = [
    path('', include(router.urls)),
]
