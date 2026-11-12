import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CLAVE_PARAMETROS, Parametros } from '../../src/models/parametros.model.js';
import { COSTO_BCRYPT, Usuario } from '../../src/models/usuario.model.js';
import { validarPoliticaClave } from '../../src/services/claves.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { authenticate, authorize } from '../../src/middlewares/auth.js';
import { crearAppDePrueba, SECRETO_DE_PRUEBA } from '../helpers/app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const CLAVE = 'Clave-Dev-Admin-2026';
const MENSAJE_CREDENCIALES = 'El correo o la clave no son correctos.';
const ERROR_CREDENCIALES = {
  code: 'AUT_CREDENCIALES_INVALIDAS',
  regla: null,
  message: MENSAJE_CREDENCIALES,
};

const app = crearAppDePrueba();
let hashClave;

function autorizacion(token) {
  return { Authorization: `Bearer ${token}` };
}

function crearCuenta(parcial = {}) {
  return Usuario.create({
    rut: '12345678-5',
    nombre: 'Camila Soto',
    correo: 'admin@iunf.cl',
    passwordHash: hashClave,
    rol: 'admin',
    incorporacion: '2024-03-01',
    ...parcial,
  });
}

function entrar(correo, password) {
  return request(app).post('/api/auth/login').send({ correo, password });
}

beforeAll(async () => {
  await conectarBaseDePrueba();
  hashClave = await bcrypt.hash(CLAVE, COSTO_BCRYPT);
  await Usuario.init();
});

afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('POST /api/auth/login', () => {
  it('inicia sesión y firma { sub, rol, sedes } por 45 minutos si no hay parámetros', async () => {
    const sede = new mongoose.Types.ObjectId();
    const doc = await crearCuenta({
      rol: 'coordinador',
      sedes: [sede],
      debeCambiarClave: true,
      correo: 'coordinador@iunf.cl',
      rut: '11111111-1',
    });

    const res = await entrar('  Coordinador@IUNF.cl  ', CLAVE);

    expect(res.status).toBe(200);
    expect(res.body.data.usuario).toEqual({
      id: doc.id,
      nombre: 'Camila Soto',
      rol: 'coordinador',
      sedes: [String(sede)],
      debeCambiarClave: true,
    });
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain(CLAVE);

    const payload = jwt.verify(res.body.data.token, SECRETO_DE_PRUEBA, { algorithms: ['HS256'] });
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'rol', 'sedes', 'sub']);
    expect(payload.sub).toBe(doc.id);
    expect(payload.rol).toBe('coordinador');
    expect(payload.sedes).toEqual([String(sede)]);
    expect(payload.exp - payload.iat).toBe(45 * 60);
  });

  it('toma la expiración de duracionSesionMinutos', async () => {
    await Parametros.create({
      clave: CLAVE_PARAMETROS,
      nombreInstitucion: 'Instituto Universitario Nueva Formación',
      nombreCorto: 'IUNF',
      siglasPortal: 'SGA',
      correoContacto: 'mesa@iunf.cl',
      telefonoMesa: '+56 2 2345 6789',
      zonaHoraria: 'America/Santiago',
      mensajeBienvenida: 'Hola',
      duracionSesionMinutos: 10,
      permitirRecuperacionClave: false,
      mostrarCodigoAsignaturaEnTablas: true,
    });
    await crearCuenta();

    const res = await entrar('admin@iunf.cl', CLAVE);
    const payload = jwt.verify(res.body.data.token, SECRETO_DE_PRUEBA, { algorithms: ['HS256'] });

    expect(res.status).toBe(200);
    expect(payload.exp - payload.iat).toBe(10 * 60);
  });

  it('responde 401 si la clave no coincide, sin repetirla', async () => {
    await crearCuenta();

    const res = await entrar('admin@iunf.cl', 'clave-que-no-es');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(ERROR_CREDENCIALES);
    expect(JSON.stringify(res.body)).not.toContain('clave-que-no-es');
    expect(JSON.stringify(res.body)).not.toContain('admin@iunf.cl');
  });

  it('responde igual si el correo no existe: mismo status, code y message', async () => {
    await crearCuenta();

    const mala = await entrar('admin@iunf.cl', 'clave-que-no-es');
    const inexistente = await entrar('nadie@iunf.cl', 'clave-que-no-es');

    expect(mala.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(inexistente.body).toEqual(mala.body);
    expect(inexistente.body).toEqual(ERROR_CREDENCIALES);
    expect(JSON.stringify(inexistente.body)).not.toContain('nadie@iunf.cl');
  });

  it('rechaza una cuenta inactiva con el mismo mensaje, sin decir que existe', async () => {
    await crearCuenta({ estado: 'inactivo' });

    const res = await entrar('admin@iunf.cl', CLAVE);

    expect(res.status).toBe(401);
    expect(res.body).toEqual(ERROR_CREDENCIALES);
  });
});

describe('sesión', () => {
  it('rechaza la petición siguiente si la cuenta pasa a inactiva, aunque el token siga vigente', async () => {
    const doc = await crearCuenta();
    const login = await entrar(doc.correo, CLAVE);
    const token = login.body.data.token;

    await Usuario.updateOne({ _id: doc._id }, { estado: 'inactivo' });

    expect(() => jwt.verify(token, SECRETO_DE_PRUEBA, { algorithms: ['HS256'] })).not.toThrow();

    const res = await request(app).get('/api/auth/me').set(autorizacion(token));

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      code: 'AUT_CUENTA_INACTIVA',
      regla: null,
      message: 'Tu cuenta está inactiva.',
    });
  });

  it('responde 401 AUT_TOKEN_VENCIDO cuando el token expiró', async () => {
    const doc = await crearCuenta();
    const token = jwt.sign(
      { sub: doc.id, rol: doc.rol, sedes: [], exp: Math.floor(Date.now() / 1000) - 30 },
      SECRETO_DE_PRUEBA,
      { algorithm: 'HS256' },
    );

    const res = await request(app).get('/api/auth/me').set(autorizacion(token));

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      code: 'AUT_TOKEN_VENCIDO',
      regla: null,
      message: 'Tu sesión venció. Inicia sesión de nuevo.',
    });
  });

  it('responde 401 AUT_TOKEN_INVALIDO cuando manipulan la firma', async () => {
    const doc = await crearCuenta();
    const token = jwt.sign({ sub: doc.id, rol: doc.rol, sedes: [] }, SECRETO_DE_PRUEBA, {
      algorithm: 'HS256',
      expiresIn: '5m',
    });
    const [cabecera, cuerpo, firma] = token.split('.');
    const manipulado = `${cabecera}.${cuerpo}.${firma.slice(0, -1)}${firma.endsWith('a') ? 'b' : 'a'}`;

    const res = await request(app).get('/api/auth/me').set(autorizacion(manipulado));

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      code: 'AUT_TOKEN_INVALIDO',
      regla: null,
      message: 'Tu sesión no es válida. Inicia sesión de nuevo.',
    });
  });

  it('responde 403 si el rol recargado no tiene el permiso, aunque el token diga admin', async () => {
    const sede = new mongoose.Types.ObjectId();
    const admin = await crearCuenta({ sedes: [sede] });
    const estudiante = await crearCuenta({
      rut: '22222222-2',
      correo: 'estudiante@iunf.cl',
      nombre: 'Leo Díaz',
      rol: 'estudiante',
    });
    const mini = express();
    mini.locals.jwtSecret = SECRETO_DE_PRUEBA;
    mini.get('/solo-admin', authenticate, authorize('usuarios.crear'), (req, res) => {
      res.json({ data: req.user });
    });
    mini.use(errorHandler);

    const tokenAdmin = jwt.sign({ sub: admin.id, rol: 'estudiante', sedes: [] }, SECRETO_DE_PRUEBA, {
      algorithm: 'HS256',
      expiresIn: '5m',
    });
    const comoAdmin = await request(mini).get('/solo-admin').set(autorizacion(tokenAdmin));

    expect(comoAdmin.status).toBe(200);
    expect(comoAdmin.body.data).toEqual({ id: admin.id, rol: 'admin', sedes: [String(sede)] });

    const tokenEstudiante = jwt.sign(
      { sub: estudiante.id, rol: 'admin', sedes: [String(sede)] },
      SECRETO_DE_PRUEBA,
      { algorithm: 'HS256', expiresIn: '5m' },
    );
    const comoEstudiante = await request(mini).get('/solo-admin').set(autorizacion(tokenEstudiante));

    expect(comoEstudiante.status).toBe(403);
    expect(comoEstudiante.body).toEqual({
      code: 'AUT_SIN_PERMISO',
      regla: null,
      message: 'Tu rol no tiene permiso para esta acción.',
    });
  });

  it('GET /api/auth/me devuelve el usuario en toJSON, sin passwordHash', async () => {
    const doc = await crearCuenta({ telefono: '+56 9 5555 0101' });
    const login = await entrar(doc.correo, CLAVE);

    const res = await request(app).get('/api/auth/me').set(autorizacion(login.body.data.token));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: doc.id,
      nombre: 'Camila Soto',
      correo: 'admin@iunf.cl',
      rol: 'admin',
      estado: 'activo',
      debeCambiarClave: false,
    });
    expect(res.body.data).not.toHaveProperty('passwordHash');
    expect(res.body.data).not.toHaveProperty('_id');
    expect(res.body.data).not.toHaveProperty('__v');
  });

  it('exige sesión para /me', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: 'AUT_TOKEN_AUSENTE', regla: null, message: 'Debes iniciar sesión.' });
  });
});

describe('POST /api/auth/cambiar-clave', () => {
  async function tokenDeAdmin(parcial = {}) {
    const doc = await crearCuenta({ debeCambiarClave: true, ...parcial });
    const login = await entrar(doc.correo, CLAVE);
    return { doc, token: login.body.data.token };
  }

  it('cambia la clave, apaga debeCambiarClave y no devuelve la clave', async () => {
    const { doc, token } = await tokenDeAdmin();
    const nueva = 'Clave-Nueva-2026';

    const res = await request(app).post('/api/auth/cambiar-clave').set(autorizacion(token)).send({ actual: CLAVE, nueva });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: null });
    expect(JSON.stringify(res.body)).not.toContain(nueva);

    const perfil = await request(app).get('/api/auth/me').set(autorizacion(token));
    expect(perfil.body.data.debeCambiarClave).toBe(false);

    const conLaNueva = await entrar(doc.correo, nueva);
    const conLaVieja = await entrar(doc.correo, CLAVE);
    expect(conLaNueva.status).toBe(200);
    expect(conLaVieja.body).toEqual(ERROR_CREDENCIALES);

    const guardado = await Usuario.findById(doc.id).select('+passwordHash');
    expect(guardado.passwordHash).not.toBe(nueva);
    expect(guardado.passwordHash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('responde 401 si la clave actual no coincide', async () => {
    const { token } = await tokenDeAdmin();

    const res = await request(app)
      .post('/api/auth/cambiar-clave')
      .set(autorizacion(token))
      .send({ actual: 'no-es-la-clave', nueva: 'Clave-Nueva-2026' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      code: 'AUT_CLAVE_ACTUAL_INCORRECTA',
      regla: null,
      message: 'La clave actual no es correcta.',
    });
    expect(JSON.stringify(res.body)).not.toContain('no-es-la-clave');
    expect(JSON.stringify(res.body)).not.toContain('Clave-Nueva-2026');
  });

  it('responde 400 si la clave nueva no cumple la política, sin repetirla', async () => {
    const { token } = await tokenDeAdmin();

    const res = await request(app)
      .post('/api/auth/cambiar-clave')
      .set(autorizacion(token))
      .send({ actual: CLAVE, nueva: 'abc123' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      code: 'AUT_POLITICA_CLAVE',
      regla: null,
      message: 'La clave debe tener al menos 10 caracteres.',
    });
    expect(JSON.stringify(res.body)).not.toContain('abc123');
  });
});

describe('GET /api/permisos', () => {
  it('devuelve la matriz rol × permiso a cualquier autenticado', async () => {
    await crearCuenta();
    const login = await entrar('admin@iunf.cl', CLAVE);

    const res = await request(app).get('/api/permisos').set(autorizacion(login.body.data.token));
    const cuatro = ['admin', 'coordinador', 'docente', 'estudiante'];

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      'auth.yo': cuatro,
      'auth.cambiarClave': cuatro,
      'usuarios.listar': ['admin', 'coordinador'],
      'usuarios.crear': ['admin'],
      'usuarios.editar': ['admin'],
      'usuarios.estado': ['admin'],
      'usuarios.restablecerClave': ['admin'],
      'parametros.leer': cuatro,
      'parametros.escribir': ['admin'],
      'permisos.leer': cuatro,
      'docente.leer': ['docente'],
      'periodos.leer': cuatro,
      // Estructura y reportes (Lorenzo).
      'sedes.leer': cuatro,
      'sedes.escribir': ['coordinador'],
      'asignaturas.leer': cuatro,
      'asignaturas.escribir': ['coordinador'],
      'carreras.leer': cuatro,
      'carreras.escribir': ['coordinador'],
      'planes.leer': cuatro,
      'planes.escribir': ['coordinador'],
      'reportes.leer': ['admin', 'coordinador'],
      // Matrículas (Angel).
      'matriculas.leer': ['admin', 'coordinador'],
      'matriculas.escribir': ['coordinador'],
    });
  });
});

describe('validarPoliticaClave', () => {
  it('acepta 10 o más caracteres con letra y número', () => {
    expect(validarPoliticaClave('Clave-Segura-1')).toBeNull();
    expect(validarPoliticaClave('contraseña1')).toBeNull();
  });

  it('dice qué falta', () => {
    expect(validarPoliticaClave('abc123')).toBe('La clave debe tener al menos 10 caracteres.');
    expect(validarPoliticaClave('1234567890')).toBe('La clave debe incluir al menos una letra.');
    expect(validarPoliticaClave('solo letras!')).toBe('La clave debe incluir al menos un número.');
    expect(validarPoliticaClave('corta')).toBe(
      'La clave debe tener al menos 10 caracteres y incluir al menos un número.',
    );
    expect(validarPoliticaClave('')).toBe(
      'La clave debe tener al menos 10 caracteres, incluir al menos una letra y incluir al menos un número.',
    );
  });
});
