const validateTask = (req, res, next) => {
  const { casaId, descripcion } = req.body;

  if (!casaId || typeof casaId !== 'number') {
    return res.status(400).json({ message: 'casaId es requerido y debe ser un número' });
  }
  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
    return res.status(400).json({ message: 'descripcion es requerida y no puede estar vacía' });
  }

  const texto = descripcion.trim();

  if (texto.length < 5 || texto.length > 255) {
    return res.status(400).json({ message: 'La descripción debe tener entre 5 y 255 caracteres' });
  }

  if (/^\d+$/.test(texto)) {
    return res.status(400).json({ message: 'La descripción no puede contener solo números' });
  }

  // Detectar caracteres repetidos consecutivos (ej. "aaaaa", ".....", "11111")
  if (/(.)\1{4,}/.test(texto)) {
    return res.status(400).json({ message: 'La descripción contiene caracteres repetitivos no válidos' });
  }

  // Debe contener al menos texto descriptivo (letras)
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(texto)) {
    return res.status(400).json({ message: 'La descripción debe contener texto descriptivo' });
  }

  // Detectar texto sin vocales (ej. "sdfghjk")
  if (!/[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/.test(texto)) {
    return res.status(400).json({ message: 'La descripción no parece un texto coherente' });
  }

  // Detectar 5 o más consonantes seguidas o secuencias repetidas tipo spam (ej. "ahshdh", "asdasd")
  if (/[bcdfghjklmnñpqrstvwxyzBCDFGHJKLMNÑPQRSTVWXYZ]{5,}/.test(texto) || /(.{2,3})\1{2,}/i.test(texto)) {
    return res.status(400).json({ message: 'La descripción ingresada no parece válida o contiene texto sin sentido' });
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
