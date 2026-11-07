import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSet;

/**
 * Levanta una base de datos temporal en memoria (replica set, D-11b) y conecta mongoose.
 * Cada archivo de test que la use obtiene su propia base, vacía y aislada.
 */
export async function conectarBaseDePrueba() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
}

/** Desconecta mongoose y apaga la base temporal. */
export async function desconectarBaseDePrueba() {
  await mongoose.disconnect();
  await replSet?.stop();
}
