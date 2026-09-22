const { pool } = require('./configDb');

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
        estado VARCHAR(50) DEFAULT 'Ingresado'
      );
    `);

    // Insertar casas por defecto si no existen
    const casasCount = await pool.query('SELECT COUNT(*) FROM casas');
    if (parseInt(casasCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO casas (id, nombre, capacidad, ocupacion_actual) VALUES
        (1, 'Casa 1', 5, 0),
        (2, 'Casa 2', 5, 0),
        (3, 'Casa 3', 5, 0),
        (4, 'Casa 4', 5, 0),
        (5, 'Casa 5', 5, 0);
      `);
      // Ajustar secuencia
      await pool.query("SELECT setval('casas_id_seq', (SELECT MAX(id) FROM casas));");
      console.log('>>> Casas por defecto creadas');
    }

    // Insertar educadoras por defecto si no existen
    const educadorasCount = await pool.query('SELECT COUNT(*) FROM educadoras');
    if (parseInt(educadorasCount.rows[0].count) === 0) {
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
    
    console.log('>>> Tablas de acogida inicializadas correctamente');
  } catch (error) {
    console.error('Error inicializando las tablas:', error);
  }
};

module.exports = {
  createDefaultRoles,
  setupDatabase
};
