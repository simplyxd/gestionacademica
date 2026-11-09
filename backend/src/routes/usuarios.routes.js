import { Router } from 'express';
import { cambiarEstado, crear, editar, listar, obtener, restablecerClave } from '../controllers/usuarios.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { esquemaCrear, esquemaEditar, esquemaEstado, esquemaId, esquemaListar } from '../schemas/usuarios.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('usuarios.listar'), validate(esquemaListar), listar);
router.post('/', authorize('usuarios.crear'), validate(esquemaCrear), crear);
router.patch('/:id/estado', authorize('usuarios.estado'), validate(esquemaEstado), cambiarEstado);
router.post('/:id/restablecer-clave', authorize('usuarios.restablecerClave'), validate(esquemaId), restablecerClave);
router.get('/:id', authorize('usuarios.listar'), validate(esquemaId), obtener);
router.patch('/:id', authorize('usuarios.editar'), validate(esquemaEditar), editar);

export default router;
