import type { SeccionOfertada } from '@/features/oferta/types';
import { secciones } from '@/mocks/sga';

const h = (hh: number, mm = 0) => hh * 60 + mm;

/**
 * Oferta inicial del coordinador. Las secciones del período en curso son las MISMAS que ve el estudiante
 * (`mocks/sga`): lo que el coordinador cree o edite aquí es lo que aparece en su oferta.
 */
export const OFERTA_SEED: SeccionOfertada[] = [
  ...secciones.map<SeccionOfertada>((s, i) => ({
    ...s,
    periodoId: 'per-2026-2',
    sede: i % 3 === 2 ? 'Sede Norte' : 'Sede Central',
  })),
  // Período cerrado: se puede consultar, pero ya no se programa.
  {
    id: 'sec-mat100-a-2026-1',
    codigoAsignatura: 'MAT-100',
    nombreAsignatura: 'Álgebra',
    seccion: 'A',
    docente: 'Lorena Pinto',
    sala: 'Sala 101',
    modalidad: 'presencial',
    jornada: 'diurna',
    cupo: 40,
    inscritosOtros: 38,
    periodoId: 'per-2026-1',
    sede: 'Sede Central',
    bloques: [
      { dia: 1, inicioMin: h(8, 30), finMin: h(10) },
      { dia: 3, inicioMin: h(8, 30), finMin: h(10) },
    ],
  },
  {
    id: 'sec-inf101-a-2026-1',
    codigoAsignatura: 'INF-101',
    nombreAsignatura: 'Programación I',
    seccion: 'A',
    docente: 'Esteban Vera',
    sala: 'Lab 1',
    modalidad: 'presencial',
    jornada: 'vespertina',
    cupo: 30,
    inscritosOtros: 30,
    periodoId: 'per-2026-1',
    sede: 'Sede Central',
    bloques: [{ dia: 2, inicioMin: h(18), finMin: h(21) }],
  },
];
