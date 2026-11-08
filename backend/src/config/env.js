// Lee y valida las variables de entorno. Se llama una sola vez al arrancar (server.js).
//
// Decisiones: D-04 (fail-fast: si algo falla, la app no arranca y el mensaje dice qué),
// "sin valores por defecto inseguros" (MONGO_URI y JWT_SECRET no tienen defecto),
// D-05 (CORS_ORIGIN solo es obligatoria en producción, y nunca "*").

const PUERTO_POR_DEFECTO = 3000;
const LARGO_MINIMO_JWT = 32; // 256 bits, el mínimo que exige HS256 (RFC 7518).

export class ErrorDeConfiguracion extends Error {
  constructor(problemas) {
    super(`Configuración de entorno inválida:\n${problemas.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'ErrorDeConfiguracion';
  }
}

/**
 * @param {Record<string, string | undefined>} env variables a validar (por defecto, process.env).
 * @returns configuración validada e inmutable.
 * @throws {ErrorDeConfiguracion} con TODOS los problemas encontrados, no solo el primero.
 */
export function leerEntorno(env = process.env) {
  const problemas = [];

  const nodeEnv = (env.NODE_ENV ?? '').trim() || 'development';
  const esProduccion = nodeEnv === 'production';

  // MONGO_URI: obligatoria.
  const mongoUri = (env.MONGO_URI ?? '').trim();
  if (!mongoUri) {
    problemas.push('MONGO_URI: falta. Es la dirección de la base de datos (mongodb://... o mongodb+srv://...).');
  } else if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    problemas.push('MONGO_URI: debe empezar con mongodb:// o mongodb+srv://.');
  }

  // JWT_SECRET: obligatoria y larga. El mensaje nunca incluye su valor (D-07).
  const jwtSecret = env.JWT_SECRET ?? '';
  if (!jwtSecret.trim()) {
    problemas.push('JWT_SECRET: falta. Es la clave con la que se firman los tokens de sesión.');
  } else if (jwtSecret.length < LARGO_MINIMO_JWT) {
    problemas.push(`JWT_SECRET: es demasiado corta; debe tener al menos ${LARGO_MINIMO_JWT} caracteres.`);
  }

  // PORT: opcional (3000 no es un defecto peligroso).
  let port = PUERTO_POR_DEFECTO;
  const puertoTexto = (env.PORT ?? '').trim();
  if (puertoTexto) {
    port = Number(puertoTexto);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      problemas.push('PORT: debe ser un número entero entre 1 y 65535.');
    }
  }

  // CORS_ORIGIN: lista de orígenes separados por coma. Obligatoria solo en producción.
  const corsOrigins = [];
  const corsTexto = (env.CORS_ORIGIN ?? '').trim();
  if (!corsTexto) {
    if (esProduccion) {
      problemas.push('CORS_ORIGIN: falta. En producción es obligatoria (orígenes separados por coma).');
    }
  } else {
    for (const parte of corsTexto.split(',').map((texto) => texto.trim()).filter(Boolean)) {
      if (parte === '*') {
        problemas.push('CORS_ORIGIN: no se permite "*"; indica orígenes concretos.');
        continue;
      }
      try {
        const url = new URL(parte);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('protocolo');
        corsOrigins.push(url.origin);
      } catch {
        problemas.push(`CORS_ORIGIN: "${parte}" no es un origen válido (ejemplo: https://sga.ejemplo.cl).`);
      }
    }
  }

  if (problemas.length > 0) throw new ErrorDeConfiguracion(problemas);

  return Object.freeze({
    nodeEnv,
    esProduccion,
    port,
    mongoUri,
    jwtSecret,
    corsOrigins: Object.freeze(corsOrigins),
  });
}
