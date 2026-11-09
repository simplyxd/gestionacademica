import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Usuario } from '../../src/models/usuario.model.js';
import * as carreras from '../../src/services/carreras.service.js';
import * as sedesServicio from '../../src/services/sedes.service.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';
import { crearBase, iniciarModelos } from './fixtures.js';
import { como, crearUsuario, reiniciarSecuencia, sinToken } from './http.js';

const ID = '507f1f77bcf86cd799439011';
const originales = { s: sedesServicio.dependencias.contarSeccionesAbiertas, c: carreras.dependencias.contarMatriculas };

beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
  await Usuario.init();
  sedesServicio.dependencias.contarSeccionesAbiertas = async () => 0;
  carreras.dependencias.contarMatriculas = async () => 0;
});
afterEach(async () => {
  reiniciarSecuencia();
  await limpiarBase();
});
afterAll(async () => {
  sedesServicio.dependencias.contarSeccionesAbiertas = originales.s;
  carreras.dependencias.contarMatriculas = originales.c;
  await desconectarBaseDePrueba();
});

const ESCRITURAS = [
  ['post', '/api/sedes'], ['patch', `/api/sedes/${ID}`], ['patch', `/api/sedes/${ID}/estado`],
  ['post', '/api/asignaturas'], ['patch', `/api/asignaturas/${ID}`],
  ['post', '/api/carreras'], ['patch', `/api/carreras/${ID}`], ['patch', `/api/carreras/${ID}/estado`],
  ['post', '/api/planes'], ['patch', `/api/planes/${ID}`], ['patch', `/api/planes/${ID}/estado`], ['put', `/api/planes/${ID}/asignaturas`],
];
const LECTURAS = [
  ['get', '/api/sedes'], ['get', `/api/sedes/${ID}`], ['get', '/api/asignaturas'], ['get', `/api/asignaturas/${ID}`],
  ['get', '/api/carreras'], ['get', `/api/carreras/${ID}`], ['get', '/api/planes'], ['get', `/api/planes/${ID}`], ['get', `/api/planes/${ID}/grafo`],
];
const REPORTES = ['matriculas', 'estudiantes', 'ocupacion', 'cupos', 'carga-docente'].map((r) => ['get', `/api/reportes/${r}`]);

describe('401 sin sesión en todas las rutas', () => {
  it.each([...ESCRITURAS, ...LECTURAS, ...REPORTES])('%s %s', async (metodo, url) => {
    const res = await sinToken(metodo, url);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUT_TOKEN_AUSENTE');
  });
});

describe('403 por rol', () => {
  it.each(ESCRITURAS)('estudiante no escribe: %s %s', async (metodo, url) => {
    const res = await como(await crearUsuario('estudiante'))[metodo](url).send({});
    expect(res.status).toBe(403);
  });
  it.each(REPORTES)('docente no ve reportes: %s %s', async (metodo, url) => {
    expect((await como(await crearUsuario('docente'))[metodo](url)).status).toBe(403);
  });
});

describe('flujo HTTP del coordinador', () => {
  it('lee con cualquier rol y respeta el formato { data, meta }', async () => {
    await crearBase();
    const res = await como(await crearUsuario('estudiante')).get('/api/asignaturas?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 2, total: 4 });
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).not.toHaveProperty('_id');
  });

  it('crea, choca en duplicado (409) y valida la forma (400)', async () => {
    const { norte } = await crearBase();
    const coord = como(await crearUsuario('coordinador', [norte._id]));
    const ok = await coord.post('/api/asignaturas').send({ codigo: 'mat-101', nombre: 'Álgebra', creditos: 6 });
    expect(ok.status).toBe(201);
    expect(ok.body.data.codigo).toBe('MAT-101');

    const dup = await coord.post('/api/asignaturas').send({ codigo: 'MAT-101', nombre: 'Otra', creditos: 6 });
    expect(dup.status).toBe(409);
    expect(dup.body).toMatchObject({ code: 'ASG_CODIGO_DUPLICADO', regla: null });

    const mala = await coord.post('/api/asignaturas').send({ codigo: 'MAT-102', nombre: 'X y', creditos: 40 });
    expect(mala.status).toBe(400);
    expect(mala.body.code).toBe('GEN_DATOS_INVALIDOS');
  });

  it('no deja colar campos fuera del esquema (rol, estado, ...)', async () => {
    const { norte } = await crearBase();
    const coord = como(await crearUsuario('coordinador', [norte._id]));
    const res = await coord.post('/api/sedes').send({ nombre: 'Sede Este', direccion: 'Calle 9', comuna: 'Talca', inventado: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data).not.toHaveProperty('inventado');
  });

  it('sede de otro coordinador → 404; inactivar con carreras activas → 422', async () => {
    const { norte, sur } = await crearBase();
    const coord = como(await crearUsuario('coordinador', [norte._id]));
    expect((await coord.patch(`/api/sedes/${sur.id}`).send({ comuna: 'X y' })).status).toBe(404);
    const res = await coord.patch(`/api/sedes/${norte.id}/estado`).send({ estado: 'inactiva' });
    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ code: 'SED_CON_DEPENDENCIAS', regla: 'Sede sin carreras ni secciones activas' });
  });

  it('PUT asignaturas del plan: el ciclo responde 422 con el camino', async () => {
    const { norte, inf, asignaturas } = await crearBase();
    const coord = como(await crearUsuario('coordinador', [norte._id]));
    const plan = await coord.post('/api/planes').send({ carreraId: inf.id, nombre: 'Plan 2024' });
    expect(plan.status).toBe(201);
    const [A, B] = asignaturas.map((a) => a.id);
    const res = await coord.put(`/api/planes/${plan.body.data.id}/asignaturas`).send({
      asignaturas: [
        { asignaturaId: A, semestre: 1, tipo: 'obligatoria', prerrequisitos: [B] },
        { asignaturaId: B, semestre: 2, tipo: 'obligatoria', prerrequisitos: [A] },
      ],
    });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('PLN_CICLO_PREREQUISITOS');
    expect(res.body.details.camino).toBe('TST-100 → TST-101 → TST-100');

    const ok = await coord.put(`/api/planes/${plan.body.data.id}/asignaturas`).send({
      asignaturas: [{ asignaturaId: A, semestre: 1, tipo: 'obligatoria' }, { asignaturaId: B, semestre: 2, tipo: 'electiva', prerrequisitos: [A] }],
    });
    expect(ok.status).toBe(200);
    const grafo = await coord.get(`/api/planes/${plan.body.data.id}/grafo`);
    expect(grafo.body.data.aristas).toEqual([{ desde: B, hacia: A }]);
  });

  it('el admin también escribe estructura y sin límite de sedes', async () => {
    const { sur } = await crearBase();
    const adm = como(await crearUsuario('admin'));
    expect((await adm.post('/api/sedes').send({ nombre: 'Sede Este', direccion: 'Calle 9', comuna: 'Talca' })).status).toBe(201);
    expect((await adm.patch(`/api/sedes/${sur.id}`).send({ comuna: 'Chillán' })).status).toBe(200);
  });

  it('reportes: admin y coordinador entran; filtro inválido → 400', async () => {
    await crearBase();
    expect((await como(await crearUsuario('admin')).get('/api/reportes/ocupacion')).status).toBe(200);
    const res = await como(await crearUsuario('coordinador')).get('/api/reportes/matriculas?estado=activa');
    expect(res.status).toBe(400);
  });
});
