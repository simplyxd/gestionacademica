// Seed de planes de estudio (dueño: Lorenzo). Idempotente: clave natural = (carrera, nombre).
// Prerrequisitos acíclicos, siempre en un semestre menor. Informática tiene cadenas de 5 niveles
// (INF-101 → INF-201 → INF-220 → INF-330 → INF-420). MAT-202 exige MAT-201 en Informática pero nada
// en Administración: el prerrequisito vive en el plan, no en la asignatura.
import { Asignatura } from '../../backend/src/models/asignatura.model.js';
import { Carrera } from '../../backend/src/models/carrera.model.js';
import { Plan } from '../../backend/src/models/plan.model.js';
import { validarGrafoPlan } from '../../backend/src/utils/grafoPrerrequisitos.js';

// [codigo, semestre, tipo, prerrequisitos]
export const PLANES = [
  {
    carrera: 'INF',
    nombre: 'Plan 2024',
    asignaturas: [
      ['MAT-100', 1, 'obligatoria', []],
      ['MAT-101', 1, 'obligatoria', []],
      ['INF-101', 1, 'obligatoria', []],
      ['MAT-201', 2, 'obligatoria', ['MAT-101']],
      ['INF-105', 2, 'obligatoria', []],
      ['INF-201', 2, 'obligatoria', ['INF-101']],
      ['INF-220', 3, 'obligatoria', ['INF-201']],
      ['INF-230', 3, 'obligatoria', ['INF-201']],
      ['MAT-202', 3, 'obligatoria', ['MAT-201']],
      ['INF-210', 3, 'electiva', ['INF-101']],
      ['INF-301', 4, 'obligatoria', ['INF-201']],
      ['INF-320', 4, 'obligatoria', ['INF-105']],
      ['INF-330', 4, 'obligatoria', ['INF-220', 'MAT-201']],
      ['INF-310', 5, 'obligatoria', ['INF-320']],
      ['INF-401', 5, 'obligatoria', ['INF-301']],
      ['INF-410', 6, 'electiva', ['INF-310']],
      ['INF-420', 6, 'electiva', ['INF-330', 'MAT-202']],
      ['INF-490', 8, 'obligatoria', ['INF-401', 'INF-301']],
    ],
  },
  {
    carrera: 'ADM',
    nombre: 'Plan 2023',
    asignaturas: [
      ['ADM-110', 1, 'obligatoria', []],
      ['MAT-100', 1, 'obligatoria', []],
      ['ADM-120', 2, 'obligatoria', ['MAT-100']],
      ['ADM-210', 2, 'obligatoria', ['ADM-110']],
      ['ADM-220', 3, 'obligatoria', ['ADM-110']],
      ['ADM-230', 3, 'obligatoria', ['ADM-120']],
      ['MAT-202', 3, 'obligatoria', []],
      ['ADM-310', 4, 'obligatoria', ['ADM-230', 'MAT-202']],
      ['ADM-320', 4, 'electiva', ['ADM-220']],
      ['ADM-410', 6, 'obligatoria', ['ADM-310', 'ADM-210']],
    ],
  },
];

export default async function sembrar({ upsertPorClave, resolver, log }) {
  await Plan.init();
  for (const plan of PLANES) {
    const carreraId = await resolver(Carrera, { codigo: plan.carrera });
    const ids = new Map();
    for (const [codigo] of plan.asignaturas) ids.set(codigo, await resolver(Asignatura, { codigo }));

    const asignaturas = plan.asignaturas.map(([codigo, semestre, tipo, prerrequisitos]) => ({
      asignaturaId: ids.get(codigo),
      semestre,
      tipo,
      prerrequisitos: prerrequisitos.map((p) => ids.get(p) ?? p),
    }));
    const violacion = validarGrafoPlan(asignaturas);
    if (violacion) throw new Error(`${plan.carrera} ${plan.nombre} no es válido: ${JSON.stringify(violacion)}`);

    await upsertPorClave(Plan, { carreraId, nombre: plan.nombre }, { estado: 'vigente', asignaturas });
  }
  log(`${PLANES.length} planes listos`);
}
