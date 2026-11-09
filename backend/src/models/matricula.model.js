import { Schema, model } from 'mongoose';

// Temporal hasta que exista constants/enums.js (Juan, H0): entonces se importa de ahí.
export const ESTADOS_MATRICULA = ['vigente', 'suspendida', 'egresada', 'retirada'];

const matriculaSchema = new Schema(
  {
    estudianteId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    carreraId: { type: Schema.Types.ObjectId, ref: 'Carrera', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    periodoId: { type: Schema.Types.ObjectId, ref: 'Periodo', required: true },
    estado: { type: String, enum: ESTADOS_MATRICULA, default: 'vigente' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// La BD es la última defensa ante dos altas simultáneas: un find previo no basta (D-07).
matriculaSchema.index(
  { estudianteId: 1, periodoId: 1 },
  { unique: true, partialFilterExpression: { estado: 'vigente' }, name: 'una_vigente_por_estudiante_y_periodo' },
);
matriculaSchema.index({ carreraId: 1, estado: 1 });
matriculaSchema.index({ periodoId: 1, createdAt: -1 });

const Matricula = model('Matricula', matriculaSchema);
export default Matricula;
