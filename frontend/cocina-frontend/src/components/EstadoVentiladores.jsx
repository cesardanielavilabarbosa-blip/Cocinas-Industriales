import React from 'react';
import '../styles/EstadoVentiladores.css';

const EstadoVentiladores = ({ lectura, error }) => {
  if (error) {
    return (
      <div className="estado-ventiladores error-state">
        <h3>ESTADO DE VENTILADORES</h3>
        <p style={{ color: '#ff6b6b', fontSize: '16px', marginTop: '20px', fontWeight: 'bold' }}>🔌 API Desconectada</p>
        <p style={{ color: '#ff6b6b', fontSize: '14px' }}>No se puede conectar al servidor</p>
      </div>
    );
  }

  if (!lectura) {
    return <div className="estado-ventiladores"><p>⏳ Cargando...</p></div>;
  }

  const ventiladores = [
    {
      nombre: 'Ventilador Extracción',
      estado: lectura.ventilador_extraccion,
      icono: '⬆️',
    },
    {
      nombre: 'Ventilador Inyección 1',
      estado: lectura.ventilador_inyeccion_1,
      icono: '➡️',
    },
    {
      nombre: 'Ventilador Inyección 2',
      estado: lectura.ventilador_inyeccion_2,
      icono: '➡️',
    },
  ];

  return (
    <div className="estado-ventiladores">
      <h3>Estado de Ventiladores</h3>
      <div className="ventiladores-grid">
        {ventiladores.map((ventilador, index) => (
          <div
            key={index}
            className={`ventilador-card ${ventilador.estado ? 'activo' : 'inactivo'}`}
          >
            <div className="ventilador-icono">{ventilador.icono}</div>
            <div className="ventilador-nombre">{ventilador.nombre}</div>
            <div className="ventilador-estado">
              <span className={`estado-badge ${ventilador.estado ? 'encendido' : 'apagado'}`}>
                {ventilador.estado ? 'ENCENDIDO' : 'APAGADO'}
              </span>
            </div>
            <div className={`ventilador-indicador ${ventilador.estado ? 'activo' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstadoVentiladores;
