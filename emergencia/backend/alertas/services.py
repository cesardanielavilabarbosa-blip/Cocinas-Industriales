"""
Logica de envio real. Es la version "backend" de lo que ya se probo en
simulacion_final.py: un evento de una cocina dispara WhatsApp a todos sus
afiliados y, si corresponde, una llamada de voz.

Se mantiene DRY_RUN para poder probar el flujo completo (incluido el
endpoint HTTP que llama el ESP32) sin gastar cuota real ni necesitar
credenciales todavia.
"""

import requests
from django.conf import settings

from .models import EnvioLog


def enviar_whatsapp(afiliado, descripcion_evento, hora_texto):
    if settings.DRY_RUN:
        detalle = f"[SIMULADO] Alerta '{descripcion_evento}' a las {hora_texto}"
        return True, detalle

    url = f"https://graph.facebook.com/v20.0/{settings.WHATSAPP_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": afiliado.telefono_whatsapp,
        "type": "template",
        "template": {
            "name": settings.WHATSAPP_TEMPLATE_NAME,
            "language": {"code": settings.WHATSAPP_TEMPLATE_LANG},
            "components": [{
                "type": "body",
                "parameters": [
                    {"type": "text", "text": descripcion_evento},
                    {"type": "text", "text": hora_texto},
                ],
            }],
        },
    }
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=10)
        return r.status_code == 200, f"HTTP {r.status_code}: {r.text[:200]}"
    except requests.RequestException as e:
        return False, f"Error de red: {e}"


def realizar_llamada(afiliado, cocina_nombre):
    if settings.DRY_RUN:
        detalle = f"[SIMULADO] Llamada de alerta por '{cocina_nombre}'"
        return True, detalle

    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    twiml = (
        "<Response><Say language='es-MX'>"
        f"Alerta critica de seguridad en {cocina_nombre}. "
        "Por favor verifique de inmediato."
        "</Say></Response>"
    )
    try:
        call = client.calls.create(
            twiml=twiml,
            to=afiliado.telefono_llamada,
            from_=settings.TWILIO_PHONE_NUMBER,
        )
        return True, f"SID: {call.sid}"
    except TwilioRestException as e:
        return False, f"Error de Twilio: {e}"


def despachar_evento(evento):
    """Envia WhatsApp a todos los afiliados activos de la cocina del
    evento, y llamada de voz solo a los que tienen recibe_llamada=True.
    Devuelve un resumen con los logs creados."""

    from django.utils import timezone

    hora_texto = timezone.localtime(evento.creado_en).strftime("%H:%M")
    afiliados = evento.cocina.afiliados.filter(activo=True)

    logs = []
    for afiliado in afiliados:
        ok, detalle = enviar_whatsapp(afiliado, evento.descripcion, hora_texto)
        logs.append(EnvioLog.objects.create(
            evento=evento, afiliado=afiliado, canal="whatsapp",
            exitoso=ok, detalle=detalle,
        ))

        if afiliado.recibe_llamada and afiliado.telefono_llamada:
            ok_call, detalle_call = realizar_llamada(afiliado, evento.cocina.nombre)
            logs.append(EnvioLog.objects.create(
                evento=evento, afiliado=afiliado, canal="llamada",
                exitoso=ok_call, detalle=detalle_call,
            ))

    return logs
