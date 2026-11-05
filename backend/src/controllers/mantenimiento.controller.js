import { pool } from '../config/configDb.js';

const crearTarea = async (req, res) => {
  const { casaId, descripcion, fechaLimite, tipo } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tareas_mantenimiento (casa_id, descripcion, estado, fecha_limite, tipo)
       VALUES ($1, $2, 'PENDIENTE', $3, $4)
       RETURNING *, casa_id AS "casaId", fecha_limite AS "fechaLimite"`,
      [casaId, descripcion, fechaLimite || 'Sin fecha', tipo || 'CORRECTIVO']
    );
    res.status(201).json({
      message: 'Tarea de mantenimiento creada exitosamente',
      tarea: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ message: 'Error al crear tarea' });
  }
};

const obtenerTareas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *, casa_id AS "casaId", fecha_limite AS "fechaLimite"
       FROM tareas_mantenimiento ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ message: 'Error al obtener tareas' });
  }
};

const actualizarEstadoTarea = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tareas_mantenimiento SET estado = $1 WHERE id = $2
       RETURNING *, casa_id AS "casaId", fecha_limite AS "fechaLimite"`,
      [estado, parseInt(id)]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ message: `Estado actualizado a ${estado}`, tarea: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar estado de tarea' });
  }
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const { descripcion, casaId, fechaLimite, tipo } = req.body;

  try {
    const actual = await pool.query('SELECT * FROM tareas_mantenimiento WHERE id = $1', [parseInt(id)]);
    if (actual.rows.length === 0)
      return res.status(404).json({ message: 'Tarea no encontrada' });

    const t = actual.rows[0];
    const result = await pool.query(
      `UPDATE tareas_mantenimiento
       SET descripcion = $1, casa_id = $2, fecha_limite = $3, tipo = $4
       WHERE id = $5
       RETURNING *, casa_id AS "casaId", fecha_limite AS "fechaLimite"`,
      [
        descripcion || t.descripcion,
        casaId || t.casa_id,
        fechaLimite !== undefined ? fechaLimite : t.fecha_limite,
        tipo || t.tipo,
        parseInt(id)
      ]
    );
    res.json({ message: 'Tarea actualizada', tarea: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ message: 'Error al actualizar tarea' });
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM tareas_mantenimiento WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ message: 'Error al eliminar tarea' });
  }
};

export { crearTarea, obtenerTareas, actualizarEstadoTarea, actualizarTarea, eliminarTarea };

