import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { RefreshCw, Home, UserPlus } from 'lucide-react';

export default function Acogida() {
  const [menores, setMenores] = useState([]);
  const [casas, setCasas] = useState([]);
  const [educadoras, setEducadoras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nombreMenor, setNombreMenor] = useState('');
  const [rutMenor, setRutMenor] = useState('');
  const [ordenTribunal, setOrdenTribunal] = useState('');
  const [edad, setEdad] = useState('');

  const [menorSeleccionado, setMenorSeleccionado] = useState('');
  const [casaSeleccionada, setCasaSeleccionada] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dataMenores, dataCasas, dataEducadoras] = await Promise.all([
        fetchAPI('/acogida/menores'),
        fetchAPI('/acogida/casas'),
        fetchAPI('/acogida/educadoras')
      ]);
      setMenores(dataMenores);
      setCasas(dataCasas);
      setEducadoras(dataEducadoras);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrarMenor = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/acogida/menores', {
        method: 'POST',
        body: JSON.stringify({ nombre: nombreMenor, rut: rutMenor, edad: Number(edad), folioLegal: ordenTribunal })
      });
      setNombreMenor('');
      setRutMenor('');
      setEdad('');
      setOrdenTribunal('');
      cargarDatos();
      alert('Menor registrado exitosamente');
    } catch (err) {
      alert(err.message);
    }
  };

  const asignarCasa = async (e) => {
    e.preventDefault();
    if (!menorSeleccionado || !casaSeleccionada) return alert("Selecciona un menor y una casa");
    try {
      await fetchAPI(`/acogida/menores/${menorSeleccionado}/asignar-casa`, {
        method: 'POST',
        body: JSON.stringify({ casaId: casaSeleccionada })
      });
      setMenorSeleccionado('');
      setCasaSeleccionada('');
      cargarDatos();
      alert('Casa asignada exitosamente');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-fade-in">
      <div className="glass-card header-card mb-6">
        <h1>Gestión de Casas y Acogida</h1>
        <p className="text-muted">Administra las 5 casas de la Aldea y la asignación de menores.</p>
      </div>

      <div className="glass-card mb-6">
        <div className="flex-between mb-4">
          <h3>Estado de las Casas</h3>
          <button className="btn-secondary" onClick={cargarDatos} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {casas.map(casa => {
            const encargada = educadoras.find(e => e.casaId === casa.id);
            const estaLlena = casa.ocupacionActual >= casa.capacidad;
            return (
              <div key={casa.id} className="glass-container house-card" style={{ padding: '15px', textAlign: 'center' }}>
                <Home size={32} style={{ color: estaLlena ? 'var(--danger)' : 'var(--primary-color)', margin: '0 auto 10px' }} />
                <h4>{casa.nombre}</h4>
                <p className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>Encargada: {encargada ? encargada.nombre : 'N/A'}</p>
                <div className={`badge ${estaLlena ? 'rechazado' : 'aprobado'}`}>
                  {casa.ocupacionActual} / {casa.capacidad} Niños
                </div>
                
                <div className="house-details-overlay">
                  <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '0.9rem' }}>Menores Asignados</h4>
                  <ul className="house-details-list">
                    {menores.filter(m => m.casaAsignadaId === casa.id).length > 0 ? (
                      menores.filter(m => m.casaAsignadaId === casa.id).map(m => (
                        <li key={m.id}>
                          <span>{m.nombre}</span>
                          <span className="text-muted">{m.edad}a</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>Sin menores</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }} className="mb-6">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4 flex-align-center gap-2"><UserPlus size={20}/> Registrar Nuevo Ingreso</h3>
          <form onSubmit={registrarMenor} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <label>Nombre Completo</label>
                <input type="text" value={nombreMenor} onChange={e => setNombreMenor(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>RUT</label>
                <input type="text" value={rutMenor} onChange={e => setRutMenor(e.target.value)} required placeholder="12.345.678-9" />
              </div>
              <div className="input-group">
                <label>Edad</label>
                <input type="number" value={edad} onChange={e => setEdad(e.target.value)} required max="18" />
              </div>
              <div className="input-group">
                <label>Orden de Tribunal (Folio)</label>
                <input type="text" value={ordenTribunal} onChange={e => setOrdenTribunal(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 'auto' }}>Registrar menor</button>
          </form>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4 flex-align-center gap-2"><Home size={20}/> Asignar a Casa</h3>
          <form onSubmit={asignarCasa} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <label>Seleccionar Menor</label>
                <select 
                  className="input-select"
                  value={menorSeleccionado} 
                  onChange={e => setMenorSeleccionado(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
                >
                  <option value="" style={{ background: 'var(--bg-color)', color: 'white' }}>-- Elige un menor --</option>
                  {menores.map(m => (
                    <option key={m.id} value={m.id} style={{ background: 'var(--bg-color)', color: 'white' }}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Seleccionar Casa</label>
                <select 
                  className="input-select"
                  value={casaSeleccionada} 
                  onChange={e => setCasaSeleccionada(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
                >
                  <option value="" style={{ background: 'var(--bg-color)', color: 'white' }}>-- Elige una casa --</option>
                  {casas.map(c => (
                    <option key={c.id} value={c.id} style={{ background: 'var(--bg-color)', color: 'white' }} disabled={c.ocupacionActual >= c.capacidad}>
                      {c.nombre} ({c.ocupacionActual}/{c.capacidad} ocupados)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 'auto' }}>Asignar Casa</button>
          </form>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="mb-4">Lista Histórica de Menores</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Folio Legal</th>
                <th>Casa Asignada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Cargando...</td></tr>
              ) : menores.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No hay menores registrados.</td></tr>
              ) : (
                menores.map(m => (
                  <tr key={m.id}>
                    <td>#{m.id}</td>
                    <td>{m.rut || 'N/A'}</td>
                    <td>{m.nombre}</td>
                    <td>{m.folioLegal}</td>
                    <td>{m.casaAsignadaId ? `Casa ${m.casaAsignadaId}` : 'Sin asignar'}</td>
                    <td>
                      <span className={`badge ${m.casaAsignadaId ? 'aprobado' : 'pendiente'}`}>
                        {m.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
