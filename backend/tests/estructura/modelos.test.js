import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Asignatura, CREDITOS_MAX, CREDITOS_MIN } from '../../src/models/asignatura.model.js';
import { Sede } from '../../src/models/sede.model.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const sedeValida = { nombre: 'Sede Central', direccion: 'Av. Libertador 4500', comuna: 'Santiago' };
const asignaturaValida = { codigo: 'MAT-101', nombre: 'Álgebra', creditos: 6 };

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Promise.all([Sede.init(), Asignatura.init()]);
});
afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('Sede', () => {
  it('se crea activa por defecto y limpia los espacios', async () => {
    const sede = await Sede.create({ ...sedeValida, nombre: '  Sede    Central ' });
    expect(sede.nombre).toBe('Sede Central');
    expect(sede.estado).toBe('activa');
  });

  it('sale al cliente con id y sin _id ni __v', async () => {
    const json = (await Sede.create(sedeValida)).toJSON();
    expect(json.id).toEqual(expect.any(String));
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('__v');
  });

  it.each(['Sede Central', 'sede central', 'SEDE CENTRAL', '  Sede   Céntral '])(
    'rechaza en la BD el nombre repetido «%s» (sin distinguir mayúsculas, tildes ni espacios)',
    async (nombre) => {
      await Sede.create(sedeValida);
      await expect(Sede.create({ ...sedeValida, nombre })).rejects.toMatchObject({ code: 11000 });
    },
  );

  it('acepta los tres estados del contrato y rechaza otros', async () => {
    for (const [i, estado] of ['activa', 'en_mantenimiento', 'inactiva'].entries()) {
      await expect(Sede.create({ ...sedeValida, nombre: `Sede ${i}`, estado })).resolves.toBeTruthy();
    }
    await expect(Sede.create({ ...sedeValida, estado: 'en mantenimiento' })).rejects.toMatchObject({ name: 'ValidationError' });
  });

  it.each(['nombre', 'direccion', 'comuna'])('exige %s', async (campo) => {
    await expect(Sede.create({ ...sedeValida, [campo]: '   ' })).rejects.toMatchObject({ name: 'ValidationError' });
  });
});

describe('Asignatura', () => {
  it('normaliza el código a mayúsculas sin espacios', async () => {
    const asignatura = await Asignatura.create({ ...asignaturaValida, codigo: ' mat-101 ' });
    expect(asignatura.codigo).toBe('MAT-101');
  });

  it('rechaza en la BD un código repetido aunque venga en minúsculas', async () => {
    await Asignatura.create(asignaturaValida);
    await expect(Asignatura.create({ ...asignaturaValida, codigo: 'mat-101', nombre: 'Otra' })).rejects.toMatchObject({ code: 11000 });
  });

  it.each(['MAT101', 'M-101', 'MATEM-101', 'MAT-10', ''])('rechaza el código mal formado «%s»', async (codigo) => {
    await expect(Asignatura.create({ ...asignaturaValida, codigo })).rejects.toMatchObject({ name: 'ValidationError' });
  });

  it.each([CREDITOS_MIN, CREDITOS_MAX])('acepta %i créditos (borde del rango)', async (creditos) => {
    await expect(Asignatura.create({ ...asignaturaValida, creditos })).resolves.toBeTruthy();
  });

  it.each([CREDITOS_MIN - 1, CREDITOS_MAX + 1, -3])('rechaza %i créditos y el mensaje indica el rango', async (creditos) => {
    const error = await Asignatura.create({ ...asignaturaValida, creditos }).catch((e) => e);
    expect(error.name).toBe('ValidationError');
    expect(error.errors.creditos.message).toContain(`entre ${CREDITOS_MIN} y ${CREDITOS_MAX}`);
  });

  it.each([4.5, 'seis'])('rechaza créditos no enteros (%s)', async (creditos) => {
    await expect(Asignatura.create({ ...asignaturaValida, creditos })).rejects.toMatchObject({ name: 'ValidationError' });
  });
});
