import type { Carrera, Periodo, PlanEstudio } from './types';

export const CARRERAS: Carrera[] = [
  {
    id: 'car-inf',
    codigo: 'INF',
    nombre: 'Ingeniería en Informática',
    sedes: ['sede-central', 'sede-norte'],
    modalidad: 'presencial',
    jornada: 'diurna',
    duracionSemestres: 8,
    estado: 'activa',
  },
  {
    id: 'car-adm',
    codigo: 'ADM',
    nombre: 'Administración de Empresas',
    sedes: ['sede-central', 'sede-sur'],
    modalidad: 'semipresencial',
    jornada: 'vespertina',
    duracionSemestres: 8,
    estado: 'activa',
  },
  {
    id: 'car-enf',
    codigo: 'ENF',
    nombre: 'Técnico en Enfermería',
    sedes: ['sede-sur'],
    modalidad: 'presencial',
    jornada: 'diurna',
    duracionSemestres: 5,
    estado: 'activa',
  },
  {
    id: 'car-con',
    codigo: 'CON',
    nombre: 'Contabilidad y Auditoría',
    sedes: ['sede-central'],
    modalidad: 'online',
    jornada: 'vespertina',
    duracionSemestres: 6,
    estado: 'activa',
  },
];

/**
 * El prerrequisito vive en el plan; una carrera puede tener varios planes.
 * Plan 2024 de Informática = `estudiante.codigosDelPlan` (mocks/sga.ts), con cada
 * prerrequisito en un semestre anterior al de la asignatura que lo exige.
 */
export const PLANES: PlanEstudio[] = [
  {
    id: 'plan-inf-2019',
    carreraId: 'car-inf',
    nombre: 'Plan 2019',
    estado: 'histórico',
    asignaturas: [
      { codigo: 'MAT-101', semestre: 1, tipo: 'obligatoria' },
      { codigo: 'INF-101', semestre: 1, tipo: 'obligatoria' },
      { codigo: 'INF-201', semestre: 2, tipo: 'obligatoria' },
    ],
  },
  {
    id: 'plan-inf-2024',
    carreraId: 'car-inf',
    nombre: 'Plan 2024',
    estado: 'vigente',
    asignaturas: [
      { codigo: 'MAT-100', semestre: 1, tipo: 'obligatoria' },
      { codigo: 'MAT-101', semestre: 1, tipo: 'obligatoria' },
      { codigo: 'INF-101', semestre: 1, tipo: 'obligatoria' },
      { codigo: 'MAT-201', semestre: 2, tipo: 'obligatoria' },
      { codigo: 'INF-105', semestre: 2, tipo: 'obligatoria' },
      { codigo: 'INF-201', semestre: 2, tipo: 'obligatoria' },
      { codigo: 'INF-301', semestre: 3, tipo: 'obligatoria' },
      { codigo: 'INF-210', semestre: 3, tipo: 'electiva' },
    ],
  },
  {
    id: 'plan-adm-2023',
    carreraId: 'car-adm',
    nombre: 'Plan 2023',
    estado: 'vigente',
    asignaturas: [
      { codigo: 'ADM-110', semestre: 1, tipo: 'obligatoria' },
      { codigo: 'MAT-100', semestre: 1, tipo: 'obligatoria' },
    ],
  },
  { id: 'plan-enf-2022', carreraId: 'car-enf', nombre: 'Plan 2022', estado: 'vigente', asignaturas: [] },
  {
    id: 'plan-con-2023',
    carreraId: 'car-con',
    nombre: 'Plan 2023',
    estado: 'vigente',
    asignaturas: [{ codigo: 'ADM-110', semestre: 1, tipo: 'obligatoria' }],
  },
];

export const PERIODOS: Periodo[] = [
  {
    id: 'per-2026-1',
    codigo: '2026-1',
    nombre: '2026 · Primer semestre',
    inicio: '2026-03-02',
    termino: '2026-07-18',
    inscripcionInicio: '2026-01-05',
    inscripcionTermino: '2026-02-20',
    estado: 'cerrado',
  },
  {
    id: 'per-2026-2',
    codigo: '2026-2',
    nombre: '2026 · Segundo semestre',
    inicio: '2026-08-03',
    termino: '2026-12-19',
    inscripcionInicio: '2026-06-01',
    inscripcionTermino: '2026-07-15',
    estado: 'en curso',
  },
  {
    id: 'per-2027-1',
    codigo: '2027-1',
    nombre: '2027 · Primer semestre',
    inicio: '2027-03-01',
    termino: '2027-07-17',
    inscripcionInicio: '2027-01-04',
    inscripcionTermino: '2027-02-19',
    estado: 'planificación',
  },
];

/** Período «en curso»: el que muestra el Header (solo uno a la vez). */
export const PERIODO_ACTUAL = PERIODOS.find((p) => p.estado === 'en curso') ?? PERIODOS[0];
