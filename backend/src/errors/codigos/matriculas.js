// Códigos de error del dominio de matrículas (prefijo MTR_).

export const MTR = Object.freeze({
  NO_ENCONTRADA: 'MTR_NO_ENCONTRADA', //          404: la matrícula no existe
  TRANSICION_INVALIDA: 'MTR_TRANSICION_INVALIDA', // 409: estado actual -> siguiente no permitido
});
