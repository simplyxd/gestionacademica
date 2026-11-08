import mongoose from 'mongoose';

// Documento de bloqueo: sirve para serializar transacciones que validan algo y luego insertan (ver utils/transaccion.js).
// La clave es única, así que dos transacciones que intentan crear el mismo bloqueo por primera vez no pueden duplicarlo.
export const esquemaBloqueo = new mongoose.Schema(
  {
    clave: { type: String, required: true, unique: true },
    version: { type: Number }, // se crea y sube solo con $inc
  },
  { collection: 'bloqueos' },
);

export const Bloqueo = mongoose.model('Bloqueo', esquemaBloqueo);
