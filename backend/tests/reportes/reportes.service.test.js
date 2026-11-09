import '../../src/config/mongoose.js';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as rep from '../../src/services/reportes.service.js';
import { admin, coordinadorDe, crearBase, iniciarModelos } from '../estructura/fixtures.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba } from '../helpers/db.js';

// Escenario calculado a mano (colecciones ajenas sembradas en crudo, según el contrato de campos):
//  - INF se imparte en Norte; ADM en Sur; MIX en Norte y Sur.
//  - Período P: 3 matrículas vigentes (e1 INF, e2 ADM, e3 MIX) + 1 retirada (e4 INF).
//  - Secciones en P: S1 (TST-100 A, Norte, cupo 2, contador 2, 2 activas + 1 anulada)
//                    S2 (TST-101 A, Sur, cupo 3, contador 2 ← desincronizado, 1 activa)
//                    S3 (TST-100 B, Sur, cancelada).
//  - Docente d1: S1 (lun 8:00-9:30 = 90) + S3 cancelada; d2: S2 (mar 10-12 + jue 10-11 = 180).
const oid = () => new mongoose.Types.ObjectId();
const P = oid();
const [e1, e2, e3, e4, d1, d2] = [oid(), oid(), oid(), oid(), oid(), oid()];
let base;
const S1 = oid();
const S2 = oid();
const S3 = oid();

beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
  base = await crearBase();
  const { norte, sur, inf, adm, asignaturas } = base;
  const mix = await mongoose.model('Carrera').create({ codigo: 'MIX', nombre: 'Mixta', sedes: [norte._id, sur._id], modalidad: 'online', jornada: 'diurna', duracionSemestres: 4 });
  const db = mongoose.connection;
  await db.collection('usuarios').insertMany([
    { _id: e1, nombre: 'Ana', rut: '1-9', rol: 'estudiante' },
    { _id: e2, nombre: 'Beto', rut: '2-7', rol: 'estudiante' },
    { _id: e3, nombre: 'Caro', rut: '3-5', rol: 'estudiante' },
    { _id: e4, nombre: 'Dani', rut: '4-3', rol: 'estudiante' },
    { _id: d1, nombre: 'Doc Uno', rut: '5-1', rol: 'docente' },
    { _id: d2, nombre: 'Doc Dos', rut: '6-K', rol: 'docente' },
  ]);
  await db.collection('matriculas').insertMany([
    { estudianteId: e1, carreraId: inf._id, periodoId: P, estado: 'vigente' },
    { estudianteId: e2, carreraId: adm._id, periodoId: P, estado: 'vigente' },
    { estudianteId: e3, carreraId: mix._id, periodoId: P, estado: 'vigente' },
    { estudianteId: e4, carreraId: inf._id, periodoId: P, estado: 'retirada' },
  ]);
  const [A, B] = asignaturas;
  await db.collection('secciones').insertMany([
    { _id: S1, asignaturaId: A._id, periodoId: P, docenteId: d1, sedeId: norte._id, letra: 'A', cupoMaximo: 2, inscritos: 2, estado: 'abierta', bloques: [{ dia: 0, inicioMin: 480, finMin: 570 }] },
    { _id: S2, asignaturaId: B._id, periodoId: P, docenteId: d2, sedeId: sur._id, letra: 'A', cupoMaximo: 3, inscritos: 2, estado: 'abierta', bloques: [{ dia: 1, inicioMin: 600, finMin: 720 }, { dia: 3, inicioMin: 600, finMin: 660 }] },
    { _id: S3, asignaturaId: A._id, periodoId: P, docenteId: d1, sedeId: sur._id, letra: 'B', cupoMaximo: 5, inscritos: 0, estado: 'cancelada', bloques: [{ dia: 2, inicioMin: 480, finMin: 600 }] },
  ]);
  await db.collection('inscripciones').insertMany([
    { estudianteId: e1, seccionId: S1, periodoId: P, estado: 'activa' },
    { estudianteId: e3, seccionId: S1, periodoId: P, estado: 'activa' },
    { estudianteId: e4, seccionId: S1, periodoId: P, estado: 'anulada' },
    { estudianteId: e2, seccionId: S2, periodoId: P, estado: 'activa' },
  ]);
});
afterAll(desconectarBaseDePrueba);

describe('reportes · matriculas', () => {
  it('admin: filtra por período y estado', async () => {
    const r = await rep.matriculas(admin, { periodoId: P.toString(), estado: 'vigente' });
    expect(r.meta.total).toBe(3);
    expect(r.data.map((m) => m.carrera.codigo)).toEqual(['ADM', 'INF', 'MIX']);
    expect(r.data[1].estudiante).toMatchObject({ nombre: 'Ana', rut: '1-9' });
  });
  it('coordinador de Norte ve INF y MIX (carrera en A y B), no ADM', async () => {
    const r = await rep.matriculas(coordinadorDe(base.norte), { periodoId: P.toString() });
    expect(r.data.map((m) => `${m.carrera.codigo}:${m.estudiante.nombre}`)).toEqual(['INF:Ana', 'INF:Dani', 'MIX:Caro']);
  });
  it('pagina', async () => {
    const r = await rep.matriculas(admin, { limit: '2', page: '2' });
    expect(r.meta).toEqual({ page: 2, limit: 2, total: 4 });
    expect(r.data).toHaveLength(2);
  });
  it('rechaza filtros inválidos (400)', async () => {
    await expect(rep.matriculas(admin, { estado: 'activa' })).rejects.toMatchObject({ status: 400, code: 'REP_FILTRO_INVALIDO' });
    await expect(rep.matriculas(admin, { periodoId: 'x' })).rejects.toMatchObject({ status: 400 });
  });
});

describe('reportes · estudiantes', () => {
  it('por carrera: solo matrículas vigentes', async () => {
    const r = await rep.estudiantes(admin, { carreraId: base.inf._id.toString() });
    expect(r.data.map((x) => x.estudiante.nombre)).toEqual(['Ana']);
  });
  it('por asignatura: inscripciones activas, respetando sedes del coordinador', async () => {
    const A = base.asignaturas[0]._id.toString();
    expect((await rep.estudiantes(admin, { asignaturaId: A })).data.map((x) => x.estudiante.nombre)).toEqual(['Ana', 'Caro']);
    expect((await rep.estudiantes(coordinadorDe(base.sur), { asignaturaId: A })).meta.total).toBe(0);
  });
});

describe('reportes · ocupacion y cupos', () => {
  it('ocupación cuenta inscripciones activas y marca la desincronización', async () => {
    const r = await rep.ocupacion(admin, { periodoId: P.toString() });
    const porId = Object.fromEntries(r.data.map((s) => [s.seccionId, s]));
    expect(porId[S1.toString()]).toMatchObject({ inscritos: 2, cupo: 2, contador: 2, desincronizado: false, porcentaje: 100, asignatura: { codigo: 'TST-100' }, sede: { nombre: 'Sede Norte' } });
    expect(porId[S2.toString()]).toMatchObject({ inscritos: 1, cupo: 3, contador: 2, desincronizado: true, porcentaje: 33.3 });
    expect(r.meta.total).toBe(3);
  });
  it('cupos: solo secciones abiertas, ordenadas por disponibles', async () => {
    const r = await rep.cupos(admin, { periodoId: P.toString() });
    expect(r.data.map((s) => [s.seccionId, s.disponibles])).toEqual([[S2.toString(), 2], [S1.toString(), 0]]);
  });
  it('coordinador de Norte solo ve S1', async () => {
    const r = await rep.ocupacion(coordinadorDe(base.norte), { periodoId: P.toString() });
    expect(r.data.map((s) => s.seccionId)).toEqual([S1.toString()]);
  });
});

describe('reportes · carga docente', () => {
  it('suma secciones y horas semanales, sin canceladas', async () => {
    const r = await rep.cargaDocente(admin, { periodoId: P.toString() });
    expect(r.data).toEqual([
      { docente: { id: d2.toString(), nombre: 'Doc Dos', rut: '6-K' }, secciones: 1, horasSemanales: 3 },
      { docente: { id: d1.toString(), nombre: 'Doc Uno', rut: '5-1' }, secciones: 1, horasSemanales: 1.5 },
    ]);
  });
});
