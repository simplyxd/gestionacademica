import { ESTADOS_INSCRIPCION } from '../constants/enums.js';
import { Inscripcion, MOTIVOS_ANULACION } from '../models/inscripcion.model.js';

/**
 * D-30: cuando Diego cancela una sección, anula todas sus inscripciones activas (no las borra).
 * - Motivo "seccion_cancelada", para que el alumno lo vea en su lista de anuladas.
 * - No libera cupo: la sección cancelada ya no recibe alumnos.
 * - No reubica: el alumno se vuelve a inscribir y pasa las 7 reglas.
 *
 * Se llama DENTRO de la transacción de cancelación de Diego, pasándole su sesión,
 * así nunca queda una sección cancelada con inscripciones activas.
 *
 * @returns cuántas inscripciones se anularon.
 */
export async function anularPorCancelacion(seccionId, sesion) {
  const resultado = await Inscripcion.updateMany(
    { seccionId, estado: ESTADOS_INSCRIPCION.ACTIVA },
    { $set: { estado: ESTADOS_INSCRIPCION.ANULADA, fechaAnulacion: new Date(), motivo: MOTIVOS_ANULACION.SECCION_CANCELADA } },
    { session: sesion },
  );
  return resultado.modifiedCount;
}
