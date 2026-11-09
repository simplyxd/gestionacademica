import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Plan } from '../../src/models/plan.model.js';
import * as servicio from '../../src/services/asignaturas.service.js';
import { admin, crearBase, iniciarModelos } from '../estructura/fixtures.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('asignaturas.service', () => {
  it('crea, busca por código o nombre y pagina', async () => {
    await crearBase();
    await servicio.crear(admin, { codigo: 'mat-101', nombre: 'Álgebra', creditos: 6 });
    expect((await servicio.listar(admin, { q: 'mat-1' })).data.map((a) => a.codigo)).toEqual(['MAT-101']);
    expect((await servicio.listar(admin, { q: 'álge' })).meta.total).toBe(1);
    expect((await servicio.listar(admin, { limit: '2', page: '3' })).meta).toEqual({ page: 3, limit: 2, total: 5 });
  });

  it('la búsqueda escapa expresiones regulares', async () => {
    await crearBase();
    expect((await servicio.listar(admin, { q: '.*' })).meta.total).toBe(0);
  });

  it('409 con código duplicado', async () => {
    await crearBase();
    await expect(servicio.crear(admin, { codigo: 'tst-100', nombre: 'x y', creditos: 3 })).rejects.toMatchObject({
      status: 409,
      code: 'ASG_CODIGO_DUPLICADO',
      message: expect.stringContaining('TST-100'),
    });
  });

  it('404 si no existe', async () => {
    await expect(servicio.actualizar(admin, '507f1f77bcf86cd799439011', { nombre: 'x' })).rejects.toMatchObject({ status: 404 });
  });

  it('bloquea cambiar créditos si está en un plan, pero permite corregir el nombre', async () => {
    const { inf, asignaturas } = await crearBase();
    const [a] = asignaturas;
    await Plan.create({ carreraId: inf._id, nombre: 'Plan 2024', asignaturas: [{ asignaturaId: a._id, semestre: 1, tipo: 'obligatoria' }] });
    await expect(servicio.actualizar(admin, a._id.toString(), { creditos: 8 })).rejects.toMatchObject({
      status: 409,
      code: 'ASG_CREDITOS_BLOQUEADOS',
      message: expect.stringContaining('Plan 2024'),
    });
    expect((await servicio.actualizar(admin, a._id.toString(), { nombre: 'Nuevo nombre', creditos: 5 })).data.nombre).toBe('Nuevo nombre');
  });

  it('cambia créditos si no está en ningún plan', async () => {
    const { asignaturas } = await crearBase();
    expect((await servicio.actualizar(admin, asignaturas[1]._id.toString(), { creditos: 8 })).data.creditos).toBe(8);
  });
});
