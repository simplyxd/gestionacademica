import { createBrowserRouter } from 'react-router-dom';
import { RoleGuard } from '@/features/auth/RoleGuard';
import { HorarioPage } from '@/features/horario/HorarioPage';
import { InscripcionPage } from '@/features/inscripcion/InscripcionPage';
import { MatriculaPage } from '@/features/matricula/MatriculaPage';
import { OfertaPage } from '@/features/oferta/OfertaPage';
import { AppLayout } from './layout/AppLayout';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { InicioPage } from './pages/InicioPage';

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
