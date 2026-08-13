# Sistema de Seguridad IoT para Cocinas Industriales

Plataforma IoT para el monitoreo de gas, temperatura y llama en cocinas
industriales, con generación de alertas y activación automática de
ventilación. Backend en Django, frontend en Vite, firmware embebido y
documentación de sustentación del proyecto de ingeniería.

## Empezar aquí

| Quiero... | Ir a |
|---|---|
| Levantar el sistema completo (backend + frontend) | [`README_EJECUCION.md`](README_EJECUCION.md) |
| Levantarlo específicamente en Windows | [`SETUP_WINDOWS.md`](SETUP_WINDOWS.md) |
| Ver el checklist antes de correrlo | [`CHECKLIST_EJECUCION.md`](CHECKLIST_EJECUCION.md) |
| Entender la arquitectura del sistema | [`ARQUITECTURA.md`](ARQUITECTURA.md) |
| Ver todos los documentos disponibles | [`DOCUMENTACION.md`](DOCUMENTACION.md) |
| Ver la presentación de sustentación (lo más actual) | [`docs/presentacion/`](docs/presentacion/) |

## ⚠️ Pendientes conocidos

- **`/api/ingesta/` devuelve 400** al recibir datos del ESP32 — el dato
  específico que falla no se identificó todavía. Contexto completo en
  [`docs/troubleshooting_backend.md`](docs/troubleshooting_backend.md).
- **Ruta "Historial" del frontend** presentaba fallas de acceso, sin
  diagnosticar (mismo documento de arriba).
- **Firmware sin confirmar:** [`firmware/sceht.ino`](firmware/sceht.ino) y su
  diagrama de Wokwi están armados para Arduino Uno, pero el resto del
  proyecto (objetivos, presentación) es sobre ESP32. Falta confirmar cuál es
  el hardware vigente.
- **`frontend.zip` en la raíz es un duplicado** de `frontend/cocina-frontend/`
  ya descomprimido — candidato a borrar, no se tocó por si aún se usa.

## Estructura del repositorio

\`\`\`
Backend_cocina/        → Backend real (Django): apps "cocina" y "sensores"
frontend/cocina-frontend/ → Frontend real (Vite)
database_cocina.sql    → Esquema/volcado de la base de datos

docs/
  presentacion/         → PDF de sustentación (documento más actual)
  informes/              → Informe de plataforma web, PROTOTIPO, listado de materiales
  diagramas/              → Lógica de prioridades y diagramas del sistema
  justificacion_estadistica_incendios.md → Datos de bomberos y casos de prensa
                                            que sustentan la necesidad del proyecto
  troubleshooting_backend.md → Notas de depuración del backend (bugs resueltos y pendientes)

firmware/
  sceht.ino              → Firmware (ver nota de hardware arriba)
  wokwi_diagram.json     → Diagrama de simulación Wokwi

analisis/
  notebooks/              → Notebook vigente de justificación estadística
  notebooks/historial/    → Versiones previas (v1, v2, exploración), como referencia
  datos/                  → Datasets pequeños usados en el análisis

referencias/
  estado_del_arte.md      → Citas de los 7 antecedentes académicos revisados
                             (sin los PDF, por derechos de autor)
\`\`\`

## Datos excluidos del repositorio

Algunos datasets crudos no se subieron por tamaño (superan o se acercan al
límite de GitHub) y quedan solo en el archivo local del proyecto:
`is.data.1.AllData` (231 MB), `Tarifas_aplicadas_de_Gas_Natural...csv` (31 MB),
`Soporte_Magnetico_Declaracion...xlsm` (19 MB).

## Licencias / material de terceros

Los PDF de los papers académicos citados en `referencias/estado_del_arte.md`
no están en este repositorio por derechos de autor de las editoriales — solo
se dejaron las citas y enlaces.
