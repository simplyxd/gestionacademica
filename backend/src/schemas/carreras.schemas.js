import { body } from 'express-validator';
import { ESTADOS_CARRERA, JORNADAS, MODALIDADES } from '../constants/enums.js';
import { DURACION_MAXIMA_SEMESTRES } from '../models/carrera.model.js';
import { enumQuery, idParam, idQuery, paginacion, q, texto } from './estructura.comun.schemas.js';

const lista = (valores) => `debe ser uno de: ${valores.join(', ')}`;
const sedes = (cadena) =>
  [cadena.isArray({ min: 1 }).withMessage('elige al menos una sede'), body('sedes.*').isMongoId().withMessage('cada sede debe ser un identificador válido')];
const duracion = (cadena) =>
  cadena.isInt({ min: 1, max: DURACION_MAXIMA_SEMESTRES }).withMessage(`debe ser un entero entre 1 y ${DURACION_MAXIMA_SEMESTRES}`).bail().toInt();

export const esquemaListar = [...paginacion(), q(), enumQuery('estado', Object.values(ESTADOS_CARRERA)), idQuery('sedeId')];
export const esquemaId = [idParam()];
export const esquemaCrear = [
  texto(body('codigo'), 10),
  texto(body('nombre'), 100),
  ...sedes(body('sedes')),
  body('modalidad').isIn(Object.values(MODALIDADES)).withMessage(lista(Object.values(MODALIDADES))),
  body('jornada').isIn(Object.values(JORNADAS)).withMessage(lista(Object.values(JORNADAS))),
  duracion(body('duracionSemestres')),
];
export const esquemaEditar = [
  idParam(),
  texto(body('codigo').optional(), 10),
  texto(body('nombre').optional(), 100),
  ...sedes(body('sedes').optional()),
  body('modalidad').optional().isIn(Object.values(MODALIDADES)).withMessage(lista(Object.values(MODALIDADES))),
  body('jornada').optional().isIn(Object.values(JORNADAS)).withMessage(lista(Object.values(JORNADAS))),
  duracion(body('duracionSemestres').optional()),
];
export const esquemaEstado = [idParam(), body('estado').isIn(Object.values(ESTADOS_CARRERA)).withMessage(lista(Object.values(ESTADOS_CARRERA)))];
