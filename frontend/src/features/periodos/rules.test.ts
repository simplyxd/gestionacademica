import { describe, expect, it } from 'vitest';
import { PERIODOS } from '@/mock/estructura';
import { validarPeriodo, type PeriodoInput } from './rules';

const valido: PeriodoInput = {
  codigo: '2027-2',
  nombre: '2027 · Segundo semestre',
  inicio: '2027-08-02',
  termino: '2027-12-18',
  inscripcionInicio: '2027-06-01',
  inscripcionTermino: '2027-07-16',
  estado: 'planificación',
};

describe('validarPeriodo', () => {
  it('acepta un período válido; la inscripción puede abrir antes del inicio', () => {
    expect(validarPeriodo(valido, PERIODOS)).toEqual({});
  });

  it('exige el formato AAAA-S y un código único', () => {
    expect(validarPeriodo({ ...valido, codigo: '27-2' }, PERIODOS).codigo).toMatch(/formato/);
    expect(validarPeriodo({ ...valido, codigo: '2026-2' }, PERIODOS).codigo).toMatch(/Ya existe/);
  });

  it('al editar, el propio período no cuenta como duplicado', () => {
    const actual = PERIODOS[2];
    const entrada: PeriodoInput = { ...valido, codigo: actual.codigo, estado: actual.estado };
    expect(validarPeriodo(entrada, PERIODOS, actual.id).codigo).toBeUndefined();
  });

  it('el término debe ser posterior al inicio (período y ventana)', () => {
    const e = validarPeriodo({ ...valido, termino: '2027-08-01', inscripcionTermino: '2027-06-01' }, PERIODOS);
    expect(e.termino).toBeDefined();
    expect(e.inscripcionTermino).toBeDefined();
  });

  it('solo puede haber un período en curso', () => {
    expect(validarPeriodo({ ...valido, estado: 'en curso' }, PERIODOS).estado).toMatch(/2026-2/);
    const actual = PERIODOS.find((p) => p.estado === 'en curso')!;
    expect(validarPeriodo({ ...valido, codigo: actual.codigo, estado: 'en curso' }, PERIODOS, actual.id).estado).toBeUndefined();
  });
});
