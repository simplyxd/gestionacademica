import { createHmac } from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DOC } from '../../src/errors/codigos/docente.js';
import { Usuario } from '../../src/models/usuario.model.js';
import { horarioDelDocente, nominaDeSeccion, seccionesDelDocente } from '../../src/services/docente.service.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// Mismo secreto que tests/helpers/app.js. No se importa ese archivo aquí: arrastra app.js
// y, con él, el middleware de auth que puede no existir todavía.
const SECRETO_DE_PRUEBA = 'secreto-solo-para-tests-0123456789abcdef';
const HASH = 'HASH-SECRETO-NO-DEBE-SALIR';

function base64url(texto) {
  return Buffer.from(texto).toString('base64url');
}

/** JWT HS256 con el payload del contrato { sub, rol, sedes }. Lo verifica authenticate cuando exista. */
function tokenDe({ sub, rol, sedes = [] }) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const cuerpo = base64url(JSON.stringify({
    sub: String(sub),
    rol,
    sedes,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }));
  const firma = createHmac('sha256', SECRETO_DE_PRUEBA).update(`${header}.${cuerpo}`).digest('base64url');
  return `${header}.${cuerpo}.${firma}`;
}

function cuenta(parcial) {
  return {
    telefono: 'TEL-SECRETO',
    passwordHash: HASH,
    incorporacion: '2024-03-01',
    ...parcial,
  };
}

function perfilEstudiante(codigo) {
  return {
    codigoEstudiante: codigo,
    contactoEmergencia: 'EMERGENCIA-SECRETA',
    nivelCursando: 2,
  };
}

/** Comprueba que el trabajo hace una sola agregación y no busca usuarios ni inscripciones uno a uno. */
async function conUnaAgregacion(trabajo) {
  const modeloSeccion = mongoose.models.Seccion ?? mongoose.models.SeccionLecturaDocente;
  const modeloInscripcion = mongoose.models.Inscripcion ?? mongoose.models.InscripcionLecturaDocente;
  const agregacion = vi.spyOn(modeloSeccion, 'aggregate');
  const busquedaUsuarios = vi.spyOn(Usuario, 'find');
  const busquedaInscripciones = vi.spyOn(modeloInscripcion, 'find');
  try {
    const resultado = await trabajo();
    expect(agregacion).toHaveBeenCalledTimes(1);
    expect(busquedaUsuarios).not.toHaveBeenCalled();
    expect(busquedaInscripciones).not.toHaveBeenCalled();
    return { resultado, pipeline: agregacion.mock.calls[0][0] };
  } finally {
    agregacion.mockRestore();
    busquedaUsuarios.mockRestore();
    busquedaInscripciones.mockRestore();
  }
}

beforeAll(conectarBaseDePrueba);
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('portal docente · servicio', () => {
  async function escenario() {
    const docenteA = await Usuario.create(cuenta({
      rut: '12345678-5',
      nombre: 'Dora Fuentes',
      correo: 'dora@duoc.cl',
      rol: 'docente',
    }));
    const docenteB = await Usuario.create(cuenta({
      rut: '11111111-1',
      nombre: 'Elena Soto',
      correo: 'elena@duoc.cl',
      rol: 'docente',
    }));
    const ana = await Usuario.create(cuenta({
      rut: '16666666-K',
      nombre: 'Ana Activa',
      correo: 'ana.activa@duoc.cl',
      rol: 'estudiante',
      perfilEstudiante: perfilEstudiante('EST-2026-010'),
    }));
    const bruno = await Usuario.create(cuenta({
      rut: '22222222-2',
      nombre: 'Bruno Anulado',
      correo: 'bruno.anulado@duoc.cl',
      rol: 'estudiante',
      perfilEstudiante: perfilEstudiante('EST-2026-011'),
    }));

    const periodo = new mongoose.Types.ObjectId();
    const otroPeriodo = new mongoose.Types.ObjectId();
    const asignaturaId = new mongoose.Types.ObjectId();
    const sedeId = new mongoose.Types.ObjectId();
    await mongoose.connection.collection('asignaturas').insertOne({
      _id: asignaturaId,
      codigo: 'MAT-100',
      nombre: 'Álgebra',
    });
    await mongoose.connection.collection('sedes').insertOne({ _id: sedeId, nombre: 'Sede Centro' });

    const secciones = mongoose.connection.collection('secciones');
    const mia = await secciones.insertOne({
      docenteId: docenteA._id,
      periodoId: periodo,
      asignaturaId,
      sedeId,
      letra: 'A',
      sala: 'Sala 101',
      modalidad: 'presencial',
      jornada: 'diurna',
      cupoMaximo: 30,
      bloques: [
        { dia: 1, inicioMin: 600, finMin: 690 },
        { dia: 3, inicioMin: 840, finMin: 930 },
      ],
    });
    const miaTambien = await secciones.insertOne({
      docenteId: docenteA._id,
      periodoId: periodo,
      asignaturaId,
      sedeId,
      letra: 'B',
      bloques: [{ dia: 0, inicioMin: 480, finMin: 570 }],
    });
    const miaEnOtroPeriodo = await secciones.insertOne({
      docenteId: docenteA._id,
      periodoId: otroPeriodo,
      asignaturaId,
      sedeId,
      letra: 'A',
      bloques: [{ dia: 2, inicioMin: 600, finMin: 690 }],
    });
    const ajena = await secciones.insertOne({
      docenteId: docenteB._id,
      periodoId: periodo,
      asignaturaId,
      sedeId,
      letra: 'A',
      bloques: [{ dia: 4, inicioMin: 600, finMin: 690 }],
    });

    await mongoose.connection.collection('inscripciones').insertMany([
      { seccionId: mia.insertedId, estudianteId: ana._id, estado: 'activa' },
      { seccionId: mia.insertedId, estudianteId: bruno._id, estado: 'anulada' },
    ]);

    return {
      docenteA,
      docenteB,
      ana,
      periodo,
      mia: mia.insertedId,
      miaTambien: miaTambien.insertedId,
      miaEnOtroPeriodo: miaEnOtroPeriodo.insertedId,
      ajena: ajena.insertedId,
    };
  }

  it('devuelve solo las secciones de ese docente en el período, con una sola agregación', async () => {
    const { docenteA, periodo, mia, miaTambien, miaEnOtroPeriodo, ajena } = await escenario();

    const { resultado, pipeline } = await conUnaAgregacion(() => seccionesDelDocente(docenteA._id, periodo));

    expect(resultado.map((seccion) => seccion.id).sort()).toEqual([String(mia), String(miaTambien)].sort());
    expect(resultado.map((seccion) => seccion.id)).not.toContain(String(miaEnOtroPeriodo));
    expect(resultado.map((seccion) => seccion.id)).not.toContain(String(ajena));
    expect(resultado[0]).toMatchObject({
      codigoAsignatura: 'MAT-100',
      nombreAsignatura: 'Álgebra',
      sede: 'Sede Centro',
    });
    expect(resultado.every((seccion) => !Object.hasOwn(seccion, 'docenteId'))).toBe(true);
    const texto = JSON.stringify(pipeline);
    expect(texto).toContain('activa');
    expect(texto).not.toContain('usuarios');
  });

  it('la sección de otro docente y una inexistente responden 404 con el mismo mensaje', async () => {
    const { docenteA, ajena } = await escenario();
    const inexistente = new mongoose.Types.ObjectId();

    const ajenaError = await nominaDeSeccion(docenteA._id, ajena).catch((error) => error);
    const inexistenteError = await nominaDeSeccion(docenteA._id, inexistente).catch((error) => error);

    expect(ajenaError).toMatchObject({ status: 404, code: DOC.SECCION_NO_ENCONTRADA, message: 'No encontramos esa sección.' });
    expect(inexistenteError).toMatchObject({ status: 404, code: DOC.SECCION_NO_ENCONTRADA, message: ajenaError.message });
  });

  it('la nómina lista solo la inscripción activa y solo nombre, rut, código y correo, en una agregación', async () => {
    const { docenteA, mia, ana } = await escenario();

    const { resultado, pipeline } = await conUnaAgregacion(() => nominaDeSeccion(docenteA._id, mia));

    expect(resultado).toEqual([
      {
        nombre: 'Ana Activa',
        rut: '16666666-K',
        codigoEstudiante: 'EST-2026-010',
        correo: 'ana.activa@duoc.cl',
      },
    ]);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).not.toBe('Bruno Anulado');
    const texto = JSON.stringify(resultado);
    expect(texto).not.toContain('TEL-SECRETO');
    expect(texto).not.toContain('EMERGENCIA-SECRETA');
    expect(texto).not.toContain(HASH);
    expect(texto).not.toContain('Bruno');
    expect(Object.keys(resultado[0]).sort()).toEqual(['codigoEstudiante', 'correo', 'nombre', 'rut']);
    expect(String(ana._id)).not.toBe(resultado[0].rut);
    const pipelineTexto = JSON.stringify(pipeline);
    expect(pipelineTexto).toContain('usuarios');
    expect(pipelineTexto).toContain('activa');

    const secciones = await seccionesDelDocente(docenteA._id, (await mongoose.connection.collection('secciones').findOne({ _id: mia })).periodoId);
    expect(secciones.find((seccion) => seccion.id === String(mia)).inscritosActivos).toBe(1);
  });

  it('el horario trae solo los bloques de sus secciones en ese período', async () => {
    const { docenteA, periodo, mia, miaTambien, ajena } = await escenario();

    const bloques = await horarioDelDocente(docenteA._id, periodo);
    const secciones = new Set(bloques.map((bloque) => bloque.seccionId));

    expect(bloques).toHaveLength(3);
    expect(secciones).toEqual(new Set([String(mia), String(miaTambien)]));
    expect(secciones.has(String(ajena))).toBe(false);
    expect(bloques.map((bloque) => [bloque.dia, bloque.inicioMin])).toEqual([
      [0, 480],
      [1, 600],
      [3, 840],
    ]);
  });
});

describe('portal docente · HTTP', () => {
  /** @type {import('express').Express | null} */
  let app = null;

  beforeAll(async () => {
    try {
      const { crearAppDePrueba } = await import('../helpers/app.js');
      app = crearAppDePrueba();
    } catch (error) {
      const texto = `${error?.message ?? ''} ${error?.cause?.message ?? ''}`;
      const faltaAuth = texto.includes('middlewares/auth');
      if (faltaAuth) return;
      throw error;
    }
  });

  function exigirApp() {
    if (app) return;
    throw new Error(
      'authenticate aún no existe en backend/src/middlewares/auth.js (lo escribe otro agente). ' +
        'El import de docente.routes.js quedó correcto y esta prueba HTTP no puede correr.',
    );
  }

  async function docenteYEstudiante() {
    const docente = await Usuario.create(cuenta({
      rut: '12345678-5',
      nombre: 'Dora Fuentes',
      correo: 'dora@duoc.cl',
      rol: 'docente',
    }));
    const otro = await Usuario.create(cuenta({
      rut: '11111111-1',
      nombre: 'Elena Soto',
      correo: 'elena@duoc.cl',
      rol: 'docente',
    }));
    const estudiante = await Usuario.create(cuenta({
      rut: '16666666-K',
      nombre: 'Ana Activa',
      correo: 'ana.activa@duoc.cl',
      rol: 'estudiante',
      perfilEstudiante: perfilEstudiante('EST-2026-010'),
    }));
    const anulado = await Usuario.create(cuenta({
      rut: '22222222-2',
      nombre: 'Bruno Anulado',
      correo: 'bruno.anulado@duoc.cl',
      rol: 'estudiante',
      perfilEstudiante: perfilEstudiante('EST-2026-011'),
    }));
    const periodo = new mongoose.Types.ObjectId();
    const asignaturaId = new mongoose.Types.ObjectId();
    const sedeId = new mongoose.Types.ObjectId();
    const mia = await mongoose.connection.collection('secciones').insertOne({
      docenteId: docente._id,
      periodoId: periodo,
      asignaturaId,
      sedeId,
      letra: 'A',
      bloques: [{ dia: 0, inicioMin: 480, finMin: 570 }],
    });
    const ajena = await mongoose.connection.collection('secciones').insertOne({
      docenteId: otro._id,
      periodoId: periodo,
      asignaturaId,
      sedeId,
      letra: 'A',
      bloques: [{ dia: 1, inicioMin: 600, finMin: 690 }],
    });
    await mongoose.connection.collection('inscripciones').insertMany([
      { seccionId: mia.insertedId, estudianteId: estudiante._id, estado: 'activa' },
      { seccionId: mia.insertedId, estudianteId: anulado._id, estado: 'anulada' },
    ]);
    return { docente, estudiante, periodo, mia: mia.insertedId, ajena: ajena.insertedId };
  }

  it('el docente ve solo sus secciones aunque la query traiga otro docenteId', async () => {
    exigirApp();
    const { docente, periodo, mia } = await docenteYEstudiante();

    const res = await request(app)
      .get('/api/docente/secciones')
      .query({ periodoId: String(periodo), docenteId: String(new mongoose.Types.ObjectId()) })
      .set('Authorization', `Bearer ${tokenDe({ sub: docente._id, rol: 'docente' })}`);

    expect(res.status).toBe(200);
    expect(res.body.data.map((seccion) => seccion.id)).toEqual([String(mia)]);
  });

  it('la sección de otro docente responde 404 y la nómina omite la inscripción anulada', async () => {
    exigirApp();
    const { docente, periodo, mia, ajena } = await docenteYEstudiante();
    const token = tokenDe({ sub: docente._id, rol: 'docente' });

    const ajenaRes = await request(app)
      .get(`/api/docente/secciones/${ajena}/nomina`)
      .set('Authorization', `Bearer ${token}`);
    const miaRes = await request(app)
      .get(`/api/docente/secciones/${mia}/nomina`)
      .set('Authorization', `Bearer ${token}`);
    const horario = await request(app)
      .get('/api/docente/horario')
      .query({ periodoId: String(periodo) })
      .set('Authorization', `Bearer ${token}`);

    expect(ajenaRes.status).toBe(404);
    expect(ajenaRes.body).toMatchObject({ code: DOC.SECCION_NO_ENCONTRADA, regla: null });
    expect(miaRes.status).toBe(200);
    expect(miaRes.body.data).toEqual([
      {
        nombre: 'Ana Activa',
        rut: '16666666-K',
        codigoEstudiante: 'EST-2026-010',
        correo: 'ana.activa@duoc.cl',
      },
    ]);
    expect(JSON.stringify(miaRes.body)).not.toContain('TEL-SECRETO');
    expect(JSON.stringify(miaRes.body)).not.toContain('Bruno');
    expect(horario.status).toBe(200);
    expect(horario.body.data).toHaveLength(1);
    expect(horario.body.data[0].seccionId).toBe(String(mia));
  });

  it('un rol que no es docente recibe 403', async () => {
    exigirApp();
    const { estudiante, periodo } = await docenteYEstudiante();

    const res = await request(app)
      .get('/api/docente/secciones')
      .query({ periodoId: String(periodo) })
      .set('Authorization', `Bearer ${tokenDe({ sub: estudiante._id, rol: 'estudiante' })}`);

    expect(res.status).toBe(403);
  });
});
