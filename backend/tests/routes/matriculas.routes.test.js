import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { crearApp } from '../../src/app.js';
import Matricula from '../../src/models/matricula.model.js';
import { MTR } from '../../src/errors/codigos/matriculas.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const app = crearApp();
const id = () => new mongoose.Types.ObjectId();
const nueva = (over = {}) => ({ estudianteId: id(), carreraId: id(), planId: id(), periodoId: id(), ...over });

describe('routes/matriculas', () => {
  beforeAll(conectarBaseDePrueba);
  afterEach(limpiarBase);
  afterAll(desconectarBaseDePrueba);

  it('GET /api/matriculas lista con data y meta', async () => {
    await Matricula.create([nueva(), nueva()]);
    const res = await request(app).get('/api/matriculas');

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 2 });
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/matriculas valida query de estado', async () => {
    const res = await request(app).get('/api/matriculas?estado=congelada');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('GEN_DATOS_INVALIDOS');
    expect(res.body.details.campos).toEqual([{ campo: 'estado', motivo: 'estado debe ser uno de: vigente, suspendida, egresada, retirada' }]);
  });

  it('PATCH /api/matriculas/:id/estado cambia el estado permitido', async () => {
    const base = await Matricula.create(nueva({ estado: 'vigente' }));
    const res = await request(app).patch(`/api/matriculas/${base.id}/estado`).send({ estado: 'suspendida' });

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('suspendida');
  });

  it('PATCH /api/matriculas/:id/estado devuelve 409 para transición inválida', async () => {
    const base = await Matricula.create(nueva({ estado: 'suspendida' }));
    const res = await request(app).patch(`/api/matriculas/${base.id}/estado`).send({ estado: 'egresada' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(MTR.TRANSICION_INVALIDA);
  });

  it('PATCH /api/matriculas/:id/estado devuelve 404 si no existe', async () => {
    const res = await request(app).patch(`/api/matriculas/${id()}/estado`).send({ estado: 'suspendida' });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe(MTR.NO_ENCONTRADA);
  });
});
