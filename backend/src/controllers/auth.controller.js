import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/configDb.js';
import { JWT_SECRET } from '../config/configEnv.js';

const SECRET_KEY = JWT_SECRET || 'aldeas_sos_jwt_secret_key_2026';

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('>>> [AUTH] Intento de login recibido para:', email);

  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      console.warn('>>> [AUTH] Usuario no encontrado en BD:', normalizedEmail);
      return res.status(401).json({ message: 'Credenciales inválidas: correo no registrado' });
    }

    const user = result.rows[0];

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptErr) {
      console.error('>>> [AUTH] Error comparando hash:', bcryptErr.message);
    }

    // Fallback: si la contraseña en BD fue guardada en texto plano en migraciones anteriores
    if (!passwordMatch && user.password_hash === password) {
      console.log('>>> [AUTH] Contraseña coincidió con texto plano. Actualizando hash a bcrypt...');
      passwordMatch = true;
      const newHash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
    }

    if (!passwordMatch) {
      console.warn('>>> [AUTH] Contraseña incorrecta para:', normalizedEmail);
      return res.status(401).json({ message: 'Credenciales inválidas: contraseña incorrecta' });
    }

    const userPayload = {
      id: user.id,
      name: user.nombre,
      email: user.email,
      role: user.role,
      houseId: user.casa_id
    };

    const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '24h' });

    console.log('>>> [AUTH] Login exitoso para:', normalizedEmail, 'Rol:', user.role);
    res.json({
      message: 'Inicio de sesión exitoso',
      user: userPayload,
      token
    });
  } catch (error) {
    console.error('>>> [AUTH] Error inesperado en login:', error);
    res.status(500).json({ message: 'Error en el servidor al procesar el inicio de sesión' });
  }
};

const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  res.json({ user: req.user });
};

const cambiarPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Debe ingresar la contraseña actual y la nueva contraseña' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'La contraseña actual ingresada es incorrecta' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor al cambiar contraseña' });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.nombre, 
        u.email, 
        u.role, 
        u.casa_id AS "casaId",
        c.nombre AS "casaNombre"
      FROM usuarios u
      LEFT JOIN casas c ON u.casa_id = c.id
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener usuarios' });
  }
};

const crearUsuario = async (req, res) => {
  const { nombre, email, password, role, casaId } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const validRole = role && ['ADMIN', 'EDUCADORA'].includes(role) ? role : 'EDUCADORA';

  try {
    const existing = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con este correo electrónico' });
    }

    const hash = await bcrypt.hash(password, 10);
    const assignedCasa = casaId ? parseInt(casaId, 10) : null;

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, role, casa_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, role, casa_id AS "casaId"`,
      [nombre.trim(), normalizedEmail, hash, validRole, assignedCasa]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error en el servidor al crear usuario' });
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, role, casaId, password } = req.body;

  try {
    const userRes = await pool.query('SELECT * FROM usuarios WHERE id = $1', [parseInt(id, 10)]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const current = userRes.rows[0];
    const newNombre = nombre ? nombre.trim() : current.nombre;
    const newEmail = email ? email.trim().toLowerCase() : current.email;
    const newRole = role && ['ADMIN', 'EDUCADORA'].includes(role) ? role : current.role;
    const newCasa = casaId !== undefined ? (casaId ? parseInt(casaId, 10) : null) : current.casa_id;

    if (newEmail !== current.email) {
      const emailCheck = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1 AND id != $2', [newEmail, parseInt(id, 10)]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado por otro usuario' });
      }
    }

    let newHash = current.password_hash;
    if (password && password.trim().length >= 6) {
      newHash = await bcrypt.hash(password.trim(), 10);
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, email = $2, role = $3, casa_id = $4, password_hash = $5
       WHERE id = $6
       RETURNING id, nombre, email, role, casa_id AS "casaId"`,
      [newNombre, newEmail, newRole, newCasa, newHash, parseInt(id, 10)]
    );

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar usuario' });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id, 10);

  if (targetId === req.user.id) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta en uso' });
  }

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [targetId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar usuario' });
  }
};

export {
  login,
  me,
  cambiarPassword,
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
