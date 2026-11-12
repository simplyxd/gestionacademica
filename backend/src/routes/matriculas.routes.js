import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { actualizarEstadoMatricula, listarMatriculas } from '../controllers/matriculas.controller.js';
import { ESTADOS_MATRICULA } from '../models/matricula.model.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

// /api/matriculas · authenticate en todas; lectura admin y coordinador, escritura solo coordinador (config/permisos.js).
const router = Router();
router.use(authenticate);

router.get(
  '/',
  authorize('matriculas.leer'),
  validate([
    query('periodoId').optional().isMongoId().withMessage('periodoId debe tener formato de id'),
    query('carreraId').optional().isMongoId().withMessage('carreraId debe tener formato de id'),
    query('estudianteId').optional().isMongoId().withMessage('estudianteId debe tener formato de id'),
    query('estado').optional().isIn(ESTADOS_MATRICULA).withMessage(`estado debe ser uno de: ${ESTADOS_MATRICULA.join(', ')}`),
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser un entero entre 1 y 100'),
  ]),
  listarMatriculas,
);

router.patch(
  '/:id/estado',
  authorize('matriculas.escribir'),
  validate([
    param('id').isMongoId().withMessage('id debe tener formato de id'),
    body('estado').isIn(ESTADOS_MATRICULA).withMessage(`estado debe ser uno de: ${ESTADOS_MATRICULA.join(', ')}`),
  ]),
  actualizarEstadoMatricula,
);

export default router;
