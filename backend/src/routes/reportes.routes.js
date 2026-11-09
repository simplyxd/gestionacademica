import { Router } from 'express';
import * as c from '../controllers/reportes.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as s from '../schemas/reportes.schemas.js';

// /api/reportes · solo admin y coordinador (el coordinador ve solo sus sedes; lo aplica el servicio).
const router = Router();
router.use(authenticate, authorize('reportes.leer'));

router.get('/matriculas', validate(s.esquemaMatriculas), c.matriculas);
router.get('/estudiantes', validate(s.esquemaEstudiantes), c.estudiantes);
router.get('/ocupacion', validate(s.esquemaPorPeriodo), c.ocupacion);
router.get('/cupos', validate(s.esquemaPorPeriodo), c.cupos);
router.get('/carga-docente', validate(s.esquemaPorPeriodo), c.cargaDocente);

export default router;
