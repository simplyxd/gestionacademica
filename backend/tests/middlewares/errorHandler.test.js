import express from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { crearApp } from '../../src/app.js';
import { AppError } from '../../src/errors/AppError.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';

// Contrato de error (plano): { code, regla, message, details? }.
// Se traducen errores de Mongoose y de JWT sin filtrar detalles internos (JUA-2, D-09, D-14).

const Modelo = mongoose.model(
  'ModeloDePruebaDeErrores',
  new mongoose.Schema({
    nombre: { type: String, required: true },
    estado: { type: String, enum: ['activo', 'inactivo'] },
  }),
);

/** App mínima cuya única ruta falla con el error indicado. */
function appQueFallaCon(error) {
  const app = express();
  app.get('/falla', (req, res, next) => next(error));
  app.use(errorHandler);
  return app;
}

const pedir = (error) => request(appQueFallaCon(error)).get('/falla');
const silenciarConsola = () => vi.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => vi.restoreAllMocks());

describe('errorHandler · AppError', () => {
  it('responde con el status y el formato plano del contrato', async () => {
    const res = await pedir(
      new AppError(422, 'INS_SIN_CUPO', 'La sección MAT-101 A está llena (30/30).', {
        regla: 'Cupo disponible',
        details: { cupo: { inscritos: 30, maximo: 30 } },
      }),
    );

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({
      code: 'INS_SIN_CUPO',
      regla: 'Cupo disponible',
      message: 'La sección MAT-101 A está llena (30/30).',
      details: { cupo: { inscritos: 30, maximo: 30 } },
    });
  });

  it('pone regla en null y omite details cuando no los hay', async () => {
    const res = await pedir(new AppError(404, 'SED_NO_ENCONTRADA', 'La sede no existe.'));

    expect(res.body).toEqual({ code: 'SED_NO_ENCONTRADA', regla: null, message: 'La sede no existe.' });
    expect(res.body).not.toHaveProperty('details');
  });

  it('no escribe en el registro de errores cuando es un 4xx esperado', async () => {
    const consola = silenciarConsola();

    await pedir(new AppError(409, 'SED_CODIGO_DUPLICADO', 'Ya existe una sede con ese código.'));

    expect(consola).not.toHaveBeenCalled();
  });
});

describe('errorHandler · errores de Mongoose', () => {
  it('traduce un ValidationError a 400 sin filtrar el texto interno de Mongoose', async () => {
    const error = await new Modelo({ estado: 'otro' }).validate().catch((e) => e);

    const res = await pedir(error);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('GEN_DATOS_INVALIDOS');
    expect(res.body.regla).toBeNull();
    expect(res.body.message).toContain('nombre');
    expect(res.body.details.campos).toHaveLength(2);
    expect(res.body.details.campos).toEqual(
      expect.arrayContaining([
        { campo: 'nombre', motivo: 'es obligatorio' },
        { campo: 'estado', motivo: 'no es un valor permitido' },
      ]),
    );
    expect(JSON.stringify(res.body)).not.toContain('Path `');
  });

  it('traduce un CastError (identificador mal formado) a 400 y lo llama "id", no "_id"', async () => {
    const res = await pedir(new mongoose.Error.CastError('ObjectId', 'abc', '_id'));

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      code: 'GEN_ID_INVALIDO',
      regla: null,
      message: 'El valor de «id» no tiene un formato válido.',
      details: { campo: 'id' },
    });
    expect(JSON.stringify(res.body)).not.toContain('abc');
  });

  it('traduce un duplicado (E11000) a 409 sin revelar el valor ni la colección', async () => {
    const error = Object.assign(
      new Error('E11000 duplicate key error collection: sga.sedes index: codigo_1 dup key: { codigo: "VALOR_EXISTENTE" }'),
      { name: 'MongoServerError', code: 11000, keyValue: { codigo: 'VALOR_EXISTENTE' } },
    );

    const res = await pedir(error);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      code: 'GEN_DUPLICADO',
      regla: null,
      message: 'Ya existe un registro con el mismo valor de: codigo.',
      details: { campos: ['codigo'] },
    });
    const texto = JSON.stringify(res.body);
    expect(texto).not.toContain('VALOR_EXISTENTE');
    expect(texto).not.toContain('E11000');
    expect(texto).not.toContain('sga.sedes');
  });
});

describe('errorHandler · errores de JWT', () => {
  it('traduce un token vencido a 401', async () => {
    const error = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });

    const res = await pedir(error);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: 'AUT_TOKEN_VENCIDO', regla: null, message: 'Tu sesión venció. Inicia sesión de nuevo.' });
  });

  it.each(['JsonWebTokenError', 'NotBeforeError'])('traduce %s a 401 sin repetir el mensaje original', async (nombre) => {
    const error = Object.assign(new Error('invalid signature'), { name: nombre });

    const res = await pedir(error);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUT_TOKEN_INVALIDO');
    expect(JSON.stringify(res.body)).not.toContain('invalid signature');
  });
});

describe('errorHandler · errores inesperados y de petición', () => {
  it('responde 500 genérico y no filtra el mensaje ni la traza del error', async () => {
    const consola = silenciarConsola();
    const error = new Error('fallo interno con password=123');

    const res = await pedir(error);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      code: 'GEN_ERROR_INTERNO',
      regla: null,
      message: 'Ocurrió un error inesperado. Intenta de nuevo más tarde.',
    });
    expect(JSON.stringify(res.body)).not.toContain('password=123');
    expect(consola).toHaveBeenCalledWith(error);
  });

  it('también registra un AppError de status 5xx', async () => {
    const consola = silenciarConsola();

    const res = await pedir(new AppError(503, 'GEN_SERVICIO_NO_DISPONIBLE', 'El servicio no está disponible.'));

    expect(res.status).toBe(503);
    expect(consola).toHaveBeenCalledTimes(1);
  });

  it('conserva el status de un error 4xx de Express y lo describe sin repetir su texto', async () => {
    const error = Object.assign(new Error('unsupported charset "UTF-1"'), { status: 415, expose: true });

    const res = await pedir(error);

    expect(res.status).toBe(415);
    expect(res.body).toEqual({ code: 'GEN_PETICION_INVALIDA', regla: null, message: 'La petición no se pudo procesar.' });
  });
});

describe('app completa · rutas inexistentes y cuerpos inválidos', () => {
  it('responde 404 en JSON (no HTML) para una ruta que no existe', async () => {
    const res = await request(crearApp()).get('/api/inexistente');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({
      code: 'GEN_RUTA_NO_ENCONTRADA',
      regla: null,
      message: 'La ruta GET /api/inexistente no existe.',
    });
  });

  it('no repite la query string en el mensaje del 404', async () => {
    const res = await request(crearApp()).get('/api/inexistente?token=SECRETO_EN_QUERY');

    expect(JSON.stringify(res.body)).not.toContain('SECRETO_EN_QUERY');
  });

  it('responde 413 en JSON cuando el body supera el límite', async () => {
    const res = await request(crearApp()).post('/api/health').send({ texto: 'x'.repeat(150 * 1024) });

    expect(res.status).toBe(413);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({
      code: 'GEN_BODY_DEMASIADO_GRANDE',
      regla: null,
      message: 'El cuerpo de la petición supera el tamaño máximo permitido.',
    });
  });

  it('responde 400 en JSON cuando el body no es un JSON válido', async () => {
    const res = await request(crearApp()).post('/api/health').set('Content-Type', 'application/json').send('{"mal": ');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      code: 'GEN_JSON_INVALIDO',
      regla: null,
      message: 'El cuerpo de la petición no es un JSON válido.',
    });
  });
});
