from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Cocina, Afiliado, Dispositivo, EventoAlarma, CodigoVinculacion, EnvioLog, generar_device_token
from .serializers import (
    CocinaSerializer, AfiliadoSerializer, DispositivoSerializer,
    EventoAlarmaSerializer,
)
from .services import despachar_evento


class CocinaViewSet(viewsets.ModelViewSet):
    """CRUD de cocinas, para el panel web (crear/editar/listar cocinas)."""
    queryset = Cocina.objects.all().order_by("nombre")
    serializer_class = CocinaSerializer


class AfiliadoViewSet(viewsets.ModelViewSet):
    """CRUD de afiliados (los usuarios que reciben la alerta). Se puede
    filtrar por cocina con ?cocina=<id>."""
    serializer_class = AfiliadoSerializer

    def get_queryset(self):
        qs = Afiliado.objects.all().order_by("nombre")
        cocina_id = self.request.query_params.get("cocina")
        if cocina_id:
            qs = qs.filter(cocina_id=cocina_id)
        return qs


class DispositivoViewSet(viewsets.ModelViewSet):
    queryset = Dispositivo.objects.all()
    serializer_class = DispositivoSerializer


class EventoAlarmaViewSet(viewsets.ReadOnlyModelViewSet):
    """Historial de eventos, de mas reciente a mas antiguo, con el detalle
    de que se le envio a cada afiliado."""
    queryset = EventoAlarma.objects.all().order_by("-creado_en")
    serializer_class = EventoAlarmaSerializer


@api_view(["POST"])
def recibir_alarma(request):
    """
    Endpoint que llama el ESP32 (o el simulador de Python) cuando se activa
    el pulsador fisico.

    Body esperado (JSON):
        {
            "device_key": "clave-secreta-para-el-esp32",
            "descripcion": "Activacion de boton fisico"   (opcional)
        }

    El dispositivo se identifica por su api_key, no hace falta que mande
    el id de la cocina: el backend ya sabe a que cocina pertenece ese
    dispositivo. Esto evita que el ESP32 pueda alarmar una cocina que no
    es la suya con solo cambiar un numero en el payload.
    """
    device_key = request.data.get("device_key")
    if not device_key:
        return Response({"error": "device_key es requerido"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        dispositivo = Dispositivo.objects.select_related("cocina").get(api_key=device_key)
    except Dispositivo.DoesNotExist:
        return Response({"error": "device_key invalida"}, status=status.HTTP_401_UNAUTHORIZED)

    if not dispositivo.cocina.activa:
        return Response({"error": "La cocina asociada esta inactiva"}, status=status.HTTP_403_FORBIDDEN)

    dispositivo.ultima_conexion = timezone.now()
    dispositivo.save(update_fields=["ultima_conexion"])

    descripcion = request.data.get("descripcion", "Activacion de boton fisico")
    evento = EventoAlarma.objects.create(cocina=dispositivo.cocina, descripcion=descripcion)

    logs = despachar_evento(evento)

    return Response({
        "ok": True,
        "evento_id": evento.id,
        "cocina": dispositivo.cocina.nombre,
        "notificados": len(logs),
        "detalle": [
            {"afiliado": l.afiliado.nombre, "canal": l.canal, "exitoso": l.exitoso}
            for l in logs
        ],
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def vincular_dispositivo(request):
    """
    Lo llama la app movil UNA sola vez, cuando la persona escribe el
    codigo de vinculacion que le dio el administrador (generado desde
    Django Admin para una cocina especifica).

    Body esperado (JSON):
        {
            "codigo": "123456",
            "nombre": "Ana Gomez",
            "telefono_whatsapp": "573001112233",
            "device_id": "..."   (opcional, id del dispositivo Android)
        }

    La cocina NUNCA la elige el celular: la determina el codigo, que ya
    quedo fijado a una cocina cuando el administrador lo genero. Esto es
    lo que evita que cualquiera en la misma red wifi se autoasigne como
    responsable de una cocina que no es suya.
    """
    codigo_texto = (request.data.get("codigo") or "").strip()
    nombre = (request.data.get("nombre") or "").strip()
    telefono = (request.data.get("telefono_whatsapp") or "").strip()
    device_id = (request.data.get("device_id") or "").strip()

    if not codigo_texto or not nombre or not telefono:
        return Response(
            {"error": "codigo, nombre y telefono_whatsapp son requeridos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        codigo = CodigoVinculacion.objects.select_related("cocina").get(codigo=codigo_texto)
    except CodigoVinculacion.DoesNotExist:
        return Response({"error": "Código inválido"}, status=status.HTTP_404_NOT_FOUND)

    if not codigo.vigente():
        return Response({"error": "Código usado o expirado"}, status=status.HTTP_410_GONE)

    afiliado = Afiliado.objects.create(
        cocina=codigo.cocina,
        nombre=nombre,
        telefono_whatsapp=telefono,
        device_token=generar_device_token(),
        device_id=device_id,
        vinculado_en=timezone.now(),
    )

    codigo.usado = True
    codigo.save(update_fields=["usado"])

    return Response({
        "ok": True,
        "device_token": afiliado.device_token,
        "cocina": {"id": codigo.cocina.id, "nombre": codigo.cocina.nombre},
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def eventos_pendientes(request):
    """
    Lo llama la app movil periodicamente (polling) mientras esta en la
    misma red que el backend. Devuelve los eventos de la cocina del
    afiliado que sean mas nuevos que `after`, y registra en EnvioLog que
    a este afiliado sí le llegó por canal "app" (para que el historial
    del panel quede completo, igual que con WhatsApp/llamada).

    Query params:
        device_token=<token devuelto por /vincular/>   (requerido)
        after=<id del ultimo evento que la app ya proceso>  (default 0)
    """
    device_token = request.query_params.get("device_token")
    after = request.query_params.get("after", "0")

    if not device_token:
        return Response({"error": "device_token es requerido"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        after_id = int(after)
    except ValueError:
        after_id = 0

    try:
        afiliado = Afiliado.objects.select_related("cocina").get(device_token=device_token, activo=True)
    except Afiliado.DoesNotExist:
        return Response({"error": "device_token inválido"}, status=status.HTTP_401_UNAUTHORIZED)

    afiliado.ultima_conexion_app = timezone.now()
    afiliado.save(update_fields=["ultima_conexion_app"])

    eventos = EventoAlarma.objects.filter(
        cocina=afiliado.cocina, id__gt=after_id
    ).order_by("id")

    nuevos = list(eventos)
    for evento in nuevos:
        EnvioLog.objects.get_or_create(
            evento=evento, afiliado=afiliado, canal="app",
            defaults={"exitoso": True, "detalle": "Recibido por polling de la app"},
        )

    return Response({
        "cocina": afiliado.cocina.nombre,
        "eventos": [
            {"id": e.id, "descripcion": e.descripcion, "creado_en": e.creado_en.isoformat()}
            for e in nuevos
        ],
    })
