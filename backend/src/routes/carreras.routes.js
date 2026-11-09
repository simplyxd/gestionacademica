import { Router } from 'express';
import * as c from '../controllers/carreras.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as s from '../schemas/carreras.schemas.js';

// /api/carreras · authenticate en todas; lectura para los cuatro roles, escritura solo coordinador (config/permisos.js).
// Sin DELETE: la baja es lógica con PATCH /:id/estado.
const router = Router();
router.use(authenticate);

router.get('/', authorize('carreras.leer'), validate(s.esquemaListar), c.listar);
router.post('/', authorize('carreras.escribir'), validate(s.esquemaCrear), c.crear);
router.get('/:id', authorize('carreras.leer'), validate(s.esquemaId), c.obtener);
router.patch('/:id', authorize('carreras.escribir'), validate(s.esquemaEditar), c.actualizar);
router.patch('/:id/estado', authorize('carreras.escribir'), validate(s.esquemaEstado), c.cambiarEstado);

export default router;
