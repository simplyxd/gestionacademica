import { Router } from 'express';
import { listarPermisos } from '../controllers/permisos.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, authorize('permisos.leer'), listarPermisos);

export default router;
