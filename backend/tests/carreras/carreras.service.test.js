import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Sede } from '../../src/models/sede.model.js';
import * as servicio from '../../src/services/carreras.service.js';
import { admin, coordinadorDe, crearBase, iniciarModelos } from '../estructura/fixtures.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const llamadas = [];
const original = servicio.dependencias.contarMatriculas;
beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
  servicio.dependencias.contarMatriculas = async (carreraId, opciones) => {
    llamadas.push({ carreraId: String(carreraId), ...opciones });
    return 12;
  };
});
afterEach(async () => {
  llamadas.length = 0;
  await limpiarBase();
});
afterAll(async () => {
  servicio.dependencias.contarMatriculas = original;
  await desconectarBaseDePrueba();
});

const nueva = (sedes, extra = {}) => ({ codigo: 'ENF', nombre: 'Enfermería', sedes, modalidad: 'presencial', jornada: 'diurna', duracionSemestres: 5, ...extra });

describe('carreras.service', () => {
  it('crea con sedes activas', async () => {
    const { norte, sur } = await crearBase();
    const { data } = await servicio.crear(admin, nueva([norte._id.toString(), sur._id.toString()]));
    expect(data.estado).toBe('activa');
    expect(data.sedes).toHaveLength(2);
  });

  it('422 si una sede no está activa o no existe', async () => {
    const { norte } = await crearBase();
    await Sede.updateOne({ _id: norte._id }, { estado: 'en_mantenimiento' });
    await expect(servicio.crear(admin, nueva([norte._id.toString()]))).rejects.toMatchObject({
      status: 422,
      code: 'CAR_SEDE_NO_DISPONIBLE',
      message: expect.stringContaining('Sede Norte (en_mantenimiento)'),
    });
    await expect(servicio.crear(admin, nueva(['507f1f77bcf86cd799439011']))).rejects.toMatchObject({ message: expect.stringContaining('inexistente') });
  });

  it('409 con código o nombre duplicado', async () => {
    const { norte } = await crearBase();
    await expect(servicio.crear(admin, nueva([norte._id.toString()], { codigo: 'inf' }))).rejects.toMatchObject({ status: 409, code: 'CAR_CODIGO_DUPLICADO' });
    await expect(servicio.crear(admin, nueva([norte._id.toString()], { nombre: 'INFORMÁTICA' }))).rejects.toMatchObject({ code: 'CAR_NOMBRE_DUPLICADO' });
  });

  it('el coordinador no asigna sedes ajenas (403) ni ve carreras ajenas (404)', async () => {
    const { norte, sur, adm } = await crearBase();
    const coord = coordinadorDe(norte);
    await expect(servicio.crear(coord, nueva([sur._id.toString()]))).rejects.toMatchObject({ status: 403, code: 'CAR_SEDE_FUERA_DE_ALCANCE' });
    await expect(servicio.obtener(coord, adm._id.toString())).rejects.toMatchObject({ status: 404 });
    expect((await servicio.listar(coord, {})).data.map((c) => c.codigo)).toEqual(['INF']);
    expect((await servicio.listar(coord, { sedeId: sur._id.toString() })).meta.total).toBe(0);
  });

  it('una carrera impartida en A y B la ve el coordinador de A', async () => {
    const { norte, sur } = await crearBase();
    await servicio.crear(admin, nueva([norte._id.toString(), sur._id.toString()]));
    expect((await servicio.listar(coordinadorDe(sur), {})).data.map((c) => c.codigo)).toEqual(['ADM', 'ENF']);
  });

  it('cerrar a nuevo ingreso conserva la carrera e informa matrículas vigentes', async () => {
    const { inf } = await crearBase();
    const { data } = await servicio.cambiarEstado(admin, inf._id.toString(), 'inactiva');
    expect(data).toMatchObject({ estado: 'inactiva', matriculasVigentes: 12, codigo: 'INF' });
    expect(llamadas).toEqual([{ carreraId: inf._id.toString(), estado: 'vigente' }]);
  });

  it('reabrir exige sedes activas', async () => {
    const { inf, norte } = await crearBase();
    await servicio.cambiarEstado(admin, inf._id.toString(), 'inactiva');
    await Sede.updateOne({ _id: norte._id }, { estado: 'inactiva' });
    await expect(servicio.cambiarEstado(admin, inf._id.toString(), 'activa')).rejects.toMatchObject({ status: 422 });
  });
});
