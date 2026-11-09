import mongoose from 'mongoose';
import { validarBloque } from '../utils/horario.js';
import { JORNADAS, MODALIDADES, ESTADOS_SECCION } from '../constants/enums.js';

const bloqueSchema = new mongoose.Schema({
  dia: { type: Number, required: true },
  inicioMin: { type: Number, required: true },
  finMin: { type: Number, required: true }
}, { _id: false });

bloqueSchema.pre('validate', function() {
  validarBloque(this);
});

const seccionSchema = new mongoose.Schema({
  asignaturaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  periodoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  docenteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sedeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  jornada: {
    type: String,
    required: true,
    enum: Object.values(JORNADAS)
  },
  modalidad: {
    type: String,
    required: true,
    enum: Object.values(MODALIDADES)
  },
  letra: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  sala: {
    type: String,
    trim: true
  },
  cupoMaximo: {
    type: Number,
    required: true,
    min: 1
  },
  inscritos: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v) {
        return v <= this.cupoMaximo;
      },
      message: 'El número de inscritos no puede superar el cupo máximo'
    }
  },
  estado: {
    type: String,
    default: ESTADOS_SECCION.ABIERTA,
    enum: Object.values(ESTADOS_SECCION)
  },
  bloques: {
    type: [bloqueSchema],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'La sección debe contener al menos un bloque horario'
    }
  }
}, {
  timestamps: true
});

// Índices compuestos solicitados
seccionSchema.index({ asignaturaId: 1, periodoId: 1, letra: 1 }, { unique: true });
seccionSchema.index({ periodoId: 1, asignaturaId: 1 });
seccionSchema.index({ docenteId: 1, periodoId: 1 });

const Seccion = mongoose.models.Seccion || mongoose.model('Seccion', seccionSchema);

export default Seccion;