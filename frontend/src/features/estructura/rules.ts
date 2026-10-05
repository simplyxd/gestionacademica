import type { Asignatura, Jornada, Modalidad } from '@/features/oferta/types';
import type { Carrera, EstadoPlan, EstadoSede, PlanEstudio, Sede, TipoAsignaturaPlan } from '@/mock/types';

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

export interface CarreraInput {
  codigo: string;
  nombre: string;
  sedes: string[];
  modalidad: Modalidad;
  jornada: Jornada;
  duracionSemestres: number;
}

export type ErroresCarrera = Partial<Record<keyof CarreraInput, string>>;

export const MODALIDADES: Modalidad[] = ['presencial', 'semipresencial', 'online'];
export const JORNADAS: Jornada[] = ['diurna', 'vespertina'];
export const DURACION_MAXIMA = 14;

/**
 * Reglas de una carrera (RF2): código y nombre únicos (sin distinguir mayúsculas),
 * al menos una sede y una duración entera entre 1 y 14 semestres.
 */
export function validarCarrera(input: CarreraInput, carreras: readonly Carrera[], editandoId?: string): ErroresCarrera {
  const errores: ErroresCarrera = {};
  const otras = carreras.filter((c) => c.id !== editandoId);

  const codigo = input.codigo.trim();
  if (!codigo) {
    errores.codigo = 'Ingresa el código de la carrera';
  } else if (codigo.length > 10) {
    errores.codigo = 'El código admite hasta 10 caracteres';
  } else if (otras.some((c) => normalizar(c.codigo) === normalizar(codigo))) {
    errores.codigo = `El código «${codigo}» ya está en uso. Usa otro o edita la carrera existente`;
  }

  const nombre = input.nombre.trim();
  if (!nombre) {
    errores.nombre = 'Ingresa el nombre de la carrera';
  } else if (nombre.length > 100) {
    errores.nombre = 'El nombre admite hasta 100 caracteres';
  } else if (otras.some((c) => normalizar(c.nombre) === normalizar(nombre))) {
    errores.nombre = `Ya existe una carrera llamada «${nombre}». Usa otro nombre o edita la existente`;
  }

  if (input.sedes.length === 0) errores.sedes = 'Elige al menos una sede donde se imparte';

  const d = input.duracionSemestres;
  if (!Number.isInteger(d) || d < 1 || d > DURACION_MAXIMA) {
    errores.duracionSemestres = `La duración debe ser un número entero entre 1 y ${DURACION_MAXIMA} semestres`;
  }

  return errores;
}

export interface PlanInput {
  carreraId: string;
  nombre: string;
  estado: EstadoPlan;
}

export type ErroresPlan = Partial<Record<keyof PlanInput, string>>;

export const ESTADOS_PLAN: EstadoPlan[] = ['vigente', 'histórico'];

/**
 * Reglas de un plan de estudios (RF2): nombre único dentro de su carrera y
 * un solo plan `vigente` por carrera (el de los nuevos ingresos).
 */
export function validarPlan(input: PlanInput, planes: readonly PlanEstudio[], editandoId?: string): ErroresPlan {
  const errores: ErroresPlan = {};
  const hermanos = planes.filter((p) => p.id !== editandoId && p.carreraId === input.carreraId);

  if (!input.carreraId) errores.carreraId = 'Selecciona la carrera del plan';

  const nombre = input.nombre.trim();
  if (!nombre) {
    errores.nombre = 'Ingresa el nombre del plan';
  } else if (nombre.length > 60) {
    errores.nombre = 'El nombre admite hasta 60 caracteres';
  } else if (input.carreraId && hermanos.some((p) => normalizar(p.nombre) === normalizar(nombre))) {
    errores.nombre = `Esta carrera ya tiene un plan llamado «${nombre}». Usa otro nombre`;
  }

  const vigente = input.estado === 'vigente' && input.carreraId ? hermanos.find((p) => p.estado === 'vigente') : undefined;
  if (vigente) {
    errores.estado = `La carrera ya tiene un plan vigente («${vigente.nombre}»). Márcalo como histórico primero`;
  }

  return errores;
}

export interface AsignaturaEnPlanInput {
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: number;
  tipo: TipoAsignaturaPlan;
}

export type ErroresAsignaturaEnPlan = Partial<Record<keyof AsignaturaEnPlanInput, string>>;

/**
 * Reglas para sumar una asignatura a un plan: el código no puede repetirse en el plan,
 * el semestre cabe en la duración de la carrera y los créditos son un entero de 1 a 30.
 * Los prerrequisitos (RF3) quedan fuera.
 */
export function validarAsignaturaEnPlan(
  input: AsignaturaEnPlanInput,
  plan: Pick<PlanEstudio, 'asignaturas'>,
  duracionSemestres: number,
): ErroresAsignaturaEnPlan {
  const errores: ErroresAsignaturaEnPlan = {};

  const codigo = input.codigo.trim();
  if (!codigo) {
    errores.codigo = 'Ingresa el código de la asignatura';
  } else if (codigo.length > 12) {
    errores.codigo = 'El código admite hasta 12 caracteres';
  } else if (plan.asignaturas.some((a) => normalizar(a.codigo) === normalizar(codigo))) {
    errores.codigo = `${codigo.toUpperCase()} ya está en este plan`;
  }

  if (!input.nombre.trim()) errores.nombre = 'Ingresa el nombre de la asignatura';
  else if (input.nombre.trim().length > 100) errores.nombre = 'El nombre admite hasta 100 caracteres';

  const c = input.creditos;
  if (!Number.isInteger(c) || c < 1 || c > 30) errores.creditos = 'Los créditos deben ser un número entero entre 1 y 30';

  const s = input.semestre;
  if (!Number.isInteger(s) || s < 1 || s > duracionSemestres) {
    errores.semestre = `Elige un semestre entre 1 y ${duracionSemestres}`;
  }

  return errores;
}

/** Busca una asignatura del catálogo por código, sin distinguir mayúsculas. */
export const buscarAsignatura = (catalogo: readonly Asignatura[], codigo: string) =>
  catalogo.find((a) => normalizar(a.codigo) === normalizar(codigo));

/** Cantidad de asignaturas y créditos totales del plan (los créditos salen del catálogo). */
export function resumenPlan(plan: Pick<PlanEstudio, 'asignaturas'>, catalogo: readonly Asignatura[]) {
  const creditos = plan.asignaturas.reduce((t, a) => t + (buscarAsignatura(catalogo, a.codigo)?.creditos ?? 0), 0);
  return { asignaturas: plan.asignaturas.length, creditos };
}
