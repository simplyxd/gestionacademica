import { describe, expect, it } from 'vitest';
import { detectarConflictos } from './conflictos';
import type { SeccionOfertada } from './types';

const h = (hh: number, mm = 0) => hh * 60 + mm;

const base: SeccionOfertada = {
  id: 'a',
  codigoAsignatura: 'INF-101',
  nombreAsignatura: 'Programación I',
  seccion: 'A',
  docente: 'Rodrigo Fuentes',
  sala: 'Sala 101',
  modalidad: 'presencial',
  jornada: 'diurna',
  cupo: 30,
  inscritosOtros: 0,
  periodoId: 'per-2026-2',
  sede: 'Sede Central',
  bloques: [{ dia: 0, inicioMin: h(8, 30), finMin: h(10) }],
};

const otra = (cambios: Partial<SeccionOfertada>): SeccionOfertada => ({ ...base, id: 'b', seccion: 'B', ...cambios });

describe('detectarConflictos', () => {
  it('detecta choque de docente en el mismo tramo', () => {
    const r = detectarConflictos(otra({ sala: 'Sala 204' }), [base]);
    expect(r.map((c) => c.tipo)).toEqual(['docente']);
  });

  it('detecta choque de sala aunque cambie el docente', () => {
    const r = detectarConflictos(otra({ docente: 'Carmen Riquelme' }), [base]);
    expect(r.map((c) => c.tipo)).toEqual(['sala']);
  });

  it('detecta los dos a la vez', () => {
    expect(detectarConflictos(otra({}), [base]).map((c) => c.tipo).sort()).toEqual(['docente', 'sala']);
  });

  it('tramos contiguos no se solapan', () => {
    const r = detectarConflictos(otra({ bloques: [{ dia: 0, inicioMin: h(10), finMin: h(11, 30) }] }), [base]);
    expect(r).toEqual([]);
  });

  it('otro día no choca', () => {
    expect(detectarConflictos(otra({ bloques: [{ dia: 1, inicioMin: h(8, 30), finMin: h(10) }] }), [base])).toEqual([]);
  });

  it('una sección online no choca por sala (solo por docente)', () => {
    const r = detectarConflictos(otra({ docente: 'Carmen Riquelme', modalidad: 'online' }), [base]);
    expect(r).toEqual([]);
  });

  it('ignora otros períodos y a sí misma', () => {
    expect(detectarConflictos(otra({ periodoId: 'per-2027-1' }), [base])).toEqual([]);
    expect(detectarConflictos(base, [base])).toEqual([]);
  });
});
