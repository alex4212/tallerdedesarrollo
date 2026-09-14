const { Router } = require('express');
const mantenimientoController = require('../controllers/mantenimiento.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateTask, validateTaskStatus } = require('../validations/mantenimiento.validation');

const router = Router();

router.use(verifyToken);

router.get('/tareas', mantenimientoController.obtenerTareas);

router.post('/tareas', isAdmin, validateTask, mantenimientoController.crearTarea);

router.patch('/tareas/:id/estado', validateTaskStatus, mantenimientoController.actualizarEstadoTarea);

module.exports = router;
