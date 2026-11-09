import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Inscripcion } from '../../src/models/inscripcion.model.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const id = () => new mongoose.Types.ObjectId();
const alumno = id();
const seccion = id();
const datos = () => ({ estudianteId: alumno, seccionId: seccion, periodoId: id(), matriculaId: id() });

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Inscripcion.init();
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('modelo Inscripcion', () => {
  it('parte activa y con fecha', async () => {
    const i = await Inscripcion.create(datos());
    expect(i.estado).toBe('activa');
    expect(i.fechaInscripcion).toBeInstanceOf(Date);
  });

  it('no permite dos activas en la misma sección (doble clic)', async () => {
    await Inscripcion.create(datos());
    await expect(Inscripcion.create(datos())).rejects.toMatchObject({ code: 11000 });
  });

  it('después de anular se puede volver a inscribir (D-07)', async () => {
    const i = await Inscripcion.create(datos());
    i.estado = 'anulada';
    i.fechaAnulacion = new Date();
    await i.save();
    await expect(Inscripcion.create(datos())).resolves.toBeTruthy();
    expect(await Inscripcion.countDocuments()).toBe(2); // la anulada no se borró
  });
});
