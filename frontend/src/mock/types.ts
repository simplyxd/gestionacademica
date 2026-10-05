/** Tipos de los catálogos mock. Reflejan las colecciones del backlog (E0-1) sin API real. */

export interface Estudiante {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
}

export interface Carrera {
  id: string;
  codigo: string;
  nombre: string;
}

export interface PlanEstudio {
  id: string;
  carreraId: string;
  nombre: string;
  /** `vigente` = plan para nuevos ingresos; `histórico` = cohortes anteriores. */
  estado: 'vigente' | 'histórico';
}

export type EstadoPeriodo = 'planificación' | 'inscripción abierta' | 'en curso' | 'cerrado';

export interface Periodo {
  id: string;
  codigo: string;
  estado: EstadoPeriodo;
}
