import { describe, expect, it } from 'vitest';
import { OFERTA_SEED } from '@/mock/oferta';
import { siguienteLetra, validarSeccion, type SeccionInput } from './reglasOferta';

const h = (hh: number, mm = 0) => hh * 60 + mm;

const valida: SeccionInput = {
  codigoAsignatura: 'INF-101',
  docente: 'Rodrigo Fuentes',
  sede: 'Sede Central',
  jornada: 'diurna',
  modalidad: 'presencial',
  cupo: 30,
  sala: 'Sala 101',
  periodoId: 'per-2026-2',
  bloques: [{ dia: 0, inicioMin: h(8, 30), finMin: h(10) }],
};

describe('validarSeccion', () => {
  it('acepta una sección completa', () => {
    expect(validarSeccion(valida)).toEqual({});
  });

  it('online no pide sala; presencial sí', () => {
    expect(validarSeccion({ ...valida, modalidad: 'online', sala: '' }).sala).toBeUndefined();
    expect(validarSeccion({ ...valida, sala: '' }).sala).toBeDefined();
  });

  it('exige al menos un bloque, con término posterior al inicio y dentro de 08:00–22:00', () => {
    expect(validarSeccion({ ...valida, bloques: [] }).bloques).toMatch(/al menos un bloque/);
    expect(validarSeccion({ ...valida, bloques: [{ dia: 0, inicioMin: h(10), finMin: h(9) }] }).bloques).toMatch(/después/);
    expect(validarSeccion({ ...valida, bloques: [{ dia: 0, inicioMin: h(7), finMin: h(9) }] }).bloques).toMatch(/entre/);
    expect(validarSeccion({ ...valida, bloques: [{ dia: 0, inicioMin: h(21), finMin: h(23) }] }).bloques).toMatch(/entre/);
  });

  it('el cupo es entero y no baja de los ya inscritos', () => {
    expect(validarSeccion({ ...valida, cupo: 0 }).cupo).toBeDefined();
    expect(validarSeccion({ ...valida, cupo: 2.5 }).cupo).toBeDefined();
    const llena = OFERTA_SEED.find((s) => s.inscritosOtros > 10)!;
    expect(validarSeccion({ ...valida, cupo: llena.inscritosOtros - 1 }, llena).cupo).toMatch(/inscritos/);
    expect(validarSeccion({ ...valida, cupo: llena.inscritosOtros }, llena).cupo).toBeUndefined();
  });
});

describe('siguienteLetra', () => {
  it('toma la primera letra libre de esa asignatura en ese período', () => {
    expect(siguienteLetra([], 'per-2026-2', 'INF-101')).toBe('A');
    const conA = OFERTA_SEED.filter((s) => s.periodoId === 'per-2026-2' && s.codigoAsignatura === 'INF-101');
    const letras = new Set(conA.map((s) => s.seccion));
    expect(letras.has(siguienteLetra(OFERTA_SEED, 'per-2026-2', 'INF-101'))).toBe(false);
  });
});
