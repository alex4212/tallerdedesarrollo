import { Router } from 'express';
import * as mantenimientoController from '../controllers/mantenimiento.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validateTask, validateTaskStatus } from '../validations/mantenimiento.validation.js';

const router = Router();

router.use(verifyToken);

router.get('/tareas', mantenimientoController.obtenerTareas);

router.post('/tareas', isAdmin, validateTask, mantenimientoController.crearTarea);

router.patch('/tareas/:id/estado', validateTaskStatus, mantenimientoController.actualizarEstadoTarea);

router.put('/tareas/:id', validateTask, mantenimientoController.actualizarTarea);
router.delete('/tareas/:id', mantenimientoController.eliminarTarea);

export default router;
