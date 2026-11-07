import mongoose from 'mongoose';

// readyState de mongoose: 0 desconectada, 1 conectada, 2 conectando, 3 desconectando.
const CONECTADA = 1;

/**
 * Regla del health check: la API está sana solo si la base de datos está conectada.
 * Devuelve un cuerpo mínimo; nunca expone la URI de Mongo ni otros datos internos (D-X4).
 */
export function estadoSalud() {
  const conectada = mongoose.connection.readyState === CONECTADA;

  return {
    sana: conectada,
    cuerpo: { api: 'ok', db: conectada ? 'conectada' : 'desconectada' },
  };
}
