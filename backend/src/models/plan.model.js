import mongoose from 'mongoose';
import { ESTADOS_PLAN, TIPOS_ASIGNATURA_EN_PLAN } from '../constants/enums.js';
import { DURACION_MAXIMA_SEMESTRES } from './carrera.model.js';
import { COLLATION_NOMBRE_SEDE, limpiarEspacios } from './sede.model.js';

// Plan de estudios (colección "planesEstudio"). El prerrequisito vive AQUÍ, no en la asignatura:
// la misma asignatura puede exigir cosas distintas en planes distintos (decisión 2026-09-05).
// Los prerrequisitos guardan asignaturaId (el código es un dato editable).
//
// Las reglas del grafo (sin ciclos, prerrequisito dentro del plan y en semestre menor) las valida
// planes.service con utils/grafoPrerrequisitos.js sobre el conjunto COMPLETO antes de guardar.
//
// Nombre del modelo: "Plan", porque matricula.model.js (Angel) ya referencia ref: 'Plan'.

const { ObjectId } = mongoose.Schema.Types;

const esquemaAsignaturaEnPlan = new mongoose.Schema(
  {
    asignaturaId: { type: ObjectId, ref: 'Asignatura', required: true },
    semestre: {
      type: Number,
      required: true,
      min: 1,
      max: DURACION_MAXIMA_SEMESTRES,
      validate: { validator: Number.isInteger, message: 'El semestre debe ser un número entero.' },
    },
    tipo: { type: String, required: true, enum: Object.values(TIPOS_ASIGNATURA_EN_PLAN) },
    prerrequisitos: { type: [{ type: ObjectId, ref: 'Asignatura' }], default: [] },
  },
  { _id: false },
);

export const esquemaPlan = new mongoose.Schema(
  {
    carreraId: { type: ObjectId, ref: 'Carrera', required: true },
    nombre: { type: String, required: true, set: limpiarEspacios, minlength: 2, maxlength: 60 },
    estado: { type: String, enum: Object.values(ESTADOS_PLAN), default: ESTADOS_PLAN.VIGENTE, required: true },
    asignaturas: { type: [esquemaAsignaturaEnPlan], default: [] },
  },
  { collection: 'planesEstudio', timestamps: true },
);

// Decisión (Lorenzo, 2026-11-09): solo UN plan vigente por carrera. Lo garantiza la BD, también ante dos
// activaciones simultáneas; el servicio traduce el E11000 a un 409 legible.
esquemaPlan.index(
  { carreraId: 1 },
  { unique: true, partialFilterExpression: { estado: ESTADOS_PLAN.VIGENTE }, name: 'un_vigente_por_carrera' },
);
esquemaPlan.index({ carreraId: 1, nombre: 1 }, { unique: true, collation: COLLATION_NOMBRE_SEDE, name: 'nombre_unico_en_carrera' });
esquemaPlan.index({ 'asignaturas.asignaturaId': 1 }); // "¿esta asignatura está en algún plan?"

export const Plan = mongoose.model('Plan', esquemaPlan);
