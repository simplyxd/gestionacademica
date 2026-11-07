import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import routes from './routes/index.js';

const LIMITE_BODY = '100kb'; // D-06: tope al JSON que acepta la API.

// D-07: el registro de cada petición lleva solo método, ruta, estado y tiempo.
// La ruta se escribe SIN la query string (puede traer datos personales o tokens) y jamás el body ni las cabeceras.
morgan.token('ruta', (req) => req.originalUrl.split('?')[0]);
const FORMATO_REGISTRO = ':method :ruta :status :response-time ms';

/**
 * Construye la aplicación, pero NO escucha en ningún puerto ni conecta a la base (D-03).
 * Eso lo hace server.js; así los tests pueden crear la app sin efectos secundarios.
 *
 * @param {object} [opciones]
 * @param {string[]} [opciones.corsOrigins] orígenes permitidos por CORS (D-05). Vacío = sin CORS
 *   (en desarrollo el proxy de Vite hace que no haga falta).
 * @param {{ write: (linea: string) => void }} [opciones.registro] destino del registro de peticiones.
 *   Sin él no se registra nada.
 */
export function crearApp({ corsOrigins = [], registro } = {}) {
  const app = express();

  app.use(helmet()); // D-06: cabeceras de seguridad HTTP (y oculta X-Powered-By).
  if (corsOrigins.length > 0) app.use(cors({ origin: corsOrigins })); // D-05: lista blanca, nunca "*".
  if (registro) app.use(morgan(FORMATO_REGISTRO, { stream: registro }));
  app.use(express.json({ limit: LIMITE_BODY }));

  // Todos los endpoints del contrato cuelgan de /api.
  app.use('/api', routes);

  // Siempre al final: lo que ninguna ruta atendió es un 404, y cualquier error se responde en JSON.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
