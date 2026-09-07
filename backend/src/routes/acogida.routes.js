const { Router } = require('express');
const acogidaController = require('../controllers/acogida.controller');

const router = Router();

router.post('/minors', acogidaController.admitMinor);

router.post('/minors/:minorId/assign-house', acogidaController.assignHouse);

router.get('/shifts/active', acogidaController.getActiveShiftEducators);

router.get('/minors', acogidaController.getMinors);

module.exports = router;
