const { Router } = require('express');
const acogidaController = require('../controllers/acogida.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateRut } = require('../validations/acogida.validation');

const router = Router();

router.use(verifyToken);

router.post('/menores', isAdmin, validateRut, acogidaController.ingresarMenor);

router.post('/menores/:menorId/asignar-casa', isAdmin, acogidaController.asignarCasa);

router.get('/turnos/activos', acogidaController.obtenerEducadorasTurnoActivo);

router.get('/menores', acogidaController.obtenerMenores);

router.get('/casas', acogidaController.obtenerCasas);

router.get('/educadoras', acogidaController.obtenerEducadoras);

module.exports = router;
