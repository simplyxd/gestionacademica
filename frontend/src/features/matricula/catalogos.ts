import { CARRERAS, PERIODOS, PLANES } from '@/mock/estructura';
import { ESTUDIANTES } from '@/mock/personas';
import type { Carrera, Estudiante, Periodo, PlanEstudio } from '@/mock/types';
import type { Matricula } from './types';

const porId = <T extends { id: string }>(xs: readonly T[]) => new Map(xs.map((x) => [x.id, x]));

const estudiantes = porId(ESTUDIANTES);
const carreras = porId(CARRERAS);
const planes = porId(PLANES);
const periodos = porId(PERIODOS);

/** Matrícula con sus catálogos resueltos, lista para mostrar. */
export interface MatriculaRow {
  matricula: Matricula;
  estudiante: Estudiante;
  carrera: Carrera;
  plan: PlanEstudio;
  periodo: Periodo;
}

export function resolver(m: Matricula): MatriculaRow | null {
  const estudiante = estudiantes.get(m.estudianteId);
  const carrera = carreras.get(m.carreraId);
  const plan = planes.get(m.planId);
  const periodo = periodos.get(m.periodoId);
  if (!estudiante || !carrera || !plan || !periodo) return null;
  return { matricula: m, estudiante, carrera, plan, periodo };
}

export const planesDeCarrera = (carreraId: string): PlanEstudio[] =>
  PLANES.filter((p) => p.carreraId === carreraId);
