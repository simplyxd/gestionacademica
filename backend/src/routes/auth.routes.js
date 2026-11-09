import { Router } from 'express';
import { body } from 'express-validator';
import { cambiarClave, login, obtenerPerfil } from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

const correo = body('correo')
  .trim()
  .toLowerCase()
  .notEmpty()
  .withMessage('es obligatorio')
  .isEmail()
  .withMessage('debe ser un correo válido');

const textoObligatorio = (campo, mensajeVacio) =>
  body(campo).isString().withMessage('debe ser un texto').notEmpty().withMessage(mensajeVacio);

// Pública, junto con GET /api/health. No revela si falló el correo o la clave.
router.post('/login', validate([correo, textoObligatorio('password', 'es obligatoria')]), login);

router.get('/me', authenticate, authorize('auth.yo'), obtenerPerfil);

router.post(
  '/cambiar-clave',
  authenticate,
  authorize('auth.cambiarClave'),
  validate([textoObligatorio('actual', 'es obligatoria'), textoObligatorio('nueva', 'es obligatoria')]),
  cambiarClave,
);

export default router;
