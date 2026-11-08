import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ErrorDeSemilla, ejecutarSemillas, listarSemillas } from '../../src/seed/runner.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// Contrato del seed: archivos NN-nombre.js en una carpeta, que se ejecutan en orden numérico y son idempotentes.
// Cada archivo exporta por defecto una función async que recibe { upsertPorClave, resolver, log }.
// Decisión 4A: si un archivo falla, el runner se detiene en ese, dice cuál y por qué.

const carpeta = (nombre) => fileURLToPath(new URL(`./fixtures/${nombre}/`, import.meta.url));

let Sede;
let Carrera;

beforeAll(async () => {
  await conectarBaseDePrueba();
  Sede = mongoose.model(
    'SedeDeSemilla',
    new mongoose.Schema({ codigo: { type: String, unique: true }, nombre: String, estado: { type: String, enum: ['activa', 'inactiva'] } }),
  );
  Carrera = mongoose.model(
    'CarreraDeSemilla',
    new mongoose.Schema({ codigo: { type: String, unique: true }, nombre: String, sede: mongoose.Schema.Types.ObjectId }),
  );
  await Promise.all([Sede.init(), Carrera.init()]);
});

afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('listarSemillas', () => {
  it('lista solo los archivos NN-nombre.js, en orden', async () => {
    expect(await listarSemillas(carpeta('ok'))).toEqual(['01-sedes.js', '02-carreras.js', '10-final.js']);
  });

  it('rechaza dos archivos con el mismo número, porque el orden quedaría ambiguo', async () => {
    await expect(listarSemillas(carpeta('repetida'))).rejects.toThrow('01-');
  });

  it('falla con un mensaje claro si la carpeta no existe', async () => {
    await expect(listarSemillas(carpeta('no-existe'))).rejects.toThrow('no-existe');
  });
});

describe('ejecutarSemillas', () => {
  it('ejecuta los archivos en orden numérico y resume cuántos registros creó cada uno', async () => {
    const mensajes = [];

    const resumen = await ejecutarSemillas({ directorio: carpeta('ok'), log: (m) => mensajes.push(m) });

    expect(resumen).toEqual([
      { archivo: '01-sedes.js', creados: 2, actualizados: 0 },
      { archivo: '02-carreras.js', creados: 1, actualizados: 0 },
      { archivo: '10-final.js', creados: 0, actualizados: 0 },
    ]);
    expect(mensajes.join('\n')).toContain('01-sedes.js: 2 creados, 0 actualizados');
    expect(await Sede.countDocuments()).toBe(2);
  });

  it('resuelve referencias entre archivos por clave natural (la carrera apunta a la sede por su código)', async () => {
    await ejecutarSemillas({ directorio: carpeta('ok'), log: () => {} });

    const sede = await Sede.findOne({ codigo: 'SCL' });
    const carrera = await Carrera.findOne({ codigo: 'INF' });

    expect(carrera.sede.toString()).toBe(sede.id);
  });

  it('es idempotente: correrlo dos veces no duplica nada', async () => {
    await ejecutarSemillas({ directorio: carpeta('ok'), log: () => {} });

    const segunda = await ejecutarSemillas({ directorio: carpeta('ok'), log: () => {} });

    expect(segunda.map((r) => r.creados)).toEqual([0, 0, 0]);
    expect(segunda.map((r) => r.actualizados)).toEqual([2, 1, 0]);
    expect(await Sede.countDocuments()).toBe(2);
    expect(await Carrera.countDocuments()).toBe(1);
  });

  it('muestra los mensajes que escribe cada archivo con su log', async () => {
    const mensajes = [];

    await ejecutarSemillas({ directorio: carpeta('ok'), log: (m) => mensajes.push(m) });

    expect(mensajes.join('\n')).toContain('sedes listas');
    expect(mensajes.join('\n')).toContain('listo');
  });

  it('con una carpeta sin semillas avisa y no hace nada', async () => {
    const mensajes = [];

    const resumen = await ejecutarSemillas({ directorio: carpeta('vacia'), log: (m) => mensajes.push(m) });

    expect(resumen).toEqual([]);
    expect(mensajes.join('\n')).toContain('No hay archivos de semilla');
  });

  it('se detiene en el primer archivo que falla, dice cuál y por qué, y no ejecuta los siguientes (4A)', async () => {
    const error = await ejecutarSemillas({ directorio: carpeta('falla'), log: () => {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorDeSemilla);
    expect(error.archivo).toBe('02-mal.js');
    expect(error.message).toContain('02-mal.js');
    expect(error.message).toContain('boom');
    expect(await Sede.findOne({ codigo: 'A1' })).not.toBeNull(); // lo anterior quedó hecho
    expect(await Sede.findOne({ codigo: 'NOCORRE' })).toBeNull(); // lo siguiente no corrió
  });

  it('exige que cada archivo exporte por defecto una función', async () => {
    const error = await ejecutarSemillas({ directorio: carpeta('sin-funcion'), log: () => {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorDeSemilla);
    expect(error.message).toContain('01-roto.js');
    expect(error.message).toContain('función');
  });
});
