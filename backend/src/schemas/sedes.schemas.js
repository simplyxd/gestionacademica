import { body } from 'express-validator';
import { ESTADOS_SEDE } from '../constants/enums.js';
import { enumQuery, idParam, paginacion, q, texto } from './estructura.comun.schemas.js';

const ESTADOS = Object.values(ESTADOS_SEDE);

export const esquemaListar = [...paginacion(), q(), enumQuery('estado', ESTADOS)];
export const esquemaId = [idParam()];
export const esquemaCrear = [
  texto(body('nombre'), 100),
  texto(body('direccion'), 160),
  texto(body('comuna'), 80),
  body('estado').optional().isIn(ESTADOS).withMessage(`debe ser uno de: ${ESTADOS.join(', ')}`),
];
export const esquemaEditar = [
  idParam(),
  texto(body('nombre').optional(), 100),
  texto(body('direccion').optional(), 160),
  texto(body('comuna').optional(), 80),
];
export const esquemaEstado = [idParam(), body('estado').isIn(ESTADOS).withMessage(`debe ser uno de: ${ESTADOS.join(', ')}`)];
