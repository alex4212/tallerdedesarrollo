const { Pool } = require('pg');
const configEnv = require('./configEnv');

const pool = new Pool({
  connectionString: configEnv.DATABASE_URL
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('>>> Conectado exitosamente a la base de datos PostgreSQL (pgAdmin)');
    client.release();
  } catch (error) {
    console.error('Error conectando a la base de datos PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
