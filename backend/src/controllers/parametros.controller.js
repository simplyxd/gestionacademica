import { PAR } from '../errors/codigos/parametros.js';
import { AppError } from '../errors/AppError.js';
import { guardarParametros, obtenerParametros, vistaPara, documentoCompleto } from '../services/parametros.service.js';
import { envolver } from '../utils/respuesta.js';

export async function obtener(req, res) {
  const documento = await obtenerParametros();
  if (!documento) {
    throw new AppError(404, PAR.NO_ENCONTRADO, 'Todavía no hay parámetros institucionales guardados.');
  }

  res.status(200).json(envolver(vistaPara(documento, req.user.rol)));
}

export async function actualizar(req, res) {
  const documento = await guardarParametros(req.datos.body);
  res.status(200).json(envolver(documentoCompleto(documento)));
}
