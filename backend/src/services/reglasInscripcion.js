import { INS } from '../errors/codigos/inscripciones.js';
import { ventanaAbierta } from './periodos.service.js';

// Las 7 reglas de inscripción (RF10 / CU8) como funciones PURAS: no tocan la base de datos.
// El servicio junta los datos (D-08) y estas funciones solo deciden. Así se prueban rápido y solas.
//
// Cada regla devuelve { ok: true } o { ok: false, code, regla, message, details }.
//
// Datos que recibe cada regla (el "contexto"):
//   matricula:  { estado, periodoId, plan: { asignaturas: ['MAT-101', ...], prerrequisitos: { 'MAT-201': ['MAT-101'] } } } | null
//   periodo:    { id, codigo, estado, inscripcionInicio, inscripcionTermino }
//   hoy:        'AAAA-MM-DD' (hora de Chile)
//   seccion:    { codigoAsignatura, nombreAsignatura, seccion, cupoMaximo, inscritos, bloques: [{ dia, inicioMin, finMin }] }
//   aprobadas:  ['MAT-100', ...]
//   inscritas:  [{ codigoAsignatura, nombreAsignatura, bloques }]  (las activas del mismo período)
//   nombres:    { 'MAT-101': 'Cálculo I' }  (para que los mensajes digan el nombre del ramo)

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const hora = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const nombreDe = (ctx, codigo) => (ctx.nombres?.[codigo] ? `${ctx.nombres[codigo]} (${codigo})` : codigo);

const ok = { ok: true };
const falla = (code, regla, message, details) => ({ ok: false, code, regla, message, details });

/** Dos bloques chocan si es el mismo día y se pisan. Intervalo [inicio, fin): 08:30-10:00 y 10:00-11:30 NO chocan. */
export const bloquesChocan = (a, b) => a.dia === b.dia && a.inicioMin < b.finMin && b.inicioMin < a.finMin;

// 1. Matrícula vigente en el período de la sección (D-10).
export function reglaMatricula(ctx) {
  const m = ctx.matricula;
  if (m && m.estado === 'vigente' && String(m.periodoId) === String(ctx.periodo.id)) return ok;
  return falla(
    INS.MATRICULA_NO_VIGENTE,
    'Matrícula vigente',
    `No tienes una matrícula vigente en el período ${ctx.periodo.codigo}${m ? ` (tu matrícula está ${m.estado})` : ''}.`,
  );
}

// 2. Ventana de inscripción abierta (fechas inclusivas, hora de Chile).
export function reglaVentana(ctx) {
  const p = ctx.periodo;
  if (ventanaAbierta(p, ctx.hoy)) return ok;
  return falla(
    INS.FUERA_DE_VENTANA,
    'Ventana de inscripción',
    `La inscripción del período ${p.codigo} está abierta del ${p.inscripcionInicio} al ${p.inscripcionTermino}; hoy es ${ctx.hoy}.`,
    { inicio: p.inscripcionInicio, termino: p.inscripcionTermino, hoy: ctx.hoy },
  );
}

// 3. Cupo disponible. (El servicio vuelve a revisarlo de forma atómica al guardar.)
export function reglaCupo(ctx) {
  const s = ctx.seccion;
  if (s.inscritos < s.cupoMaximo) return ok;
  return falla(
    INS.SIN_CUPO,
    'Cupo disponible',
    `La sección ${s.codigoAsignatura} ${s.seccion} está llena (${s.inscritos}/${s.cupoMaximo}).`,
    { inscritos: s.inscritos, cupoMaximo: s.cupoMaximo },
  );
}

// 4. La asignatura es del plan de la matrícula.
export function reglaPlan(ctx) {
  const codigo = ctx.seccion.codigoAsignatura;
  if (ctx.matricula?.plan?.asignaturas?.includes(codigo)) return ok;
  return falla(INS.ASIGNATURA_FUERA_DE_PLAN, 'Asignatura del plan', `${nombreDe(ctx, codigo)} no es parte de tu plan de estudios.`);
}

// 5. Prerrequisitos aprobados (D-11: cuenta lo que esté en el historial de aprobadas, venga del plan que venga).
export function reglaPrerrequisitos(ctx) {
  const requeridos = ctx.matricula?.plan?.prerrequisitos?.[ctx.seccion.codigoAsignatura] ?? [];
  const faltan = requeridos.filter((c) => !ctx.aprobadas.includes(c));
  if (faltan.length === 0) return ok;
  return falla(
    INS.PREREQUISITO_PENDIENTE,
    'Prerrequisitos aprobados',
    `Te falta aprobar ${faltan.map((c) => nombreDe(ctx, c)).join(', ')}.`,
    { faltan },
  );
}

// 6. No haberla aprobado antes.
export function reglaYaAprobada(ctx) {
  const codigo = ctx.seccion.codigoAsignatura;
  if (!ctx.aprobadas.includes(codigo)) return ok;
  return falla(INS.YA_APROBADA, 'Asignatura no aprobada', `Ya aprobaste ${nombreDe(ctx, codigo)}.`);
}

// 7. Sin choque de horario con lo que ya tiene inscrito en el período.
export function reglaHorario(ctx) {
  for (const otra of ctx.inscritas) {
    for (const a of ctx.seccion.bloques) {
      const b = otra.bloques.find((x) => bloquesChocan(a, x));
      if (b) {
        return falla(
          INS.CHOQUE_HORARIO,
          'Sin choque de horario',
          `Choca con ${otra.nombreAsignatura} (${otra.codigoAsignatura}), ${DIAS[b.dia]} ${hora(b.inicioMin)}–${hora(b.finMin)}.`,
          { conAsignatura: otra.codigoAsignatura, bloque: b },
        );
      }
    }
  }
  return ok;
}

export const REGLAS = [reglaMatricula, reglaVentana, reglaCupo, reglaPlan, reglaPrerrequisitos, reglaYaAprobada, reglaHorario];

/**
 * D-09: evalúa TODAS las reglas y devuelve las que fallan, en orden 1 a 7.
 * La primera es la principal (su code es el que va en la respuesta).
 */
export function evaluarReglas(ctx) {
  return REGLAS.map((regla) => regla(ctx)).filter((r) => !r.ok);
}
