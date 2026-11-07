const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * MongoDB en memoria para tests de modelos y servicios.
 * Uso: `beforeAll(conectar)`, `afterEach(limpiar)`, `afterAll(desconectar)`.
 */
let servidor;

async function conectar() {
  servidor = await MongoMemoryServer.create();
  await mongoose.connect(servidor.getUri());
  // Los índices únicos deben existir antes del primer insert, o la BD no los hace cumplir.
  await Promise.all(Object.values(mongoose.models).map((modelo) => modelo.syncIndexes()));
}

async function limpiar() {
  const colecciones = Object.values(mongoose.connection.collections);
  await Promise.all(colecciones.map((c) => c.deleteMany({})));
}

async function desconectar() {
  await mongoose.disconnect();
  if (servidor) await servidor.stop();
}

module.exports = { conectar, limpiar, desconectar };
