# Backend - Sistema IoT de Cocina

Backend seguro para conectar ESP32, base de datos PostgreSQL y página web.

## 📋 Descripción

Sistema de monitoreo para cocina industrial con:
- ✅ Recepción de datos del ESP32
- ✅ Almacenamiento en PostgreSQL
- ✅ API REST para la página web
- ✅ Alertas en tiempo real
- ✅ Historial completo de lecturas

## 🚀 Características

### Datos Monitoreados
- Temperatura
- Nivel de gas
- Detección de llama
- Estados de ventiladores (extracción e inyección)
- Estado general del sistema

### Estados del Sistema
- `NORMAL` - Funcionamiento correcto
- `TEMPERATURA_ALTA` - Alerta de temperatura
- `GAS_DETECTADO` - Alerta de gas
- `LLAMA_DETECTADA` - Alerta de llama
- `EMERGENCIA` - Parar todo

## 🔌 Rutas API

### Crear Lectura
```bash
POST /api/lecturas/
Content-Type: application/json

{
  "temperatura": 34.5,
  "nivel_gas": 420,
  "llama_detectada": false,
  "ventilador_extraccion": true,
  "ventilador_inyeccion_1": true,
  "ventilador_inyeccion_2": false,
  "estado_sistema": "NORMAL"
}
```

### Obtener Lecturas
```bash
GET /api/lecturas/              # Todas las lecturas
GET /api/lecturas/ultima/       # Última lectura
GET /api/lecturas/alertas/      # Solo alertas
GET /api/lecturas/resumen/      # Resumen del sistema
```

### Filtrar Alertas
```bash
GET /api/lecturas/alertas/?tipo=EMERGENCIA
GET /api/lecturas/alertas/?tipo=TEMPERATURA_ALTA
GET /api/lecturas/alertas/?tipo=GAS_DETECTADO
```

## 🔧 Instalación

### Requisitos
- Python 3.13+
- PostgreSQL 12+
- pip

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Backend_cocina.git
cd Backend_cocina
```

2. **Crear virtual environment**
```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL
```

5. **Crear migraciones**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Crear superusuario (para admin)**
```bash
python manage.py createsuperuser
```

7. **Ejecutar servidor**
```bash
python manage.py runserver
```

El servidor estará en: `http://127.0.0.1:8000/`

## 📊 Admin Panel

Accede a: `http://127.0.0.1:8000/admin/`

Desde aquí puedes:
- Ver todas las lecturas
- Filtrar por estado
- Buscar por tipo de alerta
- Exportar datos

## 🗄️ Base de Datos

Modelo `Lectura`:
```
id (PK)
temperatura (Float)
nivel_gas (Int)
llama_detectada (Boolean)
ventilador_extraccion (Boolean)
ventilador_inyeccion_1 (Boolean)
ventilador_inyeccion_2 (Boolean)
estado_sistema (CharField)
timestamp (DateTime) - Indexado para búsquedas rápidas
```

## 🔐 Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commits `.env` con credenciales reales
- Usa variables de entorno para producción
- Cambia `SECRET_KEY` en producción
- Configura `ALLOWED_HOSTS` según el dominio

## 📦 Tecnologías

- Django 5.2.7
- Django REST Framework 3.15.2
- PostgreSQL 12+
- psycopg2 (driver PostgreSQL)
- Python Decouple (manejo de env)

## 📝 Estructura

```
Backend_cocina/
├── backend/              # Configuración principal
│   ├── settings.py       # Configuración Django
│   ├── urls.py           # URLs principales
│   └── wsgi.py
├── cocina/               # App principal
│   ├── models.py         # Modelo Lectura
│   ├── views.py          # ViewSets API
│   ├── serializers.py    # Serializers
│   ├── urls.py           # URLs de cocina
│   ├── admin.py          # Admin Django
│   └── migrations/
├── manage.py
├── requirements.txt
├── .env                  # NO SUBIR (credenciales)
├── .gitignore
└── README.md
```

## 🚧 Próximas Mejoras

- [ ] Autenticación JWT para ESP32
- [ ] Gráficas en tiempo real
- [ ] Filtros avanzados por fecha
- [ ] Exportar datos a CSV
- [ ] Webhooks para alertas
- [ ] Docker setup

## 📞 Contacto

Para problemas o sugerencias, abre un Issue.

## 📄 Licencia

Este proyecto es parte del curso de Microcontroladores.
