# Sistema de Seguridad IoT para Cocinas Industriales

Prototipo de plataforma IoT para el monitoreo de gas, temperatura y llama en
cocinas industriales, con generación de alertas y activación automática de
ventilación. Proyecto de ingeniería.

## Estado actual (ver `docs/presentacion/`)

La presentación de sustentación es el documento más actualizado del proyecto
y resume el estado real: objetivos, arquitectura, lógica de prioridades y el
estado del arte revisado.

## ⚠️ Huecos conocidos — leer antes de asumir que el repo está completo

- **Falta el backend real.** El código Django que procesa `/api/ingesta/` y
  sirve `/api/dispositivos/`, que se estuvo depurando, no estaba en los
  archivos entregados. Ver `backend/TROUBLESHOOTING.md` para el contexto de
  los bugs ya resueltos y el pendiente (error 400 en `/api/ingesta/`, ruta
  "Historial" del frontend). Agregar el código real en `backend/` en cuanto
  se recupere.
- **Inconsistencia de hardware por confirmar.** `firmware/sceht.ino` y
  `firmware/wokwi_diagram.json` están armados para **Arduino Uno**, pero la
  presentación y los objetivos hablan de **ESP32** (que además es necesario
  para conectividad Wi-Fi con el backend). Hay que confirmar cuál es el
  firmware vigente y, si el hardware real es ESP32, portar el `.ino`.
- **Frontend no incluido.** No había archivos de la plataforma web en lo
  entregado, solo referencias en la documentación.

## Estructura

```
docs/
  presentacion/    → PDF de sustentación (documento más actual)
  informes/        → Informe de plataforma web, prototipo, listado de materiales
  diagramas/       → Lógica de prioridades y diagramas del sistema (docx + html)
firmware/
  sceht.ino        → Firmware (ver nota de hardware arriba)
  wokwi_diagram.json → Diagrama de simulación Wokwi
analisis/
  notebooks/       → Notebook vigente de justificación estadística
  notebooks/historial/ → Versiones previas (v1, v2, exploración), se conservan
                         como referencia; el vigente es el de la carpeta padre
  datos/           → Datasets pequeños usados en el análisis
backend/
  TROUBLESHOOTING.md → Notas de depuración del backend (backend aún no incluido)
referencias/
  estado_del_arte.md → Citas de los 7 antecedentes revisados (sin los PDF,
                        ver nota de licencias abajo)
```

## Datos excluidos del repositorio

Dos archivos de datos crudos no se incluyeron por tamaño:

- `Soporte_Magnetico_Declaracion_de_Produccion_de_Gas_Natural_GN_2025-2034-1.xlsm` (19 MB)
- `is.data.1.AllData` (231 MB — supera el límite de 100 MB por archivo de GitHub)
- `Tarifas_aplicadas_de_Gas_Natural_20260729.csv` (31 MB)

Quedan disponibles en el archivo local del proyecto. Si se necesitan
versionados, usar Git LFS en vez de commitearlos directo.

## Licencias / material de terceros

Los PDF de los papers académicos citados en el estado del arte **no están en
este repositorio** por derechos de autor de las editoriales. Ver
`referencias/estado_del_arte.md` para las citas completas.

## Cómo subir esto a GitHub

```bash
cd sistema-seguridad-cocinas-iot
git init
git add .
git commit -m "Organización inicial del proyecto"
git branch -M main
git remote add origin <URL_DEL_REPO_QUE_CREES_EN_GITHUB>
git push -u origin main
```
