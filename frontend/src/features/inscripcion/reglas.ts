import type { BloqueHorario } from '@/features/horario/types';
import type { FilaOferta } from '@/features/oferta/useOferta';
import { asignaturaPorCodigo, estudiante, PERIODO_ACTUAL, VENTANA_INSCRIPCION } from '@/mocks/sga';

export type CodigoRegla =
  | 'MATRICULA_NO_VIGENTE'
  | 'FUERA_DE_VENTANA'
  | 'SIN_CUPO'
  | 'FUERA_DE_PLAN'
  | 'PRERREQUISITO_PENDIENTE'
  | 'YA_APROBADA'
  | 'CHOQUE_HORARIO';

export interface ReglaRechazada {
  code: CodigoRegla;
  /** Qué pasa. Frase corta, sin punto final. */
  titulo: string;
  /** Por qué y qué puede hacer el estudiante. */
  mensaje: string;
}

export interface ReglaMeta {
  numero: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  code: CodigoRegla;
  nombre: string;
}

/** Las 7 condiciones en el orden del enunciado: la matrícula encabeza la lista. */
export const REGLAS: ReglaMeta[] = [
  { numero: 1, code: 'MATRICULA_NO_VIGENTE', nombre: 'Matrícula vigente en el período' },
  { numero: 2, code: 'FUERA_DE_VENTANA', nombre: 'Ventana de inscripción abierta' },
  { numero: 3, code: 'SIN_CUPO', nombre: 'Cupo disponible' },
  { numero: 4, code: 'FUERA_DE_PLAN', nombre: 'Asignatura de tu plan de estudios' },
  { numero: 5, code: 'PRERREQUISITO_PENDIENTE', nombre: 'Prerrequisitos aprobados' },
  { numero: 6, code: 'YA_APROBADA', nombre: 'No aprobada previamente' },
  { numero: 7, code: 'CHOQUE_HORARIO', nombre: 'Sin choque de horario' },
];

/**
 * Sin base de datos el estudiante de prueba siempre está matriculado y dentro
 * de la ventana, así que estas dos condiciones se fuerzan desde la interfaz.
 */
export type Escenario = 'normal' | 'sin-matricula' | 'ventana-futura' | 'ventana-cerrada';

export const ESCENARIOS: { value: Escenario; label: string }[] = [
  { value: 'normal', label: 'Matriculado, inscripción abierta' },
  { value: 'sin-matricula', label: 'Sin matrícula vigente' },
  { value: 'ventana-futura', label: 'La inscripción aún no abre' },
  { value: 'ventana-cerrada', label: 'La inscripción ya cerró' },
];

export function reglaDeMatricula(escenario: Escenario): ReglaRechazada | null {
  if (escenario !== 'sin-matricula') return null;
  return {
    code: 'MATRICULA_NO_VIGENTE',
    titulo: `No tienes una matrícula vigente en ${PERIODO_ACTUAL}`,
    mensaje: 'No estás matriculado en este periodo.',
  };
}

export function reglaDeVentana(escenario: Escenario): ReglaRechazada | null {
  if (escenario === 'ventana-futura') {
    return {
      code: 'FUERA_DE_VENTANA',
      titulo: 'La inscripción aún no está abierta',
      mensaje: `Las inscripciones comienzan el ${VENTANA_INSCRIPCION.abre}, inténtalo nuevamente en esa fecha.`,
    };
  }
  if (escenario === 'ventana-cerrada') {
    return {
      code: 'FUERA_DE_VENTANA',
      titulo: `La inscripción para ${PERIODO_ACTUAL} ya cerró`,
      mensaje: `Período de inscripciones cerrado. El plazo terminó el ${VENTANA_INSCRIPCION.cierra}.`,
    };
  }
  return null;
}

function nombreDe(codigo: string) {
  return asignaturaPorCodigo(codigo)?.nombre ?? codigo;
}

function listaDePendientes(codigos: string[]) {
  const nombres = codigos.map((c) => `«${nombreDe(c)}»`);
  if (nombres.length === 1) {
    return `Debes aprobar la siguiente asignatura para tomar este ramo: ${nombres[0]}.`;
  }
  return `Debes aprobar las siguientes asignaturas para tomar este ramo: ${nombres.join(', ')}.`;
}

interface EvaluacionArgs {
  fila: FilaOferta;
  /** Lo que el estudiante ya tiene en su horario, para detectar el choque. */
  bloquesInscritos: BloqueHorario[];
  escenario: Escenario;
  /** Al cambiar de sección, los bloques de la actual no cuentan como choque. */
  ignorarSeccionId?: string;
}

/** Devuelve las condiciones que no se cumplen, en el orden de las 7 reglas. */
export function evaluarReglas({ fila, bloquesInscritos, escenario, ignorarSeccionId }: EvaluacionArgs): ReglaRechazada[] {
  const rechazos: ReglaRechazada[] = [];
  const { seccion } = fila;

  const matricula = reglaDeMatricula(escenario);
  if (matricula) rechazos.push(matricula);

  const ventana = reglaDeVentana(escenario);
  if (ventana) rechazos.push(ventana);

  if (fila.sinCupo) {
    rechazos.push({
      code: 'SIN_CUPO',
      titulo: 'La sección no tiene cupo',
      mensaje: `${seccion.nombreAsignatura} sección ${seccion.seccion} tiene ${fila.inscritos} de ${fila.cupo} inscritos. Revisa las otras secciones de la asignatura.`,
    });
  }

  if (fila.fueraDelPlan) {
    rechazos.push({
      code: 'FUERA_DE_PLAN',
      titulo: 'No pertenece a tu plan de estudios',
      mensaje: `Solo puedes inscribir asignaturas del plan ${estudiante.plan}.`,
    });
  }

  if (fila.prerrequisitosPendientes.length > 0) {
    rechazos.push({
      code: 'PRERREQUISITO_PENDIENTE',
      titulo: 'Te falta aprobar un prerrequisito',
      mensaje: listaDePendientes(fila.prerrequisitosPendientes),
    });
  }

  if (fila.aprobadaEn) {
    rechazos.push({
      code: 'YA_APROBADA',
      titulo: 'Ya aprobaste esta asignatura',
      mensaje: `${seccion.nombreAsignatura} (${seccion.codigoAsignatura}) figura aprobada en ${fila.aprobadaEn}. No necesitas volver a inscribirla.`,
    });
  }

  const choca = seccion.bloques.some((b) =>
    bloquesInscritos.some(
      (i) =>
        i.seccionId !== seccion.id &&
        i.seccionId !== ignorarSeccionId &&
        i.dia === b.dia &&
        b.inicioMin < i.finMin &&
        i.inicioMin < b.finMin,
    ),
  );
  if (choca) {
    rechazos.push({
      code: 'CHOQUE_HORARIO',
      titulo: 'Choca con otra asignatura inscrita',
      mensaje: 'No puedes inscribir 2 asignaturas en el mismo horario. Prueba con una sección distinta.',
    });
  }

  return rechazos;
}
