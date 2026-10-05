import { NAV_BY_ROLE, type Rol } from '@/app/navigation';

/** Inicio de cada perfil: el primer ítem de su menú (`/admin` para Administrador, `/` para el resto). */
export function rutaInicio(rol: Rol): string {
  return NAV_BY_ROLE[rol][0]?.to ?? '/';
}
