// Códigos de error de autenticación (prefijo AUT_).
// TOKEN_VENCIDO y TOKEN_INVALIDO los traduce el errorHandler desde los errores de jsonwebtoken.
// El resto los lanza el dominio auth con AppError.

export const AUT = Object.freeze({
  TOKEN_VENCIDO: 'AUT_TOKEN_VENCIDO', //             401: el token ya expiró
  TOKEN_INVALIDO: 'AUT_TOKEN_INVALIDO', //           401: la firma o el formato del token no son válidos
  TOKEN_AUSENTE: 'AUT_TOKEN_AUSENTE', //             401: no vino un Bearer token
  SESION_INVALIDA: 'AUT_SESION_INVALIDA', //         401: el token es válido pero el usuario ya no existe
  CUENTA_INACTIVA: 'AUT_CUENTA_INACTIVA', //         401: la cuenta está inactiva (aunque el token siga vigente)
  CREDENCIALES_INVALIDAS: 'AUT_CREDENCIALES_INVALIDAS', // 401: correo o clave incorrectos; el mismo código en ambos casos
  CLAVE_ACTUAL_INCORRECTA: 'AUT_CLAVE_ACTUAL_INCORRECTA', // 401: al cambiar la clave, la actual no coincide
  POLITICA_CLAVE: 'AUT_POLITICA_CLAVE', //           400: la clave nueva no cumple la política
  SIN_PERMISO: 'AUT_SIN_PERMISO', //                 403: el rol no está en la matriz para ese permiso
});
