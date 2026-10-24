import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/configDb.js';
import { JWT_SECRET } from '../config/configEnv.js';

const SECRET_KEY = JWT_SECRET || 'aldeas_sos_jwt_secret_key_2026';

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
  }

  try {
    // Buscar usuario en la base de datos
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña contra el hash almacenado
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const userPayload = {
      id: user.id,
      name: user.nombre,
      email: user.email,
      role: user.role,
      houseId: user.casa_id
    };

    const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '24h' });

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userPayload,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  res.json({ user: req.user });
};

export { login, me };
