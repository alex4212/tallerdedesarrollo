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
  AlertCircle,
  ShoppingCart,
  Sparkles,
  Store
} from 'lucide-react';

// ─── Constantes de categorías ───────────────────────────────────────────
const CATEGORIAS = [
  {
    value: 'COMESTIBLES',
    label: 'Comestibles',
    icon: ShoppingCart,
    color: '#38BDF8',
    bg: 'rgba(56,189,248,0.12)',
    border: 'rgba(56,189,248,0.3)'
  },
  {
    value: 'ASEO_Y_LIMPIEZA',
    label: 'Aseo y Limpieza',
    icon: Sparkles,
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.3)'
  }
];

// Establecimientos sugeridos por categoría
const ESTABLECIMIENTOS = {
  COMESTIBLES: ['Supermercado', 'Lider', 'Jumbo', 'Unimarc', 'Santa Isabel', 'Coto', 'Otro'],
  ASEO_Y_LIMPIEZA: ['Supermercado', 'Jumbo', 'Easy', 'Sodimac', 'Ferretería', 'Distribuidor', 'Otro']
};

function CategoriaTag({ categoria }) {
  const cat = CATEGORIAS.find(c => c.value === categoria) || CATEGORIAS[0];
  const Icon = cat.icon;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '0.74rem',
      padding: '3px 10px',
      background: cat.bg,
      color: cat.color,
      borderRadius: '20px',
      border: `1px solid ${cat.border}`,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      <Icon size={12} />
      {cat.label}
    </span>
  );
}

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
  const [categoria, setCategoria] = useState('COMESTIBLES');
  const [establecimiento, setEstablecimiento] = useState('');
  const [estabPersonalizado, setEstabPersonalizado] = useState(false);

  // Delete Confirmation State
  const [gastoAEliminar, setGastoAEliminar] = useState(null);

  // Filters State
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroCasa, setFiltroCasa] = useState('TODAS');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');

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

  const formatCLP = (val) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(val) || 0);

  const resetForm = () => {
    setCasaId('');
    setDescripcion('');
    setMonto('');
    setUrlBoleta('');
    setCategoria('COMESTIBLES');
    setEstablecimiento('');
    setEstabPersonalizado(false);
  };

  const abrirModalCrear = () => {
    setEditandoGasto(null);
    resetForm();
    if (casas.length > 0) setCasaId(String(casas[0].id));
    setShowModal(true);
  };

  const abrirModalEditar = (g) => {
    setEditandoGasto(g);
    setCasaId(String(g.casaId));
    setDescripcion(g.descripcion);
    setMonto(String(g.monto));
    setUrlBoleta(g.urlBoleta || '');
    setCategoria(g.categoria || 'COMESTIBLES');
    const estab = g.establecimiento || '';
    const sugeridos = ESTABLECIMIENTOS[g.categoria || 'COMESTIBLES'];
    const esPersonalizado = estab && !sugeridos.includes(estab);
    setEstablecimiento(estab);
    setEstabPersonalizado(esPersonalizado);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoGasto(null);
    resetForm();
  };

  const handleCategoriaChange = (val) => {
    setCategoria(val);
    setEstablecimiento('');
    setEstabPersonalizado(false);
  };

  const handleEstablecimientoSelect = (val) => {
    if (val === 'Otro') {
      setEstabPersonalizado(true);
      setEstablecimiento('');
    } else {
      setEstabPersonalizado(false);
      setEstablecimiento(val);
    }
  };

  const guardarGasto = async (e) => {
    e.preventDefault();
    if (!casaId) return;
    const payload = {
      casaId: Number(casaId),
      descripcion,
      monto: Number(monto),
      urlBoleta,
      categoria,
      establecimiento: establecimiento || null
    };
    try {
      if (editandoGasto) {
        await fetchAPI(`/sostenibilidad/gastos/${editandoGasto.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchAPI('/sostenibilidad/gastos', { method: 'POST', body: JSON.stringify(payload) });
      }
      cerrarModal();
      cargarGastos();
    } catch (err) {
      console.error(err);
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await fetchAPI(`/sostenibilidad/gastos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      cargarGastos();
    } catch (err) { console.error(err); }
  };

  const confirmarEliminar = async () => {
    if (!gastoAEliminar) return;
    try {
      await fetchAPI(`/sostenibilidad/gastos/${gastoAEliminar.id}`, { method: 'DELETE' });
      setGastoAEliminar(null);
      cargarGastos();
    } catch (err) { console.error(err); }
  };

  // ─── Estadísticas Financieras ─────────────────────────────────────────
  const stats = useMemo(() => {
    let totalGeneral = 0, totalPendiente = 0, cantPendiente = 0;
    let totalAprobado = 0, cantAprobado = 0, totalRechazado = 0, cantRechazado = 0;

    gastos.forEach(g => {
      const valor = Number(g.monto) || 0;
      totalGeneral += valor;
      if (g.estado === 'PENDIENTE') { totalPendiente += valor; cantPendiente++; }
      else if (g.estado === 'APROBADO') { totalAprobado += valor; cantAprobado++; }
      else if (g.estado === 'RECHAZADO') { totalRechazado += valor; cantRechazado++; }
    });

    return { totalGeneral, totalPendiente, cantPendiente, totalAprobado, cantAprobado, totalRechazado, cantRechazado, totalRegistros: gastos.length };
  }, [gastos]);

  // ─── Distribución por Casa (con desglose por categoría) ───────────────
  const distribucionPorCasa = useMemo(() => {
    const mapa = {};
    casas.forEach(c => {
      mapa[c.id] = { id: c.id, nombre: c.nombre, total: 0, comestibles: 0, aseo: 0 };
    });
    gastos.forEach(g => {
      if (mapa[g.casaId]) {
        const val = Number(g.monto) || 0;
        mapa[g.casaId].total += val;
        if (g.categoria === 'ASEO_Y_LIMPIEZA') mapa[g.casaId].aseo += val;
        else mapa[g.casaId].comestibles += val;
      }
    });
    const lista = Object.values(mapa);
    const maximo = Math.max(...lista.map(i => i.total), 1);
    return lista.map(item => ({ ...item, porcentaje: Math.round((item.total / maximo) * 100) }));
  }, [casas, gastos]);

  // ─── Totales por Categoría ────────────────────────────────────────────
  const totalesPorCategoria = useMemo(() => {
    const res = { COMESTIBLES: 0, ASEO_Y_LIMPIEZA: 0 };
    gastos.forEach(g => {
      const val = Number(g.monto) || 0;
      if (g.categoria === 'ASEO_Y_LIMPIEZA') res.ASEO_Y_LIMPIEZA += val;
      else res.COMESTIBLES += val;
    });
    return res;
  }, [gastos]);

  // ─── Gastos filtrados ─────────────────────────────────────────────────
  const gastosFiltrados = useMemo(() => {
    return gastos.filter(g => {
      if (filtroEstado !== 'TODOS' && g.estado !== filtroEstado) return false;
      if (filtroCasa !== 'TODAS' && String(g.casaId) !== String(filtroCasa)) return false;
      if (filtroCategoria !== 'TODAS' && g.categoria !== filtroCategoria) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincide = [g.descripcion, g.establecimiento, `casa ${g.casaId}`]
          .some(s => (s || '').toLowerCase().includes(q));
        if (!coincide) return false;
      }
      return true;
    });
  }, [gastos, filtroEstado, filtroCasa, filtroCategoria, busqueda]);

  // ─── Gastos agrupados por casa (para vista por casa) ─────────────────
  const gastosPorCasa = useMemo(() => {
    const grupos = {};
    gastosFiltrados.forEach(g => {
      const key = g.casaId;
      if (!grupos[key]) {
        const casa = casas.find(c => c.id === key);
        grupos[key] = { casaId: key, nombre: casa?.nombre || `Casa ${key}`, gastos: [], total: 0 };
      }
      grupos[key].gastos.push(g);
      grupos[key].total += Number(g.monto) || 0;
    });
    return Object.values(grupos).sort((a, b) => a.casaId - b.casaId);
  }, [gastosFiltrados, casas]);

  const selectStyle = {
    width: '100%',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '0.9rem'
  };

  const inputStyle = { ...selectStyle };

  return (
    <div className="page-fade-in">
      {/* Header */}
      <div className="glass-card header-card mb-6">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Sostenibilidad y Gastos</h1>
            <p className="text-muted">Gestión de rendiciones presupuestarias por categoría y casa.</p>
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

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap primary"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Total Rendido</span>
            <span className="kpi-value">{formatCLP(stats.totalGeneral)}</span>
            <span className="kpi-subtext">{stats.totalRegistros} rendiciones</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap warning"><Clock size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Por Aprobar</span>
            <span className="kpi-value">{formatCLP(stats.totalPendiente)}</span>
            <span className="kpi-subtext">{stats.cantPendiente} pendientes</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap success"><CheckCircle2 size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Aprobados</span>
            <span className="kpi-value">{formatCLP(stats.totalAprobado)}</span>
            <span className="kpi-subtext">{stats.cantAprobado} validados</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap danger"><XCircle size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Rechazados</span>
            <span className="kpi-value">{formatCLP(stats.totalRechazado)}</span>
            <span className="kpi-subtext">{stats.cantRechazado} objetados</span>
          </div>
        </div>
      </div>

      {/* Resumen por Categoría */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        {CATEGORIAS.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.value} className="glass-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', border: `1px solid ${cat.border}` }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} style={{ color: cat.color }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: '1.3rem', fontWeight: 700, color: cat.color }}>
                  {formatCLP(totalesPorCategoria[cat.value])}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {gastos.filter(g => g.categoria === cat.value).length} registros
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribución por Casa con desglose */}
      <div className="glass-card budget-distribution-card">
        <div className="flex-between">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: 'var(--primary-color)' }} /> Distribución de Fondos por Casa
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comestibles · Aseo</span>
        </div>
        <div className="budget-grid">
          {distribucionPorCasa.map((item) => (
            <div key={item.id} className="budget-item">
              <div className="budget-item-header">
                <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCLP(item.total)}</span>
              </div>
              <div className="budget-progress-track">
                <div className="budget-progress-fill" style={{ width: `${item.porcentaje}%` }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#38BDF8' }}>
                  <ShoppingCart size={11} style={{ verticalAlign: 'middle' }} /> {formatCLP(item.comestibles)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#A78BFA' }}>
                  <Sparkles size={11} style={{ verticalAlign: 'middle' }} /> {formatCLP(item.aseo)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="glass-card mb-6">
        <div className="filter-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Búsqueda */}
          <div className="search-input-wrap" style={{ minWidth: '200px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar descripción, establecimiento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Pills Estado */}
          <div className="filter-pills">
            {['TODOS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'].map(est => (
              <button
                key={est}
                className={`filter-pill ${filtroEstado === est ? 'active' : ''}`}
                onClick={() => setFiltroEstado(est)}
              >
                {est === 'TODOS' ? `Todos (${stats.totalRegistros})` :
                  est === 'PENDIENTE' ? `Pendientes (${stats.cantPendiente})` :
                  est === 'APROBADO' ? `Aprobados (${stats.cantAprobado})` :
                  `Rechazados (${stats.cantRechazado})`}
              </button>
            ))}
          </div>

          {/* Filtro Categoría */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[{ value: 'TODAS', label: 'Todas categorías' }, ...CATEGORIAS.map(c => ({ value: c.value, label: c.label }))].map(op => (
              <button
                key={op.value}
                onClick={() => setFiltroCategoria(op.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  border: `1px solid ${filtroCategoria === op.value ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                  background: filtroCategoria === op.value ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: filtroCategoria === op.value ? 'var(--primary-color)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Filtro Casa */}
          <select
            value={filtroCasa}
            onChange={(e) => setFiltroCasa(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.82rem', outline: 'none' }}
          >
            <option value="TODAS" style={{ background: 'var(--bg-color)', color: 'white' }}>Todas las casas</option>
            {casas.map(c => (
              <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Listado agrupado por Casa */}
        <div className="list-container" style={{ marginTop: '20px' }}>
          {loading ? (
            <p className="text-center text-muted" style={{ padding: '30px' }}>Cargando gastos...</p>
          ) : gastosPorCasa.length === 0 ? (
            <p className="text-center text-muted" style={{ padding: '30px' }}>
              No se encontraron rendiciones con los filtros seleccionados.
            </p>
          ) : (
            gastosPorCasa.map(grupo => (
              <div key={grupo.casaId} style={{ marginBottom: '24px' }}>
                {/* Cabecera de casa */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', marginBottom: '8px',
                  background: 'rgba(99,102,241,0.1)', borderRadius: '12px',
                  border: '1px solid rgba(99,102,241,0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} style={{ color: 'var(--primary-color)' }} />
                    <strong style={{ color: 'white', fontSize: '0.95rem' }}>{grupo.nombre}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {grupo.gastos.length} rendiciones</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
                    {formatCLP(grupo.total)}
                  </span>
                </div>

                {/* Gastos de la casa */}
                {grupo.gastos.map(g => {
                  const nombreCasa = casas.find(c => c.id === g.casaId)?.nombre || `Casa ${g.casaId}`;
                  return (
                    <div key={g.id} className="list-item" style={{ alignItems: 'flex-start', gap: '15px', marginLeft: '12px', borderLeft: '2px solid rgba(99,102,241,0.2)', paddingLeft: '16px', borderRadius: '0 12px 12px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <CategoriaTag categoria={g.categoria} />

                          {g.establecimiento && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                              <Store size={11} /> {g.establecimiento}
                            </span>
                          )}

                          {g.urlBoleta ? (
                            <a
                              href={g.urlBoleta} target="_blank" rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '2px 8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '6px', textDecoration: 'none', border: '1px solid rgba(99,102,241,0.3)' }}
                            >
                              <FileText size={12} /> Ver Boleta <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin documento</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{g.descripcion}</h4>
                          <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.05rem' }}>{formatCLP(g.monto)}</span>
                        </div>
                        <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>
                          Registro #{g.id} · {g.fecha ? new Date(g.fecha).toLocaleDateString('es-CL') : ''}
                        </small>
                      </div>

                      <div className="flex-align-center gap-2" style={{ flexShrink: 0, flexWrap: 'wrap' }}>
                        <span className={`badge ${g.estado.toLowerCase()}`}>{g.estado}</span>

                        {g.estado === 'PENDIENTE' && (
                          <div className="flex-align-center gap-1">
                            <button onClick={() => actualizarEstado(g.id, 'APROBADO')} className="btn-icon" style={{ color: 'var(--success)' }} title="Aprobar">
                              <Check size={22} />
                            </button>
                            <button onClick={() => actualizarEstado(g.id, 'RECHAZADO')} className="btn-icon" style={{ color: 'var(--danger)' }} title="Rechazar">
                              <X size={22} />
                            </button>
                          </div>
                        )}

                        <button onClick={() => abrirModalEditar(g)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Edit3 size={14} /> Editar
                        </button>
                        <button onClick={() => setGastoAEliminar(g)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.4)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal Crear / Editar ── */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>
                {editandoGasto ? <Edit3 size={20} /> : <Plus size={20} />}
                {editandoGasto ? 'Editar Rendición' : 'Nueva Rendición de Gastos'}
              </h3>
              <button className="btn-icon" onClick={cerrarModal} type="button"><X size={20} /></button>
            </div>

            <form onSubmit={guardarGasto}>
              {/* Casa */}
              <div className="input-group">
                <label>Casa Responsable</label>
                <select value={casaId} onChange={(e) => setCasaId(e.target.value)} required style={selectStyle}>
                  <option value="" disabled style={{ background: 'var(--bg-color)', color: 'white' }}>-- Seleccionar Casa --</option>
                  {casas.map(c => (
                    <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Categoría — selector visual */}
              <div className="input-group">
                <label>Categoría del Gasto</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {CATEGORIAS.map(cat => {
                    const Icon = cat.icon;
                    const activa = categoria === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoriaChange(cat.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                          border: `2px solid ${activa ? cat.color : 'var(--glass-border)'}`,
                          background: activa ? cat.bg : 'rgba(255,255,255,0.03)',
                          color: activa ? cat.color : 'var(--text-muted)',
                          transition: 'all 0.2s', fontWeight: activa ? 700 : 400
                        }}
                      >
                        <Icon size={20} />
                        <span style={{ fontSize: '0.9rem' }}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Establecimiento */}
              <div className="input-group">
                <label>Establecimiento <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                {!estabPersonalizado ? (
                  <select
                    value={establecimiento}
                    onChange={(e) => handleEstablecimientoSelect(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" style={{ background: 'var(--bg-color)', color: 'white' }}>-- Seleccionar establecimiento --</option>
                    {ESTABLECIMIENTOS[categoria].map(e => (
                      <option key={e} value={e} style={{ background: 'var(--bg-color)', color: 'white' }}>{e}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Escribir nombre del establecimiento..."
                      value={establecimiento}
                      onChange={(e) => setEstablecimiento(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button type="button" onClick={() => { setEstabPersonalizado(false); setEstablecimiento(''); }}
                      style={{ padding: '0 14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}>
                      ↩
                    </button>
                  </div>
                )}
              </div>

              {/* Monto */}
              <div className="input-group">
                <label>Monto del Gasto (CLP $)</label>
                <input type="number" placeholder="Ej: 35000" value={monto} onChange={(e) => setMonto(e.target.value)} required min="1" style={inputStyle} />
              </div>

              {/* Descripción */}
              <div className="input-group">
                <label>Descripción del Gasto</label>
                <input type="text" placeholder="Ej: Compra mensual de víveres" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required style={inputStyle} />
              </div>

              {/* URL Boleta */}
              <div className="input-group">
                <label>URL Boleta / Comprobante <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                <input type="url" placeholder="https://..." value={urlBoleta} onChange={(e) => setUrlBoleta(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                  {editandoGasto ? 'Guardar Cambios' : 'Registrar Rendición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminación ── */}
      {gastoAEliminar && (
        <div className="modal-overlay" onClick={() => setGastoAEliminar(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Confirmar Eliminación
              </h3>
              <button className="btn-icon" onClick={() => setGastoAEliminar(null)} type="button"><X size={20} /></button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              ¿Eliminar la rendición por <strong>{formatCLP(gastoAEliminar.monto)}</strong> ("{gastoAEliminar.descripcion}")? Esta acción no se puede revertir.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setGastoAEliminar(null)}>Cancelar</button>
              <button type="button" className="btn-primary" style={{ width: 'auto', background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
