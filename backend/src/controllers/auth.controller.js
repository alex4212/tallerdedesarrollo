const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/configEnv');

const SECRET_KEY = JWT_SECRET || 'aldeas_sos_jwt_secret_key_2026';

const users = [
  {
    id: 1,
    name: 'Ivresse Jorquera',
    email: 'Ivresse.jorquera@aldeasinfantiles.cl',
    password: 'Ivresse Jorquera',
    role: 'ADMIN',
    houseId: null
  },
  {
    id: 2,
    name: 'María Pérez',
    email: 'maria.perez@aldeasinfantiles.cl',
    password: 'Maria Perez',
    role: 'EDUCADORA',
    houseId: 1
  }
];

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
  }

  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const userPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    houseId: user.houseId
  };

  const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '24h' });

  res.json({
    message: 'Inicio de sesión exitoso',
    user: userPayload,
    token
  });
};

const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  res.json({ user: req.user });
};

module.exports = {
  login,
  me,
  users
};
