import { Router } from 'express';
import healthRoutes from './health.routes.js';

const router = Router();

// Aquí se montan los dominios del contrato (/sedes, /carreras, /usuarios, ...).
router.use('/health', healthRoutes);

export default router;
