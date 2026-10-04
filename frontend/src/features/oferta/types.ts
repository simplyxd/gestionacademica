/** Día de la semana: 0 = Lunes … 5 = Sábado. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5;

export interface BloqueSeccion {
  dia: DiaSemana;
  /** Minutos desde 00:00 (p. ej. 10 * 60 = 10:00) */
  inicioMin: number;
  finMin: number;
}

export type Modalidad = 'presencial' | 'semipresencial' | 'online';

export type Jornada = 'diurna' | 'vespertina';

export interface Asignatura {
  codigo: string;
  nombre: string;
  creditos: number;
  /** Códigos de las asignaturas que hay que tener aprobadas antes. */
  prerrequisitos: string[];
}

export interface Seccion {
  id: string;
  codigoAsignatura: string;
  nombreAsignatura: string;
  /** Letra de la sección: A, B, C… */
  seccion: string;
  docente: string;
  sala?: string;
  modalidad: Modalidad;
  jornada: Jornada;
  cupo: number;
  /** Inscritos del resto del curso, sin contar al estudiante de prueba. */
  inscritosOtros: number;
  bloques: BloqueSeccion[];
}

export interface AsignaturaAprobada {
  codigo: string;
  /** Período en que la aprobó, para poder nombrarlo en el aviso. */
  periodo: string;
}

export interface Estudiante {
  nombre: string;
  plan: string;
  /** Códigos de asignatura que componen su plan de estudios. */
  codigosDelPlan: string[];
  aprobadas: AsignaturaAprobada[];
}

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  presencial: 'Presencial',
  semipresencial: 'Semipresencial',
  online: 'Online',
};

export const MODALIDAD_COLOR: Record<Modalidad, string> = {
  presencial: 'indigo',
  semipresencial: 'sky',
  online: 'teal',
};

export const JORNADA_LABEL: Record<Jornada, string> = {
  diurna: 'Diurna',
  vespertina: 'Vespertina',
};
