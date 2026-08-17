from django.contrib import admin

from .models import Cocina, Afiliado, Dispositivo, EventoAlarma, EnvioLog, CodigoVinculacion


class AfiliadoInline(admin.TabularInline):
    model = Afiliado
    extra = 1
    fields = ("nombre", "telefono_whatsapp", "recibe_llamada", "activo", "device_token")
    readonly_fields = ("device_token",)


@admin.register(Cocina)
class CocinaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "ubicacion", "activa", "creada_en")
    inlines = [AfiliadoInline]


@admin.register(Afiliado)
class AfiliadoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "cocina", "telefono_whatsapp", "recibe_llamada", "activo", "vinculado_en")
    list_filter = ("cocina", "recibe_llamada", "activo")
    readonly_fields = ("device_token", "device_id", "vinculado_en", "ultima_conexion_app")


@admin.register(Dispositivo)
class DispositivoAdmin(admin.ModelAdmin):
    list_display = ("identificador", "cocina", "ultima_conexion")


@admin.register(CodigoVinculacion)
class CodigoVinculacionAdmin(admin.ModelAdmin):
    """
    Para autorizar a alguien: elegir la cocina y Guardar (sin escribir
    nada mas). El codigo se genera solo y aparece en la lista para
    compartirselo a la persona (por el canal que sea, ej. de palabra).
    """
    list_display = ("codigo", "cocina", "usado", "creado_en", "expira_en", "vigente")
    list_filter = ("cocina", "usado")
    readonly_fields = ("codigo", "usado", "creado_en")
    fields = ("cocina", "expira_en", "codigo", "usado", "creado_en")

    def vigente(self, obj):
        return obj.vigente()
    vigente.boolean = True


class EnvioLogInline(admin.TabularInline):
    model = EnvioLog
    extra = 0
    readonly_fields = ("afiliado", "canal", "exitoso", "detalle", "creado_en")
    can_delete = False


@admin.register(EventoAlarma)
class EventoAlarmaAdmin(admin.ModelAdmin):
    list_display = ("cocina", "descripcion", "creado_en")
    list_filter = ("cocina",)
    inlines = [EnvioLogInline]
