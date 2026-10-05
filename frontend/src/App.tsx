import { RouterProvider } from 'react-router-dom';
import { SgaProvider } from './app/SgaContext';
import { router } from './app/router';
import { AuthProvider } from './features/auth/AuthContext';
import { MatriculaProvider } from './features/matricula/MatriculaContext';

export function App() {
  return (
    <AuthProvider>
      <MatriculaProvider>
        <SgaProvider>
          <RouterProvider router={router} />
        </SgaProvider>
      </MatriculaProvider>
    </AuthProvider>
  );
}
