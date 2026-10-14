import React, { useEffect, useState, useMemo } from 'react';
import { fetchAPI } from '../services/api';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Calendar,
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Mantenimiento() {
  const [tareas, setTareas] = useState([]);
  const [casas, setCasas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editandoTarea, setEditandoTarea] = useState(null);
  const [casaId, setCasaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('CORRECTIVO');
  const [fechaLimite, setFechaLimite] = useState('');

  // Delete Confirmation State
  const [tareaAEliminar, setTareaAEliminar] = useState(null);

  // Filters State
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS'); // 'TODAS' | 'PENDIENTE' | 'COMPLETADA'
  const [filtroCasa, setFiltroCasa] = useState('TODAS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // 'TODOS' | 'CORRECTIVO' | 'PREVENTIVO'

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

  const abrirModalCrear = () => {
    setEditandoTarea(null);
    setCasaId(casas.length > 0 ? String(casas[0].id) : '');
    setDescripcion('');
    setTipo('CORRECTIVO');
    setFechaLimite('');
    setShowModal(true);
  };

  const abrirModalEditar = (t) => {
    setEditandoTarea(t);
    setCasaId(String(t.casaId));
    setDescripcion(t.descripcion);
    setTipo(t.tipo || 'CORRECTIVO');
    setFechaLimite(t.fechaLimite || '');
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoTarea(null);
    setCasaId('');
    setDescripcion('');
    setTipo('CORRECTIVO');
    setFechaLimite('');
  };

  const guardarTarea = async (e) => {
    e.preventDefault();
    if (!casaId) return;
    try {
      if (editandoTarea) {
        await fetchAPI(`/mantenimiento/tareas/${editandoTarea.id}`, {
          method: 'PUT',
          body: JSON.stringify({ descripcion, casaId: Number(casaId), fechaLimite, tipo })
        });
      } else {
        await fetchAPI('/mantenimiento/tareas', {
          method: 'POST',
          body: JSON.stringify({ casaId: Number(casaId), descripcion, tipo, fechaLimite })
        });
      }
      cerrarModal();
      cargarTareas();
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const confirmarEliminar = async () => {
    if (!tareaAEliminar) return;
    try {
      await fetchAPI(`/mantenimiento/tareas/${tareaAEliminar.id}`, { method: 'DELETE' });
      setTareaAEliminar(null);
      cargarTareas();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper para calcular urgencia de fecha
  const getUrgencia = (fechaStr, estado) => {
    if (estado === 'COMPLETADA') return { tipo: 'completada', texto: 'Completada' };
    if (!fechaStr || fechaStr === 'Sin fecha') return { tipo: 'sin-fecha', texto: 'Sin fecha' };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(fechaStr + 'T00:00:00');

    if (isNaN(limite.getTime())) return { tipo: 'sin-fecha', texto: fechaStr };

    const diffDias = Math.round((limite - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return { tipo: 'vencida', texto: `Vencida hace ${Math.abs(diffDias)} d` };
    }
    if (diffDias <= 2) {
      return { tipo: 'proxima', texto: diffDias === 0 ? 'Vence hoy' : `Vence en ${diffDias} d` };
    }
    return { tipo: 'a-tiempo', texto: `Plazo: ${diffDias} d` };
  };

  // Estadísticas KPI
  const stats = useMemo(() => {
    const total = tareas.length;
    const pendientes = tareas.filter(t => t.estado === 'PENDIENTE').length;
    const completadas = tareas.filter(t => t.estado === 'COMPLETADA').length;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const criticas = tareas.filter(t => {
      if (t.estado !== 'PENDIENTE') return false;
      if (!t.fechaLimite || t.fechaLimite === 'Sin fecha') return false;
      const limite = new Date(t.fechaLimite + 'T00:00:00');
      return !isNaN(limite.getTime()) && limite < hoy;
    }).length;

    return { total, pendientes, completadas, criticas };
  }, [tareas]);

  // Tareas filtradas
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      if (filtroEstado !== 'TODAS' && t.estado !== filtroEstado) return false;
      if (filtroCasa !== 'TODAS' && String(t.casaId) !== String(filtroCasa)) return false;
      if (filtroTipo !== 'TODOS' && (t.tipo || 'CORRECTIVO') !== filtroTipo) return false;
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase();
        const coincideDesc = (t.descripcion || '').toLowerCase().includes(query);
        const coincideCasa = `casa ${t.casaId}`.includes(query);
        if (!coincideDesc && !coincideCasa) return false;
      }
      return true;
    });
  }, [tareas, filtroEstado, filtroCasa, filtroTipo, busqueda]);

  return (
    <div className="page-fade-in">
      {/* Header */}
      <div className="glass-card header-card mb-6">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Gestión de Mantenimiento</h1>
            <p className="text-muted">Supervisión técnica, preventivos y reparaciones de las casas de la Aldea.</p>
          </div>
          <div className="flex-align-center gap-2">
            <button className="btn-secondary" onClick={cargarTareas} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
            </button>
            <button className="btn-primary" onClick={abrirModalCrear} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
              <Plus size={18} /> Nueva Tarea
            </button>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Ejecutivos */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap primary">
            <Wrench size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Tareas</span>
            <span className="kpi-value">{stats.total}</span>
            <span className="kpi-subtext">Histórico acumulado</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap warning">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pendientes</span>
            <span className="kpi-value">{stats.pendientes}</span>
            <span className="kpi-subtext">Requieren atención</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap danger">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Críticas / Vencidas</span>
            <span className="kpi-value">{stats.criticas}</span>
            <span className="kpi-subtext">Fecha límite superada</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Completadas</span>
            <span className="kpi-value">{stats.completadas}</span>
            <span className="kpi-subtext">Trabajos finalizados</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="glass-card mb-6">
        <div className="filter-toolbar">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por descripción o casa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            <button
              className={`filter-pill ${filtroEstado === 'TODAS' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('TODAS')}
            >
              Todas ({stats.total})
            </button>
            <button
              className={`filter-pill ${filtroEstado === 'PENDIENTE' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('PENDIENTE')}
            >
              Pendientes ({stats.pendientes})
            </button>
            <button
              className={`filter-pill ${filtroEstado === 'COMPLETADA' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('COMPLETADA')}
            >
              Completadas ({stats.completadas})
            </button>
          </div>

          <div className="flex-align-center gap-2">
            <select
              value={filtroCasa}
              onChange={(e) => setFiltroCasa(e.target.value)}
              className="input-select"
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                fontSize: '0.82rem'
              }}
            >
              <option value="TODAS" style={{ background: 'var(--bg-color)', color: 'white' }}>Todas las casas</option>
              {casas.map(c => (
                <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="input-select"
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                fontSize: '0.82rem'
              }}
            >
              <option value="TODOS" style={{ background: 'var(--bg-color)', color: 'white' }}>Todos los tipos</option>
              <option value="CORRECTIVO" style={{ background: 'var(--bg-color)', color: 'white' }}>Correctivo</option>
              <option value="PREVENTIVO" style={{ background: 'var(--bg-color)', color: 'white' }}>Preventivo</option>
            </select>
          </div>
        </div>

        {/* Listado de Tareas */}
        <div className="list-container">
          {loading ? (
            <p className="text-center text-muted" style={{ padding: '30px' }}>Cargando tareas...</p>
          ) : tareasFiltradas.length === 0 ? (
            <p className="text-center text-muted" style={{ padding: '30px' }}>
              No se encontraron tareas con los filtros seleccionados.
            </p>
          ) : (
            tareasFiltradas.map((t) => {
              const urgencia = getUrgencia(t.fechaLimite, t.estado);
              const nombreCasa = casas.find(c => c.id === t.casaId)?.nombre || `Casa ${t.casaId}`;
              const esCorrectivo = (t.tipo || 'CORRECTIVO') === 'CORRECTIVO';

              return (
                <div key={t.id} className="list-item" style={{ alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span className={`task-type-badge ${esCorrectivo ? 'correctivo' : 'preventivo'}`}>
                        {esCorrectivo ? <Wrench size={12} /> : <ShieldCheck size={12} />}
                        {t.tipo || 'CORRECTIVO'}
                      </span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                        <Building2 size={13} /> {nombreCasa}
                      </span>

                      {t.estado === 'PENDIENTE' && (
                        <span className={`urgency-badge ${urgencia.tipo}`}>
                          <Clock size={12} /> {urgencia.texto}
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: t.estado === 'COMPLETADA' ? 'rgba(255,255,255,0.6)' : 'white', textDecoration: t.estado === 'COMPLETADA' ? 'line-through' : 'none' }}>
                      {t.descripcion}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> Límite: {t.fechaLimite || 'Sin fecha programada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-align-center gap-2" style={{ flexShrink: 0 }}>
                    <span className={`badge ${t.estado === 'COMPLETADA' ? 'aprobado' : 'pendiente'}`}>
                      {t.estado}
                    </span>

                    {t.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => marcarCompletada(t.id)}
                        className="btn-icon"
                        style={{ color: 'var(--success)' }}
                        title="Marcar como Completada"
                      >
                        <CheckCircle2 size={22} />
                      </button>
                    )}

                    <button
                      onClick={() => abrirModalEditar(t)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Editar tarea"
                    >
                      <Edit3 size={14} /> Editar
                    </button>

                    <button
                      onClick={() => setTareaAEliminar(t)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      title="Eliminar tarea"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Crear / Editar Tarea */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editandoTarea ? <Edit3 size={20} /> : <Plus size={20} />}
                {editandoTarea ? 'Editar Tarea de Mantenimiento' : 'Nueva Tarea de Mantenimiento'}
              </h3>
              <button className="btn-icon" onClick={cerrarModal} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarTarea}>
              <div className="input-group">
                <label>Casa Asignada</label>
                <select
                  value={casaId}
                  onChange={(e) => setCasaId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    outline: 'none'
                  }}
                >
                  <option value="" disabled style={{ background: 'var(--bg-color)', color: 'white' }}>-- Seleccionar Casa --</option>
                  {casas.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Tipo de Mantenimiento</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    outline: 'none'
                  }}
                >
                  <option value="CORRECTIVO" style={{ background: 'var(--bg-color)', color: 'white' }}>Orden Correctivo (Reparación urgente)</option>
                  <option value="PREVENTIVO" style={{ background: 'var(--bg-color)', color: 'white' }}>Preventivo (Revisión periódica)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Fecha Límite</label>
                <input
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="input-group">
                <label>Descripción del Trabajo</label>
                <input
                  type="text"
                  placeholder="Ej: Reparación de cerradura y bisagras de puerta principal"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                  {editandoTarea ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {tareaAEliminar && (
        <div className="modal-overlay" onClick={() => setTareaAEliminar(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Confirmar Eliminación
              </h3>
              <button className="btn-icon" onClick={() => setTareaAEliminar(null)} type="button">
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              ¿Estás seguro de que deseas eliminar la tarea <strong>"{tareaAEliminar.descripcion}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setTareaAEliminar(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', background: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={confirmarEliminar}
              >
                Eliminar Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
