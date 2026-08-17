"""
Simula el pulsador fisico del ESP32 sin necesidad del hardware: hace
exactamente el mismo POST que hace el firmware (ver firmware/emergencia_esp32.ino)
contra el backend real de Django.

Requisito: el backend debe estar corriendo:
    cd backend
    python manage.py runserver

Y debes tener al menos una cocina con un dispositivo asociado (ver
"python manage.py seed_demo" en el backend, que crea 2 cocinas de ejemplo
y te imprime las api_key de cada una).

Uso:
    python simulador_boton.py <api_key_del_dispositivo>

Si no pasas argumento, pide la api_key por consola.
"""

import sys
import requests

BACKEND_URL = "http://127.0.0.1:8000/api/alarma/"


def disparar_alarma(device_key, descripcion="Simulacion de boton fisico"):
    try:
        r = requests.post(
            BACKEND_URL,
            json={"device_key": device_key, "descripcion": descripcion},
            timeout=10,
        )
    except requests.ConnectionError:
        print("[ERROR] No se pudo conectar al backend. "
              "¿Esta corriendo 'python manage.py runserver' en /backend?")
        return

    if r.status_code == 201:
        data = r.json()
        print(f"\n[OK] Alarma registrada en '{data['cocina']}' "
              f"(evento #{data['evento_id']})")
        print(f"     Se notifico a {data['notificados']} destinatario(s):")
        for d in data["detalle"]:
            estado = "enviado" if d["exitoso"] else "FALLO"
            print(f"       - {d['afiliado']} [{d['canal']}]: {estado}")
    else:
        print(f"[ERROR] Backend respondio {r.status_code}: {r.text}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        api_key = input("api_key del dispositivo (cocina) a simular: ").strip()

    print("Presiona ENTER para simular una activacion del boton ('salir' para terminar).\n")
    contador = 1
    while True:
        entrada = input(f"[LISTO] Activacion #{contador}... ")
        if entrada.lower() == "salir":
            break
        disparar_alarma(api_key, descripcion=f"Boton #{contador} (simulado)")
        contador += 1
