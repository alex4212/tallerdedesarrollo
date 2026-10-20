const validateRut = (req, res, next) => {
  const { rut } = req.body;

  if (!rut) {
    return res.status(400).json({ message: 'El RUT es obligatorio' });
  }

  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

  if (cleanRut.length < 2) {
    return res.status(400).json({ message: 'El RUT ingresado no es válido' });
  }

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  if (!/^[0-9]+$/.test(body)) {
    return res.status(400).json({ message: 'El RUT ingresado no es válido' });
  }

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDvNumber = 11 - (sum % 11);
  let expectedDvStr = expectedDvNumber.toString();
  if (expectedDvNumber === 11) expectedDvStr = '0';
  if (expectedDvNumber === 10) expectedDvStr = 'K';

  if (expectedDvStr !== dv) {
    return res.status(400).json({ message: 'El dígito verificador del RUT es incorrecto' });
  }

  next();
};

// NUEVA FUNCIÓN QUE FALTABA
const validarEdadNino = (req, res, next) => {
  const { edad } = req.body;

  if (edad === undefined) {
    return res.status(400).json({ message: 'La edad es obligatoria' });
  }
  if (typeof edad !== 'number') {
    return res.status(400).json({ message: 'La edad debe ser un número válido' });
  }
  if (edad > 18 || edad < 0) {
    return res.status(400).json({ message: 'El programa de acogida es para menores de 18 años' });
  }

  next();
};

module.exports = {
  validateRut,
  validarEdadNino
};