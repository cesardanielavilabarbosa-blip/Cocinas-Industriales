from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("cocinas", views.CocinaViewSet)
router.register("afiliados", views.AfiliadoViewSet, basename="afiliado")
router.register("dispositivos", views.DispositivoViewSet)
router.register("eventos", views.EventoAlarmaViewSet, basename="evento")

urlpatterns = [
    path("", include(router.urls)),
    path("alarma/", views.recibir_alarma, name="recibir_alarma"),
    path("vincular/", views.vincular_dispositivo, name="vincular_dispositivo"),
    path("eventos-pendientes/", views.eventos_pendientes, name="eventos_pendientes"),
]
