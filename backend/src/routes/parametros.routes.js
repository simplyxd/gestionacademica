import { Router } from 'express';
import { actualizar, obtener } from '../controllers/parametros.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { reglasParametros } from '../schemas/parametros.schemas.js';

const router = Router();

router.get('/', authenticate, authorize('parametros.leer'), obtener);
router.put('/', authenticate, authorize('parametros.escribir'), validate(reglasParametros), actualizar);

export default router;
