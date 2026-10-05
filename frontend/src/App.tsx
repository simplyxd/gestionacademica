import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './features/auth/AuthContext';
import { MatriculaProvider } from './features/matricula/MatriculaContext';

export function App() {
  return (
    <AuthProvider>
      <MatriculaProvider>
        <RouterProvider router={router} />
      </MatriculaProvider>
    </AuthProvider>
  );
}
