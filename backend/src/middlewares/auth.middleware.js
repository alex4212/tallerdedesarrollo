

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  if (token === 'simulated-jwt-token-12345') {
    req.user = {
      id: 1,
      name: 'Ivresse Jorquera',
      role: 'ADMIN'
    };
    next();
  } else {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador (Jefa de Aldea).' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
