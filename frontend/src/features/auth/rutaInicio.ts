import { NAV_BY_ROLE, type Rol } from '@/app/navigation';

/** Inicio de cada perfil: el primer ítem de su menú (`/admin` para Administrador, `/` para el resto). */
export function rutaInicio(rol: Rol): string {
  return NAV_BY_ROLE[rol][0]?.to ?? '/';
}

export const RUTA_CAMBIO_CLAVE = '/cambiar-clave';

/** Ruta interna pedida antes del login (`state.from`). Descarta externas y el propio login. */
export function rutaPedida(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from;
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return null;
  if (from === '/login' || from.startsWith('/login/') || from.startsWith('/login?')) return null;
  return from;
}

/** Tras el login: si la cuenta debe cambiar la clave, no se entra al resto de la app. */
export function destinoTrasLogin(rol: Rol, debeCambiarClave: boolean, state: unknown): string {
  if (debeCambiarClave) return RUTA_CAMBIO_CLAVE;
  return rutaPedida(state) ?? rutaInicio(rol);
}

/** Tras guardar la clave nueva se vuelve a la ruta pedida, o al inicio del perfil. */
export function destinoTrasCambiarClave(rol: Rol, state: unknown): string {
  const pedida = rutaPedida(state);
  if (!pedida || pedida === RUTA_CAMBIO_CLAVE || pedida.startsWith(`${RUTA_CAMBIO_CLAVE}?`)) return rutaInicio(rol);
  return pedida;
}
