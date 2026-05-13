from django.db import models


class Lectura(models.Model):
    """Modelo para almacenar las lecturas del ESP32"""
    
    ESTADO_CHOICES = [
        ('NORMAL', 'Normal'),
        ('GAS_DETECTADO', 'Gas Detectado'),
        ('TEMPERATURA_ALTA', 'Temperatura Alta'),
        ('LLAMA_DETECTADA', 'Llama Detectada'),
        ('EMERGENCIA', 'Emergencia'),
    ]
    
    # Datos de sensores
    temperatura = models.FloatField(help_text="Temperatura en °C")
    nivel_gas = models.IntegerField(help_text="Nivel de gas (0-1023)")
    presion = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Presión en hPa")
    llama_detectada = models.BooleanField(default=False)
    
    # Estados de ventiladores
    ventilador_extraccion = models.BooleanField(default=False)
    ventilador_inyeccion_1 = models.BooleanField(default=False)
    ventilador_inyeccion_2 = models.BooleanField(default=False)
    
    # Estado del sistema
    estado_sistema = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='NORMAL'
    )
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-timestamp']  # Más reciente primero
        verbose_name_plural = "Lecturas"
    
    def __str__(self):
        return f"Lectura {self.timestamp} - {self.estado_sistema}"
    
    def es_alerta(self):
        """Retorna True si esta lectura es una alerta"""
        return self.estado_sistema != 'NORMAL'
