import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { RefreshCw, Check, X } from 'lucide-react';

export default function Sostenibilidad() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    cargarGastos();
  }, []);

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

  const actualizarGasto = async (g) => {
    const nuevaDesc = window.prompt('Nueva descripción:', g.descripcion);
    if (!nuevaDesc || nuevaDesc === g.descripcion) return;
    try {
      await fetchAPI(`/sostenibilidad/gastos/${g.id}`, {
        method: 'PUT',
        body: JSON.stringify({ descripcion: nuevaDesc, monto: g.monto, casaId: g.casaId })
      });
      cargarGastos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-fade-in">
      <div className="glass-card header-card mb-6">
        <h1>Sostenibilidad y Gastos</h1>
        <p className="text-muted">Aprueba o rechaza las rendiciones enviadas por las cuidadoras.</p>
      </div>

      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3>Rendiciones de Gastos</h3>
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
                  Casa {g.casaId} | Boleta: <a href={g.urlBoleta} target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)'}}>Ver Documento</a>
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
                <button onClick={() => actualizarGasto(g)} className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}}>
                  Actualizar
                </button>
                <button onClick={() => eliminarGasto(g.id)} className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)'}}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {!loading && gastos.length === 0 && <p>No hay gastos por revisar.</p>}
        </div>
      </div>
    </div>
  );
}
