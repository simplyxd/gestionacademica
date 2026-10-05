import { fmt } from '@/lib/horas';
import { detectarConflictos, type Conflicto } from './conflictos';
import type { BloqueSeccion, Jornada, Modalidad, SeccionOfertada } from './types';

/** Datos editables de una sección. `bloques` lleva `key` solo para la lista del formulario. */
export interface SeccionInput {
  codigoAsignatura: string;
  docente: string;
  sede: string;
  jornada: Jornada | '';
  modalidad: Modalidad | '';
  cupo: number;
  sala: string;
  periodoId: string;
  bloques: BloqueSeccion[];
}

export type CampoSeccion = keyof SeccionInput;
export type ErroresSeccion = Partial<Record<CampoSeccion, string>>;

/** La grilla del horario semanal cubre 08:00–22:00 (system design §2.3): fuera de eso un bloque no se vería. */
export const HORA_MIN = 8 * 60;
export const HORA_MAX = 22 * 60;

/**
 * Reglas de una sección (RF9): todo obligatorio, sala física salvo online, cupo entero que no baje de los ya
 * inscritos, al menos un bloque válido dentro de la grilla. No incluye los choques: esos se calculan aparte
 * con `detectarConflictos` porque se muestran en vivo mientras se edita.
 */
export function validarSeccion(input: SeccionInput, editando?: SeccionOfertada): ErroresSeccion {
  const e: ErroresSeccion = {};

  if (!input.codigoAsignatura) e.codigoAsignatura = 'Selecciona la asignatura';
  if (!input.docente) e.docente = 'Selecciona el docente';
  if (!input.sede) e.sede = 'Selecciona la sede';
  if (!input.jornada) e.jornada = 'Selecciona la jornada';
  if (!input.modalidad) e.modalidad = 'Selecciona la modalidad';
  if (!input.periodoId) e.periodoId = 'Selecciona el período';

  if (!Number.isInteger(input.cupo) || input.cupo < 1) {
    e.cupo = 'Ingresa un número entero de cupos mayor que cero';
  } else if (editando && input.cupo < editando.inscritosOtros) {
    e.cupo = `No puedes bajar el cupo a ${input.cupo}: ya hay ${editando.inscritosOtros} inscritos`;
  }

  if (input.modalidad !== 'online' && !input.sala) e.sala = 'Selecciona la sala de la sección';

  if (input.bloques.length === 0) {
    e.bloques = 'Agrega al menos un bloque horario';
  } else if (input.bloques.some((b) => b.inicioMin >= b.finMin)) {
    e.bloques = 'Cada bloque debe terminar después de empezar';
  } else if (input.bloques.some((b) => b.inicioMin < HORA_MIN || b.finMin > HORA_MAX)) {
    e.bloques = `Los bloques deben estar entre ${fmt(HORA_MIN)} y ${fmt(HORA_MAX)}`;
  }

  return e;
}

/** Letra de la nueva sección: la primera libre (A, B, C…) para esa asignatura en ese período. */
export function siguienteLetra(
  existentes: readonly SeccionOfertada[],
  periodoId: string,
  codigoAsignatura: string,
): string {
  const usadas = new Set(
    existentes.filter((s) => s.periodoId === periodoId && s.codigoAsignatura === codigoAsignatura).map((s) => s.seccion),
  );
  for (let i = 0; i < 26; i++) {
    const letra = String.fromCharCode(65 + i);
    if (!usadas.has(letra)) return letra;
  }
  return String(usadas.size + 1);
}

/** Candidata para detectar choques a partir de lo que hay en el formulario. */
export function candidataDeInput(input: SeccionInput, id: string) {
  return {
    id,
    periodoId: input.periodoId,
    docente: input.docente,
    sala: input.modalidad === 'online' ? undefined : input.sala,
    modalidad: (input.modalidad || 'presencial') as Modalidad,
    bloques: input.bloques,
  };
}

export function conflictosDeInput(
  input: SeccionInput,
  id: string,
  existentes: readonly SeccionOfertada[],
): Conflicto[] {
  if (!input.docente || input.bloques.length === 0) return [];
  return detectarConflictos(candidataDeInput(input, id), existentes);
}
