const validateExpense = (req, res, next) => {
  const { casaId, monto, descripcion } = req.body;

  if (!casaId || typeof casaId !== 'number') {
    return res.status(400).json({ message: 'casaId es requerido y debe ser un número' });
  }
  if (!monto || typeof monto !== 'number' || monto <= 0) {
    return res.status(400).json({ message: 'monto es requerido y debe ser un número mayor a 0' });
  }
  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
    return res.status(400).json({ message: 'descripcion es requerida y no puede estar vacía' });
  }

  next();
};

const validateExpenseStatus = (req, res, next) => {
  const { estado } = req.body;
  if (!estado || (estado !== 'APROBADO' && estado !== 'RECHAZADO')) {
    return res.status(400).json({ message: 'Estado inválido. Use APROBADO o RECHAZADO' });
  }
  next();
};

module.exports = {
  validateExpense,
  validateExpenseStatus
};
