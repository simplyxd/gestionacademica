const mongoose = require('mongoose');
const Matricula = require('../models/matricula.model');
const {
  TRANSICIONES,
  transicionesDe,
  matriculaVigente,
  contarPorCarrera,
  listar,
} = require('./matriculas.service');
const { conectar, limpiar, desconectar } = require('../../tests/helpers/mongo');

const id = () => new mongoose.Types.ObjectId();

function nueva(over = {}) {
  return { estudianteId: id(), carreraId: id(), planId: id(), periodoId: id(), ...over };
}

describe('tabla de transiciones', () => {
  it('vigente puede pasar a suspendida, egresada o retirada', () => {
    expect([...TRANSICIONES.vigente].sort()).toEqual(['egresada', 'retirada', 'suspendida']);
  });

  it('suspendida solo puede pasar a retirada', () => {
    expect(transicionesDe('suspendida')).toEqual(['retirada']);
  });

  it.each(['egresada', 'retirada'])('%s es final', (estado) => {
    expect(transicionesDe(estado)).toEqual([]);
  });

  it('no se puede modificar en tiempo de ejecución', () => {
    expect(Object.isFrozen(TRANSICIONES)).toBe(true);
    expect(Object.isFrozen(TRANSICIONES.vigente)).toBe(true);
  });
});

describe('consultas de matrícula', () => {
  beforeAll(conectar);
  afterEach(limpiar);
  afterAll(desconectar);

  describe('matriculaVigente', () => {
    it('devuelve la vigente del período con su carrera y plan', async () => {
      const base = nueva();
      await Matricula.create(base);
      const m = await matriculaVigente(base.estudianteId, base.periodoId);
      expect(m.carreraId.toString()).toBe(base.carreraId.toString());
      expect(m.planId.toString()).toBe(base.planId.toString());
    });

    it('devuelve null si la matrícula del período no está vigente', async () => {
      const base = nueva({ estado: 'suspendida' });
      await Matricula.create(base);
      expect(await matriculaVigente(base.estudianteId, base.periodoId)).toBeNull();
    });

    it('devuelve null si la vigente es de otro período', async () => {
      const base = nueva();
      await Matricula.create(base);
      expect(await matriculaVigente(base.estudianteId, id())).toBeNull();
    });

    it('acepta ids como string', async () => {
      const base = nueva();
      await Matricula.create(base);
      expect(await matriculaVigente(base.estudianteId.toString(), base.periodoId.toString())).not.toBeNull();
    });
  });

  describe('contarPorCarrera', () => {
    it('sin estado cuenta todas las matrículas de la carrera', async () => {
      const carreraId = id();
      await Matricula.create([
        nueva({ carreraId }),
        nueva({ carreraId, estado: 'retirada' }),
        nueva({ carreraId, estado: 'egresada' }),
        nueva(),
      ]);
      expect(await contarPorCarrera(carreraId)).toBe(3);
    });

    it('con estado cuenta solo ese estado', async () => {
      const carreraId = id();
      await Matricula.create([nueva({ carreraId }), nueva({ carreraId }), nueva({ carreraId, estado: 'suspendida' })]);
      expect(await contarPorCarrera(carreraId, { estado: 'vigente' })).toBe(2);
    });

    it('devuelve 0 si la carrera no tiene matrículas', async () => {
      expect(await contarPorCarrera(id())).toBe(0);
    });
  });

  describe('listar', () => {
    it('filtra por período, carrera, estado y estudiante', async () => {
      const periodoId = id();
      const carreraId = id();
      const estudianteId = id();
      await Matricula.create([
        nueva({ periodoId, carreraId, estudianteId }),
        nueva({ periodoId, carreraId, estado: 'suspendida' }),
        nueva({ periodoId }),
        nueva(),
      ]);

      expect((await listar({ periodoId })).meta.total).toBe(3);
      expect((await listar({ periodoId, carreraId })).meta.total).toBe(2);
      expect((await listar({ periodoId, carreraId, estado: 'vigente' })).meta.total).toBe(1);
      const { data } = await listar({ estudianteId });
      expect(data).toHaveLength(1);
      expect(data[0].estudianteId.toString()).toBe(estudianteId.toString());
    });

    it('ordena de la más reciente a la más antigua', async () => {
      const primera = await Matricula.create(nueva());
      const segunda = await Matricula.create(nueva());
      const { data } = await listar();
      expect(data.map((m) => m.id)).toEqual([segunda.id, primera.id]);
    });

    it('pagina con page y limit y devuelve el total', async () => {
      await Matricula.create(Array.from({ length: 5 }, () => nueva()));
      const { data, meta } = await listar({ page: 2, limit: 2 });
      expect(data).toHaveLength(2);
      expect(meta).toEqual({ page: 2, limit: 2, total: 5 });
    });

    it('usa page=1 y limit=20 por defecto', async () => {
      expect((await listar()).meta).toEqual({ page: 1, limit: 20, total: 0 });
    });

    it('limita a 100 por página y corrige valores inválidos', async () => {
      expect((await listar({ limit: 500 })).meta.limit).toBe(100);
      expect((await listar({ page: 0, limit: 0 })).meta).toMatchObject({ page: 1, limit: 20 });
      expect((await listar({ page: '3', limit: '10' })).meta).toMatchObject({ page: 3, limit: 10 });
    });
  });
});
