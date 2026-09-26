const express = require('express');
const cors = require('cors');
const path = require('path');
const indexRoutes = require('./routes/index.routes');
const acogidaRoutes = require('./routes/acogida.routes');
const authRoutes = require('./routes/auth.routes');
const sostenibilidadRoutes = require('./routes/sostenibilidad.routes');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://146.83.198.35:1626',
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
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: 'Frontend dist not found' });
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;

