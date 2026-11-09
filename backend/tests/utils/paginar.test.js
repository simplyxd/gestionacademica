import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors/AppError.js';
import { leerPaginacion, paginar } from '../../src/utils/paginar.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba } from '../helpers/db.js';

// Decisiones: D-10 (offset, tope 100, desempate por id) y 1B (un valor inválido se rechaza con 400).
// ?sort=campo (ascendente) | ?sort=-campo (descendente), solo con los campos que el dominio permita (2A).

/** Ejecuta la función y devuelve el error que lanza (o undefined). */
function errorDe(funcion) {
  try {
    funcion();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('leerPaginacion · page y limit', () => {
  it('usa page 1, limit 20 y orden por id cuando no se pide nada', () => {
    expect(leerPaginacion({})).toEqual({ page: 1, limit: 20, skip: 0, sort: { _id: 1 } });
  });

  it('calcula skip a partir de page y limit', () => {
    expect(leerPaginacion({ page: '3', limit: '10' })).toMatchObject({ page: 3, limit: 10, skip: 20 });
  });

  it('acepta limit = 100, que es el tope', () => {
    expect(leerPaginacion({ limit: '100' }).limit).toBe(100);
  });

  it.each([
    ['page', '0'],
    ['page', '-1'],
    ['page', 'abc'],
    ['page', '1.5'],
    ['page', ['1', '2']],
    ['limit', '0'],
    ['limit', '-5'],
    ['limit', 'abc'],
    ['limit', '101'],
    ['limit', '500'],
  ])('rechaza %s=%j con 400 y nombra el parámetro', (campo, valor) => {
    const error = errorDe(() => leerPaginacion({ [campo]: valor }));

    expect(error).toBeInstanceOf(AppError);
    expect(error.status).toBe(400);
    expect(error.code).toBe('GEN_PAGINACION_INVALIDA');
    expect(error.details.campo).toBe(campo);
  });

  it('el mensaje de limit dice cuál es el máximo permitido', () => {
    const error = errorDe(() => leerPaginacion({ limit: '500' }));

    expect(error.message).toContain('100');
    expect(error.details.maximo).toBe(100);
  });
});

describe('leerPaginacion · sort', () => {
  const opciones = { camposOrdenables: ['apellido', 'nombre'] };

  it('ordena ascendente por un campo permitido y desempata por _id', () => {
    expect(leerPaginacion({ sort: 'apellido' }, opciones).sort).toEqual({ apellido: 1, _id: 1 });
  });

  it('el prefijo - ordena descendente', () => {
    expect(leerPaginacion({ sort: '-apellido' }, opciones).sort).toEqual({ apellido: -1, _id: 1 });
  });

  it('acepta varios campos separados por coma, en el orden indicado', () => {
    const { sort } = leerPaginacion({ sort: 'apellido,-nombre' }, opciones);

    expect(Object.entries(sort)).toEqual([['apellido', 1], ['nombre', -1], ['_id', 1]]);
  });

  it('"id" siempre se puede ordenar, se traduce a _id y no se repite', () => {
    expect(leerPaginacion({ sort: '-id' }, opciones).sort).toEqual({ _id: -1 });
  });

  it('un sort vacío equivale a no pedir orden', () => {
    expect(leerPaginacion({ sort: '' }, opciones).sort).toEqual({ _id: 1 });
  });

  it('usa el orden por defecto del dominio, aunque ese campo no esté en la lista pública', () => {
    expect(leerPaginacion({}, { ordenPorDefecto: '-createdAt' }).sort).toEqual({ createdAt: -1, _id: 1 });
  });

  it.each(['clave', 'apellido,clave', '-clave', '__proto__', 'constructor', '$where'])(
    'rechaza ordenar por un campo no permitido (%s) con 400 y lista los permitidos',
    (sort) => {
      const error = errorDe(() => leerPaginacion({ sort }, opciones));

      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(400);
      expect(error.code).toBe('GEN_ORDEN_INVALIDO');
      expect(error.message).toContain('apellido');
    },
  );

  it('rechaza un sort que no es texto', () => {
    const error = errorDe(() => leerPaginacion({ sort: ['apellido', 'nombre'] }, opciones));

    expect(error?.code).toBe('GEN_ORDEN_INVALIDO');
  });
});

describe('paginar (con base de datos)', () => {
  const APELLIDOS = ['Pérez', 'Soto', 'Rojo', 'Vega', 'Mora'];
  const OPCIONES = { camposOrdenables: ['apellido', 'nombre'] };
  let Modelo;

  beforeAll(async () => {
    await conectarBaseDePrueba();
    Modelo = mongoose.model('PersonaDePrueba', new mongoose.Schema({ apellido: String, nombre: String }));
    // 25 personas con solo 5 apellidos distintos: ordenar por apellido produce muchos empates.
    await Modelo.insertMany(Array.from({ length: 25 }, (_, i) => ({ apellido: APELLIDOS[i % 5], nombre: `Nombre ${i}` })));
  });

  afterAll(desconectarBaseDePrueba);

  it('devuelve la página pedida con { data, meta }', async () => {
    const respuesta = await paginar(Modelo, {}, { page: '2', limit: '10' }, OPCIONES);

    expect(respuesta.meta).toEqual({ page: 2, limit: 10, total: 25 });
    expect(respuesta.data).toHaveLength(10);
  });

  it('la última página trae solo lo que sobra', async () => {
    const respuesta = await paginar(Modelo, {}, { page: '3', limit: '10' }, OPCIONES);

    expect(respuesta.data).toHaveLength(5);
  });

  it('una página fuera de rango devuelve data vacía pero conserva el total', async () => {
    const respuesta = await paginar(Modelo, {}, { page: '99', limit: '10' }, OPCIONES);

    expect(respuesta.data).toEqual([]);
    expect(respuesta.meta.total).toBe(25);
  });

  it('con empates en el campo de orden, recorrer todas las páginas no repite ni pierde filas (D-10)', async () => {
    const vistos = [];
    for (let page = 1; page <= 7; page += 1) {
      const respuesta = await paginar(Modelo, {}, { page: String(page), limit: '4', sort: 'apellido' }, OPCIONES);
      vistos.push(...respuesta.data.map((persona) => persona.id));
    }

    expect(vistos).toHaveLength(25);
    expect(new Set(vistos).size).toBe(25);
  });

  it('respeta el filtro del servicio y cuenta solo lo filtrado', async () => {
    const respuesta = await paginar(Modelo, { apellido: 'Soto' }, {}, OPCIONES);

    expect(respuesta.meta.total).toBe(5);
    expect(respuesta.data.every((persona) => persona.apellido === 'Soto')).toBe(true);
  });

  it('ordena descendente con el prefijo -', async () => {
    const respuesta = await paginar(Modelo, {}, { sort: '-apellido', limit: '1' }, OPCIONES);

    expect(respuesta.data[0].apellido).toBe('Vega');
  });

  it('rechaza una consulta inválida antes de consultar la base', async () => {
    await expect(paginar(Modelo, {}, { limit: '500' }, OPCIONES)).rejects.toThrow(AppError);
  });
});
