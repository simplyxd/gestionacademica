import { describe, expect, it } from 'vitest';
import { PLANES } from '@/mock/estructura';
import { cambiarEstado, registrarMatricula } from './rules';
import type { Matricula, NuevaMatricula } from './types';

const base: NuevaMatricula = {
  estudianteId: 'est-007',
  carreraId: 'car-inf',
  planId: 'plan-inf-2024',
  periodoId: 'per-2026-2',
};

const meta = (n: number) => ({ id: `MAT-T${n}`, ahora: '2026-10-04T12:00:00.000Z' });

function matricula(over: Partial<Matricula>): Matricula {
  return { id: 'MAT-X', ...base, estado: 'vigente', creadaEn: '2026-01-01T00:00:00.000Z', ...over };
}

describe('registrarMatricula', () => {
  it('asigna carrera + plan + período y deja la matrícula vigente', () => {
    const r = registrarMatricula([], base, PLANES, meta(1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ ...base, estado: 'vigente' });
  });

  it('bloquea un segundo intento vigente en el mismo período y no duplica', () => {
    const primera = registrarMatricula([], base, PLANES, meta(1));
    if (!primera.ok) throw new Error('el primer alta debía funcionar');
    const lista = [primera.value];

    const segunda = registrarMatricula(lista, { ...base, carreraId: 'car-adm', planId: 'plan-adm-2023' }, PLANES, meta(2));
    expect(segunda.ok).toBe(false);
    if (!segunda.ok) {
      expect(segunda.error.code).toBe('MATRICULA_VIGENTE_EN_PERIODO');
      expect(segunda.error.field).toBe('periodoId');
      expect(segunda.error.existente?.id).toBe('MAT-T1');
    }
    expect(lista).toHaveLength(1);
  });

  it('permite otra matrícula del mismo estudiante en otro período', () => {
    const lista = [matricula({})];
    const r = registrarMatricula(lista, { ...base, periodoId: 'per-2027-1' }, PLANES, meta(3));
    expect(r.ok).toBe(true);
  });

  it('no cuenta como bloqueo una matrícula suspendida, egresada o retirada', () => {
    for (const estado of ['suspendida', 'egresada', 'retirada'] as const) {
      const r = registrarMatricula([matricula({ estado })], base, PLANES, meta(4));
      expect(r.ok).toBe(true);
    }
  });

  it('no bloquea a otro estudiante en el mismo período', () => {
    const r = registrarMatricula([matricula({})], { ...base, estudianteId: 'est-008' }, PLANES, meta(5));
    expect(r.ok).toBe(true);
  });

  it('rechaza un plan que no pertenece a la carrera', () => {
    const r = registrarMatricula([], { ...base, planId: 'plan-adm-2023' }, PLANES, meta(6));
    expect(r).toMatchObject({ ok: false, error: { code: 'PLAN_FUERA_DE_CARRERA', field: 'planId' } });
  });

  it('exige todos los campos', () => {
    const r = registrarMatricula([], { ...base, estudianteId: '' }, PLANES, meta(7));
    expect(r).toMatchObject({ ok: false, error: { code: 'CAMPO_REQUERIDO', field: 'estudianteId' } });
  });
});

describe('cambiarEstado', () => {
  it('permite suspender, egresar y retirar una vigente (sin borrar el registro)', () => {
    for (const nuevo of ['suspendida', 'egresada', 'retirada'] as const) {
      const lista = [matricula({})];
      const r = cambiarEstado(lista, 'MAT-X', nuevo);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value).toHaveLength(1);
        expect(r.value[0].estado).toBe(nuevo);
      }
    }
  });

  it('permite retirar una suspendida, pero no egresarla', () => {
    expect(cambiarEstado([matricula({ estado: 'suspendida' })], 'MAT-X', 'retirada').ok).toBe(true);
    expect(cambiarEstado([matricula({ estado: 'suspendida' })], 'MAT-X', 'egresada').ok).toBe(false);
  });

  it('no permite salir de un estado final', () => {
    for (const estado of ['egresada', 'retirada'] as const) {
      const r = cambiarEstado([matricula({ estado })], 'MAT-X', 'vigente');
      expect(r).toMatchObject({ ok: false, error: { code: 'TRANSICION_INVALIDA' } });
    }
  });

  it('falla si la matrícula no existe', () => {
    expect(cambiarEstado([], 'MAT-NOPE', 'retirada')).toMatchObject({
      ok: false,
      error: { code: 'MATRICULA_INEXISTENTE' },
    });
  });
});
