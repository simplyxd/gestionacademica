import mongoose from 'mongoose';
import { limpiarEspacios } from './sede.model.js';

// Asignatura del catálogo institucional. Los prerrequisitos NO viven aquí: pertenecen al plan de estudios
// (decisión 2026-09-05), porque la misma asignatura puede exigir cosas distintas en planes distintos.

/** Rango de créditos aceptado (PROPUESTA pendiente de confirmar por Lorenzo; ver el PR). */
export const CREDITOS_MIN = 1;
export const CREDITOS_MAX = 30;

/** Formato del código: 2 a 4 letras, guion y 3 dígitos. Ej.: MAT-101, INF-210. */
export const FORMATO_CODIGO_ASIGNATURA = /^[A-Z]{2,4}-\d{3}$/;

/** Normaliza el código antes de guardarlo o compararlo: "  mat-101 " → "MAT-101". */
export const normalizarCodigo = (valor) => (typeof valor === 'string' ? valor.trim().toUpperCase() : valor);

export const esquemaAsignatura = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      set: normalizarCodigo,
      match: [FORMATO_CODIGO_ASIGNATURA, 'El código debe tener el formato LETRAS-123 (por ejemplo, MAT-101).'],
    },
    nombre: { type: String, required: true, set: limpiarEspacios, minlength: 2, maxlength: 120 },
    creditos: {
      type: Number,
      required: true,
      min: [CREDITOS_MIN, `Los créditos deben estar entre ${CREDITOS_MIN} y ${CREDITOS_MAX}.`],
      max: [CREDITOS_MAX, `Los créditos deben estar entre ${CREDITOS_MIN} y ${CREDITOS_MAX}.`],
      validate: { validator: Number.isInteger, message: 'Los créditos deben ser un número entero.' },
    },
  },
  { collection: 'asignaturas', timestamps: true },
);

// El código ya llega normalizado en mayúsculas, así que un índice único simple basta.
esquemaAsignatura.index({ codigo: 1 }, { unique: true, name: 'codigo_unico' });

export const Asignatura = mongoose.model('Asignatura', esquemaAsignatura);
