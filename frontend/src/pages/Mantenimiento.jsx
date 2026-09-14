import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { RefreshCw, CheckCircle } from 'lucide-react';

export default function Mantenimiento() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [casaId, setCasaId] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/mantenimiento/tareas');
      setTareas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  const crearTarea = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/mantenimiento/tareas', {
        method: 'POST',
        body: JSON.stringify({ casaId: Number(casaId), descripcion })
      });
      setCasaId('');
      setDescripcion('');
      cargarTareas();
    } catch (err) {
      alert(err.message);
    }
  };

  const marcarCompletada = async (id) => {
    try {
      await fetchAPI(`/mantenimiento/tareas/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: 'COMPLETADA' })
      });
      cargarTareas();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-fade-in">
      <div className="glass-card header-card mb-6">
        <h1>Gestión de Mantenimiento</h1>
        <p className="text-muted">Coordina las tareas críticas de las casas.</p>
      </div>

      <div className="glass-card mb-6">
        <h3>Crear Nueva Tarea</h3>
        <form onSubmit={crearTarea} className="inline-form mt-4">
          <input 
            type="number" 
            placeholder="ID Casa (Ej. 1)" 
            value={casaId} 
            onChange={e => setCasaId(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Descripción de la tarea" 
            value={descripcion} 
            onChange={e => setDescripcion(e.target.value)} 
            required 
          />
          <button type="submit" className="btn-primary">Asignar Tarea</button>
        </form>
      </div>

      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3>Tareas Actuales</h3>
          <button className="btn-secondary" onClick={cargarTareas} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
          </button>
        </div>

        <div className="list-container">
          {loading ? <p>Cargando...</p> : tareas.map(t => (
            <div key={t.id} className="list-item">
              <div>
                <h4>{t.descripcion}</h4>
                <small className="text-muted">Casa {t.casaId} | Límite: {t.fechaLimite || 'Sin fecha'}</small>
              </div>
              <div className="flex-align-center gap-2">
                <span className={`badge ${t.estado.toLowerCase()}`}>{t.estado}</span>
                {t.estado === 'PENDIENTE' && (
                  <button onClick={() => marcarCompletada(t.id)} className="btn-icon" style={{color: 'var(--success)'}} title="Completar">
                    <CheckCircle size={24} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {!loading && tareas.length === 0 && <p>No hay tareas pendientes.</p>}
        </div>
      </div>
    </div>
  );
}
