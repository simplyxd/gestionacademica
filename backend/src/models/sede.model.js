import mongoose from 'mongoose';
import { ESTADOS_SEDE } from '../constants/enums.js';

// Sede: lugar físico donde se imparten carreras. No se borra físicamente: se cambia "estado".
//
// Unicidad del nombre: la garantiza la BD con un índice único con collation español de fuerza 1,
// que compara sin distinguir mayúsculas ni tildes ("Sede Norte" = "sede norte" = "SEDE NÓRTE").
// Los espacios sobrantes se limpian con un setter, que Mongoose aplica también en consultas y updates.

/** Quita espacios al inicio y al final y colapsa los repetidos: "  Sede   Sur " → "Sede Sur". */
export const limpiarEspacios = (valor) => (typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : valor);

/** Collation que usan el índice único y toda consulta que quiera aprovecharlo. */
export const COLLATION_NOMBRE_SEDE = Object.freeze({ locale: 'es', strength: 1 });

export const esquemaSede = new mongoose.Schema(
  {
    nombre: { type: String, required: true, set: limpiarEspacios, minlength: 2, maxlength: 100 },
    direccion: { type: String, required: true, set: limpiarEspacios, minlength: 2, maxlength: 160 },
    comuna: { type: String, required: true, set: limpiarEspacios, minlength: 2, maxlength: 80 },
    estado: { type: String, enum: Object.values(ESTADOS_SEDE), default: ESTADOS_SEDE.ACTIVA, required: true },
  },
  { collection: 'sedes', timestamps: true },
);

esquemaSede.index({ nombre: 1 }, { unique: true, collation: COLLATION_NOMBRE_SEDE, name: 'nombre_unico' });
esquemaSede.index({ estado: 1 });

export const Sede = mongoose.model('Sede', esquemaSede);
