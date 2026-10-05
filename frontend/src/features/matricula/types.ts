/** Estados de matrícula (decisión 2026-09-05): una sola `vigente` por estudiante y período. */
export const ESTADOS_MATRICULA = ['vigente', 'suspendida', 'egresada', 'retirada'] as const;
export type EstadoMatricula = (typeof ESTADOS_MATRICULA)[number];

export interface Matricula {
  id: string;
  estudianteId: string;
  carreraId: string;
  planId: string;
  periodoId: string;
  estado: EstadoMatricula;
  /** ISO 8601. Solo para ordenar (la más reciente primero). */
  creadaEn: string;
}

export interface NuevaMatricula {
  estudianteId: string;
  carreraId: string;
  planId: string;
  periodoId: string;
}

/** Campo del formulario al que se asocia un error de negocio. */
export type CampoMatricula = keyof NuevaMatricula;

export type CodigoErrorMatricula =
  | 'MATRICULA_VIGENTE_EN_PERIODO'
  | 'PLAN_FUERA_DE_CARRERA'
  | 'CAMPO_REQUERIDO'
  | 'TRANSICION_INVALIDA'
  | 'MATRICULA_INEXISTENTE';

/** Mismo espíritu que `ApiError` del system design (§6.1): código + campo + dato concreto. */
export interface ErrorMatricula {
  code: CodigoErrorMatricula;
  field?: CampoMatricula;
  /** Matrícula vigente que bloquea el alta (solo en `MATRICULA_VIGENTE_EN_PERIODO`). */
  existente?: Matricula;
}

export type Resultado<T> = { ok: true; value: T } | { ok: false; error: ErrorMatricula };
