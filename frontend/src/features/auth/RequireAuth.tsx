import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ComprobandoSesion, ErrorDeSesion } from './EstadoSesion';
import { RUTA_CAMBIO_CLAVE } from './rutaInicio';
import { useAuth } from './AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  /** La página de cambio de clave es la única que se puede usar con la clave vencida. */
  permitirClavePendiente?: boolean;
}

/**
 * Sin sesión (o con un 401 que ya la borró) manda al login y guarda la ruta pedida.
 * Si `debeCambiarClave` es true, no deja usar el resto hasta cambiarla.
 */
export function RequireAuth({ children, permitirClavePendiente = false }: RequireAuthProps) {
  const { sesion, usuario, cargando, errorSesion, recargarSesion, cerrarSesion } = useAuth();
  const location = useLocation();
  const desde = `${location.pathname}${location.search}`;

  if (cargando) return <ComprobandoSesion />;
  if (!sesion) {
    if (errorSesion) return <ErrorDeSesion mensaje={errorSesion} onReintentar={recargarSesion} onSalir={cerrarSesion} />;
    return <Navigate to="/login" state={{ from: desde }} replace />;
  }
  if (usuario.debeCambiarClave && !permitirClavePendiente) {
    return <Navigate to={RUTA_CAMBIO_CLAVE} state={{ from: desde }} replace />;
  }
  return <>{children}</>;
}
