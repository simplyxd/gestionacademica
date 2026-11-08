import type { ReactNode } from 'react';
import type { Rol } from '@/app/navigation';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { useAuth } from './AuthContext';

interface RoleGuardProps {
  allow: readonly Rol[];
  children: ReactNode;
}

/**
 * Control de acceso por rol (mock). En el SGA real el backend valida el permiso (403);
 * aquí la UI muestra la página de «sin acceso» y nunca monta la pantalla protegida.
 */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { usuario } = useAuth();
  if (!allow.includes(usuario.rol)) return <ForbiddenPage />;
  return <>{children}</>;
}
