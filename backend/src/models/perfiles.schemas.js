import { Schema } from 'mongoose';

// Temporales hasta que exista constants/enums.js (Juan, H0): entonces se importan de ahí.
const ROLES = ['admin', 'coordinador', 'docente', 'estudiante'];
export const TIPOS_VINCULO = ['planta', 'contrata', 'honorarios'];

export const NIVEL_MIN = 1;
export const NIVEL_MAX = 8;
export const MAX_APROBADAS = 100;

export const perfilDocenteSchema = new Schema(
  {
    especialidad: { type: String, trim: true, maxlength: 120 },
    tipoVinculo: { type: String, enum: TIPOS_VINCULO, required: true },
    departamentos: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
  },
  { _id: false },
);

const aprobadaSchema = new Schema(
  {
    asignaturaId: { type: Schema.Types.ObjectId, ref: 'Asignatura', required: true },
    periodoId: { type: Schema.Types.ObjectId, ref: 'Periodo', required: true },
  },
  { _id: false },
);

function sinParesRepetidos(aprobadas) {
  const vistos = new Set();
  for (const { asignaturaId, periodoId } of aprobadas) {
    const clave = `${asignaturaId}:${periodoId}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
  }
  return true;
}

export const perfilEstudianteSchema = new Schema(
  {
    codigoEstudiante: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^EST-\d{4}-\d{3}$/, 'El código de estudiante debe tener el formato EST-AAAA-NNN'],
    },
    contactoEmergencia: { type: String, required: true, trim: true, maxlength: 120 },
    nivelCursando: {
      type: Number,
      required: true,
      min: NIVEL_MIN,
      max: NIVEL_MAX,
      validate: { validator: Number.isInteger, message: 'El nivel cursando debe ser un número entero' },
    },
    aprobadas: {
      type: [aprobadaSchema],
      default: [],
      validate: [
        {
          validator: (lista) => lista.length <= MAX_APROBADAS,
          message: `El historial admite hasta ${MAX_APROBADAS} asignaturas aprobadas`,
        },
        {
          validator: sinParesRepetidos,
          message: 'El historial tiene una asignatura aprobada repetida en el mismo período',
        },
      ],
    },
  },
  { _id: false },
);

/**
 * Cada rol lleva a lo más su propio perfil: docente ⇒ perfilDocente, estudiante ⇒ perfilEstudiante,
 * admin/coordinador ⇒ ninguno. El perfil puede faltar (se completa después del alta).
 * Devuelve `null` si es válido o el motivo en español; el modelo Usuario lo usa con `invalidate()`.
 */
export function validarPerfilSegunRol({ rol, perfilDocente, perfilEstudiante }) {
  const tieneDocente = perfilDocente !== null && perfilDocente !== undefined;
  const tieneEstudiante = perfilEstudiante !== null && perfilEstudiante !== undefined;

  if (!ROLES.includes(rol)) return `Rol desconocido: «${rol}»`;
  if (rol === 'docente' && tieneEstudiante) return 'Un docente no puede tener perfil de estudiante';
  if (rol === 'estudiante' && tieneDocente) return 'Un estudiante no puede tener perfil docente';
  if ((rol === 'admin' || rol === 'coordinador') && (tieneDocente || tieneEstudiante)) {
    return `Un usuario con rol ${rol} no lleva perfil académico`;
  }
  return null;
}

