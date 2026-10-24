import { Router } from 'express';
import * as acogidaController from '../controllers/acogida.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validateRut } from '../validations/acogida.validation.js';

const router = Router();

router.use(verifyToken);

router.post('/menores', isAdmin, validateRut, acogidaController.ingresarMenor);

router.post('/menores/:menorId/asignar-casa', isAdmin, acogidaController.asignarCasa);

router.get('/turnos/activos', acogidaController.obtenerEducadorasTurnoActivo);

router.get('/menores', acogidaController.obtenerMenores);

router.get('/casas', acogidaController.obtenerCasas);

router.get('/educadoras', acogidaController.obtenerEducadoras);

export default router;
