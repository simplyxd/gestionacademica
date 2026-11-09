import mongoose from 'mongoose';
import { crearApp } from './app.js';
import { ErrorDeConfiguracion, leerEntorno } from './config/env.js';

// server.js es lo único que "enciende" la app (D-03): valida el entorno (D-04),
// conecta a Mongo y escucha en el puerto. app.js nunca hace nada de esto.

function textoDeConsulta(valor) {
  try {
    return JSON.stringify(valor, (clave, actual) => {
      if (clave === 'passwordHash') return '[oculto]';
      // La sesión de una transacción apunta al cliente de Mongo y ese objeto es circular.
      if (clave === 'session') return undefined;
      return actual;
    });
  } catch {
    return '[no imprimible]';
  }
}

function registrarConsultaMongo(coleccion, metodo, ...resto) {
  const texto = resto
    .filter((parte) => parte !== undefined)
    .map(textoDeConsulta)
    .join(' ');
  console.log(`mongo ${coleccion}.${metodo}${texto ? ` ${texto}` : ''}`);
}

async function iniciar() {
  const config = leerEntorno(); // si falta algo, lanza ErrorDeConfiguracion y no se arranca
  const app = crearApp({ corsOrigins: config.corsOrigins, registro: process.stdout, jwtSecret: config.jwtSecret });

  // En local, cada petición HTTP deja debajo la consulta real que se mandó a Mongo.
  if (config.nodeEnv === 'development') mongoose.set('debug', registrarConsultaMongo);

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    // No se imprime la URI ni el mensaje original: pueden traer usuario y contraseña (D-07).
    throw new Error(`No se pudo conectar a MongoDB (${error.name}). Revisa MONGO_URI y que la base esté encendida.`);
  }
  console.log('MongoDB conectado.');

  const servidor = app.listen(config.port, () => {
    console.log(`API escuchando en http://localhost:${config.port}/api (entorno: ${config.nodeEnv})`);
  });

  // Cierre ordenado: deja de aceptar peticiones y cierra la conexión a la base.
  const apagar = (senal) => {
    console.log(`\nRecibida ${senal}: cerrando...`);
    servidor.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once('SIGINT', () => apagar('SIGINT'));
  process.once('SIGTERM', () => apagar('SIGTERM'));
}

iniciar().catch((error) => {
  // Un problema de configuración se explica solo con su mensaje; cualquier otro error muestra la traza.
  console.error(error instanceof ErrorDeConfiguracion ? error.message : error);
  process.exit(1);
});
