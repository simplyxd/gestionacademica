import { createBrowserRouter } from 'react-router-dom';
import { RoleGuard } from '@/features/auth/RoleGuard';
import { MatriculaPage } from '@/features/matricula/MatriculaPage';
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
      { path: '*', element: <ComingSoonPage /> },
    ],
  },
]);
