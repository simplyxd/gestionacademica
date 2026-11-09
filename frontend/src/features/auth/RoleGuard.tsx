import type { ReactNode } from 'react';
import type { Rol } from '@/app/navigation';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { useAuth } from './AuthContext';

interface RoleGuardProps {
  allow: readonly Rol[];
  children: ReactNode;
}

/**
 * 403 en la interfaz: si el rol no está permitido, muestra ForbiddenPage y no monta la pantalla.
 * El backend responde 403 por su cuenta; esta guarda evita pedir una sección que no corresponde.
 */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { usuario } = useAuth();
  if (!allow.includes(usuario.rol)) return <ForbiddenPage />;
  return <>{children}</>;
}
