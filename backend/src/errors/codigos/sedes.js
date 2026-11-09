// Códigos de error del dominio sedes (prefijo SED_). Se importan; nunca se escriben como strings sueltos.

export const SED = Object.freeze({
  NOMBRE_DUPLICADO: 'SED_NOMBRE_DUPLICADO', // 409: ya existe una sede con ese nombre (sin distinguir mayúsculas ni tildes)
  NO_ENCONTRADA: 'SED_NO_ENCONTRADA', //       404: la sede no existe o no pertenece al coordinador
  CON_DEPENDENCIAS: 'SED_CON_DEPENDENCIAS', // 422: no se inactiva una sede con carreras activas o secciones abiertas
});
