import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { crearContexto } from '../../src/seed/lib.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// Decisión (2A): el seed trabaja con modelos de Mongoose, así que se aplican validaciones, valores por defecto y fechas.
// upsertPorClave = "actualiza si ya existe, inserta si no", buscando por clave natural (código, RUT, correo).

let Sede;

beforeAll(async () => {
  await conectarBaseDePrueba();
  Sede = mongoose.model(
    'SedeParaLib',
    new mongoose.Schema(
      { codigo: { type: String, unique: true }, nombre: String, estado: { type: String, enum: ['activa', 'inactiva'] } },
      { timestamps: true },
    ),
  );
  await Sede.init(); // construye el índice único
});

afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('upsertPorClave', () => {
  it('crea el registro si no existe, con la clave y los datos', async () => {
    const { upsertPorClave } = crearContexto();

    const sede = await upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });

    expect(sede.codigo).toBe('SCL');
    expect(sede.nombre).toBe('Santiago');
    expect(sede.createdAt).toBeInstanceOf(Date);
    expect(await Sede.countDocuments()).toBe(1);
  });

  it('actualiza el mismo registro si ya existe, sin duplicar', async () => {
    const { upsertPorClave } = crearContexto();
    const primera = await upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });

    const segunda = await upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago Centro', estado: 'activa' });

    expect(segunda.id).toBe(primera.id);
    expect(segunda.nombre).toBe('Santiago Centro');
    expect(await Sede.countDocuments()).toBe(1);
  });

  it('es idempotente: repetir la misma llamada deja lo mismo', async () => {
    const { upsertPorClave } = crearContexto();

    for (let i = 0; i < 3; i += 1) {
      await upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });
    }

    expect(await Sede.countDocuments()).toBe(1);
  });

  it('cuenta cuántos registros creó y cuántos actualizó', async () => {
    const contexto = crearContexto();

    await contexto.upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });
    await contexto.upsertPorClave(Sede, { codigo: 'VLP' }, { nombre: 'Valparaíso', estado: 'activa' });
    await contexto.upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });

    expect(contexto.estadisticas).toEqual({ creados: 2, actualizados: 1 });
  });

  it('respeta las validaciones del modelo', async () => {
    const { upsertPorClave } = crearContexto();

    await expect(upsertPorClave(Sede, { codigo: 'X' }, { nombre: 'X', estado: 'otro' })).rejects.toMatchObject({
      name: 'ValidationError',
    });
    expect(await Sede.countDocuments()).toBe(0);
  });

  it.each([{}, null, undefined, [], 'SCL', { codigo: undefined }, { codigo: null }, { codigo: '' }])(
    'rechaza la clave %j: una clave vacía podría tocar un registro cualquiera',
    async (clave) => {
      const { upsertPorClave } = crearContexto();
      await Sede.create({ codigo: 'EXISTENTE', nombre: 'No se debe tocar', estado: 'activa' });

      await expect(upsertPorClave(Sede, clave, { nombre: 'Pisado' })).rejects.toThrow(TypeError);

      expect((await Sede.findOne({ codigo: 'EXISTENTE' })).nombre).toBe('No se debe tocar');
    },
  );
});

describe('resolver', () => {
  it('devuelve el _id del registro buscado por su clave natural', async () => {
    const { resolver } = crearContexto();
    const sede = await Sede.create({ codigo: 'SCL', nombre: 'Santiago', estado: 'activa' });

    expect((await resolver(Sede, { codigo: 'SCL' })).toString()).toBe(sede.id);
  });

  it('si no existe, falla nombrando el modelo y la clave, y sugiere revisar el orden de los archivos', async () => {
    const { resolver } = crearContexto();

    const error = await resolver(Sede, { codigo: 'NO-EXISTE' }).catch((e) => e);

    expect(error.message).toContain('SedeParaLib');
    expect(error.message).toContain('NO-EXISTE');
    expect(error.message).toContain('antes');
  });

  it('si la clave coincide con más de un registro, falla por ambigua', async () => {
    const { resolver } = crearContexto();
    await Sede.create({ codigo: 'A', nombre: 'A', estado: 'activa' });
    await Sede.create({ codigo: 'B', nombre: 'B', estado: 'activa' });

    await expect(resolver(Sede, { estado: 'activa' })).rejects.toThrow('ambigua');
  });

  it('rechaza una clave vacía', async () => {
    const { resolver } = crearContexto();

    await expect(resolver(Sede, {})).rejects.toThrow(TypeError);
  });
});
