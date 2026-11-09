import crypto from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import '../../src/app.js';
import { CLAVE_PARAMETROS, Parametros } from '../../src/models/parametros.model.js';
import { Usuario } from '../../src/models/usuario.model.js';
import { PAR } from '../../src/errors/codigos/parametros.js';
import request from 'supertest';
import { crearAppDePrueba, SECRETO_DE_PRUEBA } from '../helpers/app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// HS256 a mano para no depender de quién instale jsonwebtoken. authenticate verifica este token
// con el secreto de prueba y recarga el usuario: el rol sale de la base, no del body.

const HASH_DE_RELLENO = '$2a$12$relleno.relleno.relleno.relleno.relleno.relleno.rellen';

function base64url(valor) {
  return Buffer.from(valor).toString('base64url');
}

function firmar(usuario) {
  const ahora = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const cuerpo = base64url(JSON.stringify({
    sub: usuario._id.toString(),
    rol: usuario.rol,
    sedes: [],
    iat: ahora,
    exp: ahora + 3600,
  }));
  const firma = crypto.createHmac('sha256', SECRETO_DE_PRUEBA).update(`${header}.${cuerpo}`).digest('base64url');
  return `${header}.${cuerpo}.${firma}`;
}

function cuenta(parcial) {
  return {
    rut: '12345678-5',
    nombre: 'Ana Pérez',
    correo: 'ana.par@iunf.cl',
    telefono: '+56 9 5555 0199',
    passwordHash: HASH_DE_RELLENO,
    rol: 'admin',
    incorporacion: '2024-03-01',
    ...parcial,
  };
}

function parametrosValidos(parcial = {}) {
  return {
    nombreInstitucion: 'Instituto Universitario Nueva Formación',
    nombreCorto: 'IUNF',
    siglasPortal: 'SGA',
    correoContacto: 'mesa.ayuda@iunf.cl',
    telefonoMesa: '+56 2 2345 6789',
    zonaHoraria: 'America/Santiago',
    mensajeBienvenida: 'Bienvenido al portal académico.',
    duracionSesionMinutos: 45,
    permitirRecuperacionClave: true,
    mostrarCodigoAsignaturaEnTablas: true,
    ...parcial,
  };
}

const app = crearAppDePrueba();

describe('parámetros institucionales', () => {
  let tokenAdmin;
  let tokenDocente;

  beforeAll(async () => {
    await conectarBaseDePrueba();
    await Usuario.init();
    await Parametros.init();
  });

  beforeEach(async () => {
    await limpiarBase();
    const admin = await Usuario.create(cuenta({ rol: 'admin', correo: 'admin.par@iunf.cl', rut: '12345678-5' }));
    const docente = await Usuario.create(cuenta({ rol: 'docente', correo: 'docente.par@iunf.cl', rut: '16666666-K' }));
    tokenAdmin = firmar(admin);
    tokenDocente = firmar(docente);
  });

  afterAll(desconectarBaseDePrueba);

  const como = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

  it('responde 401 si no hay token', async () => {
    const lectura = await request(app).get('/api/parametros');
    const escritura = await request(app).put('/api/parametros').send(parametrosValidos());

    expect(lectura.status).toBe(401);
    expect(escritura.status).toBe(401);
    expect(await Parametros.countDocuments()).toBe(0);
  });

  it('un docente recibe solo lo público: sin correoContacto ni el resto', async () => {
    await request(app).put('/api/parametros').set(como(tokenAdmin)).send(parametrosValidos());

    const res = await request(app).get('/api/parametros').set(como(tokenDocente));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        nombreInstitucion: 'Instituto Universitario Nueva Formación',
        siglasPortal: 'SGA',
        duracionSesionMinutos: 45,
      },
    });
    expect(res.body.data).not.toHaveProperty('correoContacto');
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('un admin recibe el documento completo, sin clave ni hash', async () => {
    await request(app).put('/api/parametros').set(como(tokenAdmin)).send(parametrosValidos());

    const res = await request(app).get('/api/parametros').set(como(tokenAdmin));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      clave: CLAVE_PARAMETROS,
      correoContacto: 'mesa.ayuda@iunf.cl',
      nombreCorto: 'IUNF',
      telefonoMesa: '+56 2 2345 6789',
      zonaHoraria: 'America/Santiago',
      permitirRecuperacionClave: true,
      mostrarCodigoAsignaturaEnTablas: true,
    });
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).not.toHaveProperty('passwordHash');
    expect(res.body.data).not.toHaveProperty('_id');
    expect(res.body.data).not.toHaveProperty('__v');
  });

  it('sin documento responde 404 con PAR_NO_ENCONTRADO', async () => {
    const res = await request(app).get('/api/parametros').set(como(tokenDocente));

    expect(res.status).toBe(404);
    expect(res.body.code).toBe(PAR.NO_ENCONTRADO);
  });

  it('un docente no puede guardar: 403 y no se crea el documento', async () => {
    const res = await request(app).put('/api/parametros').set(como(tokenDocente)).send(parametrosValidos());

    expect(res.status).toBe(403);
    expect(await Parametros.countDocuments()).toBe(0);
  });

  it('un admin guarda, valida y el segundo guardado no deja dos documentos', async () => {
    const creado = await request(app).put('/api/parametros').set(como(tokenAdmin)).send(parametrosValidos({
      correoContacto: ' Mesa.Ayuda@IUNF.cl ',
    }));

    expect(creado.status).toBe(200);
    expect(creado.body.data.correoContacto).toBe('mesa.ayuda@iunf.cl');
    expect(creado.body.data.clave).toBe(CLAVE_PARAMETROS);

    const invalido = await request(app).put('/api/parametros').set(como(tokenAdmin)).send(parametrosValidos({
      duracionSesionMinutos: 4,
      zonaHoraria: 'UTC',
      correoContacto: 'no-es-correo',
    }));

    expect(invalido.status).toBe(400);
    expect(invalido.body.code).toBe('GEN_DATOS_INVALIDOS');
    expect(await Parametros.countDocuments()).toBe(1);
    expect((await Parametros.findOne()).duracionSesionMinutos).toBe(45);

    const actualizado = await request(app).put('/api/parametros').set(como(tokenAdmin)).send(parametrosValidos({
      nombreCorto: 'OTRO',
      clave: 'otro-documento',
      password: 'no-debe-guardarse',
      duracionSesionMinutos: 720,
    }));

    expect(actualizado.status).toBe(200);
    expect(actualizado.body.data.nombreCorto).toBe('OTRO');
    expect(actualizado.body.data.clave).toBe(CLAVE_PARAMETROS);
    expect(actualizado.body.data).not.toHaveProperty('password');
    expect(await Parametros.countDocuments()).toBe(1);
    expect(await Parametros.countDocuments({ clave: 'otro-documento' })).toBe(0);

    const extremos = await request(app).put('/api/parametros').set(como(tokenAdmin)).send(parametrosValidos({
      duracionSesionMinutos: 721,
    }));
    expect(extremos.status).toBe(400);
    expect(await Parametros.countDocuments()).toBe(1);
  });
});
