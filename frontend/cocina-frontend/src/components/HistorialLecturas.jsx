import React, { useState } from 'react';
import '../styles/HistorialLecturas.css';

const HistorialLecturas = ({ lecturas, error }) => {
  const [pagina, setPagina] = useState(1);
  const itemsPorPagina = 10;

  if (error) {
    return (
      <div className="historial-lecturas error-state">
        <h3>HISTORIAL DE LECTURAS</h3>
        <div className="historial-vacio">
          <p style={{ color: '#ff6b6b', fontSize: '16px', fontWeight: 'bold' }}>🔌 API Desconectada</p>
          <p style={{ color: '#ff6b6b', fontSize: '14px' }}>No se puede conectar al servidor</p>
        </div>
      </div>
    );
  }

  if (!lecturas || lecturas.length === 0) {
    return (
      <div className="historial-lecturas">
        <h3>Historial de Lecturas</h3>
        <div className="historial-vacio">
          <p>⏳ Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Calcular paginación
  const totalPaginas = Math.ceil(lecturas.length / itemsPorPagina);
  const indiceInicio = (pagina - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const lecturasPagina = lecturas.slice(indiceInicio, indiceFin);

  // Formatear fecha
  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Obtener color para el estado
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

  // Formatear valor booleano
  const formatearBoleano = (valor) => {
    return valor ? '✅' : '❌';
  };

  return (
    <div className="historial-lecturas">
      <h3>Historial de Lecturas</h3>
      <div className="historial-info">
        <span>Total de registros: {lecturas.length}</span>
        <span>Página {pagina} de {totalPaginas}</span>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-historial">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Temperatura</th>
              <th>Gas</th>
              <th>Llama</th>
              <th>Extracción</th>
              <th>Inyección 1</th>
              <th>Inyección 2</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lecturasPagina.map((lectura, index) => (
              <tr key={index}>
                <td className="celda-fecha">
                  {formatearFecha(lectura.timestamp)}
                </td>
                <td className="celda-numero">
                  {lectura.temperatura}°C
                </td>
                <td className="celda-numero">
                  {lectura.nivel_gas}
                </td>
                <td className="celda-booleano">
                  {formatearBoleano(lectura.llama_detectada)}
                </td>
                <td className="celda-booleano">
                  {formatearBoleano(lectura.ventilador_extraccion)}
                </td>
                <td className="celda-booleano">
                  {formatearBoleano(lectura.ventilador_inyeccion_1)}
                </td>
                <td className="celda-booleano">
                  {formatearBoleano(lectura.ventilador_inyeccion_2)}
                </td>
                <td>
                  <span
                    className="estado-badge"
                    style={{ backgroundColor: getColorEstado(lectura.estado_sistema) }}
                  >
                    {lectura.estado_sistema.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button
            className="btn-pagina"
            onClick={() => setPagina(Math.max(1, pagina - 1))}
            disabled={pagina === 1}
          >
            ← Anterior
          </button>

          <div className="numeros-pagina">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`numero-pagina ${pagina === num ? 'activo' : ''}`}
                onClick={() => setPagina(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            className="btn-pagina"
            onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
            disabled={pagina === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialLecturas;
