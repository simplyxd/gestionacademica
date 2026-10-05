import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RoleGuard } from '@/features/auth/RoleGuard';
import { AppLayout } from './layout/AppLayout';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { InicioPage } from './pages/InicioPage';

// Una pantalla por chunk: el bundle inicial no carga las features de otros perfiles.
const MatriculaPage = lazy(() =>
  import('@/features/matricula/MatriculaPage').then((m) => ({ default: m.MatriculaPage })),
);
const OfertaPage = lazy(() =>
  import('@/features/oferta/OfertaPage').then((m) => ({ default: m.OfertaPage })),
);
const InscripcionPage = lazy(() =>
  import('@/features/inscripcion/InscripcionPage').then((m) => ({ default: m.InscripcionPage })),
);
const HorarioPage = lazy(() =>
  import('@/features/horario/HorarioPage').then((m) => ({ default: m.HorarioPage })),
);

const PeriodosPage = lazy(() =>
  import('@/features/periodos/PeriodosPage').then((m) => ({ default: m.PeriodosPage })),
);
const SedesPage = lazy(() => import('@/features/estructura/SedesPage').then((m) => ({ default: m.SedesPage })));
const OfertaCoordinadorPage = lazy(() =>
  import('@/features/oferta/OfertaCoordinadorPage').then((m) => ({ default: m.OfertaCoordinadorPage })),
);
const SeccionesDocentePage = lazy(() =>
  import('@/features/docente/SeccionesDocentePage').then((m) => ({ default: m.SeccionesDocentePage })),
);
const HorarioDocentePage = lazy(() =>
  import('@/features/docente/HorarioDocentePage').then((m) => ({ default: m.HorarioDocentePage })),
);
const MatrizPermisosPage = lazy(() =>
  import('@/features/permisos/MatrizPermisosPage').then((m) => ({ default: m.MatrizPermisosPage })),
);

const AdminHomePage = lazy(() => import('@/features/admin/AdminHomePage').then((m) => ({ default: m.AdminHomePage })));
const ParametrosPage = lazy(() => import('@/features/admin/ParametrosPage').then((m) => ({ default: m.ParametrosPage })));
const ReportesPage = lazy(() => import('@/features/reportes/ReportesPage').then((m) => ({ default: m.ReportesPage })));

const UsuariosPage = lazy(() => import('@/features/usuarios/UsuariosPage').then((m) => ({ default: m.UsuariosPage })));

const PersonasPage = lazy(() => import('@/features/personas/PersonasPage').then((m) => ({ default: m.PersonasPage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioPage /> },
      {
        // RF6 / CU5: la matrícula la registra el Coordinador académico, no el estudiante.
        path: 'matricula',
        element: (
          <RoleGuard allow={['coordinador']}>
            <MatriculaPage />
          </RoleGuard>
        ),
      },
      // RF9–RF10 / CU7–CU8: oferta, inscripción y horario son del Estudiante.
      { path: 'oferta', element: <RoleGuard allow={['estudiante']}><OfertaPage /></RoleGuard> },
      { path: 'inscripcion', element: <RoleGuard allow={['estudiante']}><InscripcionPage /></RoleGuard> },
      { path: 'horario', element: <RoleGuard allow={['estudiante']}><HorarioPage /></RoleGuard> },
      // Coordinador académico: estructura, ciclo y oferta.
      { path: 'periodos', element: <RoleGuard allow={['coordinador']}><PeriodosPage /></RoleGuard> },
      // RF5 / CU4: docentes y estudiantes (alta, ficha y baja lógica).
      { path: 'personas', element: <RoleGuard allow={['coordinador']}><PersonasPage /></RoleGuard> },
      { path: 'estructura/sedes', element: <RoleGuard allow={['coordinador']}><SedesPage /></RoleGuard> },
      { path: 'coordinador/oferta', element: <RoleGuard allow={['coordinador']}><OfertaCoordinadorPage /></RoleGuard> },
      // Docente: sus secciones (con nómina) y su horario.
      { path: 'docente/secciones', element: <RoleGuard allow={['docente']}><SeccionesDocentePage /></RoleGuard> },
      { path: 'docente/horario', element: <RoleGuard allow={['docente']}><HorarioDocentePage /></RoleGuard> },
      // Administrador: permisos por perfil (RF1).
      { path: 'admin', element: <RoleGuard allow={['admin']}><AdminHomePage /></RoleGuard> },
      { path: 'admin/usuarios', element: <RoleGuard allow={['admin']}><UsuariosPage /></RoleGuard> },
      { path: 'admin/parametros', element: <RoleGuard allow={['admin']}><ParametrosPage /></RoleGuard> },
      // RF12 / CU10: consultas de solo lectura para Administrador y Coordinador.
      { path: 'reportes', element: <RoleGuard allow={['admin', 'coordinador']}><ReportesPage /></RoleGuard> },
      { path: 'admin/permisos', element: <RoleGuard allow={['admin']}><MatrizPermisosPage /></RoleGuard> },
      { path: '*', element: <ComingSoonPage /> },
    ],
  },
]);
