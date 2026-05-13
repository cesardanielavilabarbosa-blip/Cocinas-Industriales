import React, { useState, useEffect } from 'react';
import { obtenerUltimaLectura, obtenerAlertas } from '../services/api';
import '../styles/Dashboard.css';
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
      setError('No se puede conectar al servidor');
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

  const estado = lectura?.estado_sistema || 'SIN DATOS';
  const fecha = lectura?.timestamp
    ? new Date(lectura.timestamp).toLocaleString('es-CO')
    : '--';

  const estadoInfo = {
    NORMAL: { color: '#22c55e', icono: '✅', titulo: 'Sistema Normal', desc: 'Todo está funcionando correctamente' },
    TEMPERATURA_ALTA: { color: '#f97316', icono: '🌡️', titulo: 'Temperatura Elevada', desc: 'La temperatura excede el límite permitido' },
    GAS_DETECTADO: { color: '#ef4444', icono: '⚠️', titulo: 'Gas Detectado', desc: 'Se ha detectado presencia de gas' },
    LLAMA_DETECTADA: { color: '#dc2626', icono: '🔥', titulo: 'Llama Detectada', desc: 'Se ha detectado una llama no autorizada' },
    EMERGENCIA: { color: '#7f1d1d', icono: '🚨', titulo: 'EMERGENCIA', desc: 'Situación crítica del sistema' },
  };

  const info = estadoInfo[estado] || estadoInfo.NORMAL;

  return (
    <main className="terminal-layout">
      <header className="terminal-topbar">
        <div>
          <h1>Centro de Alertas</h1>
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
        </div>
      )}
    </main>
  );
}
