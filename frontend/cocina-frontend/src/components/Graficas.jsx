import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../styles/Graficas.css';

const Graficas = ({ lecturas, error }) => {
  if (error) {
    return (
      <div className="graficas-contenedor error-state">
        <h3>GRÁFICAS DE MONITOREO</h3>
        <p style={{ color: '#ff6b6b', fontSize: '16px', marginTop: '20px', fontWeight: 'bold' }}>🔌 API Desconectada</p>
        <p style={{ color: '#ff6b6b', fontSize: '14px' }}>No se puede conectar al servidor</p>
      </div>
    );
  }

  if (!lecturas || lecturas.length === 0) {
    return (
      <div className="graficas-contenedor">
        <p className="sin-datos">⏳ Cargando datos...</p>
      </div>
    );
  }

  // Preparar datos para las gráficas - últimas 20 lecturas
  const datosGrafica = lecturas
    .slice(-20)
    .reverse()
    .map((lectura, index) => ({
      id: index,
      tiempo: new Date(lectura.timestamp).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperatura: parseFloat(lectura.temperatura),
      gas: lectura.nivel_gas,
      presion: parseFloat(lectura.presion),
    }));

  // Encontrar min y max para temperaturas
  const temps = datosGrafica.map((d) => d.temperatura);
  const minTemp = Math.floor(Math.min(...temps));
  const maxTemp = Math.ceil(Math.max(...temps));

  return (
    <div className="graficas-seccion">
      <h3>Gráficas de Monitoreo</h3>

      <div className="graficas-grid">
        {/* Gráfica de Temperatura */}
        <div className="grafica-card">
          <h4>Temperatura vs Tiempo</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={datosGrafica}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <XAxis
                dataKey="tiempo"
                stroke="#90caf9"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#90caf9"
                domain={[minTemp - 1, maxTemp + 1]}
                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #90caf9',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#90caf9' }}
                formatter={(value) => [`${value.toFixed(1)}°C`, 'Temperatura']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="temperatura"
                stroke="#ff6b6b"
                dot={{ fill: '#ff6b6b', r: 4 }}
                activeDot={{ r: 6 }}
                name="Temperatura"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de Gas */}
        <div className="grafica-card">
          <h4>Nivel de Gas vs Tiempo</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={datosGrafica}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <XAxis
                dataKey="tiempo"
                stroke="#90caf9"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#90caf9"
                label={{ value: 'ppm', angle: -90, position: 'insideLeft' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #ffd54f',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#ffd54f' }}
                formatter={(value) => [`${value} ppm`, 'Gas']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="gas"
                stroke="#ffd54f"
                dot={{ fill: '#ffd54f', r: 4 }}
                activeDot={{ r: 6 }}
                name="Nivel de Gas"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de Presión */}
        <div className="grafica-card">
          <h4>Presión vs Tiempo</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={datosGrafica}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <XAxis
                dataKey="tiempo"
                stroke="#90caf9"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#90caf9"
                label={{ value: 'hPa', angle: -90, position: 'insideLeft' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #81c784',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#81c784' }}
                formatter={(value) => [`${value.toFixed(2)} hPa`, 'Presión']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="presion"
                stroke="#81c784"
                dot={{ fill: '#81c784', r: 4 }}
                activeDot={{ r: 6 }}
                name="Presión"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="estadisticas-graficas">
        <div className="stat-card">
          <span className="stat-label">Temperatura Actual</span>
          <span className="stat-valor">
            {datosGrafica[0].temperatura}°C
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Temperatura Mín</span>
          <span className="stat-valor">{minTemp}°C</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Temperatura Máx</span>
          <span className="stat-valor">{maxTemp}°C</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Gas Actual</span>
          <span className="stat-valor">
            {datosGrafica[0].gas} ppm
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Presión Actual</span>
          <span className="stat-valor">
            {datosGrafica[0].presion.toFixed(2)} hPa
          </span>
        </div>
      </div>
    </div>
  );
};

export default Graficas;
