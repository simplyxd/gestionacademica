import mongoose from 'mongoose';
import { ESTADOS_CARRERA, JORNADAS, MODALIDADES } from '../constants/enums.js';
import { COLLATION_NOMBRE_SEDE, limpiarEspacios } from './sede.model.js';

// Carrera. No se borra: "inactiva" = cerrada a nuevo ingreso (decisión 2026-09-05).
// Las matrículas existentes siguen vigentes; bloquear las NUEVAS es regla de matrícula (Angel).

export const DURACION_MAXIMA_SEMESTRES = 14; // igual que features/estructura/rules.ts

/** 2 a 10 letras o dígitos, en mayúsculas. Ej.: INF, ADM, TENS2. */
export const FORMATO_CODIGO_CARRERA = /^[A-Z0-9]{2,10}$/;

const normalizarCodigo = (valor) => (typeof valor === 'string' ? valor.trim().toUpperCase() : valor);

export const esquemaCarrera = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      set: normalizarCodigo,
      match: [FORMATO_CODIGO_CARRERA, 'El código de carrera debe tener de 2 a 10 letras o dígitos (por ejemplo, INF).'],
    },
    nombre: { type: String, required: true, set: limpiarEspacios, minlength: 2, maxlength: 100 },
    sedes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
      validate: { validator: (sedes) => sedes.length > 0, message: 'La carrera debe impartirse en al menos una sede.' },
    },
    modalidad: { type: String, required: true, enum: Object.values(MODALIDADES) },
    jornada: { type: String, required: true, enum: Object.values(JORNADAS) },
    duracionSemestres: {
      type: Number,
      required: true,
      min: [1, `La duración debe estar entre 1 y ${DURACION_MAXIMA_SEMESTRES} semestres.`],
      max: [DURACION_MAXIMA_SEMESTRES, `La duración debe estar entre 1 y ${DURACION_MAXIMA_SEMESTRES} semestres.`],
      validate: { validator: Number.isInteger, message: 'La duración debe ser un número entero de semestres.' },
    },
    estado: { type: String, enum: Object.values(ESTADOS_CARRERA), default: ESTADOS_CARRERA.ACTIVA, required: true },
  },
  { collection: 'carreras', timestamps: true },
);

esquemaCarrera.index({ codigo: 1 }, { unique: true, name: 'codigo_unico' });
// Nombre único sin distinguir mayúsculas ni tildes (mismo criterio que las sedes).
esquemaCarrera.index({ nombre: 1 }, { unique: true, collation: COLLATION_NOMBRE_SEDE, name: 'nombre_unico' });
esquemaCarrera.index({ sedes: 1, estado: 1 }); // "¿la sede X tiene carreras activas?" y alcance del coordinador

export const Carrera = mongoose.model('Carrera', esquemaCarrera);
