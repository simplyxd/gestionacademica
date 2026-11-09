export const PERIODOS_REPORTE = [
  { value: '2026-2', label: '2026-2 · Inscripción abierta' },
  { value: '2026-1', label: '2026-1 · Cerrado' },
  { value: '2025-2', label: '2025-2 · Cerrado' },
];

export const CARRERAS_REPORTE = [
  { value: 'todas', label: 'Todas las carreras' },
  { value: 'inf', label: 'Ingeniería en Informática' },
  { value: 'adm', label: 'Administración de Empresas' },
  { value: 'dis', label: 'Diseño Gráfico' },
];

export interface FilaMatricula {
  carrera: string;
  sede: string;
  matriculados: number;
  nuevos: number;
  retiros: number;
}

export interface FilaOcupacion {
  asignatura: string;
  seccion: string;
  cupo: number;
  inscritos: number;
  docente: string;
}

export interface FilaCargaDocente {
  docente: string;
  secciones: number;
  horasSemanales: number;
  asignaturas: string;
}

export interface FilaEstudiantesAsignatura {
  asignatura: string;
  carrera: string;
  inscritos: number;
}

export const matriculaPorCarrera: FilaMatricula[] = [
  { carrera: 'Ingeniería en Informática', sede: 'Santiago Centro', matriculados: 842, nuevos: 96, retiros: 12 },
  { carrera: 'Administración de Empresas', sede: 'Providencia', matriculados: 615, nuevos: 74, retiros: 9 },
  { carrera: 'Diseño Gráfico', sede: 'Maipú', matriculados: 388, nuevos: 41, retiros: 6 },
];

export const ocupacionSecciones: FilaOcupacion[] = [
  { asignatura: 'INF-201 Programación II', seccion: 'A', cupo: 30, inscritos: 28, docente: 'Diego Araya' },
  { asignatura: 'INF-301 Estructuras de Datos', seccion: 'A', cupo: 28, inscritos: 28, docente: 'Paula Muñoz' },
  { asignatura: 'MAT-101 Cálculo I', seccion: 'B', cupo: 40, inscritos: 36, docente: 'Carmen Riquelme' },
  { asignatura: 'ADM-110 Contabilidad General', seccion: 'A', cupo: 35, inscritos: 22, docente: 'Felipe Soto' },
];

export const cargaDocente: FilaCargaDocente[] = [
  { docente: 'Diego Araya', secciones: 3, horasSemanales: 18, asignaturas: 'INF-201, INF-210' },
  { docente: 'Carmen Riquelme', secciones: 2, horasSemanales: 12, asignaturas: 'MAT-101, MAT-201' },
  { docente: 'Paula Muñoz', secciones: 2, horasSemanales: 14, asignaturas: 'INF-301' },
];

export const estudiantesPorAsignatura: FilaEstudiantesAsignatura[] = [
  { asignatura: 'INF-201', carrera: 'Ingeniería en Informática', inscritos: 56 },
  { asignatura: 'MAT-101', carrera: 'Ingeniería en Informática', inscritos: 48 },
  { asignatura: 'ADM-110', carrera: 'Administración de Empresas', inscritos: 22 },
  { asignatura: 'DIS-120', carrera: 'Diseño Gráfico', inscritos: 19 },
];

/** Filtra filas mock por carrera (cliente). */
export function filtrarPorCarrera<T extends { carrera: string }>(
  filas: T[],
  carrera: string,
): T[] {
  if (carrera === 'todas') return filas;
  const map: Record<string, string> = {
    inf: 'Ingeniería en Informática',
    adm: 'Administración de Empresas',
    dis: 'Diseño Gráfico',
  };
  const label = map[carrera];
  return filas.filter((f) => f.carrera === label);
}
