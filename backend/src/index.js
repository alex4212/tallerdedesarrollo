import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import './config/configEnv.js';
import app from './app.js';
import { connectDB } from './config/configDb.js';
import { setupDatabase } from './config/initialSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 80;

connectDB()
  .then(async () => {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  });
