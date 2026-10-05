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
      { path: '*', element: <ComingSoonPage /> },
    ],
  },
]);
