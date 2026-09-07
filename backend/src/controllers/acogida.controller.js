
let minors = [];
let houses = [
  { id: 1, name: 'Casa Esperanza', capacity: 10, currentOccupancy: 0 },
  { id: 2, name: 'Casa Refugio', capacity: 5, currentOccupancy: 0 }
];
let educators = [
  { id: 1, name: 'María Pérez', role: 'Educadora', isOnActiveShift: true, houseId: 1 },
  { id: 2, name: 'Carmen Rojas', role: 'Educadora', isOnActiveShift: false, houseId: 1 },
  { id: 3, name: 'Lucía Gómez', role: 'Educadora', isOnActiveShift: true, houseId: 2 }
];


const admitMinor = (req, res) => {
  const { name, age, courtOrderNumber, admissionDate } = req.body;

  if (!name || !courtOrderNumber) {
    return res.status(400).json({ message: 'Nombre y Número de Orden de Tribunal son requeridos' });
  }

  const newMinor = {
    id: minors.length + 1,
    name,
    age,
    courtOrderNumber,
    admissionDate: admissionDate || new Date().toISOString(),
    assignedHouseId: null,
    status: 'Ingresado'
  };

  minors.push(newMinor);

  res.status(201).json({
    message: 'Menor ingresado exitosamente al sistema',
    minor: newMinor
  });
};


const assignHouse = (req, res) => {
  const { minorId } = req.params;
  const { houseId } = req.body;

  const minor = minors.find(m => m.id === parseInt(minorId));
  const house = houses.find(h => h.id === parseInt(houseId));

  if (!minor) return res.status(404).json({ message: 'Menor no encontrado' });
  if (!house) return res.status(404).json({ message: 'Casa no encontrada' });

  if (house.currentOccupancy >= house.capacity) {
    return res.status(400).json({ message: 'La casa ha alcanzado su capacidad máxima' });
  }


  if (minor.assignedHouseId) {
    const oldHouse = houses.find(h => h.id === minor.assignedHouseId);
    if (oldHouse) oldHouse.currentOccupancy--;
  }

  minor.assignedHouseId = house.id;
  minor.status = 'Asignado a Casa';
  house.currentOccupancy++;

  res.json({
    message: 'Casa asignada exitosamente',
    minor,
    house: { id: house.id, name: house.name, currentOccupancy: house.currentOccupancy }
  });
};


const getActiveShiftEducators = (req, res) => {

  const activeEducators = educators
    .filter(e => e.isOnActiveShift)
    .map(e => {
      const assignedHouse = houses.find(h => h.id === e.houseId);
      return {
        id: e.id,
        name: e.name,
        house: assignedHouse ? assignedHouse.name : 'Sin asignar'
      };
    });

  res.json({
    message: 'Educadoras en turno activo',
    activeEducators
  });
};


const getMinors = (req, res) => {
  res.json(minors);
};

module.exports = {
  admitMinor,
  assignHouse,
  getActiveShiftEducators,
  getMinors
};
