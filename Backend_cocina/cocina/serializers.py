from rest_framework import serializers
from .models import Lectura


class LecturaSerializer(serializers.ModelSerializer):
    """Serializer para las lecturas del ESP32"""
    
    es_alerta = serializers.SerializerMethodField()
    
    class Meta:
        model = Lectura
        fields = [
            'id',
            'temperatura',
            'nivel_gas',
            'llama_detectada',
            'ventilador_extraccion',
            'ventilador_inyeccion_1',
            'ventilador_inyeccion_2',
            'estado_sistema',
            'timestamp',
            'es_alerta'
        ]
        read_only_fields = ['id', 'timestamp', 'es_alerta']
    
    def validate_temperatura(self, value):
        """Valida temperatura: debe estar entre -10 y 100°C"""
        if not (-10 <= value <= 100):
            raise serializers.ValidationError(
                f"Temperatura debe estar entre -10 y 100°C, recibido: {value}"
            )
        return value
    
    def validate_nivel_gas(self, value):
        """Valida nivel_gas: convierte -1 a 0, y asegura que esté entre 0-1023"""
        # Convertir -1 a 0 (cuando el sensor no está conectado)
        if value == -1:
            value = 0
        # Validar rango
        if not (0 <= value <= 1023):
            raise serializers.ValidationError(
                f"nivel_gas debe estar entre 0 y 1023, recibido: {value}"
            )
        return value
    
    def validate(self, data):
        """Determina automáticamente el estado del sistema"""
        # Si no viene estado_sistema, calcularlo automáticamente
        if 'estado_sistema' not in data or not data['estado_sistema']:
            data['estado_sistema'] = self._determinar_estado(data)
        return data
    
    def _determinar_estado(self, data):
        """Determina el estado del sistema basado en los valores"""
        temperatura = data.get('temperatura', 0)
        nivel_gas = data.get('nivel_gas', 0)
        llama_detectada = data.get('llama_detectada', False)
        
        # Prioridad de alertas
        if llama_detectada:
            return 'LLAMA_DETECTADA'
        if temperatura > 40:  # Límite de temperatura
            return 'TEMPERATURA_ALTA'
        if nivel_gas > 500:  # Límite de gas (0-1023)
            return 'GAS_DETECTADO'
        
        return 'NORMAL'
    
    def get_es_alerta(self, obj):
        return obj.es_alerta()


class AlertaSerializer(serializers.ModelSerializer):
    """Serializer para las alertas (lecturas con estado != NORMAL)"""
    
    class Meta:
        model = Lectura
        fields = [
            'id',
            'temperatura',
            'nivel_gas',
            'llama_detectada',
            'estado_sistema',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
