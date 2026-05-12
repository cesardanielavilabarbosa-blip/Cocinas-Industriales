from django.contrib import admin
from .models import Lectura


@admin.register(Lectura)
class LecturaAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'temperatura', 'nivel_gas', 'llama_detectada', 'estado_sistema')
    list_filter = ('estado_sistema', 'llama_detectada', 'timestamp')
    search_fields = ('estado_sistema',)
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        ('Sensores', {
            'fields': ('temperatura', 'nivel_gas', 'llama_detectada')
        }),
        ('Ventiladores', {
            'fields': ('ventilador_extraccion', 'ventilador_inyeccion_1', 'ventilador_inyeccion_2')
        }),
        ('Sistema', {
            'fields': ('estado_sistema', 'timestamp')
        }),
    )
    
    ordering = ['-timestamp']
