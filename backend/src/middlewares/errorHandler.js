import { AppError } from '../errors/AppError.js';
import { AUT } from '../errors/codigos/auth.js';
import { GEN } from '../errors/codigos/general.js';

// Traduce cualquier error al formato plano del contrato { code, regla, message, details? }
// sin filtrar detalles internos (mensajes de Mongoose, trazas, valores de la base).

const MOTIVOS_DE_VALIDACION = {
  required: 'es obligatorio',
  enum: 'no es un valor permitido',
  minlength: 'es demasiado corto',
  maxlength: 'es demasiado largo',
  min: 'es menor al mínimo permitido',
  max: 'es mayor al máximo permitido',
};

// Mongoose usa "_id"; el contrato expone "id".
const nombreDeCampo = (path) => (path === '_id' ? 'id' : path);

/** Devuelve { status, code, message, regla?, details? } para el error recibido. */
function traducir(err) {
  if (err instanceof AppError) {
    return { status: err.status, code: err.code, message: err.message, regla: err.regla, details: err.details };
  }

  // Mongoose: ValidationError (esquema), CastError (identificador mal formado), E11000 (valor único repetido).
  if (err.name === 'ValidationError' && err.errors) {
    const campos = Object.entries(err.errors).map(([path, causa]) => ({
      campo: nombreDeCampo(path),
      motivo: causa.name === 'CastError' ? 'tiene un formato inválido' : (MOTIVOS_DE_VALIDACION[causa.kind] ?? 'no es válido'),
    }));
    return {
      status: 400,
      code: GEN.DATOS_INVALIDOS,
      message: `Hay datos inválidos en: ${campos.map((c) => c.campo).join(', ')}.`,
      details: { campos },
    };
  }
  if (err.name === 'CastError') {
    const campo = nombreDeCampo(err.path);
    return { status: 400, code: GEN.ID_INVALIDO, message: `El valor de «${campo}» no tiene un formato válido.`, details: { campo } };
  }
  if (err.code === 11000) {
    // Solo los NOMBRES de los campos: el valor repetido podría revelar datos de otra persona.
    const campos = Object.keys(err.keyValue ?? {});
    return {
      status: 409,
      code: GEN.DUPLICADO,
      message: `Ya existe un registro con el mismo valor de: ${campos.join(', ')}.`,
      details: { campos },
    };
  }

  // JWT: el mensaje original se descarta.
  if (err.name === 'TokenExpiredError') {
    return { status: 401, code: AUT.TOKEN_VENCIDO, message: 'Tu sesión venció. Inicia sesión de nuevo.' };
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return { status: 401, code: AUT.TOKEN_INVALIDO, message: 'Tu sesión no es válida. Inicia sesión de nuevo.' };
  }

  // Errores del lector de JSON de Express.
  if (err.type === 'entity.too.large') {
    return { status: 413, code: GEN.BODY_DEMASIADO_GRANDE, message: 'El cuerpo de la petición supera el tamaño máximo permitido.' };
  }
  if (err.type === 'entity.parse.failed') {
    return { status: 400, code: GEN.JSON_INVALIDO, message: 'El cuerpo de la petición no es un JSON válido.' };
  }

  // Otro 4xx que Express marcó como seguro de mostrar: se conserva el status, no su texto.
  const status = err.status ?? err.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 500 && err.expose) {
    return { status, code: GEN.PETICION_INVALIDA, message: 'La petición no se pudo procesar.' };
  }

  return { status: 500, code: GEN.ERROR_INTERNO, message: 'Ocurrió un error inesperado. Intenta de nuevo más tarde.' };
}

// Un manejador de errores de Express debe declarar sus 4 parámetros, aunque no use "next".
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const { status, code, message, regla = null, details } = traducir(err);

  // Los 5xx son fallas nuestras: se registran para poder investigarlas (solo el error, nunca el body).
  if (status >= 500) console.error(err);

  res.status(status).json({ code, regla, message, ...(details === undefined ? {} : { details }) });
}
