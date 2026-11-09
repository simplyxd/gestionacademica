import '../../src/config/mongoose.js';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Carrera } from '../../src/models/carrera.model.js';
import { Plan } from '../../src/models/plan.model.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const id = () => new mongoose.Types.ObjectId();
const carreraValida = () => ({
  codigo: 'inf', nombre: 'Ingeniería en Informática', sedes: [id()], modalidad: 'presencial', jornada: 'diurna', duracionSemestres: 8,
});

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Promise.all([Carrera.init(), Plan.init()]);
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('Carrera', () => {
  it('normaliza el código y queda activa por defecto', async () => {
    const c = await Carrera.create(carreraValida());
    expect(c.codigo).toBe('INF');
    expect(c.estado).toBe('activa');
  });
  it('código y nombre únicos en la BD', async () => {
    await Carrera.create(carreraValida());
    await expect(Carrera.create({ ...carreraValida(), nombre: 'Otra' })).rejects.toMatchObject({ code: 11000 });
    await expect(Carrera.create({ ...carreraValida(), codigo: 'XYZ', nombre: 'ingenieria en informatica' })).rejects.toMatchObject({ code: 11000 });
  });
  it.each([[{ sedes: [] }], [{ duracionSemestres: 0 }], [{ duracionSemestres: 15 }], [{ duracionSemestres: 7.5 }], [{ modalidad: 'hibrida' }], [{ jornada: 'nocturna' }]])(
    'rechaza %j',
    async (cambio) => {
      await expect(Carrera.create({ ...carreraValida(), ...cambio })).rejects.toMatchObject({ name: 'ValidationError' });
    },
  );
});

describe('Plan', () => {
  it('solo un plan vigente por carrera (índice parcial en BD)', async () => {
    const carreraId = id();
    await Plan.create({ carreraId, nombre: 'Plan 2019', estado: 'historico' });
    await Plan.create({ carreraId, nombre: 'Plan 2024' });
    await expect(Plan.create({ carreraId, nombre: 'Plan 2025' })).rejects.toMatchObject({ code: 11000 });
    await expect(Plan.create({ carreraId, nombre: 'Plan 2018', estado: 'historico' })).resolves.toBeTruthy();
    await expect(Plan.create({ carreraId: id(), nombre: 'Plan 2024' })).resolves.toBeTruthy();
  });
  it('nombre único dentro de la carrera', async () => {
    const carreraId = id();
    await Plan.create({ carreraId, nombre: 'Plan 2019', estado: 'historico' });
    await expect(Plan.create({ carreraId, nombre: 'plan 2019', estado: 'historico' })).rejects.toMatchObject({ code: 11000 });
  });
  it('valida semestre y tipo de cada asignatura', async () => {
    const base = { carreraId: id(), nombre: 'Plan X' };
    await expect(Plan.create({ ...base, asignaturas: [{ asignaturaId: id(), semestre: 0, tipo: 'obligatoria' }] })).rejects.toMatchObject({ name: 'ValidationError' });
    await expect(Plan.create({ ...base, asignaturas: [{ asignaturaId: id(), semestre: 1, tipo: 'libre' }] })).rejects.toMatchObject({ name: 'ValidationError' });
  });
});
