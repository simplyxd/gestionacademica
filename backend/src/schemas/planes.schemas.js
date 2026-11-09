import { body } from 'express-validator';
import { ESTADOS_PLAN, TIPOS_ASIGNATURA_EN_PLAN } from '../constants/enums.js';
import { DURACION_MAXIMA_SEMESTRES } from '../models/carrera.model.js';
import { enumQuery, idParam, idQuery, paginacion, q, texto } from './estructura.comun.schemas.js';

const ESTADOS = Object.values(ESTADOS_PLAN);
const TIPOS = Object.values(TIPOS_ASIGNATURA_EN_PLAN);
const MAXIMO_ASIGNATURAS = 120;

export const esquemaListar = [...paginacion(), q(), enumQuery('estado', ESTADOS), idQuery('carreraId')];
export const esquemaId = [idParam()];
export const esquemaCrear = [
  body('carreraId').isMongoId().withMessage('debe ser un identificador válido'),
  texto(body('nombre'), 60),
  body('estado').optional().isIn(ESTADOS).withMessage(`debe ser uno de: ${ESTADOS.join(', ')}`),
];
export const esquemaEditar = [idParam(), texto(body('nombre').optional(), 60)];
export const esquemaEstado = [idParam(), body('estado').isIn(ESTADOS).withMessage(`debe ser uno de: ${ESTADOS.join(', ')}`)];
export const esquemaAsignaturas = [
  idParam(),
  body('asignaturas').isArray({ max: MAXIMO_ASIGNATURAS }).withMessage(`debe ser una lista de hasta ${MAXIMO_ASIGNATURAS} asignaturas`),
  body('asignaturas.*.asignaturaId').isMongoId().withMessage('debe ser un identificador válido'),
  body('asignaturas.*.semestre').isInt({ min: 1, max: DURACION_MAXIMA_SEMESTRES }).withMessage(`debe ser un entero entre 1 y ${DURACION_MAXIMA_SEMESTRES}`).bail().toInt(),
  body('asignaturas.*.tipo').isIn(TIPOS).withMessage(`debe ser uno de: ${TIPOS.join(', ')}`),
  body('asignaturas.*.prerrequisitos').optional().isArray().withMessage('debe ser una lista'),
  body('asignaturas.*.prerrequisitos.*').isMongoId().withMessage('debe ser un identificador válido'),
];
