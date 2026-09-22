import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { RefreshCw, Check, X } from 'lucide-react';

export default function Sostenibilidad() {
  const [gastos, setGastos] = useState([]);
  const [casas, setCasas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [casaId, setCasaId] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlBoleta, setUrlBoleta] = useState('');
  const [editandoGasto, setEditandoGasto] = useState(null);

  const cargarGastos = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/sostenibilidad/gastos');
      setGastos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCasas = async () => {
    try {
      const data = await fetchAPI('/acogida/casas');
      setCasas(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarGastos();
    cargarCasas();
  }, []);

  const guardarGasto = async (e) => {
    e.preventDefault();
    if (!casaId) return alert('Selecciona una casa');
    try {
      if (editandoGasto) {
        await fetchAPI(`/sostenibilidad/gastos/${editandoGasto.id}`, {
          method: 'PUT',
          body: JSON.stringify({ descripcion, monto: Number(monto), casaId: Number(casaId), urlBoleta })
        });
        setEditandoGasto(null);
      } else {
        await fetchAPI('/sostenibilidad/gastos', {
          method: 'POST',
          body: JSON.stringify({ casaId: Number(casaId), descripcion, monto: Number(monto), urlBoleta })
        });
      }
      setCasaId('');
      setDescripcion('');
      setMonto('');
      setUrlBoleta('');
      cargarGastos();
    } catch (err) {
      alert(err.message);
    }
  };

  const iniciarEdicion = (g) => {
    setEditandoGasto(g);
    setCasaId(g.casaId);
    setDescripcion(g.descripcion);
    setMonto(g.monto);
    setUrlBoleta(g.urlBoleta || '');
  };

  const cancelarEdicion = () => {
    setEditandoGasto(null);
    setCasaId('');
    setDescripcion('');
    setMonto('');
    setUrlBoleta('');
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await fetchAPI(`/sostenibilidad/gastos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado })
      });
      cargarGastos();
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarGasto = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto?')) return;
    try {
      await fetchAPI(`/sostenibilidad/gastos/${id}`, { method: 'DELETE' });
      cargarGastos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-fade-in">
      <div className="glass-card header-card mb-6">
        <h1>Sostenibilidad y Gastos</h1>
        <p className="text-muted">Administra y revisa las rendiciones enviadas por las casas.</p>
      </div>

      <div className="glass-card mb-6">
        <h3>{editandoGasto ? 'Editar Rendición' : 'Nueva Rendición de Gastos'}</h3>
        <form onSubmit={guardarGasto} className="inline-form mt-4">
          <select 
            value={casaId} 
            onChange={e => setCasaId(e.target.value)} 
            required
            className="input-select"
            style={{ minWidth: '150px', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
          >
            <option value="" style={{ background: 'var(--bg-color)', color: 'white' }}>-- Casa --</option>
            {casas.map(c => (
              <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input 
            type="number"
            placeholder="Monto ($)"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            required
            style={{ minWidth: '100px', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
          />
          <input 
            type="text" 
            placeholder="Descripción del gasto"  
            value={descripcion} 
            onChange={e => setDescripcion(e.target.value)} 
            required 
            style={{ flex: 1 }}
          />
          <input 
            type="text" 
            placeholder="URL de la Boleta (opcional)"  
            value={urlBoleta} 
            onChange={e => setUrlBoleta(e.target.value)} 
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
            {editandoGasto ? 'Actualizar' : 'Crear Nuevo'}
          </button>
          {editandoGasto && (
            <button type="button" className="btn-secondary" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3>Listado de Rendiciones</h3>
          <button className="btn-secondary" onClick={cargarGastos} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
          </button>
        </div>

        <div className="list-container">
          {loading ? <p>Cargando...</p> : gastos.map(g => (
            <div key={g.id} className="list-item">
              <div>
                <h4>{g.descripcion} - <span style={{color: 'var(--success)'}}>${g.monto}</span></h4>
                <small className="text-muted">
                  Casa {g.casaId} {g.urlBoleta && <>| Boleta: <a href={g.urlBoleta} target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)'}}>Ver Documento</a></>}
                </small>
              </div>
              <div className="flex-align-center gap-2">
                <span className={`badge ${g.estado.toLowerCase()}`}>{g.estado}</span>
                {g.estado === 'PENDIENTE' && (
                  <>
                    <button onClick={() => actualizarEstado(g.id, 'APROBADO')} className="btn-icon" style={{color: 'var(--success)'}} title="Aprobar">
                      <Check size={24} />
                    </button>
                    <button onClick={() => actualizarEstado(g.id, 'RECHAZADO')} className="btn-icon" style={{color: 'var(--danger)'}} title="Rechazar">
                      <X size={24} />
                    </button>
                  </>
                )}
                <button onClick={() => iniciarEdicion(g)} className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}}>
                  Actualizar
                </button>
                <button onClick={() => eliminarGasto(g.id)} className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)'}}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {!loading && gastos.length === 0 && <p>No hay gastos registrados.</p>}
        </div>
      </div>
    </div>
  );
}
