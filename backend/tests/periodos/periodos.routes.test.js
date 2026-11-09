import { createHmac } from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Periodo } from '../../src/models/periodo.model.js';
import { Usuario } from '../../src/models/usuario.model.js';
import { crearAppDePrueba, SECRETO_DE_PRUEBA } from '../helpers/app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const app = crearAppDePrueba();

function tokenDe(usuario) {
  const encabezado = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const ahora = Math.floor(Date.now() / 1000);
  const cuerpo = Buffer.from(
    JSON.stringify({ sub: usuario.id, rol: usuario.rol, sedes: [], iat: ahora, exp: ahora + 3600 }),
  ).toString('base64url');
  const firma = createHmac('sha256', SECRETO_DE_PRUEBA).update(`${encabezado}.${cuerpo}`).digest('base64url');
  return `${encabezado}.${cuerpo}.${firma}`;
}

beforeAll(conectarBaseDePrueba);
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('GET /api/periodos', () => {
  it('exige sesión', async () => {
    const res = await request(app).get('/api/periodos');
    expect(res.status).toBe(401);
  });

  it('lista los períodos para el docente, con id, código, nombre y estado', async () => {
    const docente = await Usuario.create({
      rut: '16666666-K',
      nombre: 'Docente Demo',
      correo: 'docente@iunf.cl',
      passwordHash: '$2a$12$relleno.relleno.relleno.relleno.relleno.relleno.rellen',
      rol: 'docente',
      sedes: [new mongoose.Types.ObjectId()],
      incorporacion: '2024-03-01',
      perfilDocente: { tipoVinculo: 'planta', especialidad: 'Informática', departamentos: [] },
    });
    await Periodo.create({
      codigo: '2026-1',
      nombre: 'Primer semestre 2026',
      inicio: '2026-03-01',
      termino: '2026-07-15',
      inscripcionInicio: '2026-02-01',
      inscripcionTermino: '2026-02-28',
      estado: 'en_curso',
    });

    const res = await request(app).get('/api/periodos').set('Authorization', `Bearer ${tokenDe(docente)}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        codigo: '2026-1',
        nombre: 'Primer semestre 2026',
        estado: 'en_curso',
      }),
    ]);
    expect(res.body.meta.total).toBe(1);
  });
});
