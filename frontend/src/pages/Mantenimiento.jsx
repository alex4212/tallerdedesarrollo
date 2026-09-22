import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { RefreshCw, CheckCircle } from 'lucide-react';

export default function Mantenimiento() {
  const [tareas, setTareas] = useState([]);
  const [casas, setCasas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [casaId, setCasaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('CORRECTIVO');
  const [fechaLimite, setFechaLimite] = useState('');
  const [editandoTarea, setEditandoTarea] = useState(null);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/mantenimiento/tareas');
      setTareas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCasas = async () => {
    try {
      const data = await fetchAPI('/acogida/casas');
      setCasas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarTareas();
    cargarCasas();
  }, []);

  const guardarTarea = async (e) => {
    e.preventDefault();
    if (!casaId) return alert('Selecciona una casa');
    try {
      if (editandoTarea) {
        await fetchAPI(`/mantenimiento/tareas/${editandoTarea.id}`, {
          method: 'PUT',
          body: JSON.stringify({ descripcion, casaId: Number(casaId), fechaLimite, tipo })
        });
        setEditandoTarea(null);
      } else {
        await fetchAPI('/mantenimiento/tareas', {
          method: 'POST',
          body: JSON.stringify({ casaId: Number(casaId), descripcion, tipo, fechaLimite })
        });
      }
      setCasaId('');
      setDescripcion('');
      setTipo('CORRECTIVO');
      setFechaLimite('');
      cargarTareas();
    } catch (err) {
      alert(err.message);
    }
  };

  const iniciarEdicion = (t) => {
    setEditandoTarea(t);
    setCasaId(t.casaId);
    setDescripcion(t.descripcion);
    setTipo(t.tipo || 'CORRECTIVO');
    setFechaLimite(t.fechaLimite || '');
  };

  const cancelarEdicion = () => {
    setEditandoTarea(null);
    setCasaId('');
    setDescripcion('');
    setTipo('CORRECTIVO');
    setFechaLimite('');
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

  const eliminarTarea = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    try {
      await fetchAPI(`/mantenimiento/tareas/${id}`, { method: 'DELETE' });
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
        <h3>{editandoTarea ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h3>
        <form onSubmit={guardarTarea} className="inline-form mt-4">
          <select 
            value={casaId} 
            onChange={e => setCasaId(e.target.value)} 
            required
            className="input-select"
            style={{ minWidth: '200px', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
          >
            <option value="" style={{ background: 'var(--bg-color)', color: 'white' }}>-- Seleccionar Casa --</option>
            {casas.map(c => (
              <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select 
            value={tipo} 
            onChange={e => setTipo(e.target.value)} 
            required
            className="input-select"
            style={{ minWidth: '150px', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
          >
            <option value="CORRECTIVO" style={{ background: 'var(--bg-color)', color: 'white' }}>Orden correctivo</option>
            <option value="PREVENTIVO" style={{ background: 'var(--bg-color)', color: 'white' }}>Preventivo</option>
          </select>
          <input 
            type="date"
            value={fechaLimite}
            onChange={e => setFechaLimite(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
          />
          <input 
            type="text" 
            placeholder="Descripción de la tarea"  
            value={descripcion} 
            onChange={e => setDescripcion(e.target.value)} 
            required 
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
            {editandoTarea ? 'Actualizar' : 'Crear Nuevo'}
          </button>
          {editandoTarea && (
            <button type="button" className="btn-secondary" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
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
                <h4>{t.descripcion} <span style={{fontSize: '0.75rem', opacity: 0.8, marginLeft: '8px', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px'}}>{t.tipo || 'CORRECTIVO'}</span></h4>
                <small className="text-muted">Casa {t.casaId} | Límite: {t.fechaLimite || 'Sin fecha'}</small>
              </div>
              <div className="flex-align-center gap-2">
                <span className={`badge ${t.estado.toLowerCase()}`}>{t.estado}</span>
                {t.estado === 'PENDIENTE' && (
                  <button onClick={() => marcarCompletada(t.id)} className="btn-icon" style={{color: 'var(--success)'}} title="Completar">
                    <CheckCircle size={24} />
                  </button>
                )}
                <button onClick={() => iniciarEdicion(t)} className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}}>
                  Actualizar
                </button>
                <button onClick={() => eliminarTarea(t.id)} className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)'}}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {!loading && tareas.length === 0 && <p>No hay tareas pendientes.</p>}
        </div>
      </div>
    </div>
  );
}
