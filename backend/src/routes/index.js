import { Router } from 'express';
import asignaturasRoutes from './asignaturas.routes.js';
import authRoutes from './auth.routes.js';
import carrerasRoutes from './carreras.routes.js';
import docenteRoutes from './docente.routes.js';
import healthRoutes from './health.routes.js';
import inscripcionesRoutes from './inscripciones.routes.js';
import matriculasRoutes from './matriculas.routes.js';
import ofertaRoutes from './oferta.routes.js';
import parametrosRoutes from './parametros.routes.js';
import periodosRoutes from './periodos.routes.js';
import planesRoutes from './planes.routes.js';
import reportesRoutes from './reportes.routes.js';
import seccionesRoutes from './secciones.routes.js';
import sedesRoutes from './sedes.routes.js';
import usuariosRoutes from './usuarios.routes.js';

// Dominios del contrato: nombre en plural español, montado en /api/<nombre>.
// Todos existen desde el inicio (vacíos) para que cada persona edite solo su archivo *.routes.js.
export const DOMINIOS = {
  auth: authRoutes,
  usuarios: usuariosRoutes,
  parametros: parametrosRoutes,
  sedes: sedesRoutes,
  carreras: carrerasRoutes,
  planes: planesRoutes,
  asignaturas: asignaturasRoutes,
  periodos: periodosRoutes,
  matriculas: matriculasRoutes,
  secciones: seccionesRoutes,
  oferta: ofertaRoutes,
  inscripciones: inscripcionesRoutes,
  docente: docenteRoutes,
  reportes: reportesRoutes,
};

const router = Router();

router.use('/health', healthRoutes);
for (const [nombre, rutas] of Object.entries(DOMINIOS)) {
  router.use(`/${nombre}`, rutas);
}

export default router;
