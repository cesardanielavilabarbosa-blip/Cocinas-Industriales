import secrets

from django.core.management.base import BaseCommand

from alertas.models import Cocina, Afiliado, Dispositivo


class Command(BaseCommand):
    help = "Crea cocinas, afiliados y dispositivos de ejemplo para probar el sistema."

    def handle(self, *args, **options):
        cocina1, _ = Cocina.objects.get_or_create(
            nombre="Cocina Central - Sede Norte",
            defaults={"ubicacion": "Bucaramanga"},
        )
        cocina2, _ = Cocina.objects.get_or_create(
            nombre="Cocina Anexo - Sede Sur",
            defaults={"ubicacion": "Floridablanca"},
        )

        Afiliado.objects.get_or_create(
            cocina=cocina1, nombre="Ana",
            defaults={"telefono_whatsapp": "573001112233", "telefono_llamada": "+573001112233", "recibe_llamada": True},
        )
        Afiliado.objects.get_or_create(
            cocina=cocina1, nombre="Carlos",
            defaults={"telefono_whatsapp": "573004445566"},
        )
        Afiliado.objects.get_or_create(
            cocina=cocina1, nombre="Julia",
            defaults={"telefono_whatsapp": "573007778899"},
        )
        Afiliado.objects.get_or_create(
            cocina=cocina2, nombre="Pedro",
            defaults={"telefono_whatsapp": "573009990011", "telefono_llamada": "+573009990011", "recibe_llamada": True},
        )

        for cocina in (cocina1, cocina2):
            if not hasattr(cocina, "dispositivo"):
                api_key = secrets.token_hex(16)
                Dispositivo.objects.create(
                    cocina=cocina,
                    identificador=f"esp32-{cocina.id}",
                    api_key=api_key,
                )
                self.stdout.write(self.style.SUCCESS(
                    f"Dispositivo creado para '{cocina.nombre}' -> api_key: {api_key}"
                ))
            else:
                self.stdout.write(f"'{cocina.nombre}' ya tenia dispositivo: {cocina.dispositivo.api_key}")

        self.stdout.write(self.style.SUCCESS("Datos de ejemplo listos."))
