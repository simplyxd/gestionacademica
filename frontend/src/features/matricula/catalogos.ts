import { CARRERAS, PERIODOS, PLANES } from '@/mock/estructura';
import { ESTUDIANTES } from '@/mock/personas';
import type { Carrera, Estudiante, Periodo, PlanEstudio } from '@/mock/types';
import type { Matricula } from './types';

/** Matrícula con sus catálogos resueltos, lista para mostrar. */
export interface MatriculaRow {
  matricula: Matricula;
  estudiante: Estudiante;
  carrera: Carrera;
  plan: PlanEstudio;
  periodo: Periodo;
}

/**
 * Los catálogos vienen de los stores (pueden incluir períodos, carreras y planes creados
 * por el coordinador); por defecto, el seed.
 */
export function resolver(
  m: Matricula,
  periodos: readonly Periodo[] = PERIODOS,
  estudiantes: readonly Estudiante[] = ESTUDIANTES,
  carreras: readonly Carrera[] = CARRERAS,
  planes: readonly PlanEstudio[] = PLANES,
): MatriculaRow | null {
  const estudiante = estudiantes.find((e) => e.id === m.estudianteId);
  const carrera = carreras.find((c) => c.id === m.carreraId);
  const plan = planes.find((p) => p.id === m.planId);
  const periodo = periodos.find((p) => p.id === m.periodoId);
  if (!estudiante || !carrera || !plan || !periodo) return null;
  return { matricula: m, estudiante, carrera, plan, periodo };
}

export const planesDeCarrera = (carreraId: string, planes: readonly PlanEstudio[]): PlanEstudio[] =>
  planes.filter((p) => p.carreraId === carreraId);
