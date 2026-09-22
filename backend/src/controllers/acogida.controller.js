const { pool } = require('../config/configDb');

const ingresarMenor = async (req, res) => {
  const { nombre, edad, folioLegal, rut, fechaIngreso } = req.body;

  if (!nombre || !folioLegal || !rut || edad === undefined) {
    return res.status(400).json({ message: 'Nombre, RUT, Edad y Folio Legal son requeridos' });
  }

  if (Number(edad) >= 18) {
    return res.status(400).json({ message: 'El ingresado debe ser menor de edad (menor a 18 años)' });
  }

  try {
    const query = `
      INSERT INTO menores (nombre, rut, edad, folio_legal, fecha_ingreso, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *, id, casa_asignada_id AS "casaAsignadaId", folio_legal AS "folioLegal"
    `;
    const values = [nombre, rut, Number(edad), folioLegal, fechaIngreso || new Date().toISOString(), 'Ingresado'];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Menor ingresado exitosamente al sistema',
      menor: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al ingresar menor' });
  }
};


const asignarCasa = async (req, res) => {
  const { menorId } = req.params;
  const { casaId } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const menorRes = await client.query('SELECT * FROM menores WHERE id = $1', [parseInt(menorId)]);
      if (menorRes.rows.length === 0) throw new Error('Menor no encontrado');
      const menor = menorRes.rows[0];

      const casaRes = await client.query('SELECT * FROM casas WHERE id = $1', [parseInt(casaId)]);
      if (casaRes.rows.length === 0) throw new Error('Casa no encontrada');
      const casa = casaRes.rows[0];

      if (casa.ocupacion_actual >= casa.capacidad) {
        throw new Error('La casa ha alcanzado su capacidad máxima');
      }

      if (menor.casa_asignada_id) {
        await client.query('UPDATE casas SET ocupacion_actual = ocupacion_actual - 1 WHERE id = $1', [menor.casa_asignada_id]);
      }

      await client.query('UPDATE menores SET casa_asignada_id = $1, estado = $2 WHERE id = $3', [casa.id, 'Asignado a Casa', menor.id]);
      await client.query('UPDATE casas SET ocupacion_actual = ocupacion_actual + 1 WHERE id = $1', [casa.id]);

      await client.query('COMMIT');
      
      res.json({
        message: 'Casa asignada exitosamente',
        menor: { ...menor, casaAsignadaId: casa.id, estado: 'Asignado a Casa' },
        casa: { id: casa.id, nombre: casa.nombre, ocupacionActual: casa.ocupacion_actual + 1 }
      });
    } catch (e) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al asignar casa' });
  }
};


const obtenerEducadorasTurnoActivo = async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.nombre, COALESCE(c.nombre, 'Sin asignar') AS casa
      FROM educadoras e
      LEFT JOIN casas c ON e.casa_id = c.id
    `;
    const result = await pool.query(query);
    res.json({
      message: 'Educadoras en turno activo',
      educadorasActivas: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


const obtenerMenores = async (req, res) => {
  try {
    const result = await pool.query('SELECT *, casa_asignada_id AS "casaAsignadaId", folio_legal AS "folioLegal" FROM menores ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const obtenerCasas = async (req, res) => {
  try {
    const result = await pool.query('SELECT *, ocupacion_actual AS "ocupacionActual" FROM casas ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const obtenerEducadoras = async (req, res) => {
  try {
    const result = await pool.query('SELECT *, casa_id AS "casaId" FROM educadoras ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  ingresarMenor,
  asignarCasa,
  obtenerEducadorasTurnoActivo,
  obtenerMenores,
  obtenerCasas,
  obtenerEducadoras
};
