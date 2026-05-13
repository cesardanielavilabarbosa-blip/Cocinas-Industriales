import React, { useState, useEffect } from 'react';
import HistorialLecturas from '../components/HistorialLecturas';
import { obtenerLecturas, obtenerUltimaLectura } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/HistorialPage.css';

export default function HistorialPage() {
  const [lecturas, setLecturas] = useState([]);
  const [lectura, setLectura] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      const [lecturasData, ultimaLecturaData] = await Promise.all([
        obtenerLecturas(100),
        obtenerUltimaLectura(),
      ]);
      const lecturasList = Array.isArray(lecturasData) ? lecturasData : lecturasData.results || [];
      setLecturas(lecturasList);
      setLectura(ultimaLecturaData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se puede conectar al servidor');
      setLecturas([]);
      setLectura(null);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
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
          <h1>Historial de Lecturas</h1>
          <span className={`topbar-status ${estado.toLowerCase().replaceAll('_', '-')}`}>
            ● {error ? 'API DESCONECTADA' : estado.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="topbar-actions">
          <span className="system-pill">Sistema Normal</span>
          <button className="emergency-btn">Emergencia</button>
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
          <div className="historial-stats">
            <div className="stat-card">
              <span className="stat-label">Total de Lecturas</span>
              <span className="stat-value">{lecturas.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Temperatura Promedio</span>
              <span className="stat-value">
                {lecturas.length > 0
                  ? (lecturas.reduce((acc, l) => acc + parseFloat(l.temperatura), 0) / lecturas.length).toFixed(1)
                  : '0'}
                °C
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Gas Promedio</span>
              <span className="stat-value">
                {lecturas.length > 0
                  ? Math.round(lecturas.reduce((acc, l) => acc + l.nivel_gas, 0) / lecturas.length)
                  : '0'}
                 ppm
              </span>
            </div>
          </div>
          <HistorialLecturas lecturas={lecturas} />
        </div>
      )}
    </main>
  );
}
