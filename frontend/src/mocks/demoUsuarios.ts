import type { Rol } from '@/app/navigation';
import type { Usuario } from '@/features/auth/usuario';
import { inicialesDe } from '@/features/auth/usuario';
import { estudiante } from '@/mocks/sga';

/** Prefijo del token local de la demo (sin backend). */
export const TOKEN_DEMO = '__sga_demo__';

export const CLAVE_DEMO_USUARIO = 'sga.demo.usuario';

export interface CuentaDemo {
  id: string;
  correo: string;
  /** Solo para la tarjeta del login; no se valida contra un servidor. */
  claveVisible: string;
  nombre: string;
  rol: Rol;
  descripcion: string;
}

/**
 * Cuentas locales para la demo de Matias (períodos + inscripción).
 * No pasan por la API: sirven para mostrarle al profesor el flujo del alumno.
 */
export const CUENTAS_DEMO: readonly CuentaDemo[] = [
  {
    id: 'demo-estudiante',
    correo: 'estudiante@iunf.cl',
    claveVisible: 'Clave-Dev-Estudiante-2026',
    nombre: estudiante.nombre,
    rol: 'estudiante',
    descripcion: 'Inscripción, oferta y horario con las 7 reglas',
  },
  {
    id: 'demo-coordinador',
    correo: 'coordinador@iunf.cl',
    claveVisible: 'Clave-Dev-Coord-2026',
    nombre: 'Tomás Rojas',
    rol: 'coordinador',
    descripcion: 'Períodos académicos y ventana de inscripción',
  },
];

export function esTokenDemo(token: string | null | undefined): boolean {
  return typeof token === 'string' && token.startsWith(TOKEN_DEMO);
}

export function usuarioDesdeCuenta(cuenta: CuentaDemo): Usuario {
  return {
    id: cuenta.id,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    iniciales: inicialesDe(cuenta.nombre),
    sedes: [],
    debeCambiarClave: false,
    correo: cuenta.correo,
  };
}

export function leerUsuarioDemo(): Usuario | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_DEMO_USUARIO);
    if (!crudo) return null;
    const dato = JSON.parse(crudo) as Partial<Usuario>;
    if (!dato.id || !dato.nombre || !dato.rol || !dato.correo) return null;
    return {
      id: dato.id,
      nombre: dato.nombre,
      rol: dato.rol,
      iniciales: dato.iniciales ?? inicialesDe(dato.nombre),
      sedes: Array.isArray(dato.sedes) ? dato.sedes : [],
      debeCambiarClave: false,
      correo: dato.correo,
    };
  } catch {
    return null;
  }
}

export function guardarUsuarioDemo(usuario: Usuario): void {
  try {
    sessionStorage.setItem(CLAVE_DEMO_USUARIO, JSON.stringify(usuario));
  } catch {
    /* sin persistencia: la demo vive solo hasta recargar */
  }
}

export function borrarUsuarioDemo(): void {
  try {
    sessionStorage.removeItem(CLAVE_DEMO_USUARIO);
  } catch {
    /* nada que borrar */
  }
}
