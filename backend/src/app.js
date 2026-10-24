import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import indexRoutes from './routes/index.routes.js';
import acogidaRoutes from './routes/acogida.routes.js';
import authRoutes from './routes/auth.routes.js';
import sostenibilidadRoutes from './routes/sostenibilidad.routes.js';
import mantenimientoRoutes from './routes/mantenimiento.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN,
  'http://146.83.198.35:1626',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado por política CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);
app.use('/api/acogida', acogidaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sostenibilidad', sostenibilidadRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);

// Servir estáticos del frontend si existen
const frontendDistPath = join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.sendFile(join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: 'Frontend dist not found' });
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
