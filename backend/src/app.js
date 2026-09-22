const express = require('express');
const cors = require('cors');
const path = require('path');
const indexRoutes = require('./routes/index.routes');
const acogidaRoutes = require('./routes/acogida.routes');
const authRoutes = require('./routes/auth.routes');
const sostenibilidadRoutes = require('./routes/sostenibilidad.routes');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);
app.use('/api/acogida', acogidaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sostenibilidad', sostenibilidadRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);

// Servir archivos estáticos del frontend (React)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Cualquier otra ruta que no empiece con /api devuelve el index.html de React
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Ruta de API no encontrada' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
