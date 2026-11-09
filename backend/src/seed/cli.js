import '../config/mongoose.js'; // siempre primero: registra el plugin global antes de que los archivos de semilla carguen los modelos
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import mongoose from 'mongoose';
import { ErrorDeConfiguracion, leerEntorno } from '../config/env.js';
import { ErrorDeSemilla, ErrorDeUso, MENSAJE_RESET_EN_PRODUCCION, ejecutarSemillas, reiniciarBase } from './runner.js';

// npm run seed            carga los datos de db/seed/NN-*.js (idempotente: se puede repetir)
// npm run seed -- --reset BORRA toda la base antes de sembrar (pide confirmación; prohibido en producción)

const DIRECTORIO_SEMILLAS = fileURLToPath(new URL('../../../db/seed/', import.meta.url));

async function preguntarPorTerminal(texto) {
  const interfaz = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await interfaz.question(texto);
  } finally {
    interfaz.close();
  }
}

async function main() {
  const quiereReiniciar = process.argv.includes('--reset');
  const config = leerEntorno();

  // Antes de conectarse a nada: reiniciar en producción nunca es una opción.
  if (quiereReiniciar && config.esProduccion) throw new ErrorDeUso(MENSAJE_RESET_EN_PRODUCCION);

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    // No se imprime la URI ni el mensaje original: pueden traer usuario y contraseña.
    throw new ErrorDeUso(`No se pudo conectar a MongoDB (${error.name}). Revisa MONGO_URI y que la base esté encendida.`);
  }

  try {
    if (quiereReiniciar) {
      const reinicio = await reiniciarBase({
        conexion: mongoose.connection,
        esProduccion: config.esProduccion,
        hayTerminal: Boolean(process.stdin.isTTY),
        preguntar: preguntarPorTerminal,
      });
      if (!reinicio) {
        console.log('Cancelado: no se borró nada.');
        return;
      }
      console.log('Base borrada.');
    }

    await ejecutarSemillas({ directorio: DIRECTORIO_SEMILLAS });
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  const esperado = error instanceof ErrorDeConfiguracion || error instanceof ErrorDeSemilla || error instanceof ErrorDeUso;
  console.error(esperado ? error.message : error);
  process.exit(1);
});
