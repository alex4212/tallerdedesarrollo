const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.me);

module.exports = router;

