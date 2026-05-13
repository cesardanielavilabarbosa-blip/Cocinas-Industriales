import React from 'react';
import '../styles/LecturaActual.css';

const LecturaActual = ({ lectura, error }) => {
  if (error) {
    return (
      <div className="lectura-actual error-state">
        <h2>ÚLTIMA LECTURA</h2>
        <div style={{ color: '#ff6b6b', fontSize: '16px', marginTop: '20px', fontWeight: 'bold' }}>
          🔌 API Desconectada
        </div>
        <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  if (!lectura) {
    return <div className="lectura-actual"><h2>ÚLTIMA LECTURA</h2><p>⏳ Conectando...</p></div>;
  }

  // Formatear la fecha y hora
  const fechaHora = new Date(lectura.timestamp).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Determinar color según estado
  const getColorEstado = (estado) => {
    const colores = {
      NORMAL: '#4caf50',
      TEMPERATURA_ALTA: '#ff9800',
      GAS_DETECTADO: '#f44336',
      LLAMA_DETECTADA: '#f44336',
      EMERGENCIA: '#c62828',
    };
    return colores[estado] || '#757575';
  };

  return (
    <div className="lectura-actual">
      <h2>Última Lectura</h2>
      <div className="lectura-timestamp">
        <span>{fechaHora}</span>
      </div>

      <div className="lectura-grid">
        <div className="lectura-card">
          <span className="lectura-label">🌡️ Temperatura</span>
          <span className="lectura-valor">{lectura.temperatura}°C</span>
        </div>

        <div className="lectura-card">
          <span className="lectura-label">💨 Nivel de Gas</span>
          <span className="lectura-valor">{lectura.nivel_gas}</span>
        </div>

        <div className="lectura-card">
          <span className="lectura-label">🌬️ Presión</span>
          <span className="lectura-valor">{lectura.presion} hPa</span>
        </div>

        <div className="lectura-card">
          <span className="lectura-label">🔥 Llama Detectada</span>
          <span className={`lectura-valor ${lectura.llama_detectada ? 'alerta' : 'normal'}`}>
            {lectura.llama_detectada ? 'SÍ' : 'NO'}
          </span>
        </div>

        <div className="lectura-card">
          <span className="lectura-label">🖥️ Estado del Sistema</span>
          <span 
            className="lectura-valor estado"
            style={{ backgroundColor: getColorEstado(lectura.estado_sistema) }}
          >
            {lectura.estado_sistema.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LecturaActual;
