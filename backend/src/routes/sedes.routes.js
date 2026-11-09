import { Router } from 'express';
import * as c from '../controllers/sedes.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as s from '../schemas/sedes.schemas.js';

// /api/sedes · authenticate en todas; lectura para los cuatro roles, escritura solo coordinador (config/permisos.js).
// Sin DELETE: la baja es lógica con PATCH /:id/estado.
const router = Router();
router.use(authenticate);

router.get('/', authorize('sedes.leer'), validate(s.esquemaListar), c.listar);
router.post('/', authorize('sedes.escribir'), validate(s.esquemaCrear), c.crear);
router.get('/:id', authorize('sedes.leer'), validate(s.esquemaId), c.obtener);
router.patch('/:id', authorize('sedes.escribir'), validate(s.esquemaEditar), c.actualizar);
router.patch('/:id/estado', authorize('sedes.escribir'), validate(s.esquemaEstado), c.cambiarEstado);

export default router;
