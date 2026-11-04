import { Router } from 'express';
import * as acogidaController from '../controllers/acogida.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validateRut } from '../validations/acogida.validation.js';

const router = Router();

router.use(verifyToken);

// ─── MENORES ───────────────────────────────────────────────
router.get('/menores', acogidaController.obtenerMenores);
router.post('/menores', isAdmin, validateRut, acogidaController.ingresarMenor);
router.put('/menores/:id', isAdmin, validateRut, acogidaController.actualizarMenor);
router.delete('/menores/:id', isAdmin, acogidaController.eliminarMenor);

// Asignación, Desasignación y Egreso de menores
router.post('/menores/:menorId/asignar-casa', isAdmin, acogidaController.asignarCasa);
router.post('/menores/:menorId/desasignar-casa', isAdmin, acogidaController.desasignarCasa);
router.post('/menores/:menorId/egreso', isAdmin, acogidaController.registrarEgresoMenor);

// ─── CASAS Y EDUCADORAS ────────────────────────────────────
router.get('/casas', acogidaController.obtenerCasas);
router.get('/educadoras', acogidaController.obtenerEducadoras);

// ─── TURNOS DE EDUCADORAS ──────────────────────────────────
router.get('/turnos/activos', acogidaController.obtenerEducadorasTurnoActivo);
router.get('/turnos', acogidaController.obtenerTurnos);
router.post('/turnos', isAdmin, acogidaController.crearTurno);
router.patch('/turnos/:id/estado', isAdmin, acogidaController.actualizarEstadoTurno);
router.delete('/turnos/:id', isAdmin, acogidaController.eliminarTurno);

export default router;
