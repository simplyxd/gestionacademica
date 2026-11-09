// Códigos de error del dominio asignaturas (prefijo ASG_). Se importan; nunca se escriben como strings sueltos.

export const ASG = Object.freeze({
  CODIGO_DUPLICADO: 'ASG_CODIGO_DUPLICADO', //       409: ya existe una asignatura con ese código
  NO_ENCONTRADA: 'ASG_NO_ENCONTRADA', //             404: la asignatura no existe
  CREDITOS_BLOQUEADOS: 'ASG_CREDITOS_BLOQUEADOS', // 409: no se cambian créditos de una asignatura que está en un plan
});
