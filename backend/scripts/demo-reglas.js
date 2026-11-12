/**
 * Demo de las 7 reglas de inscripción (parte de Matias).
 *
 * Corre sin Mongo ni servidor: usa las mismas funciones puras que el backend.
 * Cómo ejecutarlo:
 *   cd backend
 *   node scripts/demo-reglas.js
 */

import {
  evaluarReglas,
  reglaMatricula,
  reglaVentana,
  reglaCupo,
  reglaPlan,
  reglaPrerrequisitos,
  reglaYaAprobada,
  reglaHorario,
} from '../src/services/reglasInscripcion.js';
import { hoyEnSantiago, ventanaAbierta, TRANSICIONES } from '../src/services/periodos.service.js';

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const gris = (t) => `\x1b[90m${t}\x1b[0m`;
const negrita = (t) => `\x1b[1m${t}\x1b[0m`;

const nombres = {
  'MAT-100': 'Álgebra',
  'MAT-101': 'Cálculo I',
  'MAT-201': 'Cálculo II',
  'INF-101': 'Programación I',
  'INF-201': 'Programación II',
};

const periodoAbierto = {
  id: 'p2',
  codigo: '2026-2',
  estado: 'inscripcion_abierta',
  inscripcionInicio: '2026-03-01',
  inscripcionTermino: '2026-03-31',
};

function ctxBase(extra = {}) {
  return {
    hoy: '2026-03-15',
    periodo: periodoAbierto,
    matricula: {
      estado: 'vigente',
      periodoId: 'p2',
      plan: {
        asignaturas: ['MAT-100', 'MAT-101', 'MAT-201', 'INF-101', 'INF-201'],
        prerrequisitos: { 'MAT-201': ['MAT-101'], 'INF-201': ['INF-101'] },
      },
    },
    seccion: {
      codigoAsignatura: 'INF-201',
      nombreAsignatura: 'Programación II',
      seccion: 'A',
      cupoMaximo: 30,
      inscritos: 12,
      bloques: [{ dia: 0, inicioMin: 600, finMin: 690 }], // lunes 10:00–11:30
    },
    aprobadas: ['MAT-100', 'MAT-101', 'INF-101'],
    inscritas: [],
    nombres,
    ...extra,
  };
}

const casos = [
  {
    titulo: 'Caso feliz — Tomás Demo Feliz',
    descripcion: 'Matrícula vigente, ventana abierta, cupo, plan, prerrequisitos y sin choque.',
    ctx: ctxBase(),
    esperarOk: true,
  },
  {
    titulo: 'Regla 1 — Renata Demo Sinmatrícula',
    descripcion: 'No tiene matrícula vigente en el período.',
    ctx: ctxBase({ matricula: null }),
    code: 'INS_MATRICULA_NO_VIGENTE',
  },
  {
    titulo: 'Regla 2 — fuera de ventana',
    descripcion: 'Hoy es después del cierre de inscripción.',
    ctx: ctxBase({ hoy: '2026-04-01' }),
    code: 'INS_FUERA_DE_VENTANA',
  },
  {
    titulo: 'Regla 3 — sin cupo',
    descripcion: 'La sección está justa llena (30/30).',
    ctx: ctxBase({
      seccion: {
        ...ctxBase().seccion,
        inscritos: 30,
      },
    }),
    code: 'INS_SIN_CUPO',
  },
  {
    titulo: 'Regla 4 — Bruno Demo Otroplan',
    descripcion: 'Quiere un ramo de Informática, pero su plan es Administración.',
    ctx: ctxBase({
      matricula: {
        estado: 'vigente',
        periodoId: 'p2',
        plan: { asignaturas: ['ADM-110'], prerrequisitos: {} },
      },
    }),
    code: 'INS_ASIGNATURA_FUERA_DE_PLAN',
  },
  {
    titulo: 'Regla 5 — Elena Demo Sinprerrequisito',
    descripcion: 'Quiere Cálculo II pero no tiene Cálculo I aprobado.',
    ctx: ctxBase({
      aprobadas: ['INF-101'],
      seccion: {
        codigoAsignatura: 'MAT-201',
        nombreAsignatura: 'Cálculo II',
        seccion: 'A',
        cupoMaximo: 40,
        inscritos: 10,
        bloques: [{ dia: 2, inicioMin: 600, finMin: 690 }],
      },
    }),
    code: 'INS_PREREQUISITO_PENDIENTE',
  },
  {
    titulo: 'Regla 6 — Simón Demo Yaaprobó',
    descripcion: 'Quiere Programación I, pero ya la aprobó.',
    ctx: ctxBase({
      seccion: {
        codigoAsignatura: 'INF-101',
        nombreAsignatura: 'Programación I',
        seccion: 'B',
        cupoMaximo: 40,
        inscritos: 5,
        bloques: [{ dia: 1, inicioMin: 600, finMin: 690 }],
      },
    }),
    code: 'INS_YA_APROBADA',
  },
  {
    titulo: 'Regla 7 — Olivia Demo Choque',
    descripcion: 'Ya tiene Física el lunes 08:30–10:30; Programación II choca.',
    ctx: ctxBase({
      inscritas: [
        {
          codigoAsignatura: 'FIS-201',
          nombreAsignatura: 'Física II',
          bloques: [{ dia: 0, inicioMin: 510, finMin: 630 }],
        },
      ],
    }),
    code: 'INS_CHOQUE_HORARIO',
  },
  {
    titulo: 'Borde — bloques contiguos NO chocan',
    descripcion: 'Una clase termina a las 10:00 y la otra parte a las 10:00.',
    ctx: ctxBase({
      inscritas: [
        {
          codigoAsignatura: 'FIS-201',
          nombreAsignatura: 'Física II',
          bloques: [{ dia: 0, inicioMin: 510, finMin: 600 }],
        },
      ],
    }),
    esperarOk: true,
  },
];

function mostrarResultado(caso) {
  const fallas = evaluarReglas(caso.ctx);
  const ok = fallas.length === 0;
  const esperadoOk = caso.esperarOk === true;
  const codeOk = !esperadoOk && fallas.some((f) => f.code === caso.code);
  const paso = esperadoOk ? ok : codeOk;

  console.log(`\n${negrita(caso.titulo)}`);
  console.log(gris(caso.descripcion));

  if (ok) {
    console.log(verde('  ✓ Se puede inscribir (ninguna regla falló)'));
  } else {
    for (const f of fallas) {
      const marca = f.code === caso.code || esperadoOk ? '→' : ' ';
      console.log(rojo(`  ${marca} [${f.code}] ${f.regla}`));
      console.log(`     ${f.message}`);
    }
  }

  console.log(paso ? verde('  DEMO OK') : rojo('  DEMO FALLÓ (resultado inesperado)'));
  return paso;
}

console.log(negrita('=== DEMO Matias · Períodos y 7 reglas de inscripción ==='));
console.log(`Hoy (Chile): ${hoyEnSantiago()}`);
console.log(`Ventana de ejemplo abierta el 2026-03-15: ${ventanaAbierta(periodoAbierto, '2026-03-15')}`);
console.log(`Estados permitidos desde planificacion: ${TRANSICIONES.planificacion.join(', ')}`);

let ok = 0;
for (const caso of casos) {
  if (mostrarResultado(caso)) ok += 1;
}

console.log(`\n${negrita('Resumen')}: ${ok}/${casos.length} demos OK`);
console.log(gris('Archivo de reglas: backend/src/services/reglasInscripcion.js'));
console.log(gris('Tests: cd backend && npm.cmd test -- tests/inscripcion'));

if (ok !== casos.length) process.exit(1);
