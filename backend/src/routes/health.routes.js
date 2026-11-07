import { Router } from 'express';
import { obtenerSalud } from '../controllers/health.controller.js';

const router = Router();

// Pública a propósito (D-X4): sin authenticate ni authorize, para que un monitor pueda consultarla.
router.get('/', obtenerSalud);

export default router;
