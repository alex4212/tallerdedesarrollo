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

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos (boletas, comprobantes, etc.)
const uploadsPath = join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api/acogida', acogidaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sostenibilidad', sostenibilidadRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);
app.use('/api', indexRoutes);

// Manejador 404 para cualquier ruta /api no encontrada (siempre devuelve JSON)
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
});

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
