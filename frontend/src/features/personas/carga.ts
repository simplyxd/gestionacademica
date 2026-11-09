import type { SeccionOfertada } from '@/features/oferta/types';

export interface CargaAcademica {
  /** Secciones que dicta en el período. */
  secciones: number;
  /** Asignaturas distintas entre esas secciones. */
  asignaturas: number;
  /** Horas pedagógicas (45 min) por semana, sumando todos los bloques. */
  horasPedagogicas: number;
  /** Inscritos en sus secciones. */
  inscritos: number;
}

const MINUTOS_PEDAGOGICOS = 45;

/** Carga académica de un docente en un período (ficha de docente, E4-2), calculada desde la oferta. */
export function calcularCarga(
  docente: string,
  secciones: readonly SeccionOfertada[],
  periodoId: string,
): CargaAcademica {
  const propias = secciones.filter((s) => s.docente === docente && s.periodoId === periodoId);
  const minutos = propias.flatMap((s) => s.bloques).reduce((suma, b) => suma + (b.finMin - b.inicioMin), 0);
  return {
    secciones: propias.length,
    asignaturas: new Set(propias.map((s) => s.codigoAsignatura)).size,
    horasPedagogicas: Math.round((minutos / MINUTOS_PEDAGOGICOS) * 10) / 10,
    inscritos: propias.reduce((suma, s) => suma + s.inscritosOtros, 0),
  };
}
