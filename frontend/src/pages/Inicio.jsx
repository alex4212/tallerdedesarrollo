import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import {
  Home,
  Users,
  Wallet,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function Inicio() {
  const [loading, setLoading] = useState(true);
  const [casas, setCasas] = useState([]);
  const [menores, setMenores] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resCasas, resMenores, resGastos, resTareas, resTurnos] = await Promise.allSettled([
        fetchAPI('/acogida/casas'),
        fetchAPI('/acogida/menores'),
        fetchAPI('/sostenibilidad/gastos'),
        fetchAPI('/mantenimiento/tareas'),
        fetchAPI('/acogida/turnos/activos'),
      ]);

      setCasas(resCasas.status === 'fulfilled' && Array.isArray(resCasas.value) ? resCasas.value : []);
      setMenores(resMenores.status === 'fulfilled' && Array.isArray(resMenores.value) ? resMenores.value : []);
      setGastos(resGastos.status === 'fulfilled' && Array.isArray(resGastos.value) ? resGastos.value : []);
      setTareas(resTareas.status === 'fulfilled' && Array.isArray(resTareas.value) ? resTareas.value : []);
      if (resTurnos.status === 'fulfilled' && resTurnos.value?.educadorasActivas) {
        setTurnos(resTurnos.value.educadorasActivas);
      }
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cálculos de métricas
  const casasAldea = casas.slice(0, 5);
  const capacidadTotal = casasAldea.reduce((acc, c) => acc + (c.capacidad || 0), 0);
  const ocupacionTotal = casasAldea.reduce((acc, c) => acc + (c.ocupacionActual || 0), 0);
  const porcentajeOcupacion = capacidadTotal > 0 ? Math.round((ocupacionTotal / capacidadTotal) * 100) : 0;

  const menoresSinAsignar = menores.filter((m) => !m.casaAsignadaId && m.estado !== 'Egresado').length;
  const menoresActivos = menores.filter((m) => m.estado !== 'Egresado').length;

  const gastosPendientes = gastos.filter((g) => g.estado === 'PENDIENTE');
  const montoPendiente = gastosPendientes.reduce((acc, g) => acc + Number(g.monto || 0), 0);

  const tareasPendientes = tareas.filter((t) => t.estado === 'PENDIENTE');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Encabezado Principal */}
      <div className="glass-container" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: '#818CF8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Panel Principal de Control
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-light)', marginTop: '4px' }}>
            Bienvenido, {user.name || 'Usuario'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
            Resumen operacional de la Aldea Infantil SOS en tiempo real.
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="btn-primary"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Tarjetas de Métricas Globales (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
        {/* KPI 1: Ocupación Global */}
        <div className="glass-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Ocupación de Casas</p>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginTop: '6px', color: '#38BDF8' }}>
                {porcentajeOcupacion}%
              </h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
              <Home size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.08)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, porcentajeOcupacion)}%`, background: '#38BDF8', height: '100%', borderRadius: '4px' }}></div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {ocupacionTotal} de {capacidadTotal} cupos ocupados (5 casas)
          </p>
        </div>

        {/* KPI 2: Menores sin Asignar */}
        <div className="glass-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Menores Sin Asignar</p>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginTop: '6px', color: menoresSinAsignar > 0 ? '#F59E0B' : '#10B981' }}>
                {menoresSinAsignar}
              </h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: menoresSinAsignar > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: menoresSinAsignar > 0 ? '#F59E0B' : '#10B981' }}>
              <Users size={22} />
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '27px' }}>
            {menoresActivos} menores activos en la Aldea
          </p>
        </div>

        {/* KPI 3: Gastos Pendientes */}
        <div className="glass-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Gastos por Revisar</p>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '6px', color: '#A78BFA' }}>
                ${montoPendiente.toLocaleString('es-CL')}
              </h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
              <Wallet size={22} />
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '27px' }}>
            {gastosPendientes.length} solicitud(es) de gasto pendientes
          </p>
        </div>

        {/* KPI 4: Mantenimiento Urgente */}
        <div className="glass-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Mantenimiento Pendiente</p>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginTop: '6px', color: tareasPendientes.length > 0 ? '#FB7185' : '#10B981' }}>
                {tareasPendientes.length}
              </h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(251, 113, 133, 0.15)', color: '#FB7185' }}>
              <Wrench size={22} />
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '27px' }}>
            {tareas.filter((t) => t.estado === 'COMPLETADA').length} tareas resueltas
          </p>
        </div>
      </div>

      {/* Secciones Inferiores: Accesos Directos y Turnos de Educadoras */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Accesos Rápidos */}
        <div className="glass-container" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '16px' }}>
            Módulos Operacionales
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              onClick={() => navigate('/dashboard/acogida')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="#38BDF8" />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block' }}>Gestión de Niños y Acogida</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Distribución de casas y menores</small>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>

            <div
              onClick={() => navigate('/dashboard/mantenimiento')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wrench size={18} color="#FB7185" />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block' }}>Mantenimiento e Infraestructura</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Reparaciones correctivas y preventivas</small>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>

            <div
              onClick={() => navigate('/dashboard/sostenibilidad')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wallet size={18} color="#A78BFA" />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block' }}>Sostenibilidad y Gastos</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Rendición de boletas y compras</small>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Turnos Activos de Educadoras Hoy */}
        <div className="glass-container" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-light)' }}>
              Turnos en Turno Activo
            </h3>
            <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 600 }}>
              Hoy
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {turnos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No hay registros de turno activo.</p>
            ) : (
              turnos.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: '0.82rem'
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-light)' }}>{t.nombre}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#818CF8', fontSize: '0.78rem' }}>{t.casa}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                      {t.horario || 'DIURNO'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

