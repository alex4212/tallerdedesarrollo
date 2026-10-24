import { Router } from 'express';
import * as sostenibilidadController from '../controllers/sostenibilidad.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validateExpense, validateExpenseStatus } from '../validations/sostenibilidad.validation.js';

const router = Router();

router.use(verifyToken);

router.get('/gastos', sostenibilidadController.obtenerGastos);

router.patch('/gastos/:id/estado', isAdmin, validateExpenseStatus, sostenibilidadController.actualizarEstadoGasto);

router.put('/gastos/:id', validateExpense, sostenibilidadController.actualizarGasto);
router.delete('/gastos/:id', sostenibilidadController.eliminarGasto);

router.post('/gastos', validateExpense, sostenibilidadController.registrarGasto);

export default router;
