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

/**
 * Deja vacías todas las colecciones sin borrarlas, así los índices (por ejemplo los únicos) se conservan.
 * Úsala en afterEach para que un test no dependa de lo que dejó otro: afterEach(limpiarBase).
 */
export async function limpiarBase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('limpiarBase: no hay conexión a la base. Llama antes a conectarBaseDePrueba().');
  }
  await Promise.all(Object.values(mongoose.connection.collections).map((coleccion) => coleccion.deleteMany({})));
}

/** Desconecta mongoose y apaga la base temporal. */
export async function desconectarBaseDePrueba() {
  await mongoose.disconnect();
  await replSet?.stop();
}
