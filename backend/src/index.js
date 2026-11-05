import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import './config/configEnv.js';
import app from './app.js';
import { connectDB } from './config/configDb.js';
import { setupDatabase } from './config/initialSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 1626;

connectDB()
  .then(async () => {
    await setupDatabase();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const handleShutdown = () => {
      console.log(`Cerrando servidor en puerto ${PORT}...`);
      server.close(() => {
        console.log('Servidor Express detenido.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
  })
  .catch((err) => {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  });
