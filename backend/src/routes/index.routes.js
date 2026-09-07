const { Router } = require('express');
const indexController = require('../controllers/index.controller');

const router = Router();

router.get('/', indexController.getHome);

module.exports = router;
