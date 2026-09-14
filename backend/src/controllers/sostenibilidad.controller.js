let gastos = [
  { id: 1, casaId: 1, monto: 15000, descripcion: 'Compra de detergente y cloro', urlBoleta: 'http://ejemplo.com/boleta1.jpg', estado: 'PENDIENTE', fecha: new Date().toISOString() }
];

const registrarGasto = (req, res) => {
  const { casaId, monto, descripcion, urlBoleta } = req.body;

  const nuevoGasto = {
    id: gastos.length + 1,
    casaId,
    monto,
    descripcion,
    urlBoleta: urlBoleta || null,
    estado: 'PENDIENTE',
    fecha: new Date().toISOString()
  };

  gastos.push(nuevoGasto);

  res.status(201).json({
    message: 'Gasto registrado exitosamente (Pendiente de aprobación)',
    gasto: nuevoGasto
  });
};

const obtenerGastos = (req, res) => {
  res.json(gastos);
};

const actualizarEstadoGasto = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const gasto = gastos.find(g => g.id === parseInt(id));

  if (!gasto) {
    return res.status(404).json({ message: 'Gasto no encontrado' });
  }

  gasto.estado = estado;

  res.json({
    message: `Gasto ${estado.toLowerCase()} exitosamente`,
    gasto
  });
};

module.exports = {
  registrarGasto,
  obtenerGastos,
  actualizarEstadoGasto
};
