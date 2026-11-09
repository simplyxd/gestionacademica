// Enums del contrato transversal. Viajan en ASCII (sin tildes ni espacios): el frontend los traduce a etiquetas.
// Esta es la ÚNICA fuente: nadie crea sus propias copias.
//
// Cada enum es un objeto congelado cuyas claves son el valor en mayúsculas:
//   ROLES.ADMIN === 'admin'
// Para un esquema de Mongoose o una validación, usa la lista de valores:
//   Object.values(ROLES)

const enumerar = (...valores) => Object.freeze(Object.fromEntries(valores.map((valor) => [valor.toUpperCase(), valor])));

export const ROLES = enumerar('admin', 'coordinador', 'docente', 'estudiante');

export const ESTADOS_USUARIO = enumerar('activo', 'inactivo');

export const ESTADOS_SEDE = enumerar('activa', 'en_mantenimiento', 'inactiva');

/** "inactiva" significa cerrada a nuevo ingreso (una carrera con matriculados no se borra). */
export const ESTADOS_CARRERA = enumerar('activa', 'inactiva');

export const ESTADOS_PLAN = enumerar('vigente', 'historico');

export const TIPOS_ASIGNATURA_EN_PLAN = enumerar('obligatoria', 'electiva');

export const ESTADOS_PERIODO = enumerar('planificacion', 'inscripcion_abierta', 'en_curso', 'cerrado');

export const ESTADOS_MATRICULA = enumerar('vigente', 'suspendida', 'egresada', 'retirada');

export const MODALIDADES = enumerar('presencial', 'semipresencial', 'online');

/** Catálogo abierto: el grupo cierra la lista definitiva. */
export const JORNADAS = enumerar('diurna', 'vespertina');

/** El estado de la sección lo confirma Diego en su decisión de diseño. */
export const ESTADOS_SECCION = enumerar('abierta', 'cerrada', 'cancelada');

export const ESTADOS_INSCRIPCION = enumerar('activa', 'anulada');
