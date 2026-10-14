import React, { useEffect, useState, useMemo } from 'react';
import { fetchAPI } from '../services/api';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  FileText,
  Building2,
  ExternalLink,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export default function Sostenibilidad() {
  const [gastos, setGastos] = useState([]);
  const [casas, setCasas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [casaId, setCasaId] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlBoleta, setUrlBoleta] = useState('');

  // Delete Confirmation State
  const [gastoAEliminar, setGastoAEliminar] = useState(null);

  // Filters State
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  const [filtroCasa, setFiltroCasa] = useState('TODAS');

  const cargarGastos = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/sostenibilidad/gastos');
      setGastos(Array.isArray(data) ? data : []);
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
    cargarGastos();
    cargarCasas();
  }, []);

  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  const abrirModalCrear = () => {
    setEditandoGasto(null);
    setCasaId(casas.length > 0 ? String(casas[0].id) : '');
    setDescripcion('');
    setMonto('');
    setUrlBoleta('');
    setShowModal(true);
  };

  const abrirModalEditar = (g) => {
    setEditandoGasto(g);
    setCasaId(String(g.casaId));
    setDescripcion(g.descripcion);
    setMonto(String(g.monto));
    setUrlBoleta(g.urlBoleta || '');
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoGasto(null);
    setCasaId('');
    setDescripcion('');
    setMonto('');
    setUrlBoleta('');
  };

  const guardarGasto = async (e) => {
    e.preventDefault();
    if (!casaId) return;
    try {
      if (editandoGasto) {
        await fetchAPI(`/sostenibilidad/gastos/${editandoGasto.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            descripcion,
            monto: Number(monto),
            casaId: Number(casaId),
            urlBoleta
          })
        });
      } else {
        await fetchAPI('/sostenibilidad/gastos', {
          method: 'POST',
          body: JSON.stringify({
            casaId: Number(casaId),
            descripcion,
            monto: Number(monto),
            urlBoleta
          })
        });
      }
      cerrarModal();
      cargarGastos();
    } catch (err) {
      console.error(err);
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await fetchAPI(`/sostenibilidad/gastos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado })
      });
      cargarGastos();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmarEliminar = async () => {
    if (!gastoAEliminar) return;
    try {
      await fetchAPI(`/sostenibilidad/gastos/${gastoAEliminar.id}`, { method: 'DELETE' });
      setGastoAEliminar(null);
      cargarGastos();
    } catch (err) {
      console.error(err);
    }
  };

  // Estadísticas Financieras
  const stats = useMemo(() => {
    let totalGeneral = 0;
    let totalPendiente = 0;
    let cantPendiente = 0;
    let totalAprobado = 0;
    let cantAprobado = 0;
    let totalRechazado = 0;
    let cantRechazado = 0;

    gastos.forEach(g => {
      const valor = Number(g.monto) || 0;
      totalGeneral += valor;

      if (g.estado === 'PENDIENTE') {
        totalPendiente += valor;
        cantPendiente += 1;
      } else if (g.estado === 'APROBADO') {
        totalAprobado += valor;
        cantAprobado += 1;
      } else if (g.estado === 'RECHAZADO') {
        totalRechazado += valor;
        cantRechazado += 1;
      }
    });

    return {
      totalGeneral,
      totalPendiente,
      cantPendiente,
      totalAprobado,
      cantAprobado,
      totalRechazado,
      cantRechazado,
      totalRegistros: gastos.length
    };
  }, [gastos]);

  // Distribución de gastos por casa
  const distribucionPorCasa = useMemo(() => {
    const mapa = {};
    casas.forEach(c => {
      mapa[c.id] = { id: c.id, nombre: c.nombre, total: 0 };
    });

    gastos.forEach(g => {
      if (mapa[g.casaId]) {
        mapa[g.casaId].total += Number(g.monto) || 0;
      }
    });

    const lista = Object.values(mapa);
    const maximo = Math.max(...lista.map(item => item.total), 1);

    return lista.map(item => ({
      ...item,
      porcentaje: Math.round((item.total / maximo) * 100)
    }));
  }, [casas, gastos]);

  // Gastos filtrados
  const gastosFiltrados = useMemo(() => {
    return gastos.filter(g => {
      if (filtroEstado !== 'TODOS' && g.estado !== filtroEstado) return false;
      if (filtroCasa !== 'TODAS' && String(g.casaId) !== String(filtroCasa)) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincideDesc = (g.descripcion || '').toLowerCase().includes(q);
        const coincideCasa = `casa ${g.casaId}`.includes(q);
        if (!coincideDesc && !coincideCasa) return false;
      }
      return true;
    });
  }, [gastos, filtroEstado, filtroCasa, busqueda]);

  return (
    <div className="page-fade-in">
      {/* Header */}
      <div className="glass-card header-card mb-6">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Sostenibilidad y Gastos</h1>
            <p className="text-muted">Gestión de rendiciones presupuestarias, boletas y aprobación de fondos.</p>
          </div>
          <div className="flex-align-center gap-2">
            <button className="btn-secondary" onClick={cargarGastos} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
            </button>
            <button
              className="btn-primary"
              onClick={abrirModalCrear}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'auto' }}
            >
              <Plus size={18} /> Nueva Rendición
            </button>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Financieros */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap primary">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Rendido</span>
            <span className="kpi-value">{formatCLP(stats.totalGeneral)}</span>
            <span className="kpi-subtext">{stats.totalRegistros} rendiciones registradas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap warning">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Por Aprobar</span>
            <span className="kpi-value">{formatCLP(stats.totalPendiente)}</span>
            <span className="kpi-subtext">{stats.cantPendiente} pendientes de firma</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Aprobados</span>
            <span className="kpi-value">{formatCLP(stats.totalAprobado)}</span>
            <span className="kpi-subtext">{stats.cantAprobado} gastos validados</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap danger">
            <XCircle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Rechazados</span>
            <span className="kpi-value">{formatCLP(stats.totalRechazado)}</span>
            <span className="kpi-subtext">{stats.cantRechazado} rendiciones objetadas</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Distribución de Presupuesto por Casa */}
      <div className="glass-card budget-distribution-card">
        <div className="flex-between">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: 'var(--primary-color)' }} /> Distribución de Fondos por Casa
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proporción acumulada</span>
        </div>

        <div className="budget-grid">
          {distribucionPorCasa.map((item) => (
            <div key={item.id} className="budget-item">
              <div className="budget-item-header">
                <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCLP(item.total)}</span>
              </div>
              <div className="budget-progress-track">
                <div
                  className="budget-progress-fill"
                  style={{ width: `${item.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
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
              className={`filter-pill ${filtroEstado === 'TODOS' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('TODOS')}
            >
              Todos ({stats.totalRegistros})
            </button>
            <button
              className={`filter-pill ${filtroEstado === 'PENDIENTE' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('PENDIENTE')}
            >
              Pendientes ({stats.cantPendiente})
            </button>
            <button
              className={`filter-pill ${filtroEstado === 'APROBADO' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('APROBADO')}
            >
              Aprobados ({stats.cantAprobado})
            </button>
            <button
              className={`filter-pill ${filtroEstado === 'RECHAZADO' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('RECHAZADO')}
            >
              Rechazados ({stats.cantRechazado})
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
          </div>
        </div>

        {/* Listado de Rendiciones */}
        <div className="list-container">
          {loading ? (
            <p className="text-center text-muted" style={{ padding: '30px' }}>Cargando gastos...</p>
          ) : gastosFiltrados.length === 0 ? (
            <p className="text-center text-muted" style={{ padding: '30px' }}>
              No se encontraron rendiciones con los filtros seleccionados.
            </p>
          ) : (
            gastosFiltrados.map((g) => {
              const nombreCasa = casas.find(c => c.id === g.casaId)?.nombre || `Casa ${g.casaId}`;

              return (
                <div key={g.id} className="list-item" style={{ alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                        <Building2 size={14} /> {nombreCasa}
                      </span>

                      {g.urlBoleta ? (
                        <a
                          href={g.urlBoleta}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            padding: '2px 8px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#818cf8',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          <FileText size={12} /> Ver Boleta <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Sin documento adjunto
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: '0', fontSize: '1.05rem', color: 'white' }}>
                        {g.descripcion}
                      </h4>
                      <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {formatCLP(g.monto)}
                      </span>
                    </div>

                    <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>
                      Identificador de registro: #{g.id}
                    </small>
                  </div>

                  <div className="flex-align-center gap-2" style={{ flexShrink: 0, flexWrap: 'wrap' }}>
                    <span className={`badge ${g.estado.toLowerCase()}`}>
                      {g.estado}
                    </span>

                    {g.estado === 'PENDIENTE' && (
                      <div className="flex-align-center gap-1">
                        <button
                          onClick={() => actualizarEstado(g.id, 'APROBADO')}
                          className="btn-icon"
                          style={{ color: 'var(--success)' }}
                          title="Aprobar Rendición"
                        >
                          <Check size={22} />
                        </button>
                        <button
                          onClick={() => actualizarEstado(g.id, 'RECHAZADO')}
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Rechazar Rendición"
                        >
                          <X size={22} />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => abrirModalEditar(g)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Editar rendición"
                    >
                      <Edit3 size={14} /> Editar
                    </button>

                    <button
                      onClick={() => setGastoAEliminar(g)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      title="Eliminar rendición"
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

      {/* Modal Crear / Editar Rendición */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editandoGasto ? <Edit3 size={20} /> : <Plus size={20} />}
                {editandoGasto ? 'Editar Rendición de Gastos' : 'Nueva Rendición de Gastos'}
              </h3>
              <button className="btn-icon" onClick={cerrarModal} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarGasto}>
              <div className="input-group">
                <label>Casa Responsable</label>
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
                <label>Monto del Gasto (CLP $)</label>
                <input
                  type="number"
                  placeholder="Ej: 35000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  min="1"
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
                <label>Descripción del Gasto</label>
                <input
                  type="text"
                  placeholder="Ej: Compra de víveres y útiles de aseo mensual"
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

              <div className="input-group">
                <label>URL de Boleta o Comprobante Digital (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/boleta.pdf"
                  value={urlBoleta}
                  onChange={(e) => setUrlBoleta(e.target.value)}
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
                  {editandoGasto ? 'Guardar Cambios' : 'Registrar Rendición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {gastoAEliminar && (
        <div className="modal-overlay" onClick={() => setGastoAEliminar(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Confirmar Eliminación
              </h3>
              <button className="btn-icon" onClick={() => setGastoAEliminar(null)} type="button">
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              ¿Estás seguro de que deseas eliminar la rendición por <strong>{formatCLP(gastoAEliminar.monto)}</strong> ("{gastoAEliminar.descripcion}")? Esta acción no se puede revertir.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setGastoAEliminar(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', background: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={confirmarEliminar}
              >
                Eliminar Rendición
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
