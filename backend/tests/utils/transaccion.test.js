import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors/AppError.js';
import { Bloqueo } from '../../src/models/bloqueo.model.js';
import { ErrorDeTransaccion, claveDeBloqueo, conTransaccion } from '../../src/utils/transaccion.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// Utilidad compartida para los endpoints que "validan y luego insertan" (choque de docente de Diego, cupo de Matias).
// Se comprobó con un experimento que UNA TRANSACCIÓN SOLA NO ALCANZA: aquí queda como prueba ejecutable.

const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

describe('claveDeBloqueo', () => {
  it('une las partes con dos puntos', () => {
    expect(claveDeBloqueo('docente', 'D1', 'periodo', 'P1')).toBe('docente:D1:periodo:P1');
  });

  it('acepta números y los convierte a texto', () => {
    expect(claveDeBloqueo('docente', 7)).toBe('docente:7');
  });

  it.each([[undefined], [null], ['']])('rechaza una parte vacía (%j): una clave con "undefined" bloquearía a todos por igual', (parte) => {
    expect(() => claveDeBloqueo('docente', parte)).toThrow(TypeError);
  });

  it('rechaza una clave sin partes', () => {
    expect(() => claveDeBloqueo()).toThrow(TypeError);
  });
});

describe('conTransaccion', () => {
  let Seccion;
  let Contador;

  beforeAll(async () => {
    await conectarBaseDePrueba();
    Seccion = mongoose.model(
      'SeccionDeTransaccion',
      new mongoose.Schema({ docenteId: String, periodoId: String, dia: Number, inicioMin: Number, finMin: Number, nombre: String }),
    );
    Contador = mongoose.model('ContadorDeTransaccion', new mongoose.Schema({ _id: String, n: Number }));
    await Seccion.init();
    await Contador.init();
  });

  afterEach(limpiarBase);
  afterAll(desconectarBaseDePrueba);

  /** Crea una sección solo si no choca con otra del mismo docente y período (lunes 10:00-11:30). Devuelve 'creada' o 'rechazada'. */
  function crearSiNoChoca(nombre, { conBloqueo }) {
    return conTransaccion(
      async (sesion) => {
        const choca = await Seccion.exists({ docenteId: 'D1', periodoId: 'P1', dia: 0, inicioMin: { $lt: 690 }, finMin: { $gt: 600 } }).session(sesion);
        if (choca) {
          throw new AppError(422, 'SEC_CHOQUE_DOCENTE', 'El docente ya tiene una sección en ese horario.', { regla: 'Sin choque de docente' });
        }
        await pausa(300); // ensancha la ventana de carrera para que el choque sea reproducible
        await Seccion.create([{ docenteId: 'D1', periodoId: 'P1', dia: 0, inicioMin: 600, finMin: 690, nombre }], { session: sesion });
      },
      { bloqueos: conBloqueo ? [claveDeBloqueo('docente', 'D1', 'periodo', 'P1')] : [] },
    ).then(
      () => 'creada',
      (error) => (error instanceof AppError ? 'rechazada' : Promise.reject(error)),
    );
  }

  it('devuelve lo que retorna el trabajo y confirma lo escrito', async () => {
    const resultado = await conTransaccion(async (sesion) => {
      await Seccion.create([{ docenteId: 'D1', periodoId: 'P1', nombre: 'A' }], { session: sesion });
      return 'listo';
    });

    expect(resultado).toBe('listo');
    expect(await Seccion.countDocuments()).toBe(1);
  });

  it('le entrega al trabajo una sesión con la transacción abierta', async () => {
    expect(await conTransaccion(async (sesion) => sesion.inTransaction())).toBe(true);
  });

  it('si el trabajo falla, deshace todo y relanza el mismo error', async () => {
    const error = new AppError(422, 'SEC_CHOQUE_DOCENTE', 'Choca.');

    await expect(
      conTransaccion(async (sesion) => {
        await Seccion.create([{ docenteId: 'D1', periodoId: 'P1', nombre: 'A' }], { session: sesion });
        throw error;
      }),
    ).rejects.toBe(error);

    expect(await Seccion.countDocuments()).toBe(0);
  });

  it('reintenta solo ante un conflicto de escritura: dos transacciones que actualizan lo mismo terminan las dos', async () => {
    await Contador.create({ _id: 'c', n: 0 });
    const sumar = () =>
      conTransaccion(async (sesion) => {
        const actual = await Contador.findById('c').session(sesion);
        await pausa(100);
        await Contador.updateOne({ _id: 'c' }, { $set: { n: actual.n + 1 } }, { session: sesion });
      });

    await Promise.all([sumar(), sumar()]);

    expect((await Contador.findById('c')).n).toBe(2); // sin reintento una suma se perdería
  });

  it('SIN bloqueo, dos creaciones simultáneas que chocan se guardan las dos: una transacción sola no basta', async () => {
    const resultados = await Promise.all([crearSiNoChoca('Sección A', { conBloqueo: false }), crearSiNoChoca('Sección B', { conBloqueo: false })]);

    expect(resultados).toEqual(['creada', 'creada']);
    expect(await Seccion.countDocuments()).toBe(2); // el invariante «sin choque de docente» quedó roto
  });

  it('CON bloqueo por docente y período, se guarda una sola y la otra se rechaza por choque', async () => {
    const resultados = await Promise.all([crearSiNoChoca('Sección A', { conBloqueo: true }), crearSiNoChoca('Sección B', { conBloqueo: true })]);

    expect(resultados.sort()).toEqual(['creada', 'rechazada']);
    expect(await Seccion.countDocuments()).toBe(1);
  });

  it('el bloqueo funciona la primera vez, aunque su documento todavía no exista, y no se duplica', async () => {
    expect(await Bloqueo.countDocuments()).toBe(0);

    await Promise.all([crearSiNoChoca('Sección A', { conBloqueo: true }), crearSiNoChoca('Sección B', { conBloqueo: true })]);

    expect(await Seccion.countDocuments()).toBe(1);
    expect(await Bloqueo.countDocuments({ clave: 'docente:D1:periodo:P1' })).toBe(1);
  });

  it('puede tomar varias claves de bloqueo a la vez, aunque se repitan', async () => {
    const a = claveDeBloqueo('docente', 'D1');
    const b = claveDeBloqueo('docente', 'D2');

    await conTransaccion(async () => undefined, { bloqueos: [b, a, a] });

    const claves = (await Bloqueo.find().sort({ clave: 1 })).map((bloqueo) => bloqueo.clave);
    expect(claves).toEqual([a, b]);
    expect((await Bloqueo.findOne({ clave: a })).version).toBe(1); // la clave repetida se toma una sola vez
  });

  it.each([[''], [undefined], [42]])('rechaza una clave de bloqueo que no es un texto con valor (%j)', async (clave) => {
    await expect(conTransaccion(async () => undefined, { bloqueos: [clave] })).rejects.toThrow(TypeError);
  });
});

describe('conTransaccion · MongoDB sin replica set', () => {
  let servidor;
  let conexion;

  beforeAll(async () => {
    servidor = await MongoMemoryServer.create(); // un mongod suelto, como el que se instala por defecto
    conexion = await mongoose.createConnection(servidor.getUri()).asPromise();
  });

  afterAll(async () => {
    await conexion.close();
    await servidor.stop();
  });

  it('falla con un mensaje que explica cómo levantar un replica set, no con el error confuso de Mongo', async () => {
    const error = await conTransaccion(
      async (sesion) => {
        await conexion.db.collection('prueba').insertOne({ a: 1 }, { session: sesion });
      },
      { conexion },
    ).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorDeTransaccion);
    expect(error.message).toContain('replica set');
    expect(error.message).toContain('rs.initiate()');
    expect(error.cause).toBeDefined();
  });
});
