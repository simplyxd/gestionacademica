import '../../src/config/mongoose.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import sembrarSedes, { SEDES } from '../../../db/seed/02-sedes.js';
import sembrarAsignaturas, { ASIGNATURAS } from '../../../db/seed/03-asignaturas.js';
import { Asignatura, CREDITOS_MAX, CREDITOS_MIN, FORMATO_CODIGO_ASIGNATURA } from '../../src/models/asignatura.model.js';
import { Sede } from '../../src/models/sede.model.js';
import { crearContexto } from '../../src/seed/lib.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba } from '../helpers/db.js';

beforeAll(conectarBaseDePrueba);
afterAll(desconectarBaseDePrueba);

describe('datos del seed de estructura', () => {
  it('trae 3 sedes y 40 asignaturas con códigos únicos y créditos en rango', () => {
    expect(SEDES).toHaveLength(3);
    expect(ASIGNATURAS).toHaveLength(40);
    expect(new Set(ASIGNATURAS.map((a) => a.codigo)).size).toBe(40);
    for (const { codigo, creditos } of ASIGNATURAS) {
      expect(codigo).toMatch(FORMATO_CODIGO_ASIGNATURA);
      expect(creditos).toBeGreaterThanOrEqual(CREDITOS_MIN);
      expect(creditos).toBeLessThanOrEqual(CREDITOS_MAX);
    }
  });

  it('cubre las 4 carreras del seed (INF/MAT, ADM, ENF, CON)', () => {
    const prefijos = new Set(ASIGNATURAS.map((a) => a.codigo.split('-')[0]));
    expect([...prefijos].sort()).toEqual(['ADM', 'CON', 'ENF', 'INF', 'MAT']);
  });
});

describe('02-sedes y 03-asignaturas en la BD', () => {
  it('siembran todo la primera vez y no duplican al repetirse (idempotente)', async () => {
    const primera = crearContexto();
    await sembrarSedes(primera);
    await sembrarAsignaturas(primera);
    expect(primera.estadisticas).toEqual({ creados: 43, actualizados: 0 });

    const segunda = crearContexto();
    await sembrarSedes(segunda);
    await sembrarAsignaturas(segunda);
    expect(segunda.estadisticas).toEqual({ creados: 0, actualizados: 43 });

    expect(await Sede.countDocuments()).toBe(3);
    expect(await Asignatura.countDocuments()).toBe(40);
    expect((await Sede.findOne({ nombre: 'Sede Sur' })).estado).toBe('en_mantenimiento');
  });
});
