// Códigos de error del dominio planes de estudio (prefijo PLN_).

export const PLN = Object.freeze({
  NO_ENCONTRADO: 'PLN_NO_ENCONTRADO', //                         404
  NOMBRE_DUPLICADO: 'PLN_NOMBRE_DUPLICADO', //                   409: la carrera ya tiene un plan con ese nombre
  VIGENTE_DUPLICADO: 'PLN_VIGENTE_DUPLICADO', //                 409: la carrera ya tiene un plan vigente
  HISTORICO_NO_EDITABLE: 'PLN_HISTORICO_NO_EDITABLE', //         409: un plan histórico no se edita
  EDICION_CONCURRENTE: 'PLN_EDICION_CONCURRENTE', //             409: otra persona modificó el plan mientras tanto
  ASIGNATURA_INEXISTENTE: 'PLN_ASIGNATURA_INEXISTENTE', //       422: una asignatura del plan no existe en el catálogo
  ASIGNATURA_REPETIDA: 'PLN_ASIGNATURA_REPETIDA', //             422: la asignatura aparece dos veces en el plan
  SEMESTRE_FUERA_DE_CARRERA: 'PLN_SEMESTRE_FUERA_DE_CARRERA', // 422: el semestre supera la duración de la carrera
  PRERREQUISITO_FUERA_DEL_PLAN: 'PLN_PRERREQUISITO_FUERA_DEL_PLAN', // 422
  PRERREQUISITO_SEMESTRE: 'PLN_PRERREQUISITO_SEMESTRE', //       422: el prerrequisito no está en un semestre menor
  CICLO_PREREQUISITOS: 'PLN_CICLO_PREREQUISITOS', //             422: los prerrequisitos forman un ciclo (nombre del contrato)
});
