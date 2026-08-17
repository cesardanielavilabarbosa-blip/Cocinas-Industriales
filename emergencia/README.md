# Sistema de Emergencia para Cocinas Industriales (ESP32 + WhatsApp + Twilio)

Sistema completo: cuando se activa una alarma (pulsador físico en el ESP32,
o el pulsador simulado en Python), el **backend** identifica a qué cocina
pertenece el dispositivo y notifica automáticamente, por **WhatsApp Cloud
API** y opcionalmente por **llamada de voz (Twilio)**, a **todos los
usuarios afiliados a esa cocina**.

```
firmware/    -> Sketch de Arduino IDE para el ESP32 (el pulsador real)
simulator/   -> Simula el pulsador desde el PC, sin hardware
backend/     -> Django + DRF: guarda cocinas/afiliados y hace el envío real
frontend/    -> Panel web en React para gestionar cocinas y afiliados
mobile-app/  -> App Android (Capacitor): simula la alarma con sonido y
                vibración en el celular; punto de partida para que el
                backend la dispare en remoto más adelante (ver su README)
```

## Cómo encajan las piezas

```
[Pulsador físico ESP32]  ---\
                              >---  POST /api/alarma/  --->  [Backend Django]
[simulador_boton.py]     ---/                                     |
                                                                    | busca afiliados
                                                                    | de esa cocina
                                                                    v
                                                    WhatsApp Cloud API + Twilio Voice
                                                       (a cada afiliado registrado)

[Panel web React]  <---- API REST (/api/cocinas, /api/afiliados, /api/eventos) ---->  [Backend Django]
```

El ESP32 y el simulador **no** llevan tokens de WhatsApp/Twilio: solo
llevan su propia `api_key` de dispositivo. Es el backend el único lugar
donde viven las credenciales reales, y el único que decide a quién avisar.

---

## 1. Backend (Django)

```bash
cd backend
python3 -m venv ../venv
source ../venv/bin/activate        # en Windows: ..\venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # y edita .env con tus valores reales
```

Mientras no tengas tus credenciales de Meta/Twilio, deja `DRY_RUN=True`
en `.env`: el sistema funciona igual, pero solo simula el envío (lo
registra en la base de datos y en consola, sin llamar a ninguna API
externa). Cuando tengas token de WhatsApp y credenciales de Twilio
verificadas, cambia a `DRY_RUN=False`.

```bash
python manage.py migrate
python manage.py createsuperuser      # para entrar a /admin
python manage.py seed_demo            # crea 2 cocinas y afiliados de ejemplo
python manage.py runserver            # backend en http://127.0.0.1:8000
```

`seed_demo` imprime en consola la `api_key` de cada cocina de ejemplo —
esa es la que usas en el simulador o en el firmware del ESP32.

Endpoints principales:

| Método | Ruta | Para qué |
|---|---|---|
| `POST` | `/api/alarma/` | Lo llama el ESP32 (o el simulador). Body: `{"device_key": "...", "descripcion": "..."}` |
| `GET/POST` | `/api/cocinas/` | Listar / crear cocinas |
| `GET/POST` | `/api/afiliados/?cocina=<id>` | Listar / crear afiliados de una cocina |
| `GET` | `/api/eventos/` | Historial de alarmas con el detalle de a quién se le avisó |
| — | `/admin/` | Panel de administración de Django (gestión rápida sin frontend) |

## 2. Simulador de Python (sin hardware)

```bash
cd simulator
pip install requests
python simulador_boton.py <api_key_de_la_cocina>
```

Cada `ENTER` simula una pulsación real del botón: hace el mismo POST que
haría el ESP32 contra el backend, y el backend responde con el detalle de
a quién le llegó cada WhatsApp/llamada.

## 3. Firmware del ESP32

1. Abre `firmware/emergencia_esp32.ino` en Arduino IDE.
2. Instala la placa "ESP32" desde el Gestor de tarjetas si no la tienes.
3. Edita al inicio del archivo:
   - `ssid` / `password`: tu red WiFi.
   - `BACKEND_URL`: la IP local de tu PC corriendo el backend (ej.
     `http://192.168.1.100:8000/api/alarma/`), o el dominio real en
     producción. El PC y el ESP32 deben estar en la misma red para
     pruebas locales.
   - `DEVICE_KEY`: la `api_key` de la cocina, sacada de `seed_demo` o del
     panel `/admin`.
4. Circuito: un extremo del pulsador al GPIO 4, el otro a GND (usa
   `INPUT_PULLUP` interno, no necesitas resistencia externa).
5. Compila y sube. Con `MODO_PRUEBA_AL_ARRANCAR = true` (por defecto),
   apenas conecta al WiFi dispara una alarma de prueba automáticamente,
   sin esperar el pulsador — así validas todo el flujo con solo
   compilar. **Cámbialo a `false` antes de la demo final**, para que solo
   se dispare con el botón real.

## 4. Panel web (React)

```bash
cd frontend
npm install
npm run dev              # abre http://localhost:5173
```

Permite crear cocinas, agregar/quitar afiliados por cocina (con su
número de WhatsApp y si además debe recibir llamada), y ver el historial
de alarmas con el detalle de éxito/fallo por cada canal y destinatario.

---

## Notas importantes (heredadas del informe original)

- **Modo de prueba de Meta**: mientras no verifiques tu número de negocio,
  la WhatsApp Cloud API solo puede enviar a destinatarios agregados a mano
  como "número de prueba" en el panel de Meta. La lógica de "una cocina,
  muchos afiliados" ya está lista en el backend; simplemente no vas a
  poder alertar a números reales fuera de esa lista hasta verificar el
  negocio.
- **Plantilla de WhatsApp**: el primer mensaje a cada número debe usar la
  plantilla aprobada (`alerta_emergencia` por defecto, configurable en
  `.env`), como se explicó en el informe original.
- **Ninguno de estos canales reemplaza la llamada al 123 o al 119.**
- Si el ESP32 pierde WiFi, ningún canal basado en internet funciona; para
  autonomía total se necesitaría un módulo GSM físico (no cubierto aquí).
