from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Lectura
from .serializers import LecturaSerializer, AlertaSerializer


class LecturaViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar las lecturas del ESP32"""
    
    queryset = Lectura.objects.all()
    serializer_class = LecturaSerializer
    
    def get_queryset(self):
        """Permite filtrar por estado_sistema si se proporciona"""
        queryset = Lectura.objects.all()
        
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado_sistema=estado)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def ultima(self, request):
        """Obtiene la última lectura registrada"""
        try:
            ultima_lectura = Lectura.objects.latest('timestamp')
            serializer = self.get_serializer(ultima_lectura)
            return Response(serializer.data)
        except Lectura.DoesNotExist:
            return Response(
                {'detalle': 'No hay lecturas registradas'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def alertas(self, request):
        """Obtiene solo las lecturas que son alertas (estado != NORMAL)"""
        alertas = Lectura.objects.filter(~Q(estado_sistema='NORMAL'))
        
        # Opcionales: filtros
        tipo_alerta = request.query_params.get('tipo', None)
        if tipo_alerta:
            alertas = alertas.filter(estado_sistema=tipo_alerta)
        
        serializer = AlertaSerializer(alertas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Obtiene un resumen del estado actual del sistema"""
        try:
            ultima = Lectura.objects.latest('timestamp')
            
            resumen = {
                'estado_actual': ultima.estado_sistema,
                'temperatura': ultima.temperatura,
                'nivel_gas': ultima.nivel_gas,
                'llama_detectada': ultima.llama_detectada,
                'ventiladores': {
                    'extraccion': ultima.ventilador_extraccion,
                    'inyeccion_1': ultima.ventilador_inyeccion_1,
                    'inyeccion_2': ultima.ventilador_inyeccion_2,
                },
                'timestamp': ultima.timestamp,
                'total_lecturas': Lectura.objects.count(),
                'total_alertas': Lectura.objects.filter(~Q(estado_sistema='NORMAL')).count()
            }
            
            return Response(resumen)
        except Lectura.DoesNotExist:
            return Response(
                {'detalle': 'No hay datos disponibles'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def crear_lectura(self, request):
        """Alias para POST /api/lecturas/ (para claridad del ESP32)"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
