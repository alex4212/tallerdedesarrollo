import { pool } from './configDb.js';
import bcrypt from 'bcryptjs';

const createDefaultRoles = async () => {
  try {
    console.log('>>> Roles por defecto creados (simulación)');
  } catch (error) {
    console.error('Error creando los roles por defecto', error);
  }
};

const setupDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS casas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        capacidad INT NOT NULL,
        ocupacion_actual INT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS educadoras (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        rol VARCHAR(100) NOT NULL,
        casa_id INT REFERENCES casas(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        rut VARCHAR(20) NOT NULL,
        edad INT NOT NULL,
        folio_legal VARCHAR(100) NOT NULL,
        fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        casa_asignada_id INT REFERENCES casas(id) NULL,
        estado VARCHAR(50) DEFAULT 'Ingresado',
        fecha_ingreso_casa TIMESTAMP NULL,
        fecha_egreso TIMESTAMP NULL,
        motivo_egreso TEXT NULL
      );
    `);

    await pool.query(`ALTER TABLE menores ADD COLUMN IF NOT EXISTS fecha_ingreso_casa TIMESTAMP;`);
    await pool.query(`ALTER TABLE menores ADD COLUMN IF NOT EXISTS fecha_egreso TIMESTAMP;`);
    await pool.query(`ALTER TABLE menores ADD COLUMN IF NOT EXISTS motivo_egreso TEXT;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gastos (
        id SERIAL PRIMARY KEY,
        casa_id INT REFERENCES casas(id),
        monto NUMERIC NOT NULL,
        descripcion TEXT NOT NULL,
        url_boleta TEXT,
        estado VARCHAR(50) DEFAULT 'PENDIENTE',
        categoria VARCHAR(50) DEFAULT 'COMESTIBLES',
        establecimiento VARCHAR(100),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'EDUCADORA',
        casa_id INT REFERENCES casas(id) NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tareas_mantenimiento (
        id SERIAL PRIMARY KEY,
        casa_id INT REFERENCES casas(id) ON DELETE CASCADE,
        descripcion TEXT NOT NULL,
        estado VARCHAR(50) DEFAULT 'PENDIENTE',
        fecha_limite VARCHAR(50) DEFAULT 'Sin fecha',
        tipo VARCHAR(50) DEFAULT 'CORRECTIVO',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS turnos_educadoras (
        id SERIAL PRIMARY KEY,
        educadora_id INT REFERENCES educadoras(id) ON DELETE CASCADE,
        casa_id INT REFERENCES casas(id) ON DELETE CASCADE,
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        horario VARCHAR(50) NOT NULL DEFAULT 'DIURNO',
        tipo VARCHAR(50) NOT NULL DEFAULT 'TITULAR',
        estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVO',
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar usuarios por defecto si no existen
    const adminEmail = 'ivresse.jorquera@aldeasinfantiles.cl';
    const adminCheck = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [adminEmail]);
    if (adminCheck.rows.length === 0) {
      const hashAdmin = await bcrypt.hash('Ivresse Jorquera', 10);
      await pool.query(`
        INSERT INTO usuarios (nombre, email, password_hash, role, casa_id) VALUES
        ($1, $2, $3, 'ADMIN', NULL)
      `, ['Ivresse Jorquera', adminEmail, hashAdmin]);
      console.log('>>> Usuario Administrador (ivresse.jorquera@aldeasinfantiles.cl) garantizado');
    }

    const eduEmail = 'maria.perez@aldeasinfantiles.cl';
    const eduCheck = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [eduEmail]);
    if (eduCheck.rows.length === 0) {
      const hashEdu = await bcrypt.hash('Maria Perez', 10);
      await pool.query(`
        INSERT INTO usuarios (nombre, email, password_hash, role, casa_id) VALUES
        ($1, $2, $3, 'EDUCADORA', 1)
      `, ['María Pérez', eduEmail, hashEdu]);
      console.log('>>> Usuario Educadora (maria.perez@aldeasinfantiles.cl) garantizado');
    }

    // Agregar columnas nuevas a gastos si no existen
    await pool.query(`ALTER TABLE gastos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'COMESTIBLES';`);
    await pool.query(`ALTER TABLE gastos ADD COLUMN IF NOT EXISTS establecimiento VARCHAR(100);`);

    // Insertar casas por defecto si no existen
    const casasCount = await pool.query('SELECT COUNT(*) FROM casas');
    if (parseInt(casasCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO casas (id, nombre, capacidad, ocupacion_actual) VALUES
        (1, 'Casa 1', 5, 0),
        (2, 'Casa 2', 5, 0),
        (3, 'Casa 3', 5, 0),
        (4, 'Casa 4', 5, 0),
        (5, 'Casa 5', 5, 0);
      `);
      await pool.query("SELECT setval('casas_id_seq', (SELECT MAX(id) FROM casas));");
      console.log('>>> Casas por defecto creadas');
    }

    // Insertar educadoras por defecto si no existen
    const educadorasCount = await pool.query('SELECT COUNT(*) FROM educadoras');
    if (parseInt(educadorasCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO educadoras (id, nombre, rol, casa_id) VALUES
        (1, 'María Pérez', 'Encargada de Casa', 1),
        (2, 'Carmen Rojas', 'Encargada de Casa', 2),
        (3, 'Lucía Gómez', 'Encargada de Casa', 3),
        (4, 'Ana Soto', 'Encargada de Casa', 4),
        (5, 'Rosa Díaz', 'Encargada de Casa', 5);
      `);
      await pool.query("SELECT setval('educadoras_id_seq', (SELECT MAX(id) FROM educadoras));");
      console.log('>>> Educadoras por defecto creadas');
    }

    // Insertar tarea de mantenimiento inicial si no existe
    const tareasCount = await pool.query('SELECT COUNT(*) FROM tareas_mantenimiento');
    if (parseInt(tareasCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO tareas_mantenimiento (casa_id, descripcion, estado, fecha_limite, tipo)
        VALUES (1, 'Reparar llave de agua del baño', 'PENDIENTE', '2026-10-01', 'CORRECTIVO');
      `);
      console.log('>>> Tareas de mantenimiento iniciales creadas');
    }

    // Insertar turnos de educadoras si no existen
    const turnosCount = await pool.query('SELECT COUNT(*) FROM turnos_educadoras');
    if (parseInt(turnosCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO turnos_educadoras (educadora_id, casa_id, fecha, horario, tipo, estado, observaciones) VALUES
        (1, 1, CURRENT_DATE, 'DIURNO',   'TITULAR',   'ACTIVO', 'Turno regular Casa 1'),
        (2, 2, CURRENT_DATE, 'DIURNO',   'TITULAR',   'ACTIVO', 'Turno regular Casa 2'),
        (3, 3, CURRENT_DATE, 'NOCTURNO', 'TITULAR',   'ACTIVO', 'Guardia nocturna Casa 3'),
        (4, 4, CURRENT_DATE, 'COMPLETO', 'REEMPLAZO', 'ACTIVO', 'Reemplazo jornada completa Casa 4'),
        (5, 5, CURRENT_DATE, 'DIURNO',   'TITULAR',   'ACTIVO', 'Turno regular Casa 5');
      `);
      console.log('>>> Turnos iniciales de educadoras creados');
    }

    console.log('>>> Tablas del sistema inicializadas correctamente');
  } catch (error) {
    console.error('Error inicializando las tablas:', error);
  }
};

export { createDefaultRoles, setupDatabase };
