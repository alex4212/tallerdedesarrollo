import { Router } from 'express';
import {
  login,
  me,
  cambiarPassword,
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, me);
router.put('/password', verifyToken, cambiarPassword);

// Gestión de Usuarios (CRUD administradores)
router.get('/usuarios', verifyToken, isAdmin, obtenerUsuarios);
router.post('/usuarios', verifyToken, isAdmin, crearUsuario);
router.put('/usuarios/:id', verifyToken, isAdmin, actualizarUsuario);
router.delete('/usuarios/:id', verifyToken, isAdmin, eliminarUsuario);

export default router;
