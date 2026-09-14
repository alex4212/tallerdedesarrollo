const validateTask = (req, res, next) => {
  const { casaId, descripcion } = req.body;

  if (!casaId || typeof casaId !== 'number') {
    return res.status(400).json({ message: 'casaId es requerido y debe ser un número' });
  }
  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
    return res.status(400).json({ message: 'descripcion es requerida y no puede estar vacía' });
  }

  next();
};

const validateTaskStatus = (req, res, next) => {
  const { estado } = req.body;
  if (!estado || typeof estado !== 'string') {
    return res.status(400).json({ message: 'Estado inválido' });
  }
  next();
};

module.exports = {
  validateTask,
  validateTaskStatus
};
