import React, { useState, useEffect } from 'react';
import HistorialLecturas from '../components/HistorialLecturas';
import { obtenerLecturas } from '../services/api';
import '../styles/HistorialPage.css';

export default function HistorialPage() {
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarHistorial = async () => {
    try {
      const data = await obtenerLecturas(100);
      // Validar si es array o un objeto con propiedad results
      const lecturasList = Array.isArray(data) ? data : data.results || [];
      setLecturas(lecturasList);
      setError(null);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('🔌 No se puede conectar al servidor');
      setLecturas([]);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarHistorial();
    const intervalo = setInterval(cargarHistorial, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="historial-page">
      <div className="historial-header">
        <h2>📊 Historial de Lecturas</h2>
        <p>Todos los registros del sistema</p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#c62828',
            color: 'white',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          {error}
        </div>
      )}

      {cargando ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '24px', marginBottom: '10px' }}>🔌</p>
          <p style={{ color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }}>API Desconectada</p>
          <p style={{ color: '#ff6b6b', fontSize: '14px' }}>No se puede conectar al servidor</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
