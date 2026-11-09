import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * MongoDB en memoria para tests de modelos y servicios.
 * Uso: `beforeAll(conectar)`, `afterEach(limpiar)`, `afterAll(desconectar)`.
 */
let servidor;

export async function conectar() {
  servidor = await MongoMemoryServer.create();
  await mongoose.connect(servidor.getUri());
  // Los índices únicos deben existir antes del primer insert, o la BD no los hace cumplir.
  await Promise.all(Object.values(mongoose.models).map((modelo) => modelo.syncIndexes()));
}

export async function limpiar() {
  const colecciones = Object.values(mongoose.connection.collections);
  await Promise.all(colecciones.map((c) => c.deleteMany({})));
}

export async function desconectar() {
  await mongoose.disconnect();
  if (servidor) await servidor.stop();
}

