import { body } from 'express-validator';

// Misma lista que frontend/src/mocks/parametros.ts (ZONAS_HORARIAS). El servidor no confía en el cliente.
export const ZONAS_HORARIAS = ['America/Santiago', 'America/Punta_Arenas', 'Pacific/Easter'];

const MAX = {
  nombreInstitucion: 160,
  nombreCorto: 40,
  siglasPortal: 20,
  correoContacto: 160,
  telefonoMesa: 30,
  mensajeBienvenida: 500,
};

function texto(campo, max) {
  return body(campo)
    .isString().withMessage('debe ser un texto').bail()
    .trim()
    .notEmpty().withMessage('es obligatorio')
    .isLength({ max }).withMessage(`debe tener como máximo ${max} caracteres`);
}

function booleano(campo) {
  return body(campo)
    .custom((valor) => typeof valor === 'boolean')
    .withMessage('debe ser verdadero o falso');
}

export const reglasParametros = [
  texto('nombreInstitucion', MAX.nombreInstitucion),
  texto('nombreCorto', MAX.nombreCorto),
  texto('siglasPortal', MAX.siglasPortal),
  texto('telefonoMesa', MAX.telefonoMesa),
  texto('mensajeBienvenida', MAX.mensajeBienvenida),
  body('correoContacto')
    .isString().withMessage('debe ser un texto').bail()
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('es obligatorio')
    .isEmail().withMessage('debe tener forma de correo')
    .isLength({ max: MAX.correoContacto }).withMessage(`debe tener como máximo ${MAX.correoContacto} caracteres`),
  body('zonaHoraria')
    .isString().withMessage('debe ser un texto').bail()
    .trim()
    .isIn(ZONAS_HORARIAS).withMessage('debe ser una zona horaria permitida'),
  body('duracionSesionMinutos')
    .custom((valor) => Number.isInteger(valor) && valor >= 5 && valor <= 720)
    .withMessage('debe ser un entero entre 5 y 720'),
  booleano('permitirRecuperacionClave'),
  booleano('mostrarCodigoAsignaturaEnTablas'),
];
