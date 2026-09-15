const users = [
  {
    id: 1,
    name: 'Ivresse Jorquera',
    email: 'Ivresse.jorquera@aldeasinfantiles.cl',
    password: 'Ivresse Jorquera',
    role: 'ADMIN',
    houseId: null
  }
];

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
  }

  const user = users.find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  res.json({
    message: 'Inicio de sesión exitoso',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      houseId: user.houseId
    },
    token: 'simulated-jwt-token-12345'
  });
};

module.exports = {
  login
};
