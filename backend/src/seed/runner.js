import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { crearContexto } from './lib.js';

// Ejecuta los archivos de semilla (NN-nombre.js) de una carpeta, en orden numérico.
// Cada archivo exporta por defecto una función async que recibe { upsertPorClave, resolver, log }.

const PATRON_SEMILLA = /^(\d{2})-.+\.js$/;

/** La persona pidió algo que no se puede hacer (por ejemplo --reset en producción). Se muestra solo el mensaje. */
export class ErrorDeUso extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeUso';
  }
}

/** Un archivo de semilla falló. Dice cuál y por qué; el runner se detiene ahí (decisión 4A). */
export class ErrorDeSemilla extends Error {
  constructor(archivo, causa) {
    super(`La semilla ${archivo} falló: ${causa.message}`);
    this.name = 'ErrorDeSemilla';
    this.archivo = archivo;
    this.cause = causa;
  }
}

/** Lista los archivos NN-nombre.js de la carpeta en orden. Rechaza números repetidos: el orden sería ambiguo. */
export async function listarSemillas(directorio) {
  let nombres;
  try {
    nombres = await readdir(directorio);
  } catch {
    throw new Error(`No existe la carpeta de semillas: ${directorio}`);
  }

  const archivos = nombres.filter((nombre) => PATRON_SEMILLA.test(nombre)).sort();

  const porNumero = new Map();
  for (const archivo of archivos) {
    const numero = archivo.slice(0, 2);
    if (porNumero.has(numero)) {
      throw new Error(
        `Numeración repetida: ${porNumero.get(numero)} y ${archivo} empiezan con ${numero}-. ` +
          'Cada archivo necesita un número único para que el orden sea claro.',
      );
    }
    porNumero.set(numero, archivo);
  }

  return archivos;
}

/**
 * Ejecuta todas las semillas. Si una falla, lanza ErrorDeSemilla y NO ejecuta las siguientes
 * (lo anterior queda hecho, y se puede volver a correr porque cada semilla es idempotente).
 * @returns [{ archivo, creados, actualizados }]
 */
export async function ejecutarSemillas({ directorio, log = console.log } = {}) {
  const archivos = await listarSemillas(directorio);

  if (archivos.length === 0) {
    log(`No hay archivos de semilla (NN-nombre.js) en ${directorio}.`);
    return [];
  }

  const resumen = [];
  for (const archivo of archivos) {
    const contexto = crearContexto({ log: (mensaje) => log(`  ${mensaje}`) });

    try {
      const modulo = await import(pathToFileURL(path.join(directorio, archivo)).href);
      if (typeof modulo.default !== 'function') {
        throw new Error('debe exportar por defecto una función async: export default async function ({ upsertPorClave, resolver, log }) { ... }');
      }
      await modulo.default(contexto);
    } catch (causa) {
      throw new ErrorDeSemilla(archivo, causa);
    }

    const { creados, actualizados } = contexto.estadisticas;
    resumen.push({ archivo, creados, actualizados });
    log(`${archivo}: ${creados} creados, ${actualizados} actualizados`);
  }

  return resumen;
}

export const MENSAJE_RESET_EN_PRODUCCION = '--reset está prohibido con NODE_ENV=production: borraría datos reales.';

/**
 * Borra toda la base (decisión 3B) después de una pregunta "s/n". Protecciones:
 * se niega en producción, muestra qué base y qué servidor va a borrar, y no corre sin una terminal donde preguntar.
 * @returns true si borró, false si la persona canceló.
 */
export async function reiniciarBase({ conexion, esProduccion, hayTerminal, preguntar }) {
  if (esProduccion) throw new ErrorDeUso(MENSAJE_RESET_EN_PRODUCCION);
  if (!hayTerminal) {
    throw new ErrorDeUso('--reset necesita una terminal interactiva para pedir confirmación; no se puede confirmar de forma automática.');
  }

  const respuesta = await preguntar(
    `Se BORRARÁ por completo la base «${conexion.name}» (servidor ${conexion.host}). ¿Continuar? (s/n) `,
  );
  if (!['s', 'si', 'sí'].includes(respuesta.trim().toLowerCase())) return false;

  await conexion.dropDatabase();
  return true;
}
