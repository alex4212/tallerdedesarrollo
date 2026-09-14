let tareas = [
  { id: 1, casaId: 1, descripcion: 'Reparar llave de agua del baño', estado: 'PENDIENTE', fechaLimite: '2026-10-01' }
];

const crearTarea = (req, res) => {
  const { casaId, descripcion, fechaLimite } = req.body;

  const nuevaTarea = {
    id: tareas.length + 1,
    casaId,
    descripcion,
    estado: 'PENDIENTE',
    fechaLimite: fechaLimite || 'Sin fecha'
  };

  tareas.push(nuevaTarea);

  res.status(201).json({
    message: 'Tarea de mantenimiento creada exitosamente',
    tarea: nuevaTarea
  });
};

const obtenerTareas = (req, res) => {
  res.json(tareas);
};

const actualizarEstadoTarea = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const tarea = tareas.find(t => t.id === parseInt(id));

  if (!tarea) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }

  tarea.estado = estado;

  res.json({
    message: `Estado de la tarea actualizado a ${estado}`,
    tarea
  });
};

module.exports = {
  crearTarea,
  obtenerTareas,
  actualizarEstadoTarea
};
