import axios from 'axios';

// Configurar la URL base del API
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Interceptor para agregar timestamp a las peticiones GET y prevenir caché
api.interceptors.request.use((config) => {
  if (config.method === 'get') {
    // Agregar timestamp para evitar caché del navegador
    config.params = config.params || {};
    config.params._t = new Date().getTime();
  }
  return config;
});

/**
 * Obtiene la última lectura registrada
 * @returns {Promise} Última lectura del sistema
 */
export const obtenerUltimaLectura = async () => {
  try {
    const response = await api.get('/lecturas/ultima/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener última lectura:', error);
    throw error;
  }
};

/**
 * Obtiene todas las lecturas (historial)
 * @param {number} limit - Límite de resultados
 * @returns {Promise} Array de lecturas
 */
export const obtenerLecturas = async (limit = 100) => {
  try {
    const response = await api.get('/lecturas/', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener lecturas:', error);
    throw error;
  }
};

/**
 * Obtiene solo las alertas (lecturas con estado != NORMAL)
 * @returns {Promise} Array de alertas
 */
export const obtenerAlertas = async () => {
  try {
    const response = await api.get('/lecturas/alertas/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    throw error;
  }
};

/**
 * Obtiene un resumen del estado actual del sistema
 * @returns {Promise} Resumen con estado actual, datos de sensores y estadísticas
 */
export const obtenerResumen = async () => {
  try {
    const response = await api.get('/lecturas/resumen/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    throw error;
  }
};

/**
 * Crea una nueva lectura (utilizado por el ESP32)
 * @param {Object} datos - Objeto con los datos de la lectura
 * @returns {Promise} Lectura creada
 */
export const crearLectura = async (datos) => {
  try {
    const response = await api.post('/lecturas/', datos);
    return response.data;
  } catch (error) {
    console.error('Error al crear lectura:', error);
    throw error;
  }
};

/**
 * Obtiene alertas con filtro opcional por tipo
 * @param {string} tipo - Tipo de alerta a filtrar (opcional)
 * @returns {Promise} Array de alertas filtradas
 */
export const obtenerAlertusPorTipo = async (tipo) => {
  try {
    const response = await api.get('/lecturas/alertas/', {
      params: { tipo },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas por tipo:', error);
    throw error;
  }
};

/**
 * Obtiene las lecturas filtradas por estado del sistema
 * @param {string} estado - Estado a filtrar (NORMAL, GAS_DETECTADO, etc.)
 * @returns {Promise} Array de lecturas filtradas
 */
export const obtenerLecturasPorEstado = async (estado) => {
  try {
    const response = await api.get('/lecturas/', {
      params: { estado },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener lecturas por estado:', error);
    throw error;
  }
};

export default api;
