import mongoose from 'mongoose';
import { esquemaBloqueo } from '../models/bloqueo.model.js';

// Utilidad compartida para los endpoints que "validan algo y luego insertan" (por ejemplo, el choque de docente al
// crear secciones, o el cupo de una inscripción).
//
// Lo que se comprobó con un experimento: UNA TRANSACCIÓN SOLA NO ALCANZA. Dos transacciones simultáneas leen un estado
// sin choque e insertan documentos distintos, y las dos se confirman. Para serializarlas hay que hacer que PELEEN por
// escribir el mismo documento: el documento de bloqueo. Una de las dos choca, se reintenta sola, ve lo que guardó la
// otra y se rechaza con su propio mensaje.
//
//   await conTransaccion(
//     async (sesion) => {
//       // 1) validar con .session(sesion)  2) lanzar un AppError si choca  3) insertar con { session: sesion }
//     },
//     { bloqueos: [claveDeBloqueo('docente', docenteId, 'periodo', periodoId)] },
//   );
//
// IMPORTANTE:
//  - El cuerpo puede ejecutarse MÁS DE UNA VEZ (se reintenta ante conflictos): no debe tener efectos fuera de la
//    transacción (enviar correos, llamar a otra API, escribir sin la sesión...).
//  - Todas las lecturas y escrituras del cuerpo deben usar la sesión que recibe.
//  - Exige MongoDB como replica set (ver el mensaje de ErrorDeTransaccion).

/** Error del entorno: las transacciones no están disponibles. No es culpa de la persona que hizo la petición (responde 500). */
export class ErrorDeTransaccion extends Error {
  constructor(mensaje, causa) {
    super(mensaje);
    this.name = 'ErrorDeTransaccion';
    this.cause = causa;
  }
}

const MENSAJE_SIN_REPLICA_SET =
  'Las transacciones necesitan que MongoDB corra como replica set. Atlas ya lo es; en local, arranca mongod con ' +
  '--replSet rs0, ejecuta rs.initiate() una vez y agrega ?replicaSet=rs0 a MONGO_URI.';

// Mongo no dice "falta el replica set": responde con mensajes que confunden (por ejemplo, "does not support retryable writes").
const PISTAS_SIN_REPLICA_SET = /replica set|retryable writes|Transaction numbers are only allowed/i;

const OPCIONES_DE_TRANSACCION = { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } };

/**
 * Arma la clave de un bloqueo. Rechaza partes vacías: una clave con "undefined" bloquearía a todo el mundo por igual.
 * @example claveDeBloqueo('docente', docenteId, 'periodo', periodoId) // "docente:64b...:periodo:64c..."
 */
export function claveDeBloqueo(...partes) {
  const hayVacias = partes.some((parte) => parte === undefined || parte === null || String(parte) === '');
  if (partes.length === 0 || hayVacias) {
    throw new TypeError('claveDeBloqueo: todas las partes deben tener valor, por ejemplo claveDeBloqueo("docente", docenteId, "periodo", periodoId).');
  }
  return partes.map(String).join(':');
}

/**
 * Ejecuta `trabajo(sesion)` dentro de una transacción de MongoDB.
 * - Si el trabajo termina bien, confirma y devuelve su resultado.
 * - Si lanza un error (por ejemplo un AppError), deshace todo y relanza ESE mismo error.
 * - Ante un conflicto de escritura entre transacciones, reintenta solo.
 *
 * @param {(sesion: import('mongoose').ClientSession) => Promise<any>} trabajo
 * @param {{ bloqueos?: string[], conexion?: import('mongoose').Connection }} [opciones]
 *   bloqueos: claves (ver claveDeBloqueo) que se toman antes de ejecutar el trabajo, para serializar a quienes usen la misma.
 */
export async function conTransaccion(trabajo, { bloqueos = [], conexion = mongoose.connection } = {}) {
  for (const clave of bloqueos) {
    if (typeof clave !== 'string' || clave === '') {
      throw new TypeError('conTransaccion: cada clave de bloqueo debe ser un texto con valor; usa claveDeBloqueo().');
    }
  }

  // El índice único del bloqueo debe existir ANTES de abrir la transacción (no se pueden crear índices dentro de una).
  const Bloqueo = conexion.models.Bloqueo ?? conexion.model('Bloqueo', esquemaBloqueo);
  await Bloqueo.init();

  // Siempre en el mismo orden (y sin repetir): dos transacciones con varias claves chocan menos.
  const claves = [...new Set(bloqueos)].sort();

  const sesion = await conexion.startSession();
  try {
    let resultado;
    await sesion.withTransaction(async () => {
      for (const clave of claves) {
        await Bloqueo.updateOne({ clave }, { $inc: { version: 1 } }, { upsert: true, session: sesion });
      }
      resultado = await trabajo(sesion);
    }, OPCIONES_DE_TRANSACCION);
    return resultado;
  } catch (error) {
    if (PISTAS_SIN_REPLICA_SET.test(error?.message ?? '')) throw new ErrorDeTransaccion(MENSAJE_SIN_REPLICA_SET, error);
    throw error;
  } finally {
    await sesion.endSession();
  }
}
