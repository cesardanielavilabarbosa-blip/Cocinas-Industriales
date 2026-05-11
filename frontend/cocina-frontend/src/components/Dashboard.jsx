import React, { useState, useEffect } from 'react';
import LecturaActual from './LecturaActual';
import EstadoVentiladores from './EstadoVentiladores';
import Alertas from './Alertas';
import HistorialLecturas from './HistorialLecturas';
import Graficas from './Graficas';
import { obtenerUltimaLectura, obtenerLecturas } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [lectura, setLectura] = useState(null);
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar la última lectura al montar el componente
  useEffect(() => {
    const cargarLectura = async () => {
      try {
        setCargando(true);
        const datos = await obtenerUltimaLectura();
        setLectura(datos);
        setError(null);
      } catch (err) {
        console.error('Error al cargar lectura:', err);
        setError('❌ No se puede conectar al servidor. Asegúrate de que el backend está ejecutándose en localhost:8000');
        setLectura(null);
      } finally {
        setCargando(false);
      }
    };

    const cargarHistorial = async () => {
      try {
        const datos = await obtenerLecturas();
        // Si es un array, usar directamente. Si es un objeto con 'results', usar eso.
        const lecturasList = Array.isArray(datos) ? datos : datos.results || [];
        setLecturas(lecturasList);
      } catch (err) {
        console.error('Error al cargar historial:', err);
        setLecturas([]);
      }
    };

    cargarLectura();
    cargarHistorial();

    // Actualizar cada 5 segundos
    const intervalo = setInterval(() => {
      cargarLectura();
      cargarHistorial();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔒 Monitor de Seguridad - Cocina</h1>
        <div className="header-info">
          {error && <div className="error-banner">{error}</div>}
          {!error && (
            <div className="status-indicator">
              <div className={`status-dot ${lectura?.estado_sistema.toLowerCase()}`} />
              <span>Sistema Activo</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-container">
        <LecturaActual lectura={lectura} error={error} />
        <EstadoVentiladores lectura={lectura} error={error} />
        <Alertas lectura={lectura} error={error} />
        <Graficas lecturas={lecturas} error={error} />
        <HistorialLecturas lecturas={lecturas} error={error} />
      </div>

      {cargando && <div className="loading">Conectando con servidor...</div>}
    </div>
  );
};

export default Dashboard;
