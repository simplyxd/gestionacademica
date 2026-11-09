import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Periodo } from '../../src/models/periodo.model.js';
import * as servicio from '../../src/services/periodos.service.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const datos = (codigo = '2026-2') => ({
  codigo,
  nombre: `Período ${codigo}`,
  inicio: '2026-08-01',
  termino: '2026-12-15',
  inscripcionInicio: '2026-07-20',
  inscripcionTermino: '2026-08-10',
});

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Periodo.init();
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('hoy y ventana (D-05)', () => {
  it('calcula hoy en hora de Chile, no en UTC', () => {
    // 02:00 UTC del 1 de agosto todavía es 31 de julio en Santiago.
    expect(servicio.hoyEnSantiago(new Date('2026-08-01T02:00:00Z'))).toBe('2026-07-31');
  });

  const p = { estado: 'inscripcion_abierta', inscripcionInicio: '2026-07-20', inscripcionTermino: '2026-08-10' };

  it('el último día de la ventana todavía está abierto', () => {
    expect(servicio.ventanaAbierta(p, '2026-08-10')).toBe(true);
  });
  it('el día siguiente al cierre ya no', () => {
    expect(servicio.ventanaAbierta(p, '2026-08-11')).toBe(false);
  });
  it('si el estado no es inscripcion_abierta, está cerrada aunque la fecha calce', () => {
    expect(servicio.ventanaAbierta({ ...p, estado: 'en_curso' }, '2026-08-01')).toBe(false);
  });
});

describe('máquina de estados', () => {
  it('avanza paso a paso hasta cerrado', async () => {
    const { id } = await servicio.crear(datos());
    for (const estado of ['inscripcion_abierta', 'en_curso', 'cerrado']) {
      const p = await servicio.cambiarEstado(id, estado);
      expect(p.estado).toBe(estado);
    }
  });

  it('no deja saltarse pasos', async () => {
    const { id } = await servicio.crear(datos());
    await expect(servicio.cambiarEstado(id, 'en_curso')).rejects.toMatchObject({
      status: 409,
      code: 'PER_TRANSICION_INVALIDA',
      details: { actual: 'planificacion', permitidos: ['inscripcion_abierta'] },
    });
  });

  it('no deja retroceder (D-04)', async () => {
    const { id } = await servicio.crear(datos());
    await servicio.cambiarEstado(id, 'inscripcion_abierta');
    await expect(servicio.cambiarEstado(id, 'planificacion')).rejects.toMatchObject({ code: 'PER_TRANSICION_INVALIDA' });
  });

  it('no deja dos en curso', async () => {
    await Periodo.create({ ...datos('2026-1'), estado: 'en_curso' });
    const { id } = await Periodo.create({ ...datos(), estado: 'inscripcion_abierta' });
    await expect(servicio.cambiarEstado(id, 'en_curso')).rejects.toMatchObject({ status: 409, code: 'PER_YA_HAY_EN_CURSO' });
  });

  it('un período cerrado no se edita', async () => {
    const { id } = await Periodo.create({ ...datos(), estado: 'cerrado' });
    await expect(servicio.actualizar(id, { nombre: 'x' })).rejects.toMatchObject({ status: 409, code: 'PER_CERRADO' });
  });

  it('crear ignora el estado que venga en los datos', async () => {
    const p = await servicio.crear({ ...datos(), estado: 'cerrado' });
    expect(p.estado).toBe('planificacion');
  });

  it('id inexistente da 404', async () => {
    await expect(servicio.cambiarEstado('64b000000000000000000000', 'cerrado')).rejects.toMatchObject({ status: 404 });
  });
});

describe('período actual (D-06)', () => {
  it('prefiere el de inscripción abierta', async () => {
    await Periodo.create({ ...datos('2026-1'), estado: 'en_curso' });
    await Periodo.create({ ...datos('2026-2'), estado: 'inscripcion_abierta' });
    expect((await servicio.actual()).codigo).toBe('2026-2');
  });

  it('si no hay inscripción abierta, usa el en curso', async () => {
    await Periodo.create({ ...datos('2026-1'), estado: 'en_curso' });
    expect((await servicio.actual()).codigo).toBe('2026-1');
  });

  it('si no hay ninguno, 404', async () => {
    await expect(servicio.actual()).rejects.toMatchObject({ status: 404, code: 'PER_SIN_PERIODO_ACTUAL' });
  });
});
