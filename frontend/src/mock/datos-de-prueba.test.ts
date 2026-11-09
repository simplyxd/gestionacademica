import { describe, expect, it } from 'vitest';
import { validarSede } from '@/features/estructura/rules';
import { conflictosDeInput, validarSeccion } from '@/features/oferta/reglasOferta';
import { validarPeriodo } from '@/features/periodos/rules';
import { validarPersona } from '@/features/personas/rules';
import { CASOS_PERIODO, CASOS_PERSONA, CASOS_SEDE, CASOS_SECCION } from './datos-de-prueba';
import { DOCENTES_SEED, ESTUDIANTES_SEED } from './personas-academicas';
import { PERIODOS } from './estructura';
import { OFERTA_SEED } from './oferta';
import { SEDES } from './sedes';

/** Mantiene honestos los casos de `datos-de-prueba.ts`: si el seed o las reglas cambian, esto avisa. */
describe('casos de sección', () => {
  it.each(CASOS_SECCION)('$id', (caso) => {
    const editando = caso.editaSeccionId ? OFERTA_SEED.find((s) => s.id === caso.editaSeccionId) : undefined;
    const errores = Object.keys(validarSeccion(caso.datos, editando));
    const choques = conflictosDeInput(caso.datos, editando?.id ?? '', OFERTA_SEED).map((c) => c.tipo);

    if (caso.esperado.resultado === 'ok') {
      expect(errores).toEqual([]);
      expect(choques).toEqual([]);
    } else {
      expect([...errores].sort()).toEqual([...(caso.esperado.campos ?? [])].sort());
      expect([...new Set(choques)].sort()).toEqual([...(caso.esperado.choques ?? [])].sort());
    }
  });
});

describe('casos de período', () => {
  it.each(CASOS_PERIODO)('$id', (caso) => {
    const errores = Object.keys(validarPeriodo(caso.datos, PERIODOS, caso.editaPeriodoId));
    expect([...errores].sort()).toEqual([...caso.camposConError].sort());
  });
});

describe('casos de sede', () => {
  it.each(CASOS_SEDE)('$id', (caso) => {
    const errores = Object.keys(validarSede(caso.datos, SEDES, caso.editaSedeId));
    expect([...errores].sort()).toEqual([...caso.camposConError].sort());
  });
});

describe('casos de persona', () => {
  it.each(CASOS_PERSONA)('$id', (caso) => {
    const existentes = caso.rol === 'docente' ? DOCENTES_SEED : ESTUDIANTES_SEED;
    const errores = Object.keys(validarPersona(caso.rol, caso.datos, existentes, caso.editaPersonaId, '2026-10-05'));
    expect([...errores].sort()).toEqual([...caso.camposConError].sort());
  });
});
