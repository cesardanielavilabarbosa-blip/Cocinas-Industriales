import React, { useState, useEffect } from 'react';
import LecturaActual from '../components/LecturaActual';
import EstadoVentiladores from '../components/EstadoVentiladores';
import Alertas from '../components/Alertas';
import Graficas from '../components/Graficas';
import { obtenerUltimaLectura, obtenerLecturas } from '../services/api';

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
      setError('🔌 No se puede conectar al servidor');
      setLectura(null);
    }
  };

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
    cargarLectura();
    cargarHistorial();
    const intervalo = setInterval(() => {
      cargarLectura();
      cargarHistorial();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
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
      <LecturaActual lectura={lectura} error={error} />
      <EstadoVentiladores lectura={lectura} error={error} />
      <Alertas lectura={lectura} error={error} />
      <Graficas lecturas={lecturas} error={error} />
    </div>
  );
}
