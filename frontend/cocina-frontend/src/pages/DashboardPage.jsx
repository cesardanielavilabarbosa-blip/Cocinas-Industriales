import React, { useState, useEffect } from 'react';
import LecturaActual from '../components/LecturaActual';
import EstadoVentiladores from '../components/EstadoVentiladores';
import Alertas from '../components/Alertas';
import Graficas from '../components/Graficas';
import HistorialLecturas from '../components/HistorialLecturas';
import { obtenerUltimaLectura, obtenerLecturas } from '../services/api';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const [lectura, setLectura] = useState(null);
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarLectura = async () => {
    try {
      const data = await obtenerUltimaLectura();
      setLectura(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar lectura:', err);
      setError('No se puede conectar al servidor');
      setLectura(null);
    }
  };

  const cargarHistorial = async () => {
    try {
      const data = await obtenerLecturas(100);
      const lecturasList = Array.isArray(data) ? data : data.results || [];
      setLecturas(lecturasList);
      setError(null);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se puede conectar al servidor');
      setLecturas([]);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarLectura();
    cargarHistorial();
    const intervalo = setInterval(() => {
      cargarLectura();
      cargarHistorial();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const estado = lectura?.estado_sistema || 'SIN DATOS';
  const fecha = lectura?.timestamp
    ? new Date(lectura.timestamp).toLocaleString('es-CO')
    : '--';

  return (
    <main className="terminal-layout">
      <header className="terminal-topbar">
        <div>
          <h1>Monitoreo</h1>
          <span className={`topbar-status ${estado.toLowerCase().replaceAll('_', '-')}`}>
            ● {error ? 'API DESCONECTADA' : estado.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="topbar-actions">
          <span className="system-pill">Sistema Normal</span>
          <button className="emergency-btn">Emergencia </button>
        </div>
      </header>

      <section className="operation-banner">
        <div>
          <h2>● Estado operativo: {estado.replaceAll('_', ' ')}</h2>
          <p>{error ? error : 'Todos los parámetros se encuentran dentro de los rangos configurados.'}</p>
        </div>
        <div className="last-reading">
          <span>Última lectura</span>
          <strong>{fecha}</strong>
        </div>
      </section>

      {cargando ? (
        <div className="loading-panel">Conectando con servidor...</div>
      ) : (
        <div className="terminal-content">
          <LecturaActual lectura={lectura} error={error} />
          <EstadoVentiladores lectura={lectura} error={error} />
          <Alertas lectura={lectura} error={error} />
          <Graficas lecturas={lecturas} error={error} />
          <HistorialLecturas lecturas={lecturas} error={error} />
        </div>
      )}
    </main>
  );
}
