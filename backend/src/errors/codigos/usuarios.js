// Códigos de error de usuarios (prefijo USR_). En el código se importa USR, nunca un string suelto.

export const USR = Object.freeze({
  NO_ENCONTRADO: 'USR_NO_ENCONTRADO', //       404: no existe, o no es visible para quien pregunta
  NO_AUTOBAJA: 'USR_NO_AUTOBAJA', //           409: un admin no puede desactivar su propia cuenta
  ULTIMO_ADMIN: 'USR_ULTIMO_ADMIN', //         409: la operación dejaría el sistema sin un admin activo
  RUT_DUPLICADO: 'USR_RUT_DUPLICADO', //       409: el índice único de rut rechazó el guardado
  CORREO_DUPLICADO: 'USR_CORREO_DUPLICADO', // 409: el índice único de correo rechazó el guardado
  CODIGO_DUPLICADO: 'USR_CODIGO_DUPLICADO', //   409: el índice único de codigoEstudiante rechazó el guardado
  CLAVE_INVALIDA: 'USR_CLAVE_INVALIDA', //     400: la clave no cumple la política
  ROL_NO_CALZA: 'USR_ROL_NO_CALZA', //         409: el rol no calza con el perfil académico que ya tiene
});
