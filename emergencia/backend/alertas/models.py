from django.db import models
from django.utils import timezone
from django.utils.crypto import get_random_string
import secrets


class Cocina(models.Model):
    """Una cocina industrial monitoreada (una instalacion fisica con su
    propio ESP32 y su propia lista de personas a notificar)."""

    nombre = models.CharField(max_length=150)
    ubicacion = models.CharField(max_length=200, blank=True)
    activa = models.BooleanField(default=True)
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Afiliado(models.Model):
    """Persona que debe recibir la alerta cuando su cocina se activa.
    Varios afiliados pueden pertenecer a la misma cocina."""

    cocina = models.ForeignKey(Cocina, related_name="afiliados", on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    # Formato E.164 sin '+' para WhatsApp (ej: 573001112233)
    telefono_whatsapp = models.CharField(max_length=20)
    # Formato E.164 con '+' para Twilio (ej: +573001112233); opcional si
    # este afiliado no debe recibir llamada de voz, solo WhatsApp.
    telefono_llamada = models.CharField(max_length=20, blank=True)
    recibe_llamada = models.BooleanField(
        default=False,
        help_text="Si esta activo, tambien se le llama por voz (no solo WhatsApp)."
    )
    activo = models.BooleanField(default=True)

    # --- Vinculacion con la app movil (celular que recibe la alarma) ---
    device_token = models.CharField(
        max_length=64, unique=True, null=True, blank=True,
        help_text="Se genera al vincular la app; el celular lo usa para autenticar el polling."
    )
    device_id = models.CharField(
        max_length=100, blank=True,
        help_text="Identificador del dispositivo Android, para evitar duplicar el registro si reinstala."
    )
    vinculado_en = models.DateTimeField(null=True, blank=True)
    ultima_conexion_app = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.cocina.nombre})"


class CodigoVinculacion(models.Model):
    """Codigo de un solo uso que el administrador genera desde el panel
    (Django Admin) para autorizar a UNA persona a vincular su celular con
    UNA cocina especifica. El celular nunca elige la cocina por su cuenta."""

    cocina = models.ForeignKey(Cocina, related_name="codigos_vinculacion", on_delete=models.CASCADE)
    codigo = models.CharField(max_length=8, unique=True, editable=False)
    usado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    expira_en = models.DateTimeField(blank=True)

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = get_random_string(6, allowed_chars="0123456789")
        if not self.expira_en:
            self.expira_en = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)

    def vigente(self):
        return not self.usado and timezone.now() < self.expira_en

    def __str__(self):
        estado = "usado" if self.usado else ("vigente" if self.vigente() else "expirado")
        return f"{self.codigo} -> {self.cocina.nombre} ({estado})"


def generar_device_token():
    return secrets.token_hex(24)


class Dispositivo(models.Model):
    """Un ESP32 fisico asociado a una cocina. La api_key es la que el
    firmware envia en cada peticion para autenticarse."""

    cocina = models.OneToOneField(Cocina, related_name="dispositivo", on_delete=models.CASCADE)
    identificador = models.CharField(max_length=100, unique=True, help_text="Ej: esp32-cocina-norte")
    api_key = models.CharField(max_length=100, unique=True)
    ultima_conexion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.identificador


class EventoAlarma(models.Model):
    """Un evento de alarma disparado por un dispositivo (o simulado
    manualmente desde el panel)."""

    cocina = models.ForeignKey(Cocina, related_name="eventos", on_delete=models.CASCADE)
    descripcion = models.CharField(max_length=200, default="Activacion de boton fisico")
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cocina.nombre} - {self.creado_en:%Y-%m-%d %H:%M}"


class EnvioLog(models.Model):
    """Registro de cada mensaje/llamada individual disparado por un
    evento, para poder auditar que si le llego (o no) a cada afiliado."""

    CANAL_CHOICES = [("whatsapp", "WhatsApp"), ("llamada", "Llamada"), ("app", "App móvil")]

    evento = models.ForeignKey(EventoAlarma, related_name="envios", on_delete=models.CASCADE)
    afiliado = models.ForeignKey(Afiliado, on_delete=models.CASCADE)
    canal = models.CharField(max_length=10, choices=CANAL_CHOICES)
    exitoso = models.BooleanField(default=False)
    detalle = models.CharField(max_length=300, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        estado = "OK" if self.exitoso else "ERROR"
        return f"[{estado}] {self.canal} -> {self.afiliado.nombre}"
