/*
  Firmware del ESP32 para el sistema de emergencia de cocinas.

  Arquitectura: el ESP32 YA NO llama directamente a WhatsApp/Twilio.
  En su lugar, hace un solo POST al backend Django (endpoint /api/alarma/)
  cuando se presiona el pulsador. Es el backend quien:
    - identifica a que cocina pertenece este dispositivo (por su api_key)
    - busca todos los afiliados de esa cocina
    - les manda WhatsApp a todos, y llamada a los que tengan
      recibe_llamada = true

  Esto simplifica mucho el firmware y evita tener tokens de Meta/Twilio
  guardados en el propio ESP32 (solo lleva su propia api_key, que se
  puede revocar sin tocar nada mas si el dispositivo se pierde o se
  compromete).
*/

#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TU_SSID_WIFI";
const char* password = "TU_PASSWORD_WIFI";

// URL del backend. En desarrollo (mismo router que el PC) usar la IP local
// del computador que corre "python manage.py runserver 0.0.0.0:8000".
// En produccion, usar el dominio real (https://tu-servidor.com/api/alarma/).
const char* BACKEND_URL = "http://192.168.1.100:8000/api/alarma/";

// api_key de ESTE dispositivo, generada por el backend
// (ver README / comando seed_demo, o el panel /admin de Django).
const String DEVICE_KEY = "REEMPLAZAR_CON_LA_API_KEY_DEL_DISPOSITIVO";

// --- Interruptor de modo -------------------------------------------------
// true  -> al conectar WiFi, dispara una alerta de prueba automaticamente
//          (util para validar que el backend, WiFi y credenciales sirven
//          con solo compilar y subir el sketch, sin esperar el pulsador).
// false -> modo normal: solo se dispara con el pulsador fisico (GPIO 4).
const bool MODO_PRUEBA_AL_ARRANCAR = true;

const int botonPin = 4;
bool estadoAnterior = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(botonPin, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado a Wi-Fi, IP: " + WiFi.localIP().toString());

  if (MODO_PRUEBA_AL_ARRANCAR) {
    Serial.println("[MODO PRUEBA] Disparando alarma de prueba al arrancar...");
    dispararAlarma("Prueba automatica al compilar/arrancar");
  }
}

void loop() {
  bool estadoActual = digitalRead(botonPin);
  if (estadoAnterior == HIGH && estadoActual == LOW) {
    dispararAlarma("Activacion de boton fisico");
    delay(1000);  // evita multiples disparos por rebote del pulsador
  }
  estadoAnterior = estadoActual;
}

void dispararAlarma(const String& descripcion) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] Sin conexion WiFi, no se pudo avisar al backend.");
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"device_key\":\"" + DEVICE_KEY + "\",";
  body += "\"descripcion\":\"" + descripcion + "\"}";

  int httpCode = http.POST(body);

  if (httpCode == 201) {
    Serial.println("[OK] Backend confirmo el envio a los afiliados.");
    Serial.println(http.getString());  // resumen: a quien se le mando y si funciono
  } else if (httpCode > 0) {
    Serial.printf("[ERROR] Backend respondio codigo %d\n", httpCode);
    Serial.println(http.getString());
  } else {
    Serial.println("[ERROR] No se pudo conectar al backend. Revisa BACKEND_URL.");
  }

  http.end();
}
