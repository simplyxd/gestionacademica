import { body, param, query } from 'express-validator';
import { ESTADOS_USUARIO, ROLES } from '../constants/enums.js';
import { rutCanonico } from '../utils/rut.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const OBJECT_ID = /^[a-f\d]{24}$/i;
const ROLES_VALIDOS = Object.values(ROLES);
const ESTADOS_VALIDOS = Object.values(ESTADOS_USUARIO);

const idParam = () => param('id').isMongoId().withMessage('debe ser un identificador válido');

function fechaReal(valor) {
  if (!FECHA.test(valor)) return false;
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

function rut(obligatorio) {
  const cadena = obligatorio ? body('rut') : body('rut').optional();
  return cadena
    .isString()
    .withMessage('debe ser un texto')
    .bail()
    .custom((valor) => rutCanonico(valor) !== null)
    .withMessage('no es un RUT válido; se guarda como 12345678-5');
}

function nombre(obligatorio) {
  const cadena = obligatorio ? body('nombre') : body('nombre').optional();
  return cadena
    .isString()
    .withMessage('debe ser un texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('es obligatorio')
    .isLength({ max: 120 })
    .withMessage('debe tener como máximo 120 caracteres');
}

function correo(obligatorio) {
  const cadena = obligatorio ? body('correo') : body('correo').optional();
  return cadena.trim().isEmail().withMessage('debe ser un correo válido');
}

function telefono() {
  return body('telefono')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('debe ser un texto')
    .bail()
    .trim()
    .isLength({ max: 30 })
    .withMessage('debe tener como máximo 30 caracteres');
}

function rol(obligatorio) {
  const cadena = obligatorio ? body('rol') : body('rol').optional();
  return cadena.isIn(ROLES_VALIDOS).withMessage('no es un rol permitido');
}

function sedes() {
  return body('sedes')
    .optional()
    .isArray()
    .withMessage('debe ser una lista de sedes')
    .bail()
    .custom((lista) => lista.every((id) => typeof id === 'string' && OBJECT_ID.test(id)))
    .withMessage('cada sede debe ser un identificador válido');
}

function incorporacion(obligatorio) {
  const cadena = obligatorio ? body('incorporacion') : body('incorporacion').optional();
  return cadena.custom(fechaReal).withMessage('se guarda como fecha YYYY-MM-DD');
}

const CODIGO_ESTUDIANTE = /^EST-\d{4}-\d{3}$/;
const VINCULOS = ['planta', 'contrata', 'honorarios'];

function perfilEstudiante() {
  return body('perfilEstudiante')
    .optional({ nullable: true })
    .customSanitizer((valor) => {
      if (valor == null) return null;
      if (typeof valor !== 'object' || Array.isArray(valor)) return valor;
      const nivel = Number(valor.nivelCursando);
      return {
        codigoEstudiante: typeof valor.codigoEstudiante === 'string' ? valor.codigoEstudiante.trim().toUpperCase() : valor.codigoEstudiante,
        contactoEmergencia: typeof valor.contactoEmergencia === 'string' ? valor.contactoEmergencia.trim() : valor.contactoEmergencia,
        nivelCursando: nivel,
      };
    })
    .custom((valor) => {
      if (valor == null) return true;
      if (typeof valor !== 'object') throw new Error('debe ser un objeto');
      if (!CODIGO_ESTUDIANTE.test(valor.codigoEstudiante ?? '')) throw new Error('el código debe tener el formato EST-AAAA-NNN');
      if (typeof valor.contactoEmergencia !== 'string' || valor.contactoEmergencia === '' || valor.contactoEmergencia.length > 120) {
        throw new Error('el contacto de emergencia es obligatorio');
      }
      if (!Number.isInteger(valor.nivelCursando) || valor.nivelCursando < 1 || valor.nivelCursando > 8) {
        throw new Error('el nivel debe ser un entero del 1 al 8');
      }
      return true;
    });
}

function perfilDocente() {
  return body('perfilDocente')
    .optional({ nullable: true })
    .customSanitizer((valor) => {
      if (valor == null) return null;
      if (typeof valor !== 'object' || Array.isArray(valor)) return valor;
      const departamentos = Array.isArray(valor.departamentos)
        ? valor.departamentos.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
        : [];
      return {
        especialidad: typeof valor.especialidad === 'string' ? valor.especialidad.trim() : '',
        tipoVinculo: valor.tipoVinculo,
        departamentos,
      };
    })
    .custom((valor) => {
      if (valor == null) return true;
      if (typeof valor !== 'object') throw new Error('debe ser un objeto');
      if (!VINCULOS.includes(valor.tipoVinculo)) throw new Error('el vínculo debe ser planta, contrata u honorarios');
      if (typeof valor.especialidad !== 'string' || valor.especialidad.length > 120) throw new Error('la especialidad admite hasta 120 caracteres');
      if (valor.departamentos.some((item) => item.length > 120)) throw new Error('cada departamento admite hasta 120 caracteres');
      return true;
    });
}

export const esquemaListar = [
  query('rol').optional({ values: 'falsy' }).isIn(ROLES_VALIDOS).withMessage('no es un rol permitido'),
  query('estado').optional({ values: 'falsy' }).isIn(ESTADOS_VALIDOS).withMessage('no es un estado permitido'),
  query('q')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 120 })
    .withMessage('debe tener como máximo 120 caracteres'),
  // page, limit y sort se dejan pasar como texto: paginar rechaza los valores inválidos.
  query('page').optional({ values: 'falsy' }).isString().withMessage('debe ser un texto'),
  query('limit').optional({ values: 'falsy' }).isString().withMessage('debe ser un texto'),
  query('sort').optional({ values: 'falsy' }).isString().withMessage('debe ser un texto'),
];

export const esquemaId = [idParam()];

export const esquemaCrear = [
  rut(true),
  nombre(true),
  correo(true),
  telefono(),
  body('clave').isString().withMessage('es obligatoria').bail().notEmpty().withMessage('es obligatoria'),
  rol(true),
  sedes(),
  incorporacion(true),
  perfilEstudiante(),
  perfilDocente(),
];

export const esquemaEditar = [
  idParam(),
  rut(false),
  nombre(false),
  correo(false),
  telefono(),
  rol(false),
  sedes(),
  incorporacion(false),
  perfilEstudiante(),
  perfilDocente(),
];

export const esquemaEstado = [
  idParam(),
  body('estado').isIn(ESTADOS_VALIDOS).withMessage('debe ser activo o inactivo'),
];
