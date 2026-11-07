const mongoose = require('mongoose');
const Matricula = require('./matricula.model');
const { conectar, limpiar, desconectar } = require('../../tests/helpers/mongo');

const id = () => new mongoose.Types.ObjectId();

function nueva(over = {}) {
  return { estudianteId: id(), carreraId: id(), planId: id(), periodoId: id(), ...over };
}

describe('modelo Matricula', () => {
  beforeAll(conectar);
  afterEach(limpiar);
  afterAll(desconectar);

  it('nace vigente', async () => {
    const m = await Matricula.create(nueva());
    expect(m.estado).toBe('vigente');
  });

  it('rechaza un estado fuera del catálogo', async () => {
    await expect(Matricula.create(nueva({ estado: 'congelada' }))).rejects.toThrow(/estado/);
  });

  it('exige estudiante, carrera, plan y período', async () => {
    const error = await Matricula.create({}).catch((e) => e);
    expect(Object.keys(error.errors).sort()).toEqual(['carreraId', 'estudianteId', 'periodoId', 'planId']);
  });

  describe('una sola vigente por estudiante y período (índice único parcial)', () => {
    it('la BD rechaza la segunda vigente del mismo estudiante en el mismo período', async () => {
      const base = nueva();
      await Matricula.create(base);
      const error = await Matricula.create({ ...base, carreraId: id(), planId: id() }).catch((e) => e);
      expect(error.code).toBe(11000);
    });

    it('con dos altas simultáneas, solo una queda vigente', async () => {
      const base = nueva();
      const resultados = await Promise.allSettled([Matricula.create(base), Matricula.create(base)]);
      expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await Matricula.countDocuments({ estado: 'vigente' })).toBe(1);
    });

    it('permite otra vigente del mismo estudiante en otro período', async () => {
      const base = nueva();
      await Matricula.create(base);
      await expect(Matricula.create({ ...base, periodoId: id() })).resolves.toBeDefined();
    });

    it('permite otro estudiante en el mismo período', async () => {
      const base = nueva();
      await Matricula.create(base);
      await expect(Matricula.create({ ...base, estudianteId: id() })).resolves.toBeDefined();
    });

    it.each(['suspendida', 'egresada', 'retirada'])('una matrícula %s no bloquea una nueva vigente', async (estado) => {
      const base = nueva();
      await Matricula.create({ ...base, estado });
      await expect(Matricula.create(base)).resolves.toBeDefined();
    });
  });

  it('al serializar expone id como string y oculta _id y __v', async () => {
    const m = await Matricula.create(nueva());
    const json = m.toJSON();
    expect(json.id).toBe(m._id.toString());
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('__v');
  });
});
