import { Router } from 'express';
import { listarPeriodos } from '../controllers/periodos.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

// /api/periodos · lectura para los cuatro roles. El alta y el cambio de estado siguen en el servicio.
const router = Router();
router.use(authenticate);

router.get('/', authorize('periodos.leer'), listarPeriodos);

export default router;
