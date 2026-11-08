import type { Inscripcion } from '@/features/inscripcion/types';
import type { Asignatura, Estudiante, Seccion } from '@/features/oferta/types';

const h = (hora: number, minuto = 0) => hora * 60 + minuto;

export const PERIODO_ACTUAL = '2026-2';

/** Fechas de la ventana de inscripción, tal como se nombran en los avisos. */
export const VENTANA_INSCRIPCION = { abre: '10 de marzo', cierra: '21 de marzo' };

export const asignaturas: Asignatura[] = [
  { codigo: 'MAT-100', nombre: 'Álgebra', creditos: 6, prerrequisitos: [] },
  { codigo: 'MAT-101', nombre: 'Cálculo I', creditos: 6, prerrequisitos: [] },
  { codigo: 'MAT-201', nombre: 'Cálculo II', creditos: 6, prerrequisitos: ['MAT-100'] },
  { codigo: 'INF-101', nombre: 'Programación I', creditos: 8, prerrequisitos: [] },
  { codigo: 'INF-105', nombre: 'Bases de Datos', creditos: 6, prerrequisitos: [] },
  { codigo: 'INF-201', nombre: 'Programación II', creditos: 8, prerrequisitos: ['INF-101'] },
  { codigo: 'INF-210', nombre: 'Redes de Computadores', creditos: 6, prerrequisitos: [] },
  { codigo: 'INF-301', nombre: 'Estructuras de Datos', creditos: 8, prerrequisitos: ['INF-201'] },
  { codigo: 'ADM-110', nombre: 'Contabilidad General', creditos: 4, prerrequisitos: [] },
];

export const estudiante: Estudiante = {
  nombre: 'Javiera Soto',
  plan: 'Ingeniería en Informática 2024',
  codigosDelPlan: [
    'MAT-100',
    'MAT-101',
    'MAT-201',
    'INF-101',
    'INF-105',
    'INF-201',
    'INF-210',
    'INF-301',
  ],
  aprobadas: [
    { codigo: 'MAT-100', periodo: '2025-2' },
    { codigo: 'INF-101', periodo: '2025-2' },
  ],
};

/**
 * Oferta del período. Cada sección cubre a propósito un caso distinto de las
 * 7 reglas, para que todos los avisos se puedan ver sin base de datos.
 */
export const secciones: Seccion[] = [
  {
    id: 'sec-mat100-a',
    codigoAsignatura: 'MAT-100',
    nombreAsignatura: 'Álgebra',
    seccion: 'A',
    docente: 'Rodrigo Fuentes',
    sala: 'Sala 101',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 40,
    inscritosOtros: 18,
    bloques: [{ dia: 1, inicioMin: h(11, 45), finMin: h(13, 15) }],
  },
  {
    id: 'sec-mat101-a',
    codigoAsignatura: 'MAT-101',
    nombreAsignatura: 'Cálculo I',
    seccion: 'A',
    docente: 'Carmen Riquelme',
    sala: 'Sala 204',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 40,
    inscritosOtros: 27,
    bloques: [{ dia: 0, inicioMin: h(10), finMin: h(11, 30) }],
  },
  {
    id: 'sec-mat201-a',
    codigoAsignatura: 'MAT-201',
    nombreAsignatura: 'Cálculo II',
    seccion: 'A',
    docente: 'Carmen Riquelme',
    sala: 'Sala 206',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 35,
    inscritosOtros: 20,
    bloques: [{ dia: 3, inicioMin: h(8, 30), finMin: h(10) }],
  },
  {
    id: 'sec-inf105-a',
    codigoAsignatura: 'INF-105',
    nombreAsignatura: 'Bases de Datos',
    seccion: 'A',
    docente: 'Marcela Ortiz',
    sala: 'Lab 3',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 30,
    inscritosOtros: 21,
    bloques: [{ dia: 1, inicioMin: h(8, 30), finMin: h(10) }],
  },
  {
    id: 'sec-inf105-b',
    codigoAsignatura: 'INF-105',
    nombreAsignatura: 'Bases de Datos',
    seccion: 'B',
    docente: 'Marcela Ortiz',
    modalidad: 'online',
    jornada: 'vespertina',
    cupo: 45,
    inscritosOtros: 12,
    bloques: [{ dia: 2, inicioMin: h(19), finMin: h(20, 30) }],
  },
  {
    id: 'sec-inf201-a',
    codigoAsignatura: 'INF-201',
    nombreAsignatura: 'Programación II',
    seccion: 'A',
    docente: 'Diego Araya',
    sala: 'Lab 2',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 30,
    inscritosOtros: 18,
    bloques: [{ dia: 0, inicioMin: h(10), finMin: h(11, 30) }],
  },
  {
    id: 'sec-inf201-b',
    codigoAsignatura: 'INF-201',
    nombreAsignatura: 'Programación II',
    seccion: 'B',
    docente: 'Diego Araya',
    sala: 'Lab 1',
    modalidad: 'presencial',
    jornada: 'vespertina',
    cupo: 30,
    inscritosOtros: 29,
    bloques: [{ dia: 2, inicioMin: h(14), finMin: h(15, 30) }],
  },
  {
    id: 'sec-inf201-c',
    codigoAsignatura: 'INF-201',
    nombreAsignatura: 'Programación II',
    seccion: 'C',
    docente: 'Paula Henríquez',
    sala: 'Lab 1',
    modalidad: 'semipresencial',
    jornada: 'vespertina',
    cupo: 30,
    inscritosOtros: 10,
    bloques: [{ dia: 4, inicioMin: h(18), finMin: h(19, 30) }],
  },
  {
    id: 'sec-inf210-a',
    codigoAsignatura: 'INF-210',
    nombreAsignatura: 'Redes de Computadores',
    seccion: 'A',
    docente: 'Esteban Vera',
    sala: 'Lab 4',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 35,
    inscritosOtros: 35,
    bloques: [{ dia: 4, inicioMin: h(10), finMin: h(11, 30) }],
  },
  {
    id: 'sec-inf210-b',
    codigoAsignatura: 'INF-210',
    nombreAsignatura: 'Redes de Computadores',
    seccion: 'B',
    docente: 'Esteban Vera',
    sala: 'Lab 4',
    modalidad: 'presencial',
    jornada: 'vespertina',
    cupo: 35,
    inscritosOtros: 14,
    bloques: [{ dia: 2, inicioMin: h(14), finMin: h(15, 30) }],
  },
  {
    id: 'sec-inf301-a',
    codigoAsignatura: 'INF-301',
    nombreAsignatura: 'Estructuras de Datos',
    seccion: 'A',
    docente: 'Diego Araya',
    sala: 'Lab 2',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 30,
    inscritosOtros: 8,
    bloques: [{ dia: 3, inicioMin: h(14), finMin: h(15, 30) }],
  },
  {
    id: 'sec-adm110-a',
    codigoAsignatura: 'ADM-110',
    nombreAsignatura: 'Contabilidad General',
    seccion: 'A',
    docente: 'Lorena Pinto',
    modalidad: 'online',
    jornada: 'vespertina',
    cupo: 60,
    inscritosOtros: 31,
    bloques: [{ dia: 5, inicioMin: h(9), finMin: h(10, 30) }],
  },
];

/** Lo que el estudiante de prueba tiene inscrito al abrir la aplicación. */
export const inscripcionesIniciales: Inscripcion[] = [
  { id: 'ins-001', seccionId: 'sec-mat101-a', estado: 'inscrita' },
  { id: 'ins-002', seccionId: 'sec-inf105-a', estado: 'inscrita' },
  { id: 'ins-003', seccionId: 'sec-inf201-b', estado: 'inscrita' },
];

/**
 * Sección que el estudiante está evaluando. Choca con Cálculo I (lunes 10:00),
 * así el estado `conflicto` del horario queda visible en los dos bloques.
 */
export const seccionEnEvaluacionId = 'sec-inf201-a';

export function asignaturaPorCodigo(codigo: string) {
  return asignaturas.find((a) => a.codigo === codigo);
}
