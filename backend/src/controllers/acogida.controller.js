let menores = [];
let casas = [
  { id: 1, nombre: 'Casa 1', capacidad: 5, ocupacionActual: 0 },
  { id: 2, nombre: 'Casa 2', capacidad: 5, ocupacionActual: 0 },
  { id: 3, nombre: 'Casa 3', capacidad: 5, ocupacionActual: 0 },
  { id: 4, nombre: 'Casa 4', capacidad: 5, ocupacionActual: 0 },
  { id: 5, nombre: 'Casa 5', capacidad: 5, ocupacionActual: 0 }
];

let educadoras = [
  { id: 1, nombre: 'María Pérez', rol: 'Encargada de Casa', casaId: 1 },
  { id: 2, nombre: 'Carmen Rojas', rol: 'Encargada de Casa', casaId: 2 },
  { id: 3, nombre: 'Lucía Gómez', rol: 'Encargada de Casa', casaId: 3 },
  { id: 4, nombre: 'Ana Soto', rol: 'Encargada de Casa', casaId: 4 },
  { id: 5, nombre: 'Rosa Díaz', rol: 'Encargada de Casa', casaId: 5 }
];


const ingresarMenor = (req, res) => {
  const { nombre, edad, folioLegal, fechaIngreso } = req.body;

  if (!nombre || !folioLegal) {
    return res.status(400).json({ message: 'Nombre y Folio Legal son requeridos' });
  }

  const nuevoMenor = {
    id: menores.length + 1,
    nombre,
    edad,
    folioLegal,
    fechaIngreso: fechaIngreso || new Date().toISOString(),
    casaAsignadaId: null,
    estado: 'Ingresado'
  };

  menores.push(nuevoMenor);

  res.status(201).json({
    message: 'Menor ingresado exitosamente al sistema',
    menor: nuevoMenor
  });
};


const asignarCasa = (req, res) => {
  const { menorId } = req.params;
  const { casaId } = req.body;

  const menor = menores.find(m => m.id === parseInt(menorId));
  const casa = casas.find(h => h.id === parseInt(casaId));

  if (!menor) return res.status(404).json({ message: 'Menor no encontrado' });
  if (!casa) return res.status(404).json({ message: 'Casa no encontrada' });

  if (casa.ocupacionActual >= casa.capacidad) {
    return res.status(400).json({ message: 'La casa ha alcanzado su capacidad máxima' });
  }

  if (menor.casaAsignadaId) {
    const casaAntigua = casas.find(h => h.id === menor.casaAsignadaId);
    if (casaAntigua) casaAntigua.ocupacionActual--;
  }

  menor.casaAsignadaId = casa.id;
  menor.estado = 'Asignado a Casa';
  casa.ocupacionActual++;

  res.json({
    message: 'Casa asignada exitosamente',
    menor,
    casa: { id: casa.id, nombre: casa.nombre, ocupacionActual: casa.ocupacionActual }
  });
};


const obtenerEducadorasTurnoActivo = (req, res) => {
  const educadorasActivas = educadoras.map(e => {
      const casaAsignada = casas.find(h => h.id === e.casaId);
      return {
        id: e.id,
        nombre: e.nombre,
        casa: casaAsignada ? casaAsignada.nombre : 'Sin asignar'
      };
    });

  res.json({
    message: 'Educadoras en turno activo',
    educadorasActivas
  });
};


const obtenerMenores = (req, res) => {
  res.json(menores);
};

const obtenerCasas = (req, res) => {
  res.json(casas);
};

const obtenerEducadoras = (req, res) => {
  res.json(educadoras);
};

module.exports = {
  ingresarMenor,
  asignarCasa,
  obtenerEducadorasTurnoActivo,
  obtenerMenores,
  obtenerCasas,
  obtenerEducadoras
};
