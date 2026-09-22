const { pool } = require('../config/configDb');

const registrarGasto = async (req, res) => {
  const { casaId, monto, descripcion, urlBoleta } = req.body;

  try {
    const query = `
      INSERT INTO gastos (casa_id, monto, descripcion, url_boleta, estado, fecha)
      VALUES ($1, $2, $3, $4, 'PENDIENTE', CURRENT_TIMESTAMP)
      RETURNING *, casa_id AS "casaId", url_boleta AS "urlBoleta"
    `;
    const values = [casaId, monto, descripcion, urlBoleta || null];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Gasto registrado exitosamente (Pendiente de aprobación)',
      gasto: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar gasto' });
  }
};

const obtenerGastos = async (req, res) => {
  try {
    const result = await pool.query('SELECT *, casa_id AS "casaId", url_boleta AS "urlBoleta" FROM gastos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener gastos' });
  }
};

const actualizarEstadoGasto = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const result = await pool.query(
      'UPDATE gastos SET estado = $1 WHERE id = $2 RETURNING *, casa_id AS "casaId", url_boleta AS "urlBoleta"',
      [estado, parseInt(id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Gasto no encontrado' });
    
    res.json({
      message: `Gasto ${estado.toLowerCase()} exitosamente`,
      gasto: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado del gasto' });
  }
};

const actualizarGasto = async (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, casaId, urlBoleta } = req.body;
  try {
    const gastoRes = await pool.query('SELECT * FROM gastos WHERE id = $1', [parseInt(id)]);
    if (gastoRes.rows.length === 0) return res.status(404).json({ message: 'Gasto no encontrado' });
    
    const gasto = gastoRes.rows[0];
    const newDesc = descripcion || gasto.descripcion;
    const newMonto = monto || gasto.monto;
    const newCasa = casaId || gasto.casa_id;
    const newUrl = urlBoleta !== undefined ? urlBoleta : gasto.url_boleta;

    const result = await pool.query(
      'UPDATE gastos SET descripcion = $1, monto = $2, casa_id = $3, url_boleta = $4 WHERE id = $5 RETURNING *, casa_id AS "casaId", url_boleta AS "urlBoleta"',
      [newDesc, newMonto, newCasa, newUrl, parseInt(id)]
    );

    res.json({ message: 'Gasto actualizado', gasto: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar gasto' });
  }
};

const eliminarGasto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM gastos WHERE id = $1 RETURNING id', [parseInt(id)]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Gasto no encontrado' });
    res.json({ message: 'Gasto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar gasto' });
  }
};

module.exports = {
  registrarGasto,
  obtenerGastos,
  actualizarEstadoGasto,
  actualizarGasto,
  eliminarGasto
};
