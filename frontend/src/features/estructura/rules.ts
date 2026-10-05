import type { EstadoSede, Sede } from '@/mock/types';

export interface SedeInput {
  nombre: string;
  direccion: string;
  comuna: string;
  estado: EstadoSede;
}

export type ErroresSede = Partial<Record<keyof SedeInput, string>>;

export const ESTADOS_SEDE: EstadoSede[] = ['activa', 'en mantenimiento', 'inactiva'];

const normalizar = (s: string) => s.trim().toLowerCase();

/**
 * Reglas de una sede (RF2): nombre único (sin distinguir mayúsculas), dirección y comuna obligatorias.
 * Devuelve un mensaje por campo; vacío = válido.
 */
export function validarSede(input: SedeInput, sedes: readonly Sede[], editandoId?: string): ErroresSede {
  const errores: ErroresSede = {};

  const nombre = input.nombre.trim();
  if (!nombre) {
    errores.nombre = 'Ingresa el nombre de la sede';
  } else if (nombre.length > 100) {
    errores.nombre = 'El nombre admite hasta 100 caracteres';
  } else if (sedes.some((s) => s.id !== editandoId && normalizar(s.nombre) === normalizar(nombre))) {
    errores.nombre = `Ya existe una sede llamada «${nombre}». Usa otro nombre o edita la existente`;
  }

  if (!input.direccion.trim()) errores.direccion = 'Ingresa la dirección física';
  else if (input.direccion.trim().length > 160) errores.direccion = 'La dirección admite hasta 160 caracteres';

  if (!input.comuna.trim()) errores.comuna = 'Ingresa la comuna o ciudad';
  else if (input.comuna.trim().length > 80) errores.comuna = 'La comuna admite hasta 80 caracteres';

  return errores;
}
