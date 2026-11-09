import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { leerEntorno } from '../../src/config/env.js';
import { SECRETO_DE_PRUEBA, crearAppDePrueba } from './app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from './db.js';

// Estos son los helpers que usará todo el equipo para escribir tests de API. Aquí se prueba que funcionan.

describe('crearAppDePrueba', () => {
  it('usa un secreto de prueba que cumple el contrato (32 caracteres o más)', () => {
    const entorno = { MONGO_URI: 'mongodb://localhost:27017/sga', JWT_SECRET: SECRETO_DE_PRUEBA };

    expect(() => leerEntorno(entorno)).not.toThrow();
  });

  it('crea la app con ese secreto en app.locals', () => {
    expect(crearAppDePrueba().locals.jwtSecret).toBe(SECRETO_DE_PRUEBA);
  });

  it('permite sobrescribir cualquier opción de crearApp', () => {
    const otro = 'otro-secreto-de-al-menos-32-caracteres-x';

    expect(crearAppDePrueba({ jwtSecret: otro }).locals.jwtSecret).toBe(otro);
  });
});

describe('limpiarBase · sin conexión', () => {
  it('falla con un mensaje que dice qué hacer', async () => {
    await expect(limpiarBase()).rejects.toThrow('conectarBaseDePrueba');
  });
});

describe('limpiarBase · con base de datos', () => {
  let Uno;
  let Dos;

  beforeAll(async () => {
    await conectarBaseDePrueba();
    Uno = mongoose.model('ColeccionUnoDePrueba', new mongoose.Schema({ codigo: { type: String, unique: true } }));
    Dos = mongoose.model('ColeccionDosDePrueba', new mongoose.Schema({ texto: String }));
    await Uno.init(); // construye el índice único
  });

  afterAll(desconectarBaseDePrueba);

  it('vacía todas las colecciones', async () => {
    await Uno.create({ codigo: 'X' });
    await Dos.create({ texto: 'hola' });

    await limpiarBase();

    expect(await Uno.countDocuments()).toBe(0);
    expect(await Dos.countDocuments()).toBe(0);
  });

  it('conserva los índices únicos: sigue rechazando un duplicado', async () => {
    await limpiarBase();
    await Uno.create({ codigo: 'X' });

    await expect(Uno.create({ codigo: 'X' })).rejects.toMatchObject({ code: 11000 });
  });
});
