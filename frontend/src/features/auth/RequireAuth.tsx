import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Exige sesión iniciada (mock). En el SGA real el backend valida el JWT y responde 401,
 * que la UI convierte en redirección a login (system design §6.5); aquí basta con el estado local.
 * Guarda la ruta pedida en `state.from` para volver a ella tras iniciar sesión.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { sesion } = useAuth();
  const location = useLocation();
  if (!sesion) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  return <>{children}</>;
}
