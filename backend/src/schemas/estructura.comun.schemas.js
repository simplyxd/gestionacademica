// Piezas de validación compartidas por sedes, asignaturas, carreras, planes y reportes (express-validator).
import { param, query } from 'express-validator';

export const idParam = () => param('id').isMongoId().withMessage('debe ser un identificador válido');

/** page/limit/sort los valida utils/paginar (400 con su propio código); aquí solo se dejan pasar. */
export const paginacion = () => [query('page').optional(), query('limit').optional(), query('sort').optional().isString()];

export const q = () => query('q').optional().isString().withMessage('debe ser un texto').isLength({ max: 100 }).withMessage('admite hasta 100 caracteres');

export const idQuery = (campo) => query(campo).optional({ values: 'falsy' }).isMongoId().withMessage('debe ser un identificador válido');

export const enumQuery = (campo, valores) =>
  query(campo).optional({ values: 'falsy' }).isIn(valores).withMessage(`debe ser uno de: ${valores.join(', ')}`);

export const texto = (cadena, max) =>
  cadena.isString().withMessage('debe ser un texto').bail().trim().notEmpty().withMessage('es obligatorio').isLength({ max }).withMessage(`admite hasta ${max} caracteres`);
