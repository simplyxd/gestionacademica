// Códigos de error del dominio inscripciones (prefijo INS_). Las 7 reglas responden 422.

export const INS = Object.freeze({
  MATRICULA_NO_VIGENTE: 'INS_MATRICULA_NO_VIGENTE', //         regla 1
  FUERA_DE_VENTANA: 'INS_FUERA_DE_VENTANA', //                 regla 2
  SIN_CUPO: 'INS_SIN_CUPO', //                                 regla 3
  ASIGNATURA_FUERA_DE_PLAN: 'INS_ASIGNATURA_FUERA_DE_PLAN', // regla 4
  PREREQUISITO_PENDIENTE: 'INS_PREREQUISITO_PENDIENTE', //     regla 5
  YA_APROBADA: 'INS_YA_APROBADA', //                           regla 6
  CHOQUE_HORARIO: 'INS_CHOQUE_HORARIO', //                     regla 7
  NO_ENCONTRADA: 'INS_NO_ENCONTRADA', //                       404
  YA_INSCRITA: 'INS_YA_INSCRITA', //                           409: ya tiene esa sección activa
  YA_ANULADA: 'INS_YA_ANULADA', //                             409
  PERIODO_CERRADO: 'INS_PERIODO_CERRADO', //                   409: el período no permite cambios
});
