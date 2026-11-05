const CATEGORIAS_VALIDAS = ['COMESTIBLES', 'ASEO_Y_LIMPIEZA'];

const validateExpense = (req, res, next) => {
  const { casaId, monto, descripcion, categoria } = req.body;

  const casaIdNum = Number(casaId);
  if (!casaId || isNaN(casaIdNum) || casaIdNum <= 0) {
    return res.status(400).json({ message: 'casaId es requerido y debe ser un número válido' });
  }
  const montoNum = Number(monto);
  if (!monto || isNaN(montoNum) || montoNum <= 0) {
    return res.status(400).json({ message: 'monto es requerido y debe ser un número mayor a 0' });
  }
  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
    return res.status(400).json({ message: 'descripcion es requerida y no puede estar vacía' });
  }
  if (categoria && !CATEGORIAS_VALIDAS.includes(categoria)) {
    return res.status(400).json({ message: `Categoría inválida. Use: ${CATEGORIAS_VALIDAS.join(' o ')}` });
  }

  // Normalizar a número para que el controlador no falle
  req.body.casaId = casaIdNum;
  req.body.monto = montoNum;

  next();
};

const validateExpenseStatus = (req, res, next) => {
  const { estado } = req.body;
  if (!estado || (estado !== 'APROBADO' && estado !== 'RECHAZADO')) {
    return res.status(400).json({ message: 'Estado inválido. Use APROBADO o RECHAZADO' });
  }
  next();
};

export { validateExpense, validateExpenseStatus };
