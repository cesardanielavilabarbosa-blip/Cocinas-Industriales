# Alarma Cocinas — App móvil (Android)

App simple: un botón "Simular alarma" que hace sonar una sirena a
volumen alto (generada en tiempo real, sin archivos de audio), vibra el
celular sin parar, y mantiene la pantalla encendida mientras la alarma
está activa. Es el punto de partida: hoy se dispara a mano, mañana la
disparará el backend.

## Por qué no viene el `.apk` ya compilado

Generar el `.apk` requiere el **Android SDK + Gradle**, que solo puede
descargarse con acceso a internet completo (servidores de Google/Gradle).
Este proyecto ya está 100% listo — solo falta el paso final de
compilación, que debes correr en tu propia máquina con Android Studio.

## Cómo generar el APK (una vez, en tu PC)

1. Instala **Android Studio** (incluye el SDK y Gradle):
   https://developer.android.com/studio

2. Abre el proyecto:
   ```bash
   cd mobile-app
   npm install
   npx cap sync android
   npx cap open android
   ```
   Esto abre `mobile-app/android` directamente en Android Studio.

3. Deja que Android Studio termine de sincronizar Gradle (la primera vez
   descarga dependencias, tarda unos minutos).

4. Genera el APK: menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   Cuando termine, aparece un enlace "locate" — el archivo queda en
   `android/app/build/outputs/apk/debug/app-debug.apk`.

5. Copia ese `.apk` al celular (por USB, o subiéndolo a Drive/WhatsApp) e
   instálalo. Puede que Android pida activar "Instalar apps de fuentes
   desconocidas" la primera vez — es normal, tu propio APK no compilado
   no viene de Play Store.

## Probar sin compilar (más rápido, mientras iteras)

Si solo quieres ver la pantalla y probar la sirena/vibración sin pasar
por Android Studio cada vez, ábrela directo en el navegador del celular:

```bash
cd mobile-app/www
python3 -m http.server 8080
```

Y entra desde el celular (misma red WiFi) a `http://<ip-de-tu-pc>:8080`.
El sonido y la vibración funcionan igual en el navegador — es exactamente
el mismo HTML/JS que se empaqueta dentro del APK. Lo único que **no**
puedes probar así es el ícono/nombre de la app instalada como tal, para
eso sí necesitas el paso de Android Studio.

## Nota importante sobre el volumen

Actualmente el sonido usa el canal de audio normal (multimedia). Si el
celular está en modo silencio/vibración, **el sonido no sonará aunque la
app diga que está activa** — así funciona cualquier audio de web/apps
normales en Android. Para que suene incluso en modo silencioso (como
hacen las apps de alarma de verdad), se necesita un plugin nativo que use
el canal `STREAM_ALARM` de Android — no está implementado todavía, pero
es el siguiente paso natural cuando pasemos de "simulación" a producción.

## Siguiente paso: conectar al servidor

En `www/app.js`, al final del archivo, ya está el código comentado con
las dos formas de conectar esto al backend de Django (polling o
WebSocket) para que la alarma se dispare sola cuando el ESP32 active el
botón físico. Se activa cuando el backend esté desplegado en un servidor
accesible desde internet.
