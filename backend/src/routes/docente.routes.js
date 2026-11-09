import { Router } from 'express';
import { param, query } from 'express-validator';
import { listarSecciones, obtenerHorario, obtenerNomina } from '../controllers/docente.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

const periodoId = query('periodoId')
  .trim()
  .notEmpty()
  .withMessage('es obligatorio')
  .isMongoId()
  .withMessage('tiene un formato inválido');

const seccionId = param('id').isMongoId().withMessage('tiene un formato inválido');

// authenticate + authorize('docente.leer') en todas. El id del docente sale del token.
router.get('/secciones', authenticate, authorize('docente.leer'), validate([periodoId]), listarSecciones);
router.get('/secciones/:id/nomina', authenticate, authorize('docente.leer'), validate([seccionId]), obtenerNomina);
router.get('/horario', authenticate, authorize('docente.leer'), validate([periodoId]), obtenerHorario);

export default router;
