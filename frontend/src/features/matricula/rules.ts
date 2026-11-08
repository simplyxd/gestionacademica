import type { PlanEstudio } from '@/mock/types';
import type {
  EstadoMatricula,
  Matricula,
  NuevaMatricula,
  Resultado,
} from './types';

/**
 * Reglas de matrícula (RF6 / CU5). Funciones puras: la UI puede adelantar el error,
 * pero la fuente de verdad de las reglas vive aquí (en el SGA real, en el backend).
 */

/**
 * Transiciones permitidas. `egresada` y `retirada` son estados finales.
 * Reactivar una matrícula suspendida no está en el alcance de esta tarjeta.
 */
export const TRANSICIONES: Record<EstadoMatricula, readonly EstadoMatricula[]> = {
  vigente: ['suspendida', 'egresada', 'retirada'],
  suspendida: ['retirada'],
  egresada: [],
  retirada: [],
};

export function transicionesDe(estado: EstadoMatricula): readonly EstadoMatricula[] {
  return TRANSICIONES[estado];
}

/** Matrícula vigente del estudiante en el período, si existe. */
export function buscarVigente(
  matriculas: readonly Matricula[],
  estudianteId: string,
  periodoId: string,
): Matricula | undefined {
  return matriculas.find(
    (m) => m.estudianteId === estudianteId && m.periodoId === periodoId && m.estado === 'vigente',
  );
}

interface MetaAlta {
  id: string;
  ahora: string;
}

export function registrarMatricula(
  matriculas: readonly Matricula[],
  input: NuevaMatricula,
  planes: readonly PlanEstudio[],
  meta: MetaAlta,
): Resultado<Matricula> {
  const campos: (keyof NuevaMatricula)[] = ['estudianteId', 'carreraId', 'planId', 'periodoId'];
  for (const campo of campos) {
    if (!input[campo]) return { ok: false, error: { code: 'CAMPO_REQUERIDO', field: campo } };
  }

  const plan = planes.find((p) => p.id === input.planId);
  if (!plan || plan.carreraId !== input.carreraId) {
    return { ok: false, error: { code: 'PLAN_FUERA_DE_CARRERA', field: 'planId' } };
  }

  const existente = buscarVigente(matriculas, input.estudianteId, input.periodoId);
  if (existente) {
    return {
      ok: false,
      error: { code: 'MATRICULA_VIGENTE_EN_PERIODO', field: 'periodoId', existente },
    };
  }

  return {
    ok: true,
    value: { ...input, id: meta.id, estado: 'vigente', creadaEn: meta.ahora },
  };
}

export function cambiarEstado(
  matriculas: readonly Matricula[],
  id: string,
  nuevo: EstadoMatricula,
): Resultado<Matricula[]> {
  const actual = matriculas.find((m) => m.id === id);
  if (!actual) return { ok: false, error: { code: 'MATRICULA_INEXISTENTE' } };
  if (!TRANSICIONES[actual.estado].includes(nuevo)) {
    return { ok: false, error: { code: 'TRANSICION_INVALIDA' } };
  }
  return {
    ok: true,
    value: matriculas.map((m) => (m.id === id ? { ...m, estado: nuevo } : m)),
  };
}
