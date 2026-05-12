import React, { useState, useEffect } from 'react';
import { obtenerUltimaLectura, obtenerAlertas } from '../services/api';
import '../styles/AlertasPage.css';

export default function AlertasPage() {
  const [lectura, setLectura] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      const [lecturaData, alertasData] = await Promise.all([
        obtenerUltimaLectura(),
        obtenerAlertas(),
      ]);
      setLectura(lecturaData);
      setAlertas(alertasData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
      setError('🔌 No se puede conectar al servidor');
      setLectura(null);
      setAlertas([]);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const estadoInfo = {
    NORMAL: { color: '#22c55e', icono: '✅', titulo: 'Sistema Normal', desc: 'Todo está funcionando correctamente' },
    TEMPERATURA_ALTA: { color: '#f97316', icono: '🌡️', titulo: 'Temperatura Elevada', desc: 'La temperatura excede el límite permitido' },
    GAS_DETECTADO: { color: '#ef4444', icono: '⚠️', titulo: 'Gas Detectado', desc: 'Se ha detectado presencia de gas' },
    LLAMA_DETECTADA: { color: '#dc2626', icono: '🔥', titulo: 'Llama Detectada', desc: 'Se ha detectado una llama no autorizada' },
    EMERGENCIA: { color: '#7f1d1d', icono: '🚨', titulo: 'EMERGENCIA', desc: 'Situación crítica del sistema' },
  };

  const estado = lectura?.estado_sistema || 'NORMAL';
  const info = estadoInfo[estado] || estadoInfo.NORMAL;

  return (
    <div className="alertas-page">
      <div className="alertas-header">
        <h2>🔔 Centro de Alertas</h2>
        <p>Monitoreo en tiempo real del sistema</p>
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
        <p>Cargando alertas...</p>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '24px', marginBottom: '10px' }}>🔌</p>
          <p style={{ color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }}>API Desconectada</p>
          <p style={{ color: '#ff6b6b', fontSize: '14px' }}>No se puede conectar al servidor</p>
        </div>
      ) : (
        <>
          <div className="estado-actual" style={{ borderLeftColor: info.color }}>
            <div className="estado-icono">{info.icono}</div>
            <div className="estado-info">
              <h3 style={{ color: info.color }}>{info.titulo}</h3>
              <p>{info.desc}</p>
            </div>
            <div className="estado-indicador" style={{ backgroundColor: info.color }}></div>
          </div>

          <div className="lecturas-criticas">
            <h3>📈 Valores Críticos</h3>
            <div className="criticas-grid">
              <div className={`critica-card ${parseFloat(lectura?.temperatura) > 35 ? 'alerta' : ''}`}>
                <span className="critica-label">Temperatura</span>
                <span className="critica-valor">{lectura?.temperatura}°C</span>
                <span className="critica-rango">Límite: 35°C</span>
              </div>
              <div className={`critica-card ${lectura?.nivel_gas > 450 ? 'alerta' : ''}`}>
                <span className="critica-label">Nivel de Gas</span>
                <span className="critica-valor">{lectura?.nivel_gas} ppm</span>
                <span className="critica-rango">Límite: 450 ppm</span>
              </div>
              <div className={`critica-card ${lectura?.llama_detectada ? 'alerta' : ''}`}>
                <span className="critica-label">Llama</span>
                <span className="critica-valor">{lectura?.llama_detectada ? '🔥 DETECTADA' : '✅ No detectada'}</span>
                <span className="critica-rango">Crítico si: SÍ</span>
              </div>
            </div>
          </div>

          <div className="historial-alertas">
            <h3>📋 Historial de Alertas</h3>
            {alertas.length === 0 ? (
              <div className="sin-alertas">
                <p>✅ No hay alertas en el sistema</p>
              </div>
            ) : (
              <div className="alertas-list">
                {alertas.map((alerta, index) => (
                  <div key={index} className="alerta-item">
                    <div className="alerta-tiempo">
                      {new Date(alerta.timestamp).toLocaleTimeString('es-CO')}
                    </div>
                    <div className="alerta-tipo">{alerta.tipo}</div>
                    <div className="alerta-mensaje">{alerta.mensaje}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
