/** Día de la semana: 0 = lunes … 5 = sábado. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5;

export interface PeriodoDocente {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
}

export interface BloqueDocente {
  dia: DiaSemana;
  inicioMin: number;
  finMin: number;
}

/** Sección que dicta el docente con sesión. El id del docente no viaja en la respuesta. */
export interface SeccionDocente {
  id: string;
  periodoId: string;
  asignaturaId: string;
  sedeId: string;
  codigoAsignatura: string | null;
  nombreAsignatura: string | null;
  sede: string | null;
  letra: string | null;
  sala: string | null;
  modalidad: string | null;
  jornada: string | null;
  cupoMaximo: number | null;
  estado: string | null;
  inscritosActivos: number;
  bloques: BloqueDocente[];
}

/** D-18: la nómina solo trae estos cuatro datos. */
export interface InscritoNomina {
  nombre: string;
  rut: string;
  codigoEstudiante: string | null;
  correo: string;
}

export interface BloqueHorarioDocente {
  id: string;
  seccionId: string;
  asignaturaId: string;
  codigoAsignatura: string | null;
  nombreAsignatura: string | null;
  letra: string | null;
  sala: string | null;
  dia: DiaSemana;
  inicioMin: number;
  finMin: number;
}

export const ETIQUETA_ESTADO_PERIODO: Record<string, string> = {
  planificacion: 'Planificación',
  inscripcion_abierta: 'Inscripción abierta',
  en_curso: 'En curso',
  cerrado: 'Cerrado',
};

export const COLOR_ESTADO_PERIODO: Record<string, string> = {
  planificacion: 'sky',
  inscripcion_abierta: 'teal',
  en_curso: 'orange',
  cerrado: 'slate',
};

export const MODALIDAD_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  semipresencial: 'Semipresencial',
  online: 'Online',
};

export const MODALIDAD_COLOR: Record<string, string> = {
  presencial: 'indigo',
  semipresencial: 'sky',
  online: 'teal',
};

export const JORNADA_LABEL: Record<string, string> = {
  diurna: 'Diurna',
  vespertina: 'Vespertina',
};
