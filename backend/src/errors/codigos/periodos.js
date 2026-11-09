// Códigos de error del dominio períodos (prefijo PER_).

export const PER = Object.freeze({
  NO_ENCONTRADO: 'PER_NO_ENCONTRADO', //               404: el período no existe
  SIN_PERIODO_ACTUAL: 'PER_SIN_PERIODO_ACTUAL', //     404: no hay período abierto ni en curso
  TRANSICION_INVALIDA: 'PER_TRANSICION_INVALIDA', //   409: el cambio de estado no sigue el orden permitido
  CERRADO: 'PER_CERRADO', //                           409: un período cerrado no se edita
  YA_HAY_EN_CURSO: 'PER_YA_HAY_EN_CURSO', //           409: ya existe otro período en curso
});
