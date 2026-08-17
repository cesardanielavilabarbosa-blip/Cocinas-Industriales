from rest_framework import serializers

from .models import Cocina, Afiliado, Dispositivo, EventoAlarma, EnvioLog


class AfiliadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Afiliado
        fields = [
            "id", "cocina", "nombre", "telefono_whatsapp",
            "telefono_llamada", "recibe_llamada", "activo",
        ]


class CocinaSerializer(serializers.ModelSerializer):
    afiliados = AfiliadoSerializer(many=True, read_only=True)
    total_afiliados = serializers.SerializerMethodField()

    class Meta:
        model = Cocina
        fields = ["id", "nombre", "ubicacion", "activa", "creada_en", "afiliados", "total_afiliados"]

    def get_total_afiliados(self, obj):
        return obj.afiliados.filter(activo=True).count()


class DispositivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispositivo
        fields = ["id", "cocina", "identificador", "ultima_conexion"]
        # api_key nunca se expone por API de lectura


class EnvioLogSerializer(serializers.ModelSerializer):
    afiliado_nombre = serializers.CharField(source="afiliado.nombre", read_only=True)

    class Meta:
        model = EnvioLog
        fields = ["id", "canal", "exitoso", "detalle", "afiliado_nombre", "creado_en"]


class EventoAlarmaSerializer(serializers.ModelSerializer):
    cocina_nombre = serializers.CharField(source="cocina.nombre", read_only=True)
    envios = EnvioLogSerializer(many=True, read_only=True)

    class Meta:
        model = EventoAlarma
        fields = ["id", "cocina", "cocina_nombre", "descripcion", "creado_en", "envios"]
