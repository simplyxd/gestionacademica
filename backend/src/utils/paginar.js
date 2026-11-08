import { AppError } from '../errors/AppError.js';
import { GEN } from '../errors/codigos/general.js';
import { envolverLista } from './respuesta.js';

// Paginación por offset (D-10): ?page=1&limit=20&sort=-apellido
//  - page: entero >= 1 (por defecto 1). limit: entero entre 1 y 100 (por defecto 20).
//  - Un valor inválido se rechaza con 400 (decisión 1B); no se corrige en silencio.
//  - sort: campos separados por coma; "-" delante = descendente (2A). Solo campos permitidos por el dominio.
//  - El orden siempre termina desempatando por _id, para que las páginas no repitan ni pierdan filas.

const PAGINA_POR_DEFECTO = 1;
const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO = 100;

const paginacionInvalida = (campo, esperado, detalles = {}) =>
  new AppError(400, GEN.PAGINACION_INVALIDA, `El parámetro «${campo}» debe ser ${esperado}.`, {
    details: { campo, ...detalles },
  });

/** Lee un entero positivo escrito solo con dígitos. Arreglos, decimales, signos y letras se rechazan. */
function leerEntero(valor, campo, porDefecto, maximo) {
  if (valor === undefined || valor === '') return porDefecto;

  const numero = typeof valor === 'string' && /^\d+$/.test(valor) ? Number(valor) : Number.NaN;
  const dentroDelRango = Number.isSafeInteger(numero) && numero >= 1 && (maximo === undefined || numero <= maximo);
  if (dentroDelRango) return numero;

  if (maximo === undefined) throw paginacionInvalida(campo, 'un entero mayor o igual a 1');
  throw paginacionInvalida(campo, `un entero entre 1 y ${maximo}`, { maximo });
}

/**
 * Convierte "apellido,-nombre" en { apellido: 1, nombre: -1, _id: 1 }.
 * @param {string[] | null} permitidos campos ordenables; null = sin restricción (orden por defecto del dominio).
 */
function leerOrden(texto, permitidos) {
  const sort = {};

  for (const pedido of texto.split(',').map((parte) => parte.trim()).filter(Boolean)) {
    const descendente = pedido.startsWith('-');
    const nombre = descendente ? pedido.slice(1) : pedido;
    const puedeOrdenar = permitidos === null || nombre === 'id' || permitidos.includes(nombre);

    if (!puedeOrdenar) {
      const lista = ['id', ...permitidos].join(', ');
      throw new AppError(400, GEN.ORDEN_INVALIDO, `No se puede ordenar por «${nombre}». Campos permitidos: ${lista}.`, {
        details: { campo: nombre, permitidos: ['id', ...permitidos] },
      });
    }
    sort[nombre === 'id' ? '_id' : nombre] = descendente ? -1 : 1;
  }

  if (!('_id' in sort)) sort._id = 1; // desempate estable
  return sort;
}

/**
 * Lee y valida page, limit y sort de la query string.
 * @param {object} query lo que llegó en ?page=&limit=&sort=
 * @param {{ camposOrdenables?: string[], ordenPorDefecto?: string }} [opciones]
 * @returns {{ page: number, limit: number, skip: number, sort: Record<string, 1 | -1> }}
 * @throws {AppError} 400 si algún valor es inválido.
 */
export function leerPaginacion(query = {}, { camposOrdenables = [], ordenPorDefecto = 'id' } = {}) {
  const page = leerEntero(query.page, 'page', PAGINA_POR_DEFECTO);
  const limit = leerEntero(query.limit, 'limit', LIMITE_POR_DEFECTO, LIMITE_MAXIMO);
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) throw paginacionInvalida('page', 'un número de página razonable');

  const pidioOrden = query.sort !== undefined && query.sort !== '';
  if (pidioOrden && typeof query.sort !== 'string') {
    throw new AppError(400, GEN.ORDEN_INVALIDO, 'El parámetro «sort» debe ser un texto, por ejemplo sort=-apellido.', {
      details: { campo: 'sort' },
    });
  }
  const sort = pidioOrden ? leerOrden(query.sort, camposOrdenables) : leerOrden(ordenPorDefecto, null);

  return { page, limit, skip, sort };
}

/**
 * Consulta una página de un modelo y entrega { data, meta: { page, limit, total } }.
 * IMPORTANTE: el filtro lo arma el servicio; nunca se arma directamente con la query string
 * (un cliente podría colar operadores de Mongo como {"$ne": ""}).
 */
export async function paginar(Modelo, filtro, query, opciones) {
  const { page, limit, skip, sort } = leerPaginacion(query, opciones);

  const [data, total] = await Promise.all([
    Modelo.find(filtro).sort(sort).skip(skip).limit(limit).exec(),
    Modelo.countDocuments(filtro).exec(),
  ]);

  return envolverLista(data, { page, limit, total });
}
