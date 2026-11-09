import { body } from 'express-validator';
import { CREDITOS_MAX, CREDITOS_MIN } from '../models/asignatura.model.js';
import { idParam, paginacion, q, texto } from './estructura.comun.schemas.js';

const creditos = (cadena) =>
  cadena.isInt({ min: CREDITOS_MIN, max: CREDITOS_MAX }).withMessage(`debe ser un entero entre ${CREDITOS_MIN} y ${CREDITOS_MAX}`).bail().toInt();

export const esquemaListar = [...paginacion(), q()];
export const esquemaId = [idParam()];
export const esquemaCrear = [texto(body('codigo'), 12), texto(body('nombre'), 120), creditos(body('creditos'))];
export const esquemaEditar = [idParam(), texto(body('codigo').optional(), 12), texto(body('nombre').optional(), 120), creditos(body('creditos').optional())];
