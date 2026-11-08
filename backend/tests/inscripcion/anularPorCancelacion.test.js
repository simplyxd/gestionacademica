import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Inscripcion } from '../../src/models/inscripcion.model.js';
import { anularPorCancelacion } from '../../src/services/inscripciones.service.js';
import { conTransaccion } from '../../src/utils/transaccion.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const id = () => new mongoose.Types.ObjectId();
const inscribir = (seccionId, extra = {}) =>
  Inscripcion.create({ estudianteId: id(), seccionId, periodoId: id(), matriculaId: id(), ...extra });

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Inscripcion.init();
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('anularPorCancelacion (D-30)', () => {
  it('anula las activas de esa sección con motivo seccion_cancelada', async () => {
    const seccion = id();
    await inscribir(seccion);
    await inscribir(seccion);

    expect(await anularPorCancelacion(seccion)).toBe(2);

    const todas = await Inscripcion.find({ seccionId: seccion });
    expect(todas).toHaveLength(2); // no se borró ninguna
    for (const i of todas) {
      expect(i.estado).toBe('anulada');
      expect(i.motivo).toBe('seccion_cancelada');
      expect(i.fechaAnulacion).toBeInstanceOf(Date);
    }
  });

  it('no toca otras secciones', async () => {
    const otra = id();
    await inscribir(otra);
    await anularPorCancelacion(id());
    expect((await Inscripcion.findOne({ seccionId: otra })).estado).toBe('activa');
  });

  it('no cambia el motivo de las que ya estaban anuladas', async () => {
    const seccion = id();
    await inscribir(seccion, { estado: 'anulada', motivo: 'estudiante', fechaAnulacion: new Date() });
    expect(await anularPorCancelacion(seccion)).toBe(0);
    expect((await Inscripcion.findOne({ seccionId: seccion })).motivo).toBe('estudiante');
  });

  it('funciona dentro de una transacción y se deshace si la transacción falla', async () => {
    const seccion = id();
    await inscribir(seccion);

    await expect(
      conTransaccion(async (sesion) => {
        await anularPorCancelacion(seccion, sesion);
        throw new Error('falló la cancelación de la sección');
      }),
    ).rejects.toThrow('falló');

    expect((await Inscripcion.findOne({ seccionId: seccion })).estado).toBe('activa');
  });

  it('el motivo solo acepta valores del contrato', async () => {
    await expect(inscribir(id(), { motivo: 'porque_si' })).rejects.toThrow(/motivo/);
  });
});
