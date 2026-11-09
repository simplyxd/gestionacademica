import { describe, expect, it } from 'vitest';
import * as r from '../../src/services/reglasInscripcion.js';

// Un contexto donde TODO está bien. Cada test cambia solo lo que quiere romper.
const ctxValido = () => ({
  hoy: '2026-08-05',
  periodo: { id: 'p2', codigo: '2026-2', estado: 'inscripcion_abierta', inscripcionInicio: '2026-07-20', inscripcionTermino: '2026-08-10' },
  matricula: {
    estado: 'vigente',
    periodoId: 'p2',
    plan: { asignaturas: ['MAT-101', 'MAT-201', 'FIS-201'], prerrequisitos: { 'MAT-201': ['MAT-101'] } },
  },
  seccion: {
    codigoAsignatura: 'MAT-201',
    nombreAsignatura: 'Cálculo II',
    seccion: 'A',
    cupoMaximo: 30,
    inscritos: 10,
    bloques: [{ dia: 0, inicioMin: 600, finMin: 690 }], // lunes 10:00–11:30
  },
  aprobadas: ['MAT-101'],
  inscritas: [],
  nombres: { 'MAT-101': 'Cálculo I', 'MAT-201': 'Cálculo II' },
});

describe('caso feliz', () => {
  it('no falla ninguna regla', () => {
    expect(r.evaluarReglas(ctxValido())).toEqual([]);
  });
});

describe('regla 1 · matrícula vigente', () => {
  it('falla sin matrícula', () => {
    const ctx = { ...ctxValido(), matricula: null };
    expect(r.reglaMatricula(ctx)).toMatchObject({ ok: false, code: 'INS_MATRICULA_NO_VIGENTE' });
  });
  it('falla si está suspendida y lo dice', () => {
    const ctx = ctxValido();
    ctx.matricula.estado = 'suspendida';
    expect(r.reglaMatricula(ctx).message).toMatch(/suspendida/);
  });
  it('falla si la matrícula es de otro período (D-10)', () => {
    const ctx = ctxValido();
    ctx.matricula.periodoId = 'p1';
    expect(r.reglaMatricula(ctx).ok).toBe(false);
  });
});

describe('regla 2 · ventana', () => {
  it('el último día todavía se puede', () => {
    expect(r.reglaVentana({ ...ctxValido(), hoy: '2026-08-10' }).ok).toBe(true);
  });
  it('el día siguiente ya no, y el mensaje dice las fechas', () => {
    const res = r.reglaVentana({ ...ctxValido(), hoy: '2026-08-11' });
    expect(res).toMatchObject({ ok: false, code: 'INS_FUERA_DE_VENTANA' });
    expect(res.message).toMatch(/2026-07-20 al 2026-08-10/);
  });
  it('un período cerrado nunca tiene la ventana abierta', () => {
    const ctx = ctxValido();
    ctx.periodo.estado = 'cerrado';
    expect(r.reglaVentana(ctx).ok).toBe(false);
  });
});

describe('regla 3 · cupo', () => {
  it('queda 1 cupo: se puede', () => {
    const ctx = ctxValido();
    ctx.seccion.inscritos = 29;
    expect(r.reglaCupo(ctx).ok).toBe(true);
  });
  it('justo lleno: no se puede y dice 30/30', () => {
    const ctx = ctxValido();
    ctx.seccion.inscritos = 30;
    expect(r.reglaCupo(ctx)).toMatchObject({ ok: false, code: 'INS_SIN_CUPO', message: expect.stringMatching(/30\/30/) });
  });
});

describe('regla 4 · plan', () => {
  it('falla si la asignatura no está en el plan', () => {
    const ctx = ctxValido();
    ctx.seccion.codigoAsignatura = 'ADM-110';
    expect(r.reglaPlan(ctx)).toMatchObject({ ok: false, code: 'INS_ASIGNATURA_FUERA_DE_PLAN' });
  });
});

describe('regla 5 · prerrequisitos', () => {
  it('falla si falta uno y lo nombra', () => {
    const ctx = { ...ctxValido(), aprobadas: [] };
    expect(r.reglaPrerrequisitos(ctx)).toMatchObject({
      ok: false,
      code: 'INS_PREREQUISITO_PENDIENTE',
      message: 'Te falta aprobar Cálculo I (MAT-101).',
    });
  });
  it('una asignatura sin prerrequisitos pasa', () => {
    const ctx = { ...ctxValido(), aprobadas: [] };
    ctx.seccion.codigoAsignatura = 'MAT-101';
    expect(r.reglaPrerrequisitos(ctx).ok).toBe(true);
  });
});

describe('regla 6 · ya aprobada', () => {
  it('falla si ya la aprobó', () => {
    const ctx = ctxValido();
    ctx.aprobadas.push('MAT-201');
    expect(r.reglaYaAprobada(ctx)).toMatchObject({ ok: false, code: 'INS_YA_APROBADA', message: 'Ya aprobaste Cálculo II (MAT-201).' });
  });
});

describe('regla 7 · choque de horario', () => {
  const otra = (inicioMin, finMin, dia = 0) => ({ codigoAsignatura: 'FIS-201', nombreAsignatura: 'Física II', bloques: [{ dia, inicioMin, finMin }] });

  it('falla si se pisan y dice con qué y cuándo', () => {
    const ctx = { ...ctxValido(), inscritas: [otra(510, 630)] }; // lunes 08:30–10:30
    expect(r.reglaHorario(ctx)).toMatchObject({
      ok: false,
      code: 'INS_CHOQUE_HORARIO',
      message: 'Choca con Física II (FIS-201), lunes 08:30–10:30.',
    });
  });
  it('bloques contiguos NO chocan (uno termina 10:00, el otro parte 10:00)', () => {
    expect(r.reglaHorario({ ...ctxValido(), inscritas: [otra(510, 600)] }).ok).toBe(true);
  });
  it('misma hora pero otro día no choca', () => {
    expect(r.reglaHorario({ ...ctxValido(), inscritas: [otra(600, 690, 1)] }).ok).toBe(true);
  });
});

describe('varias reglas a la vez (D-09)', () => {
  it('devuelve todas las que fallan, en orden de 1 a 7', () => {
    const ctx = { ...ctxValido(), matricula: null, hoy: '2026-09-01' };
    const codes = r.evaluarReglas(ctx).map((f) => f.code);
    expect(codes[0]).toBe('INS_MATRICULA_NO_VIGENTE');
    expect(codes[1]).toBe('INS_FUERA_DE_VENTANA');
  });
  it('cada mensaje es distinto', () => {
    const ctx = { ...ctxValido(), matricula: null, hoy: '2026-09-01', aprobadas: ['MAT-201'] };
    ctx.seccion.inscritos = 30;
    const mensajes = r.evaluarReglas(ctx).map((f) => f.message);
    expect(new Set(mensajes).size).toBe(mensajes.length);
  });
});
