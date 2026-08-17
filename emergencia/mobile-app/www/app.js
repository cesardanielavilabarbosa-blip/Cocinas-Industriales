/*
  App de alarma local. Tres partes:

  1. Registro de usuario (nombre + telefono), guardado en este celular.
     Es la base del futuro sistema de usuarios: cuando el backend este
     desplegado, este mismo perfil sera el que se registre contra el
     servidor para que sepa a que celular avisarle.

  2. Control de la alarma: usa el plugin nativo (AlarmPlugin, con
     Foreground Service, sonido por STREAM_ALARM y vibracion) cuando la
     app corre como APK real. Si se abre en un navegador de escritorio
     (para probar rapido sin compilar), cae a una version simplificada
     con Web Audio API + navigator.vibrate.

  3. Doble confirmacion obligatoria para detener la alarma: no existe
     ningun camino que la apague con un solo toque, ni siquiera la
     notificacion del sistema (ver AlarmForegroundService.java).
*/

// ---------------------------------------------------------------------
// 1. Registro de usuario + vinculación real con el servidor
// ---------------------------------------------------------------------

const CLAVE_PERFIL = "perfil_usuario";

const pantallaRegistro = document.getElementById("pantalla-registro");
const pantallaApp = document.getElementById("app");
const inputNombre = document.getElementById("input-nombre");
const inputTelefono = document.getElementById("input-telefono");
const inputCodigo = document.getElementById("input-codigo");
const inputServidor = document.getElementById("input-servidor");
const errorRegistro = document.getElementById("error-registro");
const btnGuardarRegistro = document.getElementById("btn-guardar-registro");
const saludoUsuario = document.getElementById("saludo-usuario");
const estadoConexion = document.getElementById("estado-conexion");

function obtenerPerfil() {
  const guardado = localStorage.getItem(CLAVE_PERFIL);
  return guardado ? JSON.parse(guardado) : null;
}

function guardarPerfil(perfil) {
  localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
}

function mostrarPantallaApp(perfil) {
  pantallaRegistro.classList.add("oculto");
  pantallaApp.classList.remove("oculto");
  saludoUsuario.textContent = `Hola, ${perfil.nombre} — ${perfil.cocinaNombre}`;
  estadoConexion.textContent = `Conectado a ${perfil.servidor}`;
  estadoConexion.classList.remove("estado--offline");
  estadoConexion.classList.add("estado--online");
}

async function obtenerIdDispositivo() {
  // Id estable por instalacion (no es un identificador de hardware real,
  // pero alcanza para que el backend evite duplicar el registro).
  const clave = "device_id_local";
  let id = localStorage.getItem(clave);
  if (!id) {
    id = "dev-" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem(clave, id);
  }
  return id;
}

async function vincularConServidor(servidor, codigo, nombre, telefono) {
  const deviceId = await obtenerIdDispositivo();
  const url = `http://${servidor}/api/vincular/`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codigo, nombre, telefono_whatsapp: telefono, device_id: deviceId,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "No se pudo vincular");
  return data; // { device_token, cocina: { id, nombre } }
}

btnGuardarRegistro.addEventListener("click", async () => {
  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const codigo = inputCodigo.value.trim();
  const servidor = inputServidor.value.trim();

  if (nombre.length < 2) {
    errorRegistro.textContent = "Escribe tu nombre completo.";
    errorRegistro.classList.remove("oculto");
    return;
  }
  if (!/^\d{7,15}$/.test(telefono)) {
    errorRegistro.textContent = "Escribe un numero de celular valido (solo digitos).";
    errorRegistro.classList.remove("oculto");
    return;
  }
  if (!/^\d{4,8}$/.test(codigo)) {
    errorRegistro.textContent = "Escribe el código de vinculación que te dio el administrador.";
    errorRegistro.classList.remove("oculto");
    return;
  }
  if (!servidor) {
    errorRegistro.textContent = "Escribe la IP:puerto del servidor (te la da el administrador).";
    errorRegistro.classList.remove("oculto");
    return;
  }

  errorRegistro.classList.add("oculto");
  btnGuardarRegistro.disabled = true;
  btnGuardarRegistro.textContent = "Vinculando...";

  try {
    const resultado = await vincularConServidor(servidor, codigo, nombre, telefono);
    const perfil = {
      nombre, telefono, servidor,
      deviceToken: resultado.device_token,
      cocinaId: resultado.cocina.id,
      cocinaNombre: resultado.cocina.nombre,
      ultimoEventoId: 0,
    };
    guardarPerfil(perfil);
    mostrarPantallaApp(perfil);
    iniciarPollingAlarmas(perfil);
  } catch (e) {
    errorRegistro.textContent = "No se pudo vincular: " + e.message + ". Revisa el código y que el celular esté en la misma red wifi que el servidor.";
    errorRegistro.classList.remove("oculto");
  } finally {
    btnGuardarRegistro.disabled = false;
    btnGuardarRegistro.textContent = "Guardar y continuar";
  }
});

// Al cargar: si ya hay perfil guardado (y ya vinculado), saltar directo a la app.
const perfilExistente = obtenerPerfil();
if (perfilExistente && perfilExistente.deviceToken) {
  mostrarPantallaApp(perfilExistente);
}


// ---------------------------------------------------------------------
// 2. Control de la alarma (plugin nativo con respaldo web)
// ---------------------------------------------------------------------

const circulo = document.getElementById("circulo-estado");
const textoCirculo = document.getElementById("texto-circulo");
const controlesNormales = document.getElementById("controles-normales");
const btnSimular = document.getElementById("btn-simular");
const btnPedirDetener = document.getElementById("btn-pedir-detener");

let alarmaActiva = false;

function usaPluginNativo() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
    && window.Capacitor.Plugins && window.Capacitor.Plugins.AlarmPlugin);
}

// --- Respaldo web (solo para cuando se prueba en navegador de escritorio) --

let audioCtx = null;
let osciladores = [];
let intervaloVibracion = null;
let wakeLock = null;

function iniciarSirenaWeb() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = audioCtx.createGain();
  gain.gain.value = 1.0;
  gain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 800;
  osc.connect(gain);
  osc.start();

  let alto = true;
  const cambiarTono = setInterval(() => {
    if (!audioCtx) return;
    osc.frequency.setValueAtTime(alto ? 1200 : 700, audioCtx.currentTime);
    alto = !alto;
  }, 400);

  osciladores.push({ osc, cambiarTono });
}

function detenerSirenaWeb() {
  osciladores.forEach(({ osc, cambiarTono }) => {
    clearInterval(cambiarTono);
    osc.stop();
  });
  osciladores = [];
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

function iniciarVibracionWeb() {
  if (!("vibrate" in navigator)) return;
  const patron = [400, 200, 400, 200];
  navigator.vibrate(patron);
  intervaloVibracion = setInterval(() => navigator.vibrate(patron), 1000);
}

function detenerVibracionWeb() {
  if (intervaloVibracion) clearInterval(intervaloVibracion);
  intervaloVibracion = null;
  if ("vibrate" in navigator) navigator.vibrate(0);
}

async function pedirWakeLockWeb() {
  try {
    if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) { console.warn("No se pudo mantener la pantalla encendida:", e); }
}

function soltarWakeLockWeb() {
  if (wakeLock) { wakeLock.release(); wakeLock = null; }
}

// --- Control principal ------------------------------------------------

function activarAlarma() {
  if (alarmaActiva) return;
  alarmaActiva = true;

  if (usaPluginNativo()) {
    // App real (APK): el sonido, la vibracion y la notificacion las
    // maneja el Foreground Service nativo, incluso en segundo plano.
    window.Capacitor.Plugins.AlarmPlugin.startAlarm();
  } else {
    iniciarSirenaWeb();
    iniciarVibracionWeb();
    pedirWakeLockWeb();
  }

  circulo.classList.remove("circulo--reposo");
  circulo.classList.add("circulo--alarma");
  textoCirculo.textContent = "ALARMA ACTIVA";

  btnSimular.disabled = true;
  btnPedirDetener.disabled = false;
}

function detenerAlarmaDeVerdad() {
  if (!alarmaActiva) return;
  alarmaActiva = false;

  if (usaPluginNativo()) {
    window.Capacitor.Plugins.AlarmPlugin.stopAlarm();
  } else {
    detenerSirenaWeb();
    detenerVibracionWeb();
    soltarWakeLockWeb();
  }

  circulo.classList.remove("circulo--alarma");
  circulo.classList.add("circulo--reposo");
  textoCirculo.textContent = "EN REPOSO";

  btnSimular.disabled = false;
  btnPedirDetener.disabled = true;
}

btnSimular.addEventListener("click", activarAlarma);

// Si el usuario cambia de app y vuelve (solo aplica al modo web de
// respaldo; el modo nativo no lo necesita porque el sonido vive en el
// servicio, no en esta pagina).
document.addEventListener("visibilitychange", () => {
  if (alarmaActiva && document.visibilityState === "visible" && !usaPluginNativo()) {
    pedirWakeLockWeb();
  }
});


// ---------------------------------------------------------------------
// 3. Doble confirmacion para detener la alarma
// ---------------------------------------------------------------------

const panelConfirmacion = document.getElementById("panel-confirmacion");
const btnConfirmar1 = document.getElementById("btn-confirmar-1");
const btnConfirmar2 = document.getElementById("btn-confirmar-2");
const btnCancelarConfirmacion = document.getElementById("btn-cancelar-confirmacion");

let primeraConfirmacionHecha = false;

function abrirPanelConfirmacion() {
  primeraConfirmacionHecha = false;
  btnConfirmar1.disabled = false;
  btnConfirmar2.disabled = true;
  controlesNormales.classList.add("oculto");
  panelConfirmacion.classList.remove("oculto");
}

function cerrarPanelConfirmacion() {
  controlesNormales.classList.remove("oculto");
  panelConfirmacion.classList.add("oculto");
}

btnPedirDetener.addEventListener("click", abrirPanelConfirmacion);

btnConfirmar1.addEventListener("click", () => {
  primeraConfirmacionHecha = true;
  btnConfirmar1.disabled = true;
  btnConfirmar2.disabled = false;
});

btnConfirmar2.addEventListener("click", () => {
  if (!primeraConfirmacionHecha) return; // seguridad extra: no se salta el paso 1
  detenerAlarmaDeVerdad();
  cerrarPanelConfirmacion();
});

btnCancelarConfirmacion.addEventListener("click", () => {
  // La alarma NO se detiene: solo se cierra el panel y se sigue sonando.
  cerrarPanelConfirmacion();
});


/*
  -----------------------------------------------------------------------
  Conexión con el servidor: polling de alarmas (misma red wifi)
  -----------------------------------------------------------------------

  Mientras el celular esté en la misma red wifi que el backend, se
  pregunta cada pocos segundos si hay eventos nuevos para la cocina a la
  que este perfil quedó vinculado (ver vincularConServidor arriba).

  Nota para cuando esto salga de la red local: esto sigue funcionando
  igual si el backend queda accesible por dominio público, cambiando el
  "http://IP:PUERTO" por "https://tu-dominio.com". Para que las alarmas
  lleguen con el celular en segundo plano y sin gastar batería
  preguntando todo el tiempo, el siguiente paso sería reemplazar este
  polling por notificaciones push reales (Firebase Cloud Messaging).
*/

const INTERVALO_POLLING_MS = 4000;
let pollingTimer = null;

async function revisarAlarmasPendientes(perfil) {
  const url = `http://${perfil.servidor}/api/eventos-pendientes/?device_token=${perfil.deviceToken}&after=${perfil.ultimoEventoId}`;
  try {
    const r = await fetch(url);
    if (!r.ok) {
      estadoConexion.textContent = "Sin conexión con el servidor (revisa la red wifi)";
      estadoConexion.classList.remove("estado--online");
      estadoConexion.classList.add("estado--offline");
      return;
    }
    const data = await r.json();
    estadoConexion.textContent = `Conectado a ${perfil.servidor}`;
    estadoConexion.classList.remove("estado--offline");
    estadoConexion.classList.add("estado--online");

    if (data.eventos && data.eventos.length > 0) {
      const maxId = Math.max(...data.eventos.map((e) => e.id));
      perfil.ultimoEventoId = maxId;
      guardarPerfil(perfil);
      activarAlarma();
    }
  } catch (e) {
    estadoConexion.textContent = "Sin conexión con el servidor (revisa la red wifi)";
    estadoConexion.classList.remove("estado--online");
    estadoConexion.classList.add("estado--offline");
  }
}

function iniciarPollingAlarmas(perfil) {
  if (pollingTimer) return;
  revisarAlarmasPendientes(perfil);
  pollingTimer = setInterval(() => revisarAlarmasPendientes(perfil), INTERVALO_POLLING_MS);
}

// Si ya había un perfil vinculado guardado, retomar el polling al abrir.
if (perfilExistente && perfilExistente.deviceToken) {
  iniciarPollingAlarmas(perfilExistente);
}
