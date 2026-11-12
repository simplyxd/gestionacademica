import { Periodo } from '../../backend/src/models/periodo.model.js';

// Los mismos tres períodos que el mock del frontend (frontend/src/mock/estructura.ts), con las mismas fechas,
// para que la cabecera, Períodos y las pantallas que leen la API muestren lo mismo.
// Si cambias uno, cambia el otro. Al pasar el semestre hay que actualizar ambos.
// El orden importa: 2026-1 deja de estar en curso antes de que 2026-2 lo esté (índice un_solo_en_curso).
export const PERIODOS = [
  {
    codigo: '2026-1',
    nombre: '2026 · Primer semestre',
    inicio: '2026-03-02',
    termino: '2026-07-18',
    inscripcionInicio: '2026-01-05',
    inscripcionTermino: '2026-02-20',
    estado: 'cerrado',
  },
  {
    codigo: '2026-2',
    nombre: '2026 · Segundo semestre',
    inicio: '2026-08-03',
    termino: '2026-12-19',
    inscripcionInicio: '2026-06-01',
    inscripcionTermino: '2026-07-15',
    estado: 'en_curso',
  },
  {
    codigo: '2027-1',
    nombre: '2027 · Primer semestre',
    inicio: '2027-03-01',
    termino: '2027-07-17',
    inscripcionInicio: '2027-01-04',
    inscripcionTermino: '2027-02-19',
    estado: 'planificacion',
  },
];

/** Período ya cerrado (historial de aprobadas), en curso (matrículas) y siguiente. */
export const PERIODO_ANTERIOR = '2026-1';
export const PERIODO_EN_CURSO = '2026-2';
export const PERIODO_SIGUIENTE = '2027-1';

export default async function sembrar({ upsertPorClave, log }) {
  await Periodo.init();
  for (const { codigo, ...datos } of PERIODOS) {
    await upsertPorClave(Periodo, { codigo }, datos);
  }
  log(`${PERIODOS.length} períodos listos (${PERIODO_EN_CURSO} en curso, igual que el frontend)`);
}
