import { describe, expect, it } from 'vitest';
import { detectarCiclo, profundidadMaxima, validarGrafoPlan } from '../../src/utils/grafoPrerrequisitos.js';

describe('detectarCiclo', () => {
  it('grafo vacío: sin ciclo', () => expect(detectarCiclo({})).toBeNull());
  it('asignatura aislada: sin ciclo', () => expect(detectarCiclo({ A: [] })).toBeNull());
  it('cadena y diamante sin ciclo', () => {
    expect(detectarCiclo({ D: ['B', 'C'], B: ['A'], C: ['A'], A: [] })).toBeNull();
  });
  it('autorreferencia A → A', () => expect(detectarCiclo({ A: ['A'] })).toEqual(['A', 'A']));
  it('ciclo directo A → B → A', () => expect(detectarCiclo({ A: ['B'], B: ['A'] })).toEqual(['A', 'B', 'A']));
  it('ciclo largo y devuelve solo el ciclo, no la cola que llega a él', () => {
    const grafo = { X: ['A'], A: ['B'], B: ['C'], C: ['D'], D: ['B'] };
    expect(detectarCiclo(grafo)).toEqual(['B', 'C', 'D', 'B']);
  });
  it('encuentra el ciclo en una componente separada', () => {
    expect(detectarCiclo({ A: [], B: ['A'], P: ['Q'], Q: ['P'] })).toEqual(['P', 'Q', 'P']);
  });
  it('aguanta un plan de 40 asignaturas en cadena', () => {
    const grafo = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`a${i}`, i ? [`a${i - 1}`] : []]));
    expect(detectarCiclo(grafo)).toBeNull();
    expect(profundidadMaxima(grafo)).toBe(40);
  });
});

describe('validarGrafoPlan', () => {
  const a = (asignaturaId, semestre, prerrequisitos = []) => ({ asignaturaId, semestre, prerrequisitos });

  it('acepta un plan válido', () => {
    expect(validarGrafoPlan([a('A', 1), a('B', 2, ['A']), a('C', 3, ['B', 'A'])])).toBeNull();
  });
  it('rechaza una asignatura repetida', () => {
    expect(validarGrafoPlan([a('A', 1), a('A', 2)])).toEqual({ tipo: 'REPETIDA', asignaturaId: 'A' });
  });
  it('rechaza un prerrequisito que no está en el plan', () => {
    expect(validarGrafoPlan([a('B', 2, ['Z'])])).toMatchObject({ tipo: 'FUERA_DEL_PLAN', prerrequisitoId: 'Z' });
  });
  it('rechaza un ciclo y lo nombra (antes que la regla de semestre)', () => {
    expect(validarGrafoPlan([a('A', 1, ['B']), a('B', 2, ['A'])])).toEqual({ tipo: 'CICLO', ciclo: ['A', 'B', 'A'] });
  });
  it('rechaza la autorreferencia como ciclo', () => {
    expect(validarGrafoPlan([a('A', 1, ['A'])])).toEqual({ tipo: 'CICLO', ciclo: ['A', 'A'] });
  });
  it('rechaza un prerrequisito del mismo semestre o posterior', () => {
    expect(validarGrafoPlan([a('A', 2), a('B', 2, ['A'])])).toMatchObject({ tipo: 'SEMESTRE', semestre: 2, semestrePrerrequisito: 2 });
    expect(validarGrafoPlan([a('A', 3), a('B', 2, ['A'])])).toMatchObject({ tipo: 'SEMESTRE' });
  });
  it('acepta el plan vacío', () => expect(validarGrafoPlan([])).toBeNull());
});
