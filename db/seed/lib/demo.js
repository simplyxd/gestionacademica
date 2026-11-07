const { formatRut } = require('./rut');

/**
 * Alumnos reservados para demostrar las reglas de inscripción (D-12, propuesta para Matias).
 * Se referencian por clave natural: carrera por código, plan por año, período por código.
 * `aprobadas` son códigos de asignatura; el seed 08 les asigna el período 2026-1.
 * Las reglas 2 (ventana) y 3 (cupo) no dependen del alumno: se demuestran con `feliz`.
 */
const RUT_BASE_DEMO = 25_000_000;
const MATRICULA_INF = { carrera: 'INF', plan: '2024', periodo: '2026-2' };
const BASICAS_INF = ['MAT-100', 'MAT-101', 'INF-101'];

const CASOS = [
  {
    clave: 'sinmatricula',
    regla: 1,
    nombres: 'Renata',
    apellidos: 'Demo Sinmatrícula',
    nivelCursando: 1,
    matricula: null,
    aprobadas: [],
    intenta: 'INF-101',
  },
  {
    clave: 'otroplan',
    regla: 4,
    nombres: 'Bruno',
    apellidos: 'Demo Otroplan',
    nivelCursando: 1,
    matricula: { carrera: 'ADM', plan: '2023', periodo: '2026-2' },
    aprobadas: [],
    intenta: 'INF-201',
  },
  {
    clave: 'sinprerrequisito',
    regla: 5,
    nombres: 'Elena',
    apellidos: 'Demo Sinprerrequisito',
    nivelCursando: 2,
    matricula: MATRICULA_INF,
    aprobadas: ['MAT-101', 'INF-101'],
    intenta: 'MAT-201',
  },
  {
    clave: 'yaaprobo',
    regla: 6,
    nombres: 'Simón',
    apellidos: 'Demo Yaaprobó',
    nivelCursando: 2,
    matricula: MATRICULA_INF,
    aprobadas: BASICAS_INF,
    intenta: 'INF-101',
  },
  {
    clave: 'choque',
    regla: 7,
    nombres: 'Olivia',
    apellidos: 'Demo Choque',
    nivelCursando: 2,
    matricula: MATRICULA_INF,
    aprobadas: BASICAS_INF,
    // La inscripción previa que choca la siembra Matias (10-inscripciones) en una sección que se cruza con esta.
    intenta: 'INF-201',
  },
  {
    clave: 'feliz',
    regla: null,
    nombres: 'Tomás',
    apellidos: 'Demo Feliz',
    nivelCursando: 2,
    matricula: MATRICULA_INF,
    aprobadas: BASICAS_INF,
    intenta: 'INF-201',
  },
];

const ALUMNOS_DEMO = CASOS.map(({ nivelCursando, ...caso }, i) => ({
  ...caso,
  rut: formatRut(RUT_BASE_DEMO + i + 1),
  email: `demo.${caso.clave}@alumnos.nuevaformacion.cl`,
  telefono: `+56 9 7000 000${i + 1}`,
  rol: 'estudiante',
  estado: 'activo',
  perfilEstudiante: {
    codigoEstudiante: `EST-2026-${900 + i + 1}`,
    contactoEmergencia: `Contacto Demo · +56 9 7100 000${i + 1}`,
    nivelCursando,
    aprobadas: [],
  },
}));

module.exports = { ALUMNOS_DEMO };
