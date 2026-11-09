import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Plan } from '../../src/models/plan.model.js';
import * as servicio from '../../src/services/planes.service.js';
import { admin, coordinadorDe, crearBase, iniciarModelos } from '../estructura/fixtures.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

async function preparar() {
  const base = await crearBase();
  const { data: plan } = await servicio.crear(admin, { carreraId: base.inf._id.toString(), nombre: 'Plan 2024' });
  const [A, B, C, D] = base.asignaturas.map((a) => a._id.toString());
  return { ...base, plan, A, B, C, D };
}
const fila = (asignaturaId, semestre, prerrequisitos = [], tipo = 'obligatoria') => ({ asignaturaId, semestre, tipo, prerrequisitos });

describe('planes.service · ciclo de vida', () => {
  it('un solo plan vigente por carrera (409); histórico convive', async () => {
    const { inf } = await preparar();
    await expect(servicio.crear(admin, { carreraId: inf._id.toString(), nombre: 'Plan 2025' })).rejects.toMatchObject({ status: 409, code: 'PLN_VIGENTE_DUPLICADO' });
    await expect(servicio.crear(admin, { carreraId: inf._id.toString(), nombre: 'Plan 2019', estado: 'historico' })).resolves.toBeTruthy();
  });

  it('nombre duplicado dentro de la carrera → 409', async () => {
    const { inf } = await preparar();
    await expect(servicio.crear(admin, { carreraId: inf._id.toString(), nombre: 'plan 2024', estado: 'historico' })).rejects.toMatchObject({ code: 'PLN_NOMBRE_DUPLICADO' });
  });

  it('transiciones vigente → historico → vigente, y reactivar con otro vigente choca', async () => {
    const { plan, inf } = await preparar();
    expect((await servicio.cambiarEstado(admin, plan.id, 'historico')).data.estado).toBe('historico');
    const { data: otro } = await servicio.crear(admin, { carreraId: inf._id.toString(), nombre: 'Plan 2026' });
    await expect(servicio.cambiarEstado(admin, plan.id, 'vigente')).rejects.toMatchObject({ code: 'PLN_VIGENTE_DUPLICADO' });
    await servicio.cambiarEstado(admin, otro.id, 'historico');
    expect((await servicio.cambiarEstado(admin, plan.id, 'vigente')).data.estado).toBe('vigente');
  });

  it('un plan histórico no se edita (nombre ni asignaturas)', async () => {
    const { plan, A } = await preparar();
    await servicio.cambiarEstado(admin, plan.id, 'historico');
    await expect(servicio.actualizar(admin, plan.id, { nombre: 'Otro' })).rejects.toMatchObject({ status: 409, code: 'PLN_HISTORICO_NO_EDITABLE' });
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 1)])).rejects.toMatchObject({ code: 'PLN_HISTORICO_NO_EDITABLE' });
  });

  it('el coordinador de otra sede no ve el plan (404) ni crea planes en carreras ajenas', async () => {
    const { plan, sur, norte, inf } = await preparar();
    await expect(servicio.obtener(coordinadorDe(sur), plan.id)).rejects.toMatchObject({ status: 404 });
    await expect(servicio.crear(coordinadorDe(sur), { carreraId: inf._id.toString(), nombre: 'X' })).rejects.toMatchObject({ status: 404 });
    expect((await servicio.listar(coordinadorDe(sur), {})).meta.total).toBe(0);
    expect((await servicio.listar(coordinadorDe(norte), {})).meta.total).toBe(1);
  });
});

describe('planes.service · prerrequisitos (LOR-5)', () => {
  it('guarda un conjunto válido y entrega el grafo', async () => {
    const { plan, A, B, C, D } = await preparar();
    await servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 1), fila(B, 2, [A]), fila(C, 3, [B]), fila(D, 4, [C, A], 'electiva')]);
    const { data } = await servicio.grafo(admin, plan.id);
    expect(data.nodos).toHaveLength(4);
    expect(data.nodos[0]).toMatchObject({ codigo: 'TST-100', semestre: 1 });
    expect(data.aristas).toContainEqual({ desde: D, hacia: A });
  });

  it('422 PLN_CICLO_PREREQUISITOS nombra el ciclo con códigos', async () => {
    const { plan, A, B, C } = await preparar();
    const error = await servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 1, [C]), fila(B, 2, [A]), fila(C, 3, [B])]).catch((e) => e);
    expect(error).toMatchObject({ status: 422, code: 'PLN_CICLO_PREREQUISITOS', regla: 'Prerrequisitos sin ciclos' });
    expect(error.details.camino).toBe('TST-100 → TST-102 → TST-101 → TST-100');
    expect(error.message).toContain(error.details.camino);
  });

  it('autorreferencia también es ciclo', async () => {
    const { plan, A } = await preparar();
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 1, [A])])).rejects.toMatchObject({ code: 'PLN_CICLO_PREREQUISITOS' });
  });

  it('prerrequisito fuera del plan → 422', async () => {
    const { plan, A, B } = await preparar();
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(B, 2, [A])])).rejects.toMatchObject({
      code: 'PLN_PRERREQUISITO_FUERA_DEL_PLAN',
      message: 'TST-101 exige TST-100, que no está en este plan.',
    });
  });

  it('prerrequisito en el mismo semestre → 422', async () => {
    const { plan, A, B } = await preparar();
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 2), fila(B, 2, [A])])).rejects.toMatchObject({ code: 'PLN_PRERREQUISITO_SEMESTRE' });
  });

  it('asignatura repetida, inexistente o en semestre mayor a la duración → 422', async () => {
    const { plan, A } = await preparar();
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 1), fila(A, 2)])).rejects.toMatchObject({ code: 'PLN_ASIGNATURA_REPETIDA' });
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila('507f1f77bcf86cd799439011', 1)])).rejects.toMatchObject({ code: 'PLN_ASIGNATURA_INEXISTENTE' });
    await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 5)])).rejects.toMatchObject({ code: 'PLN_SEMESTRE_FUERA_DE_CARRERA' });
  });

  it('el conjunto vacío es válido', async () => {
    const { plan } = await preparar();
    expect((await servicio.reemplazarAsignaturas(admin, plan.id, [])).data.asignaturas).toEqual([]);
  });

  it('detecta una edición concurrente (409) en vez de mezclar conjuntos', async () => {
    const { plan, A } = await preparar();
    const original = Plan.findOneAndUpdate.bind(Plan);
    // Simula que otra persona guardó justo antes: se toca updatedAt entre la lectura y la escritura.
    Plan.findOneAndUpdate = async (...args) => {
      await Plan.updateOne({ _id: plan.id }, { $set: { updatedAt: new Date(Date.now() + 1000) } }, { timestamps: false });
      return original(...args);
    };
    try {
      await expect(servicio.reemplazarAsignaturas(admin, plan.id, [fila(A, 1)])).rejects.toMatchObject({ status: 409, code: 'PLN_EDICION_CONCURRENTE' });
    } finally {
      Plan.findOneAndUpdate = original;
    }
  });
});
