import { Router } from 'express';
import * as c from '../controllers/planes.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as s from '../schemas/planes.schemas.js';

// /api/planes · authenticate en todas; lectura para los cuatro roles, escritura admin y coordinador. Sin DELETE.
const router = Router();
router.use(authenticate);

router.get('/', authorize('planes.leer'), validate(s.esquemaListar), c.listar);
router.post('/', authorize('planes.escribir'), validate(s.esquemaCrear), c.crear);
router.get('/:id', authorize('planes.leer'), validate(s.esquemaId), c.obtener);
router.get('/:id/grafo', authorize('planes.leer'), validate(s.esquemaId), c.grafo);
router.patch('/:id', authorize('planes.escribir'), validate(s.esquemaEditar), c.actualizar);
router.patch('/:id/estado', authorize('planes.escribir'), validate(s.esquemaEstado), c.cambiarEstado);
router.put('/:id/asignaturas', authorize('planes.escribir'), validate(s.esquemaAsignaturas), c.reemplazarAsignaturas);

export default router;
