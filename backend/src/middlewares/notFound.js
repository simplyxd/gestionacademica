import { AppError } from '../errors/AppError.js';
import { GEN } from '../errors/codigos/general.js';

// Va después de todas las rutas: si ninguna respondió, la URL no existe.
// Responde JSON (no el HTML por defecto de Express) pasando por el errorHandler.
export function notFound(req, res, next) {
  const ruta = req.originalUrl.split('?')[0]; // sin query string: puede traer datos personales o tokens
  next(new AppError(404, GEN.RUTA_NO_ENCONTRADA, `La ruta ${req.method} ${ruta} no existe.`));
}
