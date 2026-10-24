import { Router } from 'express';
import { getHome } from '../controllers/index.controller.js';

const router = Router();

router.get('/', getHome);

export default router;
