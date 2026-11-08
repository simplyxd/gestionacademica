import { matchedData, validationResult } from 'express-validator';
import { AppError } from '../errors/AppError.js';
import { GEN } from '../errors/codigos/general.js';

// Mensaje que express-validator pone cuando la regla no define uno propio.
const MENSAJE_POR_DEFECTO = 'Invalid value';

/**
 * Envuelve una lista de reglas de express-validator en un middleware de ruta.
 *
 *   router.post('/', validate([body('correo').isEmail().withMessage('debe ser un correo válido')]), crear);
 *
 * - Si algo es inválido responde 400 (GEN_DATOS_INVALIDOS) con TODOS los campos con error y todos sus
 *   motivos (decisión 5C). No repite los valores enviados: podrían ser contraseñas.
 * - Si todo es válido, el servicio recibe SOLO los campos que tienen regla (decisión 4B):
 *   lo demás se descarta, así nadie puede colar "rol: admin". Quedan en req.datos.{body,params,query}
 *   y req.body se reemplaza por lo validado, por si algún código aún lee req.body.
 */
export function validate(validaciones) {
  const revisar = (req, res, next) => {
    const resultado = validationResult(req);

    if (!resultado.isEmpty()) {
      const campos = resultado.array().map((error) => ({
        campo: error.path ?? error.type,
        motivo: error.msg && error.msg !== MENSAJE_POR_DEFECTO ? String(error.msg) : 'no es válido',
      }));
      const nombres = [...new Set(campos.map((c) => c.campo))];

      return next(new AppError(400, GEN.DATOS_INVALIDOS, `Hay datos inválidos en: ${nombres.join(', ')}.`, { details: { campos } }));
    }

    const soloValidado = (ubicacion) => matchedData(req, { locations: [ubicacion], includeOptionals: false });
    const datos = { body: soloValidado('body'), params: soloValidado('params'), query: soloValidado('query') };

    req.body = datos.body;
    req.datos = datos;
    return next();
  };

  return [...validaciones, revisar];
}
