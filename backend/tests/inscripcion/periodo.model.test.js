import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Periodo } from '../../src/models/periodo.model.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const base = {
  codigo: '2026-2',
  nombre: 'Segundo semestre 2026',
  inicio: '2026-08-01',
  termino: '2026-12-15',
  inscripcionInicio: '2026-07-20',
  inscripcionTermino: '2026-08-10',
};

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Periodo.init();
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('modelo Periodo', () => {
  it('guarda un período válido y parte en planificacion', async () => {
    const p = await Periodo.create(base);
    expect(p.estado).toBe('planificacion');
    expect(p.toJSON().id).toBeTypeOf('string');
  });

  it('acepta que la inscripción abra antes del inicio del semestre (D-01)', async () => {
    await expect(Periodo.create(base)).resolves.toBeTruthy();
  });

  it('rechaza un código con formato malo', async () => {
    await expect(Periodo.create({ ...base, codigo: '2026-B' })).rejects.toThrow(/AAAA-S/);
  });

  it('rechaza término antes del inicio', async () => {
    await expect(Periodo.create({ ...base, termino: '2026-07-01' })).rejects.toThrow(/debe ser después del inicio/);
  });

  it('rechaza cierre de inscripción antes de la apertura', async () => {
    await expect(Periodo.create({ ...base, inscripcionTermino: '2026-07-01' })).rejects.toThrow(/no puede ser antes de la apertura/);
  });

  it('rechaza cierre de inscripción después del término', async () => {
    await expect(Periodo.create({ ...base, inscripcionTermino: '2026-12-31' })).rejects.toThrow(/después del término/);
  });

  it('no permite dos períodos con el mismo código', async () => {
    await Periodo.create(base);
    await expect(Periodo.create({ ...base, nombre: 'otro' })).rejects.toMatchObject({ code: 11000 });
  });

  it('no permite dos períodos en_curso a la vez (índice parcial, D-03)', async () => {
    await Periodo.create({ ...base, codigo: '2026-1', estado: 'en_curso' });
    await expect(Periodo.create({ ...base, estado: 'en_curso' })).rejects.toMatchObject({ code: 11000 });
  });

  it('sí permite varios períodos cerrados', async () => {
    await Periodo.create({ ...base, codigo: '2025-1', estado: 'cerrado' });
    await expect(Periodo.create({ ...base, codigo: '2025-2', estado: 'cerrado' })).resolves.toBeTruthy();
  });
});
