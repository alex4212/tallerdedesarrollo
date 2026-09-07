const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index.routes');
const acogidaRoutes = require('./routes/acogida.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);
app.use('/api/acogida', acogidaRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
