import { createHmac } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Usuario } from '../../src/models/usuario.model.js';
import { crearAppDePrueba, SECRETO_DE_PRUEBA } from '../helpers/app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const HASH_DE_RELLENO = '$2a$12$relleno.relleno.relleno.relleno.relleno.relleno.rellen';
const CLAVE = 'Clave-Dev-Admin-2026';
const RUTS = [
  '12345678-5',
  '11111111-1',
  '22222222-2',
  '1000005-K',
  '1000013-0',
  '1000019-K',
  '1000022-K',
  '1000027-0',
  '1000030-0',
  '1000036-K',
  '1000044-0',
  '1000053-K',
];

const SEDE_A = new mongoose.Types.ObjectId();
const SEDE_B = new mongoose.Types.ObjectId();
const app = crearAppDePrueba();

let secuencia = 0;

function firmarToken(payload) {
  const encabezado = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const ahora = Math.floor(Date.now() / 1000);
  const cuerpo = Buffer.from(JSON.stringify({ ...payload, iat: ahora, exp: ahora + 3600 })).toString('base64url');
  const firma = createHmac('sha256', SECRETO_DE_PRUEBA).update(`${encabezado}.${cuerpo}`).digest('base64url');
  return `${encabezado}.${cuerpo}.${firma}`;
}

function tokenDe(usuario) {
  return firmarToken({
    sub: usuario.id,
    rol: usuario.rol,
    sedes: usuario.sedes.map((sede) => String(sede)),
  });
}

function como(usuario) {
  const token = tokenDe(usuario);
  const conToken = (pedido) => pedido.set('Authorization', `Bearer ${token}`);
  return {
    get: (url) => conToken(request(app).get(url)),
    post: (url) => conToken(request(app).post(url)),
    patch: (url) => conToken(request(app).patch(url)),
  };
}

async function insertar(parcial = {}) {
  const n = secuencia;
  secuencia += 1;
  return Usuario.create({
    rut: RUTS[n],
    nombre: `Persona ${n}`,
    correo: `persona${n}@iunf.cl`,
    telefono: '+56955550199',
    passwordHash: HASH_DE_RELLENO,
    rol: 'docente',
    sedes: [],
    estado: 'activo',
    incorporacion: '2024-03-01',
    ...parcial,
  });
}

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Usuario.init();
});

afterEach(async () => {
  secuencia = 0;
  await limpiarBase();
});

afterAll(desconectarBaseDePrueba);

describe('sesión y permiso', () => {
  it.each([
    ['get', '/api/usuarios'],
    ['get', `/api/usuarios/${SEDE_A.toString()}`],
    ['post', '/api/usuarios'],
    ['patch', `/api/usuarios/${SEDE_A.toString()}`],
    ['patch', `/api/usuarios/${SEDE_A.toString()}/estado`],
    ['post', `/api/usuarios/${SEDE_A.toString()}/restablecer-clave`],
  ])('responde 401 en %s %s sin token', async (metodo, ruta) => {
    const res = await request(app)[metodo](ruta).send({});

    expect(res.status).toBe(401);
  });

  it('responde 403 si un docente o un coordinador intentan crear una cuenta', async () => {
    const docente = await insertar({ rol: 'docente', sedes: [SEDE_A] });
    const coordinador = await insertar({ rol: 'coordinador', sedes: [SEDE_A] });
    const cuerpo = {
      rut: '16.666.666-k',
      nombre: 'Alguien Nuevo',
      correo: 'alguien@iunf.cl',
      clave: CLAVE,
      rol: 'estudiante',
      incorporacion: '2025-03-01',
    };

    const comoDocente = await como(docente).post('/api/usuarios').send(cuerpo);
    const comoCoordinador = await como(coordinador).post('/api/usuarios').send(cuerpo);

    expect(comoDocente.status).toBe(403);
    expect(comoCoordinador.status).toBe(403);
    expect(await Usuario.countDocuments({ correo: 'alguien@iunf.cl' })).toBe(0);
  });

  it('responde 200 al admin que lista las cuentas', async () => {
    const admin = await insertar({ rol: 'admin', nombre: 'Camila Soto' });

    const res = await como(admin).get('/api/usuarios');

    expect(res.status).toBe(200);
    expect(res.body.data.map((usuario) => usuario.id)).toContain(admin.id);
    expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 1 });
    expect(res.body.data[0]).not.toHaveProperty('passwordHash');
  });
});

describe('alta y edición de la cuenta', () => {
  it('crea la cuenta, guarda solo el hash y no persiste el perfil ni la clave en claro', async () => {
    const admin = await insertar({ rol: 'admin' });

    const res = await como(admin).post('/api/usuarios').send({
      rut: '16.666.666-k',
      nombre: '  Nueva Persona  ',
      correo: '  Nueva@IUNF.cl ',
      telefono: '+56912345678',
      clave: CLAVE,
      rol: 'docente',
      sedes: [String(SEDE_A)],
      incorporacion: '2025-03-01',
      perfilEstudiante: { codigoEstudiante: 'EST-2026-009', contactoEmergencia: 'X', nivelCursando: 1 },
      passwordHash: 'no-guardar',
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      rut: '16666666-K',
      nombre: 'Nueva Persona',
      correo: 'nueva@iunf.cl',
      rol: 'docente',
      estado: 'activo',
    });
    expect(res.body.data).not.toHaveProperty('passwordHash');
    expect(res.body.data).not.toHaveProperty('perfilEstudiante');
    expect(JSON.stringify(res.body)).not.toContain(CLAVE);
    expect(JSON.stringify(res.body)).not.toContain('no-guardar');

    const guardado = await Usuario.findById(res.body.data.id).select('+passwordHash');
    expect(guardado.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(guardado.passwordHash).not.toBe(CLAVE);
    expect(guardado.perfilEstudiante).toBeUndefined();
    expect(await bcrypt.compare(CLAVE, guardado.passwordHash)).toBe(true);
  });

  it('edita la cuenta y conserva el perfil académico que ya tenía', async () => {
    const admin = await insertar({ rol: 'admin' });
    const docente = await insertar({
      rol: 'docente',
      sedes: [SEDE_A],
      perfilDocente: { tipoVinculo: 'planta', especialidad: 'Matemática', departamentos: [] },
    });

    const res = await como(admin).patch(`/api/usuarios/${docente.id}`).send({
      nombre: 'Nombre Nuevo',
      telefono: '+56911111111',
      perfilDocente: { tipoVinculo: 'honorarios', especialidad: 'No debe reemplazar', departamentos: ['Intruso'] },
    });

    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe('Nombre Nuevo');
    expect(res.body.data.telefono).toBe('+56911111111');
    expect(res.body.data.perfilDocente).toMatchObject({ tipoVinculo: 'planta', especialidad: 'Matemática' });
  });
});

describe('duplicados desde el índice', () => {
  it('responde 409 si el RUT ya existe, aunque llegue con puntos', async () => {
    const admin = await insertar({ rol: 'admin', rut: '12345678-5', correo: 'admin-dup@iunf.cl' });

    const res = await como(admin).post('/api/usuarios').send({
      rut: '12.345.678-5',
      nombre: 'Otra Persona',
      correo: 'otra-rut@iunf.cl',
      clave: CLAVE,
      rol: 'docente',
      incorporacion: '2025-03-01',
    });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('USR_RUT_DUPLICADO');
    expect(res.body.message).toContain('RUT');
    expect(JSON.stringify(res.body)).not.toContain('12345678-5');
    expect(await Usuario.countDocuments()).toBe(1);
  });

  it('responde 409 si el correo ya existe, aunque llegue en mayúsculas', async () => {
    const admin = await insertar({ rol: 'admin', correo: 'ana@iunf.cl' });

    const res = await como(admin).post('/api/usuarios').send({
      rut: '16.666.666-k',
      nombre: 'Otra Persona',
      correo: 'ANA@iunf.cl',
      clave: CLAVE,
      rol: 'estudiante',
      incorporacion: '2025-03-01',
    });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('USR_CORREO_DUPLICADO');
    expect(res.body.message).toContain('correo');
    expect(JSON.stringify(res.body)).not.toContain('ana@iunf.cl');
    expect(await Usuario.countDocuments()).toBe(1);
  });
});

describe('reglas de administrador', () => {
  it('no deja que un admin se desactive a sí mismo', async () => {
    const admin = await insertar({ rol: 'admin', nombre: 'Admin Uno' });
    await insertar({ rol: 'admin', nombre: 'Admin Dos' });

    const res = await como(admin).patch(`/api/usuarios/${admin.id}/estado`).send({ estado: 'inactivo' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      code: 'USR_NO_AUTOBAJA',
      regla: null,
      message: 'No puedes desactivar tu propia cuenta.',
    });
    expect((await Usuario.findById(admin.id)).estado).toBe('activo');
  });

  it('no cambia el rol del último admin activo', async () => {
    const admin = await insertar({ rol: 'admin' });

    const res = await como(admin).patch(`/api/usuarios/${admin.id}`).send({ rol: 'docente' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('USR_ULTIMO_ADMIN');
    expect(res.body.message).toContain('administrador activo');
    expect((await Usuario.findById(admin.id)).rol).toBe('admin');
  });

  it('desactiva a otro admin si queda uno activo, y no borra el documento', async () => {
    const admin1 = await insertar({ rol: 'admin' });
    const admin2 = await insertar({ rol: 'admin' });

    const res = await como(admin1).patch(`/api/usuarios/${admin2.id}/estado`).send({ estado: 'inactivo' });

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('inactivo');
    expect(await Usuario.countDocuments()).toBe(2);
    expect(await Usuario.countDocuments({ rol: 'admin', estado: 'activo' })).toBe(1);
  });

  it('dos desactivaciones simultáneas del último par de admins no dejan cero admins activos', async () => {
    const admin1 = await insertar({ rol: 'admin', nombre: 'Admin Uno' });
    const admin2 = await insertar({ rol: 'admin', nombre: 'Admin Dos' });

    const [res1, res2] = await Promise.all([
      como(admin1).patch(`/api/usuarios/${admin2.id}/estado`).send({ estado: 'inactivo' }),
      como(admin2).patch(`/api/usuarios/${admin1.id}/estado`).send({ estado: 'inactivo' }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 409]);
    const conflicto = [res1, res2].find((res) => res.status === 409);
    expect(conflicto.body.code).toBe('USR_ULTIMO_ADMIN');
    expect(await Usuario.countDocuments({ rol: 'admin', estado: 'activo' })).toBe(1);
    expect(await Usuario.countDocuments()).toBe(2);
  });
});

describe('visibilidad del coordinador', () => {
  async function escenario() {
    const coordinador = await insertar({ rol: 'coordinador', sedes: [SEDE_A], nombre: 'Coord A' });
    const docenteA = await insertar({ rol: 'docente', sedes: [SEDE_A], nombre: 'Docente A' });
    const docenteB = await insertar({ rol: 'docente', sedes: [SEDE_B], nombre: 'Docente B' });
    const estudianteAmbas = await insertar({
      rol: 'estudiante',
      sedes: [SEDE_B, SEDE_A],
      nombre: 'Estudiante Ambas',
    });
    const admin = await insertar({ rol: 'admin', sedes: [SEDE_A], nombre: 'Admin Visible' });
    return { coordinador, docenteA, docenteB, estudianteAmbas, admin };
  }

  it('lista solo docentes y estudiantes con alguna sede en común', async () => {
    const { coordinador, docenteA, docenteB, estudianteAmbas, admin } = await escenario();

    const res = await como(coordinador).get('/api/usuarios');

    expect(res.status).toBe(200);
    const ids = res.body.data.map((usuario) => usuario.id);
    expect(ids).toContain(docenteA.id);
    expect(ids).toContain(estudianteAmbas.id);
    expect(ids).not.toContain(docenteB.id);
    expect(ids).not.toContain(admin.id);
    expect(ids).not.toContain(coordinador.id);
    expect(res.body.meta.total).toBe(2);
  });

  it('responde 404 al pedir un usuario de otra sede o un admin, y 200 al de su sede', async () => {
    const { coordinador, docenteA, docenteB, admin } = await escenario();

    const ajeno = await como(coordinador).get(`/api/usuarios/${docenteB.id}`);
    const oculto = await como(coordinador).get(`/api/usuarios/${admin.id}`);
    const propio = await como(coordinador).get(`/api/usuarios/${docenteA.id}`);

    expect(ajeno.status).toBe(404);
    expect(oculto.status).toBe(404);
    expect(ajeno.body.code).toBe('USR_NO_ENCONTRADO');
    expect(oculto.body).toEqual(ajeno.body);
    expect(ajeno.body.message).not.toMatch(/sede|permiso/i);
    expect(propio.status).toBe(200);
    expect(propio.body.data.id).toBe(docenteA.id);
  });

  it('busca por nombre, rut o correo dentro de lo que el coordinador puede ver', async () => {
    const { coordinador, docenteB } = await escenario();
    const admin = await Usuario.findOne({ rol: 'admin' });

    const porNombre = await como(admin).get('/api/usuarios').query({ q: 'docente b' });
    const porRut = await como(admin).get('/api/usuarios').query({ q: docenteB.rut });
    const porCorreo = await como(admin).get('/api/usuarios').query({ q: docenteB.correo });
    const fuera = await como(coordinador).get('/api/usuarios').query({ q: 'Docente B' });
    const comodin = await como(admin).get('/api/usuarios').query({ q: '.*' });

    expect(porNombre.body.data.map((usuario) => usuario.id)).toEqual([docenteB.id]);
    expect(porRut.body.data.map((usuario) => usuario.id)).toEqual([docenteB.id]);
    expect(porCorreo.body.data.map((usuario) => usuario.id)).toEqual([docenteB.id]);
    expect(fuera.body.data).toEqual([]);
    expect(fuera.body.meta.total).toBe(0);
    expect(comodin.body.meta.total).toBe(0);
  });
});

describe('restablecer clave', () => {
  it('devuelve la clave temporal una sola vez, guarda el hash y obliga a cambiarla', async () => {
    const admin = await insertar({ rol: 'admin' });
    const docente = await insertar({ rol: 'docente', sedes: [SEDE_A] });

    const res = await como(admin).post(`/api/usuarios/${docente.id}/restablecer-clave`).send({});

    expect(res.status).toBe(200);
    const { claveTemporal } = res.body.data;
    expect(claveTemporal).toEqual(expect.any(String));
    expect(claveTemporal.length).toBeGreaterThanOrEqual(10);
    expect(claveTemporal).toMatch(/[A-Za-z]/);
    expect(claveTemporal).toMatch(/\d/);
    expect(res.body.data).not.toHaveProperty('passwordHash');

    const guardado = await Usuario.findById(docente.id).select('+passwordHash');
    expect(guardado.debeCambiarClave).toBe(true);
    expect(guardado.passwordHash).not.toBe(claveTemporal);
    expect(await bcrypt.compare(claveTemporal, guardado.passwordHash)).toBe(true);

    const lectura = await como(admin).get(`/api/usuarios/${docente.id}`);
    expect(JSON.stringify(lectura.body)).not.toContain(claveTemporal);
  });
});
