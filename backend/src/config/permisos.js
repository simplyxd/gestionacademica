import { ROLES } from '../constants/enums.js';

// Única matriz rol × permiso (D-09). La leen authorize(permiso) y GET /api/permisos.
// La clave es el permiso; el valor, los roles que lo tienen. Nadie duplica esta lista.

const CUATRO = Object.freeze([ROLES.ADMIN, ROLES.COORDINADOR, ROLES.DOCENTE, ROLES.ESTUDIANTE]);
const ADMIN = Object.freeze([ROLES.ADMIN]);

export const PERMISOS = Object.freeze({
  'auth.yo': CUATRO,
  'auth.cambiarClave': CUATRO,
  'usuarios.listar': Object.freeze([ROLES.ADMIN, ROLES.COORDINADOR]),
  'usuarios.crear': ADMIN,
  'usuarios.editar': ADMIN,
  'usuarios.estado': ADMIN,
  'usuarios.restablecerClave': ADMIN,
  'parametros.leer': CUATRO,
  'parametros.escribir': ADMIN,
  'permisos.leer': CUATRO,
  'docente.leer': Object.freeze([ROLES.DOCENTE]),
});

/** True si el rol tiene ese permiso. Un permiso desconocido no lo tiene nadie. */
export function rolPuede(rol, permiso) {
  const roles = PERMISOS[permiso];
  return Array.isArray(roles) && roles.includes(rol);
}
