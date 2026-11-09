// Códigos de error de parámetros institucionales (prefijo PAR_).
// La forma inválida del body la responde el middleware validate con GEN_DATOS_INVALIDOS (decisión 5C).

export const PAR = Object.freeze({
  NO_ENCONTRADO: 'PAR_NO_ENCONTRADO', // 404: todavía no existe el documento único
});
