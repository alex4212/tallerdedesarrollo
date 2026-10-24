import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/configEnv.js';

const SECRET_KEY = JWT_SECRET || 'aldeas_sos_jwt_secret_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Acceso denegado. Token expirado.' });
    }
    return res.status(403).json({ message: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'Jefa de Aldea')) {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador (Jefa de Aldea).' });
  }
};

const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
};

export { verifyToken, isAdmin, hasRole };
