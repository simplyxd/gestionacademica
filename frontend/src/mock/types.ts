/** Tipos de los catálogos mock. Reflejan las colecciones del backlog (E0-1) sin API real. */

import type { Jornada, Modalidad } from '@/features/oferta/types';

export interface Estudiante {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
}

export type EstadoCarrera = 'activa' | 'inactiva';

export interface Carrera {
  id: string;
  codigo: string;
  nombre: string;
  /** Ids de las sedes donde se imparte (ver `mock/sedes.ts`). */
  sedes: string[];
  modalidad: Modalidad;
  jornada: Jornada;
  duracionSemestres: number;
  estado: EstadoCarrera;
}

export type EstadoPlan = 'vigente' | 'histórico';

export type TipoAsignaturaPlan = 'obligatoria' | 'electiva';

/** Asignatura dentro de un plan: el nombre y los créditos viven en el catálogo de asignaturas. */
export interface AsignaturaPlan {
  codigo: string;
  semestre: number;
  tipo: TipoAsignaturaPlan;
}

export interface PlanEstudio {
  id: string;
  carreraId: string;
  nombre: string;
  /** `vigente` = plan para nuevos ingresos; `histórico` = cohortes anteriores. */
  estado: EstadoPlan;
  asignaturas: AsignaturaPlan[];
}

export type EstadoPeriodo = 'planificación' | 'inscripción abierta' | 'en curso' | 'cerrado';

export interface Periodo {
  id: string;
  /** «2026-2»: año y semestre. */
  codigo: string;
  nombre: string;
  /** ISO `YYYY-MM-DD`. La ventana de inscripción puede empezar antes del inicio académico. */
  inicio: string;
  termino: string;
  inscripcionInicio: string;
  inscripcionTermino: string;
  estado: EstadoPeriodo;
}

export type EstadoSede = 'activa' | 'en mantenimiento' | 'inactiva';

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  comuna: string;
  estado: EstadoSede;
}

export interface Docente {
  id: string;
  nombre: string;
}
