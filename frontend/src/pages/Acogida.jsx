import React, { useEffect, useState } from "react";
import { fetchAPI } from "../services/api";
import {
  RefreshCw,
  Home,
  UserPlus,
  X,
  Map,
  LayoutGrid,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  DollarSign,
  UserCheck,
  Calendar,
  Sparkles,
  ShoppingCart,
  Clock,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

// Posiciones simétricas y espaciadas para exactamente 5 casas (pentágono / estrella alrededor de la plaza)
const POSICIONES_5_CASAS = [
  { top: "5%", left: "50%", transform: "translateX(-50%)" },   // Casa 1: Arriba Centro (Norte)
  { top: "24%", right: "6%", transform: "none" },              // Casa 2: Noreste
  { bottom: "8%", right: "10%", transform: "none" },           // Casa 3: Sureste
  { bottom: "8%", left: "10%", transform: "none" },            // Casa 4: Suroeste
  { top: "24%", left: "6%", transform: "none" },               // Casa 5: Noroeste
];

export default function Acogida() {
  const [menores, setMenores] = useState([]);
  const [casas, setCasas] = useState([]);
  const [educadoras, setEducadoras] = useState([]);
  const [tareasMantenimiento, setTareasMantenimiento] = useState([]);
  const [gastosSostenibilidad, setGastosSostenibilidad] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vistaModo, setVistaModo] = useState("mapa"); // "mapa" | "tarjetas"

  // Modales
  const [showModalRegistrar, setShowModalRegistrar] = useState(false);
  const [showModalAsignar, setShowModalAsignar] = useState(false);
  const [showModalResumen, setShowModalResumen] = useState(false);
  const [casaResumen, setCasaResumen] = useState(null);

  // Formulario Menor
  const [nombreMenor, setNombreMenor] = useState("");
  const [rutMenor, setRutMenor] = useState("");
  const [ordenTribunal, setOrdenTribunal] = useState("");
  const [edad, setEdad] = useState("");

  // Asignación directa
  const [menorSeleccionado, setMenorSeleccionado] = useState("");
  const [casaSeleccionada, setCasaSeleccionada] = useState("");
  const [asignandoId, setAsignandoId] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resMenores, resCasas, resEducadoras, resTareas, resGastos] = await Promise.allSettled([
        fetchAPI("/acogida/menores"),
        fetchAPI("/acogida/casas"),
        fetchAPI("/acogida/educadoras"),
        fetchAPI("/mantenimiento/tareas"),
        fetchAPI("/sostenibilidad/gastos"),
      ]);

      setMenores(resMenores.status === "fulfilled" && Array.isArray(resMenores.value) ? resMenores.value : []);
      setCasas(resCasas.status === "fulfilled" && Array.isArray(resCasas.value) ? resCasas.value : []);
      setEducadoras(resEducadoras.status === "fulfilled" && Array.isArray(resEducadoras.value) ? resEducadoras.value : []);
      setTareasMantenimiento(resTareas.status === "fulfilled" && Array.isArray(resTareas.value) ? resTareas.value : []);
      setGastosSostenibilidad(resGastos.status === "fulfilled" && Array.isArray(resGastos.value) ? resGastos.value : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Límite estricto de 5 casas para la Aldea
  const casasAldea = casas.slice(0, 5);

  const totalCapacidad = casasAldea.reduce((acc, c) => acc + (c.capacidad || 0), 0);
  const totalOcupados = casasAldea.reduce((acc, c) => acc + (c.ocupacionActual || 0), 0);
  const totalDisponible = Math.max(0, totalCapacidad - totalOcupados);
  const menoresSinCasa = menores.filter((m) => !m.casaAsignadaId).length;

  const registrarMenor = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI("/acogida/menores", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombreMenor,
          rut: rutMenor,
          edad: Number(edad),
          folioLegal: ordenTribunal,
        }),
      });
      setNombreMenor("");
      setRutMenor("");
      setEdad("");
      setOrdenTribunal("");
      setShowModalRegistrar(false);
      cargarDatos();
      alert("Menor registrado exitosamente");
    } catch (err) {
      alert(err.message || "Error al registrar menor");
    }
  };

  const asignarCasa = async (e) => {
    e.preventDefault();
    if (!menorSeleccionado || !casaSeleccionada) {
      return alert("Selecciona un menor y una casa");
    }
    try {
      await fetchAPI(`/acogida/menores/${menorSeleccionado}/asignar-casa`, {
        method: "POST",
        body: JSON.stringify({ casaId: Number(casaSeleccionada) }),
      });
      setMenorSeleccionado("");
      setCasaSeleccionada("");
      setShowModalAsignar(false);
      await cargarDatos();
      alert("Casa asignada exitosamente");
    } catch (err) {
      alert(err.message || "Error al asignar casa");
    }
  };

  const handleAsignarCasaFila = async (menor, casaId) => {
    if (!casaId) return;
    try {
      setAsignandoId(menor.id);
      await fetchAPI(`/acogida/menores/${menor.id}/asignar-casa`, {
        method: "POST",
        body: JSON.stringify({ casaId: Number(casaId) }),
      });
      await cargarDatos();
    } catch (err) {
      alert(err.message || "Error al asignar casa");
    } finally {
      setAsignandoId(null);
    }
  };

  // Abrir el resumen integral de la casa
  const abrirResumenCasa = (casa) => {
    setCasaResumen(casa);
    setShowModalResumen(true);
  };

  // Datos de la casa en el modal de resumen
  const tiaEncargadaResumen = casaResumen
    ? educadoras.find((e) => e.casaId === casaResumen.id)
    : null;
  const ninosCasaResumen = casaResumen
    ? menores.filter((m) => m.casaAsignadaId === casaResumen.id)
    : [];
  const tareasCasaResumen = casaResumen
    ? tareasMantenimiento.filter((t) => t.casaId === casaResumen.id)
    : [];
  const gastosCasaResumen = casaResumen
    ? gastosSostenibilidad.filter((g) => g.casaId === casaResumen.id)
    : [];

  const totalGastosCasa = gastosCasaResumen.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const totalComestibles = gastosCasaResumen
    .filter((g) => g.categoria === "COMESTIBLES")
    .reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const totalAseo = gastosCasaResumen
    .filter((g) => g.categoria === "ASEO_Y_LIMPIEZA")
    .reduce((acc, g) => acc + (Number(g.monto) || 0), 0);

  return (
    <div className="page-fade-in">
      {/* Header */}
      <div className="glass-card header-card mb-6">
        <div>
          <h1>Gestión de Casas y Acogida</h1>
          <p className="text-muted">
            Mapa interactivo de la Aldea (Límite: 5 Casas), asignación y resumen completo por casa.
          </p>
        </div>
      </div>

      {/* Contenedor del Mapa / Tarjetas */}
      <div className="glass-card mb-6">
        <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0 }}>Estado de las Casas de la Aldea</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Haz clic en cualquier casa del mapa para ver su resumen completo (Niños, Tía encargada, Mantenimiento y Sostenibilidad).
            </span>
          </div>

          <div className="flex-align-center gap-2">
            <div
              style={{
                display: "inline-flex",
                background: "rgba(255,255,255,0.05)",
                padding: "4px",
                borderRadius: "12px",
                border: "1px solid var(--glass-border)",
              }}
            >
              <button
                type="button"
                className={`view-toggle-btn ${vistaModo === "mapa" ? "active" : ""}`}
                onClick={() => setVistaModo("mapa")}
              >
                <Map size={16} /> Mapa Aldea
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${vistaModo === "tarjetas" ? "active" : ""}`}
                onClick={() => setVistaModo("tarjetas")}
              >
                <LayoutGrid size={16} /> Tarjetas
              </button>
            </div>
            <button className="btn-secondary" onClick={cargarDatos} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""} /> Actualizar
            </button>
          </div>
        </div>

        {/* VISTA MAPA INTERACTIVO */}
        {vistaModo === "mapa" ? (
          <div className="village-map-container">
            {/* KPI Bar */}
            <div className="map-kpi-bar">
              <div className="kpi-chip">
                <Building2 size={18} style={{ color: "var(--primary-color)" }} />
                <span>Casas Aldea: <strong>{casasAldea.length} / 5</strong></span>
              </div>
              <div className="kpi-chip">
                <Users size={18} style={{ color: "#38BDF8" }} />
                <span>Ocupación: <strong>{totalOcupados} / {totalCapacidad}</strong></span>
              </div>
              <div className="kpi-chip">
                <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                <span>Cupos Disponibles: <strong>{totalDisponible}</strong></span>
              </div>
              <div className="kpi-chip">
                <AlertCircle size={18} style={{ color: "var(--warning)" }} />
                <span>Menores sin Casa: <strong>{menoresSinCasa}</strong></span>
              </div>
            </div>

            {/* Lienzo del Mapa */}
            <div className="map-canvas">
              {/* Conexiones SVG simétricas desde el centro hacia cada una de las 5 casas */}
              <svg className="village-path-svg">
                {/* Casa 1 (Norte) */}
                <line x1="50%" y1="50%" x2="50%" y2="18%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                {/* Casa 2 (Noreste) */}
                <line x1="50%" y1="50%" x2="82%" y2="32%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                {/* Casa 3 (Sureste) */}
                <line x1="50%" y1="50%" x2="78%" y2="80%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                {/* Casa 4 (Suroeste) */}
                <line x1="50%" y1="50%" x2="22%" y2="80%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                {/* Casa 5 (Noroeste) */}
                <line x1="50%" y1="50%" x2="18%" y2="32%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
              </svg>

              {/* Plaza Central */}
              <div className="central-plaza">
                <Building2 size={26} style={{ marginBottom: "4px", color: "#A5B4FC" }} />
                <strong style={{ fontSize: "0.85rem", color: "white" }}>Plaza Central</strong>
                <span style={{ fontSize: "0.7rem", color: "#A5B4FC" }}>Aldea SOS</span>
              </div>

              {/* Renderizado de exactamente hasta 5 casas ordenadas sin superposición */}
              {casasAldea.map((casa, idx) => {
                const encargada = educadoras.find((e) => e.casaId === casa.id);
                const estaLlena = casa.ocupacionActual >= casa.capacidad;
                const pos = POSICIONES_5_CASAS[idx] || POSICIONES_5_CASAS[0];

                return (
                  <div
                    key={casa.id}
                    className={`house-node ${estaLlena ? "llena" : "disponible"}`}
                    style={pos}
                    onClick={() => abrirResumenCasa(casa)}
                    title={`Ver resumen completo de ${casa.nombre}`}
                  >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                      <Home
                        size={26}
                        style={{
                          color: estaLlena ? "var(--danger)" : "var(--primary-color)",
                        }}
                      />
                    </div>
                    <h5 style={{ fontSize: "0.9rem", margin: "2px 0", color: "white", fontWeight: "600" }}>
                      {casa.nombre}
                    </h5>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 6px" }}>
                      {encargada ? `Tía ${encargada.nombre}` : "Sin encargada"}
                    </p>
                    <div
                      className={`badge ${estaLlena ? "rechazado" : "aprobado"}`}
                      style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                    >
                      {casa.ocupacionActual} / {casa.capacidad} Niños
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "0.68rem", color: "#38BDF8", fontWeight: "500" }}>
                      Ver Resumen Completo
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VISTA EN TARJETAS */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "16px",
            }}
          >
            {casasAldea.map((casa) => {
              const encargada = educadoras.find((e) => e.casaId === casa.id);
              const estaLlena = casa.ocupacionActual >= casa.capacidad;
              return (
                <div
                  key={casa.id}
                  className="glass-container house-card"
                  style={{ padding: "18px", textAlign: "center", cursor: "pointer" }}
                  onClick={() => abrirResumenCasa(casa)}
                  title={`Ver resumen completo de ${casa.nombre}`}
                >
                  <Home
                    size={32}
                    style={{
                      color: estaLlena ? "var(--danger)" : "var(--primary-color)",
                      margin: "0 auto 10px",
                    }}
                  />
                  <h4 style={{ margin: "4px 0" }}>{casa.nombre}</h4>
                  <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
                    Encargada: {encargada ? `Tía ${encargada.nombre}` : "Sin encargada"}
                  </p>
                  <div className={`badge ${estaLlena ? "rechazado" : "aprobado"}`}>
                    {casa.ocupacionActual} / {casa.capacidad} Niños
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "#38BDF8" }}>
                    Ver Resumen Completo →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lista Histórica de Menores ── */}
      <div className="glass-card">
        <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0 }}>Lista Histórica de Menores</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Asigna casas directamente desde la lista a los menores sin casa asignada.
            </span>
          </div>
          <div className="flex-align-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowModalRegistrar(true)}
              style={{ width: "auto", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <UserPlus size={18} /> Agregar Menor
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowModalAsignar(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Home size={18} /> Asignar Casa
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Folio Legal</th>
                <th>Casa Asignada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: "24px" }}>
                    Cargando datos...
                  </td>
                </tr>
              ) : menores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: "24px" }}>
                    No hay menores registrados.
                  </td>
                </tr>
              ) : (
                menores.map((m) => {
                  const esSinAsignar =
                    !m.casaAsignadaId ||
                    m.estado === "Sin asignar" ||
                    m.estado === "Ingresado";

                  return (
                    <tr key={m.id}>
                      <td>{m.rut || "N/A"}</td>
                      <td style={{ fontWeight: "500", color: "white" }}>{m.nombre}</td>
                      <td>{m.folioLegal || "N/A"}</td>
                      <td>
                        {esSinAsignar ? (
                          <select
                            className="table-select-casa"
                            value=""
                            disabled={asignandoId === m.id}
                            onChange={(e) => handleAsignarCasaFila(m, e.target.value)}
                            title="Selecciona una casa para asignar al menor"
                          >
                            <option value="" disabled>
                              {asignandoId === m.id ? "Asignando..." : "Asignar casa..."}
                            </option>
                            {casasAldea.map((c) => {
                              const estaLlena = c.ocupacionActual >= c.capacidad;
                              return (
                                <option key={c.id} value={c.id} disabled={estaLlena}>
                                  {c.nombre} ({c.ocupacionActual}/{c.capacidad}){estaLlena ? " - Llena" : ""}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <span className="casa-asignada-tag">
                            <Home size={15} />
                            {casasAldea.find((c) => c.id === m.casaAsignadaId)?.nombre ||
                              `Casa ${m.casaAsignadaId}`}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${esSinAsignar ? "pendiente" : "aprobado"}`}>
                          {esSinAsignar ? "Sin asignar" : (m.estado || "Asignado a Casa")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL RESUMEN COMPLETO DE CASA (AL APRETAR EN EL MAPA)
         ══════════════════════════════════════════════════════════════ */}
      {showModalResumen && casaResumen && (
        <div className="modal-overlay" onClick={() => setShowModalResumen(false)}>
          <div
            className="modal-content modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "860px", maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Header del Modal */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.2)",
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                  }}
                >
                  <Home size={24} style={{ color: "var(--primary-color)" }} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{casaResumen.nombre} - Resumen Integral</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Ficha detallada de la casa: tía encargada, menores, mantenimiento y sostenibilidad
                  </span>
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={() => setShowModalResumen(false)}
                type="button"
                style={{ color: "#ffffff" }}
                title="Cerrar ventana"
              >
                <X size={22} color="#ffffff" />
              </button>
            </div>

            {/* Banner de Capacidad y Tía Encargada */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {/* Tarjeta Tía Encargada */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    background: "rgba(236, 72, 153, 0.15)",
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                  }}
                >
                  <UserCheck size={24} style={{ color: "#F472B6" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Tía Encargada
                  </div>
                  <strong style={{ fontSize: "1.05rem", color: "white" }}>
                    {tiaEncargadaResumen ? `Tía ${tiaEncargadaResumen.nombre}` : "Sin tía asignada"}
                  </strong>
                  <div style={{ fontSize: "0.75rem", color: "#A5B4FC" }}>
                    {tiaEncargadaResumen ? (tiaEncargadaResumen.rut || "Educadora de Trato Directo") : "Pendiente de designación"}
                  </div>
                </div>
              </div>

              {/* Tarjeta Ocupación / Capacidad */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: "12px",
                      padding: "10px",
                    }}
                  >
                    <Users size={24} style={{ color: "#38BDF8" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Capacidad
                    </div>
                    <strong style={{ fontSize: "1.05rem", color: "white" }}>
                      {casaResumen.ocupacionActual} de {casaResumen.capacidad} Niños
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {casaResumen.capacidad - casaResumen.ocupacionActual > 0
                        ? `${casaResumen.capacidad - casaResumen.ocupacionActual} cupos disponibles`
                        : "Capacidad máxima completada"}
                    </div>
                  </div>
                </div>

                <div
                  className={`badge ${
                    casaResumen.ocupacionActual >= casaResumen.capacidad ? "rechazado" : "aprobado"
                  }`}
                  style={{ padding: "6px 12px" }}
                >
                  {casaResumen.ocupacionActual >= casaResumen.capacidad ? "Llena" : "Disponible"}
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: NIÑOS ASIGNADOS A LA CASA */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--glass-border)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div className="flex-between mb-3">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={18} style={{ color: "#38BDF8" }} />
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
                    Niños en esta Casa ({ninosCasaResumen.length})
                  </h4>
                </div>
                {casaResumen.ocupacionActual < casaResumen.capacidad && (
                  <button
                    className="btn-primary"
                    style={{ width: "auto", padding: "5px 12px", fontSize: "0.8rem" }}
                    onClick={() => {
                      setCasaSeleccionada(casaResumen.id);
                      setShowModalResumen(false);
                      setShowModalAsignar(true);
                    }}
                  >
                    + Asignar Niño a esta Casa
                  </button>
                )}
              </div>

              {ninosCasaResumen.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Actualmente no hay niños viviendo en esta casa.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                  {ninosCasaResumen.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong style={{ color: "white", fontSize: "0.9rem", display: "block" }}>{n.nombre}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          RUT: {n.rut || "Sin RUT"} • Folio: {n.folioLegal || "N/A"}
                        </span>
                      </div>
                      <span className="badge aprobado" style={{ fontSize: "0.72rem" }}>
                        {n.edad ? `${n.edad} años` : "Menor"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: MANTENIMIENTO */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--glass-border)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div className="flex-between mb-3">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Wrench size={18} style={{ color: "#FBBF24" }} />
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
                    Mantenimiento de la Casa ({tareasCasaResumen.length} tareas)
                  </h4>
                </div>
              </div>

              {tareasCasaResumen.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  <CheckCircle2 size={24} style={{ color: "var(--success)", margin: "0 auto 6px", display: "block" }} />
                  La casa está en óptimas condiciones. No registra solicitudes de mantenimiento pendientes.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {tareasCasaResumen.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ color: "white", fontSize: "0.88rem", fontWeight: "500" }}>
                          {t.descripcion}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", gap: "10px", marginTop: "3px" }}>
                          <span>Tipo: {t.tipo || "Correctivo"}</span>
                          {t.fechaLimite && <span>Límite: {t.fechaLimite}</span>}
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          t.estado === "COMPLETADA"
                            ? "aprobado"
                            : t.estado === "EN_PROGRESO"
                            ? "pendiente"
                            : "rechazado"
                        }`}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {t.estado || "PENDIENTE"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN 3: SOSTENIBILIDAD Y GASTOS */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--glass-border)",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div className="flex-between mb-3">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <DollarSign size={18} style={{ color: "#34D399" }} />
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
                    Sostenibilidad y Gastos ({gastosCasaResumen.length} registros)
                  </h4>
                </div>
                <strong style={{ color: "#34D399", fontSize: "1rem" }}>
                  Total: ${totalGastosCasa.toLocaleString("es-CL")}
                </strong>
              </div>

              {/* Subtotales Aseo vs Comestibles */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <ShoppingCart size={16} style={{ color: "#38BDF8" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Comestibles</div>
                    <strong style={{ color: "white", fontSize: "0.85rem" }}>
                      ${totalComestibles.toLocaleString("es-CL")}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(167, 139, 250, 0.08)",
                    border: "1px solid rgba(167, 139, 250, 0.25)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Sparkles size={16} style={{ color: "#A78BFA" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Aseo y Limpieza</div>
                    <strong style={{ color: "white", fontSize: "0.85rem" }}>
                      ${totalAseo.toLocaleString("es-CL")}
                    </strong>
                  </div>
                </div>
              </div>

              {gastosCasaResumen.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No se registran gastos asignados a esta casa.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                  {gastosCasaResumen.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: "10px",
                        padding: "8px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div>
                        <span style={{ color: "white", fontWeight: "500" }}>{g.descripcion}</span>
                        {g.establecimiento && (
                          <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>
                            ({g.establecimiento})
                          </span>
                        )}
                        <span
                          className={`badge ${g.categoria === "COMESTIBLES" ? "aprobado" : "pendiente"}`}
                          style={{ marginLeft: "8px", fontSize: "0.68rem", padding: "2px 6px" }}
                        >
                          {g.categoria === "COMESTIBLES" ? "Comestibles" : "Aseo/Limpieza"}
                        </span>
                      </div>
                      <strong style={{ color: "#34D399" }}>
                        ${Number(g.monto).toLocaleString("es-CL")}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer de cierre */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowModalResumen(false)}
              >
                Cerrar Resumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Menor */}
      {showModalRegistrar && (
        <div className="modal-overlay" onClick={() => setShowModalRegistrar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <UserPlus size={20} /> Registrar Nuevo Ingreso
              </h3>
              <button
                className="btn-icon"
                onClick={() => setShowModalRegistrar(false)}
                type="button"
                style={{ color: "#ffffff" }}
                title="Cerrar"
              >
                <X size={20} color="#ffffff" />
              </button>
            </div>
            <form onSubmit={registrarMenor}>
              <div className="input-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={nombreMenor}
                  onChange={(e) => setNombreMenor(e.target.value)}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="input-group">
                <label>RUT</label>
                <input
                  type="text"
                  value={rutMenor}
                  onChange={(e) => setRutMenor(e.target.value)}
                  required
                  placeholder="12.345.678-9"
                />
              </div>
              <div className="input-group">
                <label>Edad</label>
                <input
                  type="number"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  required
                  placeholder="Ej: 8"
                />
              </div>
              <div className="input-group">
                <label>Orden de Tribunal (Folio)</label>
                <input
                  type="text"
                  value={ordenTribunal}
                  onChange={(e) => setOrdenTribunal(e.target.value)}
                  required
                  placeholder="Ej: F-12345"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModalRegistrar(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: "auto" }}>
                  Registrar Menor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Casa */}
      {showModalAsignar && (
        <div className="modal-overlay" onClick={() => setShowModalAsignar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Home size={20} /> Asignar Menor a Casa
              </h3>
              <button
                className="btn-icon"
                onClick={() => setShowModalAsignar(false)}
                type="button"
                style={{ color: "#ffffff" }}
                title="Cerrar"
              >
                <X size={20} color="#ffffff" />
              </button>
            </div>
            <form onSubmit={asignarCasa}>
              <div className="input-group">
                <label>Seleccionar Menor</label>
                <select
                  className="input-select"
                  value={menorSeleccionado}
                  onChange={(e) => setMenorSeleccionado(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                >
                  <option value="" style={{ background: "var(--bg-color)", color: "white" }}>
                    -- Elige un menor --
                  </option>
                  {menores.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      style={{ background: "var(--bg-color)", color: "white" }}
                    >
                      {m.nombre} - {m.rut || "Sin RUT"} (Actual:{" "}
                      {m.casaAsignadaId
                        ? `Casa ${m.casaAsignadaId}`
                        : "Sin asignar"}
                      )
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Seleccionar Casa (Límite: 5 Casas)</label>
                <select
                  className="input-select"
                  value={casaSeleccionada}
                  onChange={(e) => setCasaSeleccionada(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                >
                  <option value="" style={{ background: "var(--bg-color)", color: "white" }}>
                    -- Elige una casa --
                  </option>
                  {casasAldea.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      style={{ background: "var(--bg-color)", color: "white" }}
                      disabled={c.ocupacionActual >= c.capacidad}
                    >
                      {c.nombre} ({c.ocupacionActual}/{c.capacidad} ocupados)
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModalAsignar(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: "auto" }}>
                  Asignar Casa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
