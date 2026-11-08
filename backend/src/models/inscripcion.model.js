import mongoose from 'mongoose';
import { ESTADOS_INSCRIPCION } from '../constants/enums.js';
import { toJSONPlugin } from '../utils/toJSONPlugin.js';

const { ObjectId } = mongoose.Schema.Types;

export const esquemaInscripcion = new mongoose.Schema(
  {
    estudianteId: { type: ObjectId, ref: 'Usuario', required: true },
    seccionId: { type: ObjectId, ref: 'Seccion', required: true },
    periodoId: { type: ObjectId, ref: 'Periodo', required: true },
    matriculaId: { type: ObjectId, ref: 'Matricula', required: true },
    estado: { type: String, enum: Object.values(ESTADOS_INSCRIPCION), default: ESTADOS_INSCRIPCION.ACTIVA },
    fechaInscripcion: { type: Date, default: Date.now },
    fechaAnulacion: { type: Date, default: null },
  },
  { collection: 'inscripciones', timestamps: true },
);

// D-07: un alumno no puede tener dos inscripciones ACTIVAS en la misma sección.
// Las anuladas no cuentan, así se puede volver a inscribir y la historia se conserva.
esquemaInscripcion.index(
  { estudianteId: 1, seccionId: 1 },
  { unique: true, partialFilterExpression: { estado: ESTADOS_INSCRIPCION.ACTIVA }, name: 'una_activa_por_seccion' },
);
esquemaInscripcion.index({ estudianteId: 1, periodoId: 1, estado: 1 });

esquemaInscripcion.plugin(toJSONPlugin);

export const Inscripcion = mongoose.models.Inscripcion ?? mongoose.model('Inscripcion', esquemaInscripcion);
