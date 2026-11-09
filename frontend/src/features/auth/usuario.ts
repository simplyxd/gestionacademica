import type { Rol } from '@/app/navigation';

const ROLES: readonly Rol[] = ['admin', 'coordinador', 'docente', 'estudiante'];

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}

/** Dos letras para el avatar del encabezado. Un solo nombre usa una. */
export function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primera = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  const letras = `${primera}${ultima}`.toLocaleUpperCase('es');
  return letras || '?';
}

/** El login manda ids; /auth/me podría mandar la sede populada. */
export function idDeSede(valor: unknown): string | null {
  if (typeof valor === 'string' && valor.trim()) return valor;
  if (!valor || typeof valor !== 'object') return null;
  const id = (valor as { id?: unknown; _id?: unknown }).id ?? (valor as { _id?: unknown })._id;
  return typeof id === 'string' && id.trim() ? id : null;
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  iniciales: string;
  sedes: string[];
  debeCambiarClave: boolean;
  correo: string;
}

export function esAbort(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

/**
 * Arma el usuario de la sesión desde el `usuario` de login o de /auth/me.
 * `correoRespaldo` cubre el login, que no trae el correo dentro de `usuario`.
 */
export function normalizarUsuario(raw: unknown, correoRespaldo = ''): Usuario | null {
  if (!raw || typeof raw !== 'object') return null;
  const dato = raw as Record<string, unknown>;
  const id = typeof dato.id === 'string' ? dato.id : typeof dato._id === 'string' ? dato._id : '';
  const nombre = typeof dato.nombre === 'string' ? dato.nombre.trim() : '';
  if (!id || !nombre || !esRol(dato.rol)) return null;
  const sedes = Array.isArray(dato.sedes) ? dato.sedes.map(idDeSede).filter((sede): sede is string => sede !== null) : [];
  const correoPropio = typeof dato.correo === 'string' ? dato.correo.trim() : '';
  return {
    id,
    nombre,
    rol: dato.rol,
    iniciales: inicialesDe(nombre),
    sedes,
    debeCambiarClave: dato.debeCambiarClave === true,
    correo: correoPropio || correoRespaldo.trim(),
  };
}

export function leerLogin(data: unknown, correoRespaldo: string): { token: string; usuario: Usuario } | null {
  if (!data || typeof data !== 'object') return null;
  const dato = data as Record<string, unknown>;
  if (typeof dato.token !== 'string' || !dato.token) return null;
  const usuario = normalizarUsuario(dato.usuario, correoRespaldo);
  if (!usuario) return null;
  return { token: dato.token, usuario };
}
