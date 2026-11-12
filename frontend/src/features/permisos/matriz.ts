import type { Rol } from '@/app/navigation';

const ROLES: readonly Rol[] = ['admin', 'coordinador', 'docente', 'estudiante'];

/** Etiquetas de la matriz que publica GET /api/permisos. Una clave nueva se muestra tal cual. */
const NOMBRES: Record<string, string> = {
  'auth.yo': 'Ver la propia sesión',
  'auth.cambiarClave': 'Cambiar la propia clave',
  'usuarios.listar': 'Listar usuarios',
  'usuarios.crear': 'Crear usuarios',
  'usuarios.editar': 'Editar usuarios',
  'usuarios.estado': 'Activar o desactivar usuarios',
  'usuarios.restablecerClave': 'Restablecer claves',
  'parametros.leer': 'Ver parámetros',
  'parametros.escribir': 'Editar parámetros',
  'permisos.leer': 'Ver permisos',
  'docente.leer': 'Ver secciones y horario propios',
  'periodos.leer': 'Ver períodos',
  'sedes.leer': 'Ver sedes',
  'sedes.escribir': 'Editar sedes',
  'asignaturas.leer': 'Ver asignaturas',
  'asignaturas.escribir': 'Editar asignaturas',
  'carreras.leer': 'Ver carreras',
  'carreras.escribir': 'Editar carreras',
  'planes.leer': 'Ver planes de estudio',
  'planes.escribir': 'Editar planes de estudio',
  'reportes.leer': 'Ver reportes',
  'matriculas.leer': 'Ver matrículas',
  'matriculas.escribir': 'Cambiar estado de matrículas',
};

function nombreDe(id: string): string {
  return NOMBRES[id] ?? id;
}

export interface FilaPermiso {
  id: string;
  nombre: string;
  permisos: Record<Rol, boolean>;
}

function esRol(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}

function permisosDesdeRoles(roles: unknown): Record<Rol, boolean> | null {
  if (!Array.isArray(roles) || !roles.every(esRol)) return null;
  return {
    admin: roles.includes('admin'),
    coordinador: roles.includes('coordinador'),
    docente: roles.includes('docente'),
    estudiante: roles.includes('estudiante'),
  };
}

function permisosDesdeMapa(valor: unknown): Record<Rol, boolean> | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null;
  const dato = valor as Record<string, unknown>;
  const salida = {} as Record<Rol, boolean>;
  for (const rol of ROLES) {
    if (typeof dato[rol] !== 'boolean') return null;
    salida[rol] = dato[rol];
  }
  return salida;
}

function leerFila(item: unknown): FilaPermiso | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const dato = item as Record<string, unknown>;
  const id = typeof dato.id === 'string' ? dato.id : typeof dato.recurso === 'string' ? dato.recurso : '';
  const explicito = typeof dato.nombre === 'string' && dato.nombre.trim() ? dato.nombre.trim() : '';
  const nombre = explicito || nombreDe(id);
  if (!id || !nombre) return null;
  const permisos = permisosDesdeMapa(dato.permisos) ?? (dato.roles !== undefined ? permisosDesdeRoles(dato.roles) : null);
  if (!permisos) return null;
  return { id, nombre, permisos };
}

/**
 * Acepta la matriz como lista `{ id, nombre, permisos }` o `{ recurso, roles }`,
 * o como mapa `{ usuarios: ['admin'] }`. Si el formato no se reconoce, devuelve null.
 */
export function leerMatriz(data: unknown): FilaPermiso[] | null {
  if (Array.isArray(data)) {
    const filas: FilaPermiso[] = [];
    for (const item of data) {
      const fila = leerFila(item);
      if (!fila) return null;
      filas.push(fila);
    }
    return filas;
  }
  if (data && typeof data === 'object') {
    const filas: FilaPermiso[] = [];
    for (const [clave, valor] of Object.entries(data)) {
      const permisos = Array.isArray(valor) ? permisosDesdeRoles(valor) : permisosDesdeMapa(valor);
      if (!permisos) return null;
      filas.push({ id: clave, nombre: nombreDe(clave), permisos });
    }
    return filas;
  }
  return null;
}
