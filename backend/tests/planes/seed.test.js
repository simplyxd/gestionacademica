import '../../src/config/mongoose.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import sembrarSedes from '../../../db/seed/02-sedes.js';
import sembrarAsignaturas from '../../../db/seed/03-asignaturas.js';
import sembrarCarreras, { CARRERAS } from '../../../db/seed/04-carreras.js';
import sembrarPlanes, { PLANES } from '../../../db/seed/05-planes.js';
import { Carrera } from '../../src/models/carrera.model.js';
import { Plan } from '../../src/models/plan.model.js';
import { crearContexto } from '../../src/seed/lib.js';
import { construirGrafo, detectarCiclo, profundidadMaxima, validarGrafoPlan } from '../../src/utils/grafoPrerrequisitos.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba } from '../helpers/db.js';

beforeAll(conectarBaseDePrueba);
afterAll(desconectarBaseDePrueba);

const sembrarTodo = async () => {
  const ctx = crearContexto();
  for (const s of [sembrarSedes, sembrarAsignaturas, sembrarCarreras, sembrarPlanes]) await s(ctx);
  return ctx.estadisticas;
};

describe('seed de carreras y planes', () => {
  it('declara 4 carreras y 2 planes', () => {
    expect(CARRERAS).toHaveLength(4);
    expect(PLANES).toHaveLength(2);
  });

  it('es idempotente', async () => {
    expect(await sembrarTodo()).toEqual({ creados: 49, actualizados: 0 });
    expect(await sembrarTodo()).toEqual({ creados: 0, actualizados: 49 });
    expect(await Carrera.countDocuments()).toBe(4);
    expect(await Plan.countDocuments({ estado: 'vigente' })).toBe(2);
  });

  it('ningún plan sembrado tiene ciclos ni viola las reglas del grafo', async () => {
    for (const plan of await Plan.find().lean()) {
      expect(detectarCiclo(construirGrafo(plan.asignaturas))).toBeNull();
      expect(validarGrafoPlan(plan.asignaturas)).toBeNull();
    }
  });

  it('el plan de Informática tiene al menos 3 niveles de profundidad', async () => {
    const inf = await Carrera.findOne({ codigo: 'INF' });
    const plan = await Plan.findOne({ carreraId: inf._id }).lean();
    expect(profundidadMaxima(construirGrafo(plan.asignaturas))).toBeGreaterThanOrEqual(3);
  });
});
