// Códigos de error de autenticación (prefijo AUT_).
// Por ahora solo los dos que el errorHandler traduce desde los errores de JWT;
// el dueño del dominio auth agrega aquí el resto (credenciales incorrectas, rol sin permiso, etc.).

export const AUT = Object.freeze({
  TOKEN_VENCIDO: 'AUT_TOKEN_VENCIDO', //   401: el token ya expiró
  TOKEN_INVALIDO: 'AUT_TOKEN_INVALIDO', // 401: la firma o el formato del token no son válidos
});
