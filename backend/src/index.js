import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import './config/configEnv.js';
import app from './app.js';
import { connectDB } from './config/configDb.js';
import { setupDatabase } from './config/initialSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 1626;

// Escuchar primero: así el puerto siempre queda tomado por el backend
// (y no por otro servidor), aunque la base de datos tarde o falle.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`No se pudo escuchar en el puerto ${PORT}:`, err.message);
  process.exit(1);
});

const initDB = async (intento = 1) => {
  try {
    await connectDB();
    await setupDatabase();
    console.log('>>> Base de datos lista');
  } catch (err) {
    console.error(`Error inicializando la base de datos (intento ${intento}):`, err.message);
    if (intento < 10) {
      setTimeout(() => initDB(intento + 1), 5000);
    }
  }
};

initDB();
