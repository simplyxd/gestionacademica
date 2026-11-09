// Códigos de error del dominio carreras (prefijo CAR_).

export const CAR = Object.freeze({
  CODIGO_DUPLICADO: 'CAR_CODIGO_DUPLICADO', //   409: ya existe una carrera con ese código
  NOMBRE_DUPLICADO: 'CAR_NOMBRE_DUPLICADO', //   409: ya existe una carrera con ese nombre
  NO_ENCONTRADA: 'CAR_NO_ENCONTRADA', //         404: no existe o no es de las sedes del coordinador
  SEDE_NO_DISPONIBLE: 'CAR_SEDE_NO_DISPONIBLE', // 422: alguna sede no existe o no está activa
  SEDE_FUERA_DE_ALCANCE: 'CAR_SEDE_FUERA_DE_ALCANCE', // 403: el coordinador asigna una sede que no es suya
});
