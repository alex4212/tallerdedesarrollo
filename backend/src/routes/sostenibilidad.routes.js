const { Router } = require('express');
const sostenibilidadController = require('../controllers/sostenibilidad.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateExpense, validateExpenseStatus } = require('../validations/sostenibilidad.validation');

const router = Router();

router.use(verifyToken);

router.get('/gastos', sostenibilidadController.obtenerGastos);

router.patch('/gastos/:id/estado', isAdmin, validateExpenseStatus, sostenibilidadController.actualizarEstadoGasto);

router.post('/gastos', validateExpense, sostenibilidadController.registrarGasto);

module.exports = router;
