import { pool } from '../config/configDb.js';

const ingresarMenor = async (req, res) => {
  const { nombre, edad, folioLegal, rut, fechaIngreso } = req.body;

  if (!nombre || !folioLegal || !rut || edad === undefined) {
    return res.status(400).json({ message: 'Nombre, RUT, Edad y Folio Legal son requeridos' });
  }

  if (Number(edad) >= 18) {
    return res.status(400).json({ message: 'El ingresado debe ser menor de edad (menor a 18 años)' });
  }

  try {
    const rutExistente = await pool.query(
      'SELECT id, nombre FROM menores WHERE LOWER(TRIM(rut)) = LOWER(TRIM($1))',
      [rut]
    );
    if (rutExistente.rows.length > 0) {
      return res.status(400).json({
        message: `El RUT "${rut.trim()}" ya se encuentra registrado para el menor ${rutExistente.rows[0].nombre}`
      });
    }

    const folioExistente = await pool.query(
      'SELECT id, nombre FROM menores WHERE LOWER(TRIM(folio_legal)) = LOWER(TRIM($1))',
      [folioLegal]
    );
    if (folioExistente.rows.length > 0) {
      return res.status(400).json({
        message: `El Folio Legal "${folioLegal.trim()}" ya se encuentra registrado para el menor ${folioExistente.rows[0].nombre}`
      });
    }

    const query = `
      INSERT INTO menores (nombre, rut, edad, folio_legal, fecha_ingreso, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *, id, casa_asignada_id AS "casaAsignadaId", folio_legal AS "folioLegal"
    `;
    const values = [nombre.trim(), rut.trim(), Number(edad), folioLegal.trim(), fechaIngreso || new Date().toISOString(), 'Sin asignar'];
    
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

const actualizarMenor = async (req, res) => {
  const { id } = req.params;
  const { nombre, rut, edad, folioLegal, estado } = req.body;

  try {
    const menorRes = await pool.query('SELECT * FROM menores WHERE id = $1', [parseInt(id, 10)]);
    if (menorRes.rows.length === 0) {
      return res.status(404).json({ message: 'Menor no encontrado' });
    }

    const current = menorRes.rows[0];
    const newNombre = nombre ? nombre.trim() : current.nombre;
    const newRut = rut ? rut.trim() : current.rut;
    const newEdad = edad !== undefined ? Number(edad) : current.edad;
    const newFolio = folioLegal ? folioLegal.trim() : current.folio_legal;
    const newEstado = estado || current.estado;

    if (newEdad >= 18) {
      return res.status(400).json({ message: 'El ingresado debe ser menor de edad (menor a 18 años)' });
    }

    if (newRut) {
      const rutExistente = await pool.query(
        'SELECT id, nombre FROM menores WHERE LOWER(TRIM(rut)) = LOWER(TRIM($1)) AND id != $2',
        [newRut, parseInt(id, 10)]
      );
      if (rutExistente.rows.length > 0) {
        return res.status(400).json({
          message: `El RUT "${newRut}" ya pertenece a otro menor (${rutExistente.rows[0].nombre})`
        });
      }
    }

    if (newFolio) {
      const folioExistente = await pool.query(
        'SELECT id, nombre FROM menores WHERE LOWER(TRIM(folio_legal)) = LOWER(TRIM($1)) AND id != $2',
        [newFolio, parseInt(id, 10)]
      );
      if (folioExistente.rows.length > 0) {
        return res.status(400).json({
          message: `El Folio Legal "${newFolio}" ya pertenece a otro menor (${folioExistente.rows[0].nombre})`
        });
      }
    }

    const result = await pool.query(
      `UPDATE menores
       SET nombre = $1, rut = $2, edad = $3, folio_legal = $4, estado = $5
       WHERE id = $6
       RETURNING *, id, casa_asignada_id AS "casaAsignadaId", folio_legal AS "folioLegal", 
                 fecha_ingreso AS "fechaIngreso", fecha_ingreso_casa AS "fechaIngresoCasa", 
                 fecha_egreso AS "fechaEgreso", motivo_egreso AS "motivoEgreso"`,
      [newNombre, newRut, newEdad, newFolio, newEstado, parseInt(id, 10)]
    );

    res.json({
      message: 'Datos del menor actualizados exitosamente',
      menor: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al actualizar menor' });
  }
};

const asignarCasa = async (req, res) => {
  const { menorId } = req.params;
  const { casaId, fechaIngresoCasa } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const menorRes = await client.query('SELECT * FROM menores WHERE id = $1', [parseInt(menorId, 10)]);
      if (menorRes.rows.length === 0) throw new Error('Menor no encontrado');
      const menor = menorRes.rows[0];

      const casaRes = await client.query('SELECT * FROM casas WHERE id = $1', [parseInt(casaId, 10)]);
      if (casaRes.rows.length === 0) throw new Error('Casa no encontrada');
      const casa = casaRes.rows[0];

      if (casa.ocupacion_actual >= casa.capacidad) {
        throw new Error('La casa ha alcanzado su capacidad máxima');
      }

      if (menor.casa_asignada_id) {
        await client.query('UPDATE casas SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1) WHERE id = $1', [menor.casa_asignada_id]);
      }

      const fechaToUse = fechaIngresoCasa || new Date().toISOString();
      await client.query(
        'UPDATE menores SET casa_asignada_id = $1, estado = $2, fecha_ingreso_casa = $3 WHERE id = $4',
        [casa.id, 'Asignado a Casa', fechaToUse, menor.id]
      );
      await client.query('UPDATE casas SET ocupacion_actual = ocupacion_actual + 1 WHERE id = $1', [casa.id]);

      await client.query('COMMIT');
      
      res.json({
        message: 'Casa asignada exitosamente',
        menor: { ...menor, casaAsignadaId: casa.id, estado: 'Asignado a Casa', fechaIngresoCasa: fechaToUse },
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

const desasignarCasa = async (req, res) => {
  const { menorId } = req.params;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const menorRes = await client.query('SELECT * FROM menores WHERE id = $1', [parseInt(menorId, 10)]);
      if (menorRes.rows.length === 0) throw new Error('Menor no encontrado');
      const menor = menorRes.rows[0];

      if (!menor.casa_asignada_id) {
        throw new Error('El menor no tiene una casa asignada actualmente');
      }

      const anteriorCasaId = menor.casa_asignada_id;
      await client.query('UPDATE casas SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1) WHERE id = $1', [anteriorCasaId]);

      const result = await client.query(
        `UPDATE menores 
         SET casa_asignada_id = NULL, estado = 'Sin asignar', fecha_ingreso_casa = NULL 
         WHERE id = $1 
         RETURNING *, id, casa_asignada_id AS "casaAsignadaId", folio_legal AS "folioLegal"`,
        [menor.id]
      );

      const casaRes = await client.query('SELECT *, ocupacion_actual AS "ocupacionActual" FROM casas WHERE id = $1', [anteriorCasaId]);

      await client.query('COMMIT');

      res.json({
        message: 'Menor desasignado de la casa exitosamente',
        menor: result.rows[0],
        casa: casaRes.rows[0]
      });
    } catch (e) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al desasignar casa' });
  }
};

const registrarEgresoMenor = async (req, res) => {
  const { menorId } = req.params;
  const { motivoEgreso, fechaEgreso } = req.body;

  if (!motivoEgreso || motivoEgreso.trim() === '') {
    return res.status(400).json({ message: 'El motivo de egreso es obligatorio (ej: Revinculación familiar, Mayoría de edad, Derivación)' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const menorRes = await client.query('SELECT * FROM menores WHERE id = $1', [parseInt(menorId, 10)]);
      if (menorRes.rows.length === 0) throw new Error('Menor no encontrado');
      const menor = menorRes.rows[0];

      if (menor.casa_asignada_id) {
        await client.query('UPDATE casas SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1) WHERE id = $1', [menor.casa_asignada_id]);
      }

      const fechaFinal = fechaEgreso || new Date().toISOString();
      const result = await client.query(
        `UPDATE menores 
         SET casa_asignada_id = NULL, 
             estado = 'Egresado', 
             fecha_egreso = $1, 
             motivo_egreso = $2 
         WHERE id = $3 
         RETURNING *, id, casa_asignada_id AS "casaAsignadaId", folio_legal AS "folioLegal", 
                   fecha_egreso AS "fechaEgreso", motivo_egreso AS "motivoEgreso"`,
        [fechaFinal, motivoEgreso.trim(), menor.id]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Egreso del menor registrado exitosamente',
        menor: result.rows[0]
      });
    } catch (e) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar egreso' });
  }
};

const eliminarMenor = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const menorRes = await client.query('SELECT * FROM menores WHERE id = $1', [parseInt(id, 10)]);
      if (menorRes.rows.length === 0) throw new Error('Menor no encontrado');
      const menor = menorRes.rows[0];

      if (menor.casa_asignada_id) {
        await client.query('UPDATE casas SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1) WHERE id = $1', [menor.casa_asignada_id]);
      }

      await client.query('DELETE FROM menores WHERE id = $1', [menor.id]);
      await client.query('COMMIT');

      res.json({ message: 'Menor eliminado del sistema exitosamente' });
    } catch (e) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al eliminar menor' });
  }
};

const obtenerEducadorasTurnoActivo = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, 
        e.nombre, 
        COALESCE(c_turno.nombre, c_fija.nombre, 'Sin asignar') AS casa,
        COALESCE(t.horario, 'Turno Regular') AS horario,
        COALESCE(t.tipo, 'TITULAR') AS tipo,
        CASE WHEN t.id IS NOT NULL THEN 'En turno activo' ELSE 'Asignación regular' END AS "estadoTurno",
        t.id AS "turnoId"
      FROM educadoras e
      LEFT JOIN casas c_fija ON e.casa_id = c_fija.id
      LEFT JOIN turnos_educadoras t ON t.educadora_id = e.id 
        AND t.fecha = CURRENT_DATE 
        AND t.estado = 'ACTIVO'
      LEFT JOIN casas c_turno ON t.casa_id = c_turno.id
      ORDER BY e.id ASC
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

const obtenerTurnos = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.educadora_id AS "educadoraId",
        e.nombre AS "educadoraNombre",
        t.casa_id AS "casaId",
        c.nombre AS "casaNombre",
        TO_CHAR(t.fecha, 'YYYY-MM-DD') AS fecha,
        t.horario,
        t.tipo,
        t.estado,
        t.observaciones,
        t.created_at AS "createdAt"
      FROM turnos_educadoras t
      JOIN educadoras e ON t.educadora_id = e.id
      JOIN casas c ON t.casa_id = c.id
      ORDER BY t.fecha DESC, t.id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al obtener turnos' });
  }
};

const crearTurno = async (req, res) => {
  const { educadoraId, casaId, fecha, horario, tipo, observaciones } = req.body;

  if (!educadoraId || !casaId) {
    return res.status(400).json({ message: 'Educadora y Casa son obligatorias' });
  }

  try {
    const query = `
      INSERT INTO turnos_educadoras (educadora_id, casa_id, fecha, horario, tipo, estado, observaciones)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), COALESCE($4, 'DIURNO'), COALESCE($5, 'TITULAR'), 'ACTIVO', $6)
      RETURNING 
        id,
        educadora_id AS "educadoraId",
        casa_id AS "casaId",
        TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
        horario,
        tipo,
        estado,
        observaciones,
        created_at AS "createdAt"
    `;
    const result = await pool.query(query, [
      parseInt(educadoraId, 10),
      parseInt(casaId, 10),
      fecha || null,
      horario || 'DIURNO',
      tipo || 'TITULAR',
      observaciones || null
    ]);

    res.status(201).json({
      message: 'Turno registrado exitosamente',
      turno: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar turno' });
  }
};

const actualizarEstadoTurno = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: 'El estado es requerido' });
  }

  try {
    const result = await pool.query(
      `UPDATE turnos_educadoras 
       SET estado = $1 
       WHERE id = $2 
       RETURNING id, educadora_id AS "educadoraId", casa_id AS "casaId", estado`,
      [estado, parseInt(id, 10)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.json({ message: `Estado del turno actualizado a ${estado}`, turno: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al actualizar turno' });
  }
};

const eliminarTurno = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM turnos_educadoras WHERE id = $1 RETURNING id', [parseInt(id, 10)]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al eliminar turno' });
  }
};

const obtenerMenores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        m.casa_asignada_id AS "casaAsignadaId", 
        m.folio_legal AS "folioLegal",
        m.fecha_ingreso AS "fechaIngreso",
        m.fecha_ingreso_casa AS "fechaIngresoCasa",
        m.fecha_egreso AS "fechaEgreso",
        m.motivo_egreso AS "motivoEgreso",
        c.nombre AS "casaNombre"
      FROM menores m
      LEFT JOIN casas c ON m.casa_asignada_id = c.id
      ORDER BY m.id ASC
    `);
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

export {
  ingresarMenor,
  actualizarMenor,
  asignarCasa,
  desasignarCasa,
  registrarEgresoMenor,
  eliminarMenor,
  obtenerEducadorasTurnoActivo,
  obtenerTurnos,
  crearTurno,
  actualizarEstadoTurno,
  eliminarTurno,
  obtenerMenores,
  obtenerCasas,
  obtenerEducadoras
};
