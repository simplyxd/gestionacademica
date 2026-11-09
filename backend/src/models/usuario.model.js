import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import '../config/mongoose.js';
import { ESTADOS_USUARIO, ROLES } from '../constants/enums.js';
import { rutCanonico } from '../utils/rut.js';
import { perfilDocenteSchema, perfilEstudianteSchema, validarPerfilSegunRol } from './perfiles.schemas.js';

// bcrypt (algoritmo, con sal). bcryptjs lo implementa en JS puro: mismo formato $2a$12$, sin SHA-256 ni cifrado.
export const COSTO_BCRYPT = 12;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function correoCanonico(valor) {
  return typeof valor === 'string' ? valor.trim().toLowerCase() : valor;
}

/** Reescribe rut y correo del filtro para que la búsqueda use la misma forma que quedó guardada (D-01, D-03). */
function normalizarFiltro() {
  const filtro = this.getFilter();
  if (typeof filtro.rut === 'string') {
    const canonico = rutCanonico(filtro.rut);
    if (canonico) filtro.rut = canonico;
  }
  if (typeof filtro.correo === 'string') filtro.correo = correoCanonico(filtro.correo);
}

/** Lo mismo cuando el cambio llega por findOneAndUpdate ($set), que no pasa por los setters del documento. */
function normalizarActualizacion() {
  const actualizacion = this.getUpdate();
  if (!actualizacion || typeof actualizacion !== 'object') return;
  const destino = actualizacion.$set ?? actualizacion;
  if (typeof destino.rut === 'string') {
    const canonico = rutCanonico(destino.rut);
    if (canonico) destino.rut = canonico;
  }
  if (typeof destino.correo === 'string') destino.correo = correoCanonico(destino.correo);
}

const esquema = new mongoose.Schema(
  {
    rut: {
      type: String,
      required: [true, 'El RUT es obligatorio'],
      unique: true,
      set: (valor) => (typeof valor === 'string' ? (rutCanonico(valor) ?? valor.trim()) : valor),
      validate: {
        validator: (valor) => rutCanonico(valor) === valor,
        message: 'El RUT no es válido: revisa el dígito verificador. Se guarda como 12345678-5',
      },
    },
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 120 },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      set: correoCanonico,
      validate: {
        validator: (valor) => CORREO.test(valor),
        message: 'El correo no tiene un formato válido',
      },
    },
    telefono: { type: String, trim: true, maxlength: 30, default: '' },
    passwordHash: { type: String, required: [true, 'La clave es obligatoria'], select: false },
    rol: { type: String, required: [true, 'El rol es obligatorio'], enum: Object.values(ROLES) },
    sedes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }], default: [] },
    estado: { type: String, enum: Object.values(ESTADOS_USUARIO), default: ESTADOS_USUARIO.ACTIVO },
    incorporacion: {
      type: String,
      required: [true, 'La fecha de incorporación es obligatoria'],
      validate: {
        validator: (valor) => FECHA.test(valor),
        message: 'La incorporación se guarda como fecha YYYY-MM-DD',
      },
    },
    debeCambiarClave: { type: Boolean, default: false },
    perfilDocente: { type: perfilDocenteSchema },
    perfilEstudiante: { type: perfilEstudianteSchema },
  },
  { timestamps: true, collection: 'usuarios' },
);

// El unique del subdocumento no alcanza: el índice tiene que ser de la colección, y sparse para quien no es estudiante.
esquema.index({ 'perfilEstudiante.codigoEstudiante': 1 }, { unique: true, sparse: true });

esquema.pre(/^find/, normalizarFiltro);
esquema.pre('countDocuments', normalizarFiltro);
esquema.pre('findOneAndUpdate', normalizarActualizacion);

// D-04: el rol y el perfil se validan juntos. Si no calzan, el documento no se guarda.
esquema.pre('validate', function rechazarPerfilQueNoCalza() {
  const motivo = validarPerfilSegunRol({
    rol: this.rol,
    perfilDocente: this.perfilDocente ?? null,
    perfilEstudiante: this.perfilEstudiante ?? null,
  });
  if (motivo) this.invalidate('rol', motivo);
});

esquema.methods.fijarClave = async function fijarClave(clave) {
  if (typeof clave !== 'string' || clave.length === 0) {
    throw new Error('La clave no puede estar vacía');
  }
  this.passwordHash = await bcrypt.hash(clave, COSTO_BCRYPT);
};

export const Usuario = mongoose.model('Usuario', esquema);
