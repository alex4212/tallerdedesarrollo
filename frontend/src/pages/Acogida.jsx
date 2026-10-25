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
  Trash2,
} from "lucide-react";

export default function Acogida() {
  const [menores, setMenores] = useState([]);
  const [casas, setCasas] = useState([]);
  const [educadoras, setEducadoras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vistaModo, setVistaModo] = useState("mapa"); // "mapa" | "tarjetas"

  const [showModalRegistrar, setShowModalRegistrar] = useState(false);
  const [showModalAsignar, setShowModalAsignar] = useState(false);

  const [nombreMenor, setNombreMenor] = useState("");
  const [rutMenor, setRutMenor] = useState("");
  const [ordenTribunal, setOrdenTribunal] = useState("");
  const [edad, setEdad] = useState("");

  const [menorSeleccionado, setMenorSeleccionado] = useState("");
  const [casaSeleccionada, setCasaSeleccionada] = useState("");
  const [asignandoId, setAsignandoId] = useState(null);

  const [menorAEliminar, setMenorAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminar = async () => {
    if (!menorAEliminar) return;
    setEliminando(true);
    try {
      await fetchAPI(`/acogida/menores/${menorAEliminar.id}`, {
        method: "DELETE",
      });
      setMenorAEliminar(null);
      await cargarDatos();
    } catch (err) {
      alert(err.message || "Error al eliminar menor");
    } finally {
      setEliminando(false);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dataMenores, dataCasas, dataEducadoras] = await Promise.all([
        fetchAPI("/acogida/menores"),
        fetchAPI("/acogida/casas"),
        fetchAPI("/acogida/educadoras"),
      ]);
      setMenores(Array.isArray(dataMenores) ? dataMenores : []);
      setCasas(Array.isArray(dataCasas) ? dataCasas : []);
      setEducadoras(Array.isArray(dataEducadoras) ? dataEducadoras : []);
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
      alert(err.message);
    }
  };

  const asignarCasa = async (e) => {
    e.preventDefault();
    if (!menorSeleccionado || !casaSeleccionada)
      return alert("Selecciona un menor y una casa");
    try {
      await fetchAPI(`/acogida/menores/${menorSeleccionado}/asignar-casa`, {
        method: "POST",
        body: JSON.stringify({ casaId: casaSeleccionada }),
      });
      setMenorSeleccionado("");
      setCasaSeleccionada("");
      setShowModalAsignar(false);
      cargarDatos();
      alert("Casa asignada exitosamente");
    } catch (err) {
      alert(err.message);
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

  // Coordenadas fijas para la distribución visual de las 5 casas en el mapa
  const posicionesCasas = [
    { top: "10%", left: "8%" },
    { top: "10%", right: "8%" },
    { top: "45%", right: "6%" },
    { bottom: "10%", left: "10%" },
    { bottom: "10%", right: "12%" },
  ];

  const totalCapacidad = casas.reduce((acc, c) => acc + (c.capacidad || 0), 0);
  const totalOcupados = casas.reduce((acc, c) => acc + (c.ocupacionActual || 0), 0);
  const totalDisponible = totalCapacidad - totalOcupados;
  const menoresSinCasa = menores.filter((m) => !m.casaAsignadaId).length;

  return (
    <div className="page-fade-in">
      <div className="glass-card header-card mb-6">
        <h1>Gestión de Casas y Acogida</h1>
        <p className="text-muted">
          Administra las 5 casas de la Aldea y la asignación de menores.
        </p>
      </div>

      <div className="glass-card mb-6">
        <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "10px" }}>
          <h3>Estado de las Casas</h3>
          <div className="flex-align-center gap-2">
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
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
            <button
              className="btn-secondary"
              onClick={cargarDatos}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} /> Actualizar
            </button>
          </div>
        </div>

        {/* VISTA MAPA INTERACTIVO DE LA ALDEA */}
        {vistaModo === "mapa" ? (
          <div className="village-map-container">
            <div className="map-kpi-bar">
              <div className="kpi-chip">
                <Building2 size={18} style={{ color: "var(--primary-color)" }} />
                <span>Casas Totales: <strong>{casas.length}</strong></span>
              </div>
              <div className="kpi-chip">
                <Users size={18} style={{ color: "#38BDF8" }} />
                <span>Ocupación: <strong>{totalOcupados} / {totalCapacidad}</strong></span>
              </div>
              <div className="kpi-chip">
                <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                <span>Disponibles: <strong>{totalDisponible} cupos</strong></span>
              </div>
              <div className="kpi-chip">
                <AlertCircle size={18} style={{ color: "var(--warning)" }} />
                <span>Sin Casa: <strong>{menoresSinCasa} niños</strong></span>
              </div>
            </div>

            <div className="map-canvas">
              {/* Rutas conectoras SVG de la Aldea */}
              <svg className="village-path-svg">
                <line x1="50%" y1="50%" x2="16%" y2="25%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="50%" y1="50%" x2="84%" y2="25%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="50%" y1="50%" x2="84%" y2="58%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="50%" y1="50%" x2="18%" y2="78%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="50%" y1="50%" x2="80%" y2="78%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,6" />
              </svg>

              {/* Plaza Central */}
              <div className="central-plaza">
                <Building2 size={24} style={{ marginBottom: "4px" }} />
                <strong>Plaza Central</strong>
                <span>Aldea SOS</span>
              </div>

              {/* Casas en el Mapa */}
              {casas.map((casa, idx) => {
                const encargada = educadoras.find((e) => e.casaId === casa.id);
                const estaLlena = casa.ocupacionActual >= casa.capacidad;
                const pos = posicionesCasas[idx % posicionesCasas.length];

                return (
                  <div
                    key={casa.id}
                    className={`house-node ${estaLlena ? "llena" : "disponible"}`}
                    style={pos}
                    onClick={() => {
                      setCasaSeleccionada(casa.id);
                      setShowModalAsignar(true);
                    }}
                    title="Haz clic para asignar un menor a esta casa"
                  >
                    <Home
                      size={24}
                      style={{
                        color: estaLlena ? "var(--danger)" : "var(--primary-color)",
                        margin: "0 auto 6px",
                      }}
                    />
                    <h5 style={{ fontSize: "0.88rem", margin: "2px 0", color: "white" }}>
                      {casa.nombre}
                    </h5>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 6px" }}>
                      {encargada ? encargada.nombre : "Sin encargada"}
                    </p>
                    <div
                      className={`badge ${estaLlena ? "rechazado" : "aprobado"}`}
                      style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                    >
                      {casa.ocupacionActual} / {casa.capacidad} Niños
                    </div>

                    <div className="house-details-overlay">
                      <h4
                        style={{
                          margin: 0,
                          color: "var(--primary-color)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {casa.nombre}
                      </h4>
                      <ul className="house-details-list">
                        {menores.filter((m) => m.casaAsignadaId === casa.id).length > 0 ? (
                          menores
                            .filter((m) => m.casaAsignadaId === casa.id)
                            .map((m) => (
                              <li key={m.id}>
                                <span>{m.nombre}</span>
                                <span className="text-muted">{m.edad}a</span>
                              </li>
                            ))
                        ) : (
                          <li style={{ justifyContent: "center", color: "var(--text-muted)" }}>
                            Sin menores
                          </li>
                        )}
                      </ul>
                      <span style={{ fontSize: "0.7rem", color: "var(--primary-color)", marginTop: "8px" }}>
                        + Clic para Asignar
                      </span>
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
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {casas.map((casa) => {
              const encargada = educadoras.find((e) => e.casaId === casa.id);
              const estaLlena = casa.ocupacionActual >= casa.capacidad;
              return (
                <div
                  key={casa.id}
                  className="glass-container house-card"
                  style={{ padding: "15px", textAlign: "center" }}
                >
                  <Home
                    size={32}
                    style={{
                      color: estaLlena ? "var(--danger)" : "var(--primary-color)",
                      margin: "0 auto 10px",
                    }}
                  />
                  <h4>{casa.nombre}</h4>
                  <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
                    Encargada: {encargada ? encargada.nombre : "N/A"}
                  </p>
                  <div
                    className={`badge ${estaLlena ? "rechazado" : "aprobado"}`}
                  >
                    {casa.ocupacionActual} / {casa.capacidad} Niños
                  </div>

                  <div className="house-details-overlay">
                    <h4
                      style={{
                        margin: 0,
                        color: "var(--primary-color)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Menores Asignados
                    </h4>
                    <ul className="house-details-list">
                      {menores.filter((m) => m.casaAsignadaId === casa.id)
                        .length > 0 ? (
                        menores
                          .filter((m) => m.casaAsignadaId === casa.id)
                          .map((m) => (
                            <li key={m.id}>
                              <span>{m.nombre}</span>
                              <span className="text-muted">{m.edad}a</span>
                            </li>
                          ))
                      ) : (
                        <li
                          style={{
                            justifyContent: "center",
                            color: "var(--text-muted)",
                          }}
                        >
                          Sin menores
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      <div className="glass-card">
        <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>Lista Histórica de Menores</h3>
          <div className="flex-align-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowModalRegistrar(true)}
              style={{ width: "auto", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <UserPlus size={18} /> Agregar
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
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Cargando...
                  </td>
                </tr>
              ) : menores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
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
                      <td>{m.nombre}</td>
                      <td>{m.folioLegal}</td>
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
                            {casas.map((c) => {
                              const estaLlena = c.ocupacionActual >= c.capacidad;
                              return (
                                <option
                                  key={c.id}
                                  value={c.id}
                                  disabled={estaLlena}
                                >
                                  {c.nombre} ({c.ocupacionActual}/{c.capacidad}){estaLlena ? " - Llena" : ""}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <span className="casa-asignada-tag">
                            <Home size={15} />
                            {casas.find((c) => c.id === m.casaAsignadaId)?.nombre ||
                              `Casa ${m.casaAsignadaId}`}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${esSinAsignar ? "pendiente" : "aprobado"}`}
                        >
                          {esSinAsignar ? "Sin asignar" : (m.estado || "Asignado a Casa")}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setMenorAEliminar(m)}
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            color: "var(--danger)",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                          title="Eliminar menor del sistema"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              >
                <X size={20} />
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
                <Home size={20} /> Asignar a Casa
              </h3>
              <button
                className="btn-icon"
                onClick={() => setShowModalAsignar(false)}
                type="button"
              >
                <X size={20} />
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
                  <option
                    value=""
                    style={{ background: "var(--bg-color)", color: "white" }}
                  >
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
                <label>Seleccionar Casa</label>
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
                  <option
                    value=""
                    style={{ background: "var(--bg-color)", color: "white" }}
                  >
                    -- Elige una casa --
                  </option>
                  {casas.map((c) => (
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

      {/* Modal Confirmar Eliminación */}
      {menorAEliminar && (
        <div className="modal-overlay" onClick={() => !eliminando && setMenorAEliminar(null)}>
          <div className="modal-content" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={20} /> Confirmar Eliminación
              </h3>
              <button
                className="btn-icon"
                onClick={() => setMenorAEliminar(null)}
                disabled={eliminando}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: "1.5" }}>
              ¿Estás seguro de que deseas eliminar al menor <strong>"{menorAEliminar.nombre}"</strong> ({menorAEliminar.rut || "Sin RUT"})?
              Esta acción no se puede deshacer y liberará su cupo si estaba asignado a una casa.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setMenorAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "auto", background: "var(--danger)", borderColor: "var(--danger)" }}
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Eliminar Menor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

