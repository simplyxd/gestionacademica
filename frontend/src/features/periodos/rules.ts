import type { EstadoPeriodo, Periodo } from '@/mock/types';

/** Datos editables de un período. Las fechas van en ISO `YYYY-MM-DD`, que se ordena como texto. */
export interface PeriodoInput {
  codigo: string;
  nombre: string;
  inicio: string;
  termino: string;
  inscripcionInicio: string;
  inscripcionTermino: string;
  estado: EstadoPeriodo;
}

export type ErroresPeriodo = Partial<Record<keyof PeriodoInput, string>>;

export const ESTADOS_PERIODO: EstadoPeriodo[] = ['planificación', 'inscripción abierta', 'en curso', 'cerrado'];

/**
 * Reglas de un período (RF4): código `AAAA-S` único, fechas ordenadas, ventana de inscripción propia
 * (puede empezar antes del inicio académico) y un solo período «en curso» a la vez.
 * Devuelve un mensaje por campo; vacío = válido.
 */
export function validarPeriodo(
  input: PeriodoInput,
  periodos: readonly Periodo[],
  editandoId?: string,
): ErroresPeriodo {
  const errores: ErroresPeriodo = {};
  const otros = periodos.filter((p) => p.id !== editandoId);

  const codigo = input.codigo.trim();
  if (!codigo) {
    errores.codigo = 'Ingresa el código del período';
  } else if (!/^\d{4}-[12]$/.test(codigo)) {
    errores.codigo = 'Usa el formato año-semestre, por ejemplo 2027-1';
  } else if (otros.some((p) => p.codigo === codigo)) {
    errores.codigo = `Ya existe el período ${codigo}. Edítalo desde la lista o usa otro código`;
  }

  if (!input.nombre.trim()) errores.nombre = 'Ingresa el nombre del período';

  if (!input.inicio) errores.inicio = 'Indica cuándo empieza el período';
  if (!input.termino) errores.termino = 'Indica cuándo termina el período';
  if (input.inicio && input.termino && input.inicio >= input.termino) {
    errores.termino = 'El término debe ser posterior al inicio del período';
  }

  if (!input.inscripcionInicio) errores.inscripcionInicio = 'Indica cuándo abre la inscripción';
  if (!input.inscripcionTermino) errores.inscripcionTermino = 'Indica cuándo cierra la inscripción';
  if (input.inscripcionInicio && input.inscripcionTermino && input.inscripcionInicio >= input.inscripcionTermino) {
    errores.inscripcionTermino = 'El cierre de inscripción debe ser posterior a su apertura';
  }

  if (input.estado === 'en curso') {
    const enCurso = otros.find((p) => p.estado === 'en curso');
    if (enCurso) {
      errores.estado = `${enCurso.codigo} ya está en curso. Cierra ese período antes de poner otro en curso`;
    }
  }

  return errores;
}

export function periodoDesdeInput(input: PeriodoInput, id: string): Periodo {
  return {
    id,
    codigo: input.codigo.trim(),
    nombre: input.nombre.trim(),
    inicio: input.inicio,
    termino: input.termino,
    inscripcionInicio: input.inscripcionInicio,
    inscripcionTermino: input.inscripcionTermino,
    estado: input.estado,
  };
}
