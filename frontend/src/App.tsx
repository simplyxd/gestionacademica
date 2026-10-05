import { RouterProvider } from 'react-router-dom';
import { ParametrosProvider } from './app/parametros/ParametrosContext';
import { SgaProvider } from './app/SgaContext';
import { EstructuraProvider } from './features/estructura/EstructuraContext';
import { SedesProvider } from './features/estructura/SedesContext';
import { OfertaProvider } from './features/oferta/OfertaContext';
import { PeriodosProvider } from './features/periodos/PeriodosContext';
import { PermisosProvider } from './features/permisos/PermisosContext';
import { PersonasProvider } from './features/personas/PersonasContext';
import { router } from './app/router';
import { AuthProvider } from './features/auth/AuthContext';
import { MatriculaProvider } from './features/matricula/MatriculaContext';

export function App() {
  return (
    <AuthProvider>
      <ParametrosProvider>
      <PermisosProvider>
      <PersonasProvider>
        <PeriodosProvider>
          <SedesProvider>
            <EstructuraProvider>
              <OfertaProvider>
                <MatriculaProvider>
                  <SgaProvider>
                    <RouterProvider router={router} />
                  </SgaProvider>
                </MatriculaProvider>
              </OfertaProvider>
            </EstructuraProvider>
          </SedesProvider>
        </PeriodosProvider>
      </PersonasProvider>
      </PermisosProvider>
      </ParametrosProvider>
    </AuthProvider>
  );
}
