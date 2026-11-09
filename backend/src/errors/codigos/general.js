// Códigos de error genéricos (prefijo GEN_). Cada dominio declara los suyos en errors/codigos/<dominio>.js:
// en el código nunca se escriben strings sueltos, siempre se importa la constante.

export const GEN = Object.freeze({
  ERROR_INTERNO: 'GEN_ERROR_INTERNO', //            500: algo inesperado falló
  RUTA_NO_ENCONTRADA: 'GEN_RUTA_NO_ENCONTRADA', //  404: la URL no existe
  DATOS_INVALIDOS: 'GEN_DATOS_INVALIDOS', //        400: faltan campos o tienen un valor inválido
  ID_INVALIDO: 'GEN_ID_INVALIDO', //                400: un identificador no tiene formato válido
  JSON_INVALIDO: 'GEN_JSON_INVALIDO', //            400: el body no es un JSON válido
  PETICION_INVALIDA: 'GEN_PETICION_INVALIDA', //    4xx: la petición no se pudo procesar
  BODY_DEMASIADO_GRANDE: 'GEN_BODY_DEMASIADO_GRANDE', // 413: el body supera el límite
  DUPLICADO: 'GEN_DUPLICADO', //                    409: choca con un valor único que ya existe
  PAGINACION_INVALIDA: 'GEN_PAGINACION_INVALIDA', // 400: page o limit fuera de rango o mal escritos
  ORDEN_INVALIDO: 'GEN_ORDEN_INVALIDO', //          400: sort pide un campo que no se puede ordenar
});
