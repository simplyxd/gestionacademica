import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as servicio from '../../src/services/sedes.service.js';
import { Carrera } from '../../src/models/carrera.model.js';
import { admin, coordinadorDe, crearBase, iniciarModelos } from '../estructura/fixtures.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

let secciones = 0;
const original = servicio.dependencias.contarSeccionesAbiertas;
beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
  servicio.dependencias.contarSeccionesAbiertas = async () => secciones;
});
afterEach(async () => {
  secciones = 0;
  await limpiarBase();
});
afterAll(async () => {
  servicio.dependencias.contarSeccionesAbiertas = original;
  await desconectarBaseDePrueba();
});

describe('sedes.service', () => {
  it('crea y lista con paginación y búsqueda', async () => {
    await crearBase();
    await servicio.crear(admin, { nombre: 'Sede Centro', direccion: 'Av. 1', comuna: 'Santiago' });
    const todas = await servicio.listar(admin, { limit: '2' });
    expect(todas.meta).toEqual({ page: 1, limit: 2, total: 3 });
    const filtradas = await servicio.listar(admin, { q: 'santi' });
    expect(filtradas.data.map((s) => s.nombre)).toEqual(['Sede Centro']);
  });

  it('409 legible con nombre duplicado (mayúsculas y tildes)', async () => {
    await crearBase();
    await expect(servicio.crear(admin, { nombre: 'SEDE NÓRTE', direccion: 'x y', comuna: 'x y' })).rejects.toMatchObject({
      status: 409,
      code: 'SED_NOMBRE_DUPLICADO',
      message: expect.stringContaining('SEDE NÓRTE'),
    });
  });

  it('el coordinador solo ve y edita sus sedes (404 en la ajena)', async () => {
    const { norte, sur } = await crearBase();
    const coord = coordinadorDe(norte);
    expect((await servicio.listar(coord, {})).data.map((s) => s.nombre)).toEqual(['Sede Norte']);
    await expect(servicio.actualizar(coord, sur._id.toString(), { comuna: 'Otra' })).rejects.toMatchObject({ status: 404, code: 'SED_NO_ENCONTRADA' });
    await expect(servicio.cambiarEstado(coord, sur._id.toString(), 'inactiva')).rejects.toMatchObject({ status: 404 });
    expect((await servicio.actualizar(coord, norte._id.toString(), { comuna: 'Calama' })).data.comuna).toBe('Calama');
  });

  it('id mal formado → 400', async () => {
    await expect(servicio.obtener(admin, 'abc')).rejects.toMatchObject({ status: 400, code: 'GEN_ID_INVALIDO' });
  });

  it('no inactiva una sede con carreras activas (422 nombra la carrera)', async () => {
    const { norte } = await crearBase();
    await expect(servicio.cambiarEstado(admin, norte._id.toString(), 'inactiva')).rejects.toMatchObject({
      status: 422,
      code: 'SED_CON_DEPENDENCIAS',
      message: expect.stringContaining('INF'),
    });
  });

  it('no inactiva una sede con secciones abiertas', async () => {
    const { norte } = await crearBase();
    await Carrera.updateMany({}, { estado: 'inactiva' });
    secciones = 2;
    await expect(servicio.cambiarEstado(admin, norte._id.toString(), 'inactiva')).rejects.toMatchObject({
      status: 422,
      message: expect.stringContaining('2 sección(es) abierta(s)'),
    });
  });

  it('inactiva cuando no hay dependencias y pasa a mantenimiento siempre', async () => {
    const { norte, sur } = await crearBase();
    expect((await servicio.cambiarEstado(admin, norte._id.toString(), 'en_mantenimiento')).data.estado).toBe('en_mantenimiento');
    await Carrera.updateMany({}, { estado: 'inactiva' });
    expect((await servicio.cambiarEstado(admin, sur._id.toString(), 'inactiva')).data.estado).toBe('inactiva');
  });
});
