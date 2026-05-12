import React from 'react';
import '../styles/Alertas.css';

const Alertas = ({ lectura, error }) => {
  if (error) {
    return (
      <div className="alertas-section error-state">
        <h3>ESTADO DE ALERTAS</h3>
        <p style={{ color: '#ff6b6b', fontSize: '16px', marginTop: '20px', fontWeight: 'bold' }}>🔌 API Desconectada</p>
        <p style={{ color: '#ff6b6b', fontSize: '14px' }}>No se puede conectar al servidor</p>
      </div>
    );
  }

  if (!lectura) {
    return <div className="alertas-section"><p>⏳ Cargando...</p></div>;
  }

  // Mapeo de estados a información de alerta
  const estadoInfo = {
    NORMAL: {
      title: 'Sistema Normal',
      icon: '✅',
      color: '#4caf50',
      description: 'Todos los parámetros dentro de los rangos establecidos',
    },
    TEMPERATURA_ALTA: {
      title: 'Temperatura Alta',
      icon: '🌡️',
      color: '#ff9800',
      description: 'La temperatura ha excedido el límite permitido',
    },
    GAS_DETECTADO: {
      title: 'Gas Detectado',
      icon: '⚠️',
      color: '#f44336',
      description: 'Se ha detectado presencia de gas en el ambiente',
    },
    LLAMA_DETECTADA: {
      title: 'Llama Detectada',
      icon: '🔥',
      color: '#f44336',
      description: 'Se ha detectado presencia de llama',
    },
    EMERGENCIA: {
      title: 'Emergencia',
      icon: '🚨',
      color: '#c62828',
      description: 'Situación crítica - Se recomienda evacuación',
    },
  };

  const estado = estadoInfo[lectura.estado_sistema] || estadoInfo.NORMAL;

  return (
    <div className="alertas-section">
      <h3>Estado de Alertas</h3>
      <div
        className={`alerta-principal ${lectura.estado_sistema.toLowerCase()}`}
        style={{ borderLeftColor: estado.color }}
      >
        <div className="alerta-icono" style={{ color: estado.color }}>
          {estado.icon}
        </div>
        <div className="alerta-contenido">
          <div className="alerta-titulo" style={{ color: estado.color }}>
            {estado.title}
          </div>
          <div className="alerta-descripcion">
            {estado.description}
          </div>
        </div>
        {lectura.estado_sistema !== 'NORMAL' && (
          <div className="alerta-urgencia">
            <span>⚠️ Urgente</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertas;
