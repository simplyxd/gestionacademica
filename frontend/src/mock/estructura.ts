import type { Carrera, Periodo, PlanEstudio } from './types';

export const CARRERAS: Carrera[] = [
  { id: 'car-inf', codigo: 'INF', nombre: 'Ingeniería en Informática' },
  { id: 'car-adm', codigo: 'ADM', nombre: 'Administración de Empresas' },
  { id: 'car-enf', codigo: 'ENF', nombre: 'Técnico en Enfermería' },
  { id: 'car-con', codigo: 'CON', nombre: 'Contabilidad y Auditoría' },
];

/** El prerrequisito vive en el plan; una carrera puede tener varios planes. */
export const PLANES: PlanEstudio[] = [
  { id: 'plan-inf-2019', carreraId: 'car-inf', nombre: 'Plan 2019', estado: 'histórico' },
  { id: 'plan-inf-2024', carreraId: 'car-inf', nombre: 'Plan 2024', estado: 'vigente' },
  { id: 'plan-adm-2023', carreraId: 'car-adm', nombre: 'Plan 2023', estado: 'vigente' },
  { id: 'plan-enf-2022', carreraId: 'car-enf', nombre: 'Plan 2022', estado: 'vigente' },
  { id: 'plan-con-2023', carreraId: 'car-con', nombre: 'Plan 2023', estado: 'vigente' },
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
