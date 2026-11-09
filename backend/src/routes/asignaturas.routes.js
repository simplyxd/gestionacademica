import { Router } from 'express';
import * as c from '../controllers/asignaturas.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as s from '../schemas/asignaturas.schemas.js';

// /api/asignaturas · authenticate en todas; lectura para los cuatro roles, escritura solo coordinador. Sin DELETE.
const router = Router();
router.use(authenticate);

router.get('/', authorize('asignaturas.leer'), validate(s.esquemaListar), c.listar);
router.post('/', authorize('asignaturas.escribir'), validate(s.esquemaCrear), c.crear);
router.get('/:id', authorize('asignaturas.leer'), validate(s.esquemaId), c.obtener);
router.patch('/:id', authorize('asignaturas.escribir'), validate(s.esquemaEditar), c.actualizar);

export default router;
