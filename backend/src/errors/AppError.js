// Prefijos de dominio permitidos para el code (contrato transversal).
const PREFIJOS = ['GEN', 'AUT', 'USR', 'PAR', 'SED', 'ASG', 'CAR', 'PLN', 'PER', 'PRS', 'MTR', 'SEC', 'OFE', 'INS', 'DOC', 'REP'];
const FORMATO_CODIGO = new RegExp(`^(${PREFIJOS.join('|')})_[A-Z0-9]+(_[A-Z0-9]+)*$`);

/**
 * Error de negocio o de petición con la forma del contrato:
 *   { code, regla, message, details? } + el status HTTP.
 *
 * - status: entero 400-599 (400 forma, 401 sin sesión, 403 sin permiso, 404 no existe,
 *   409 choque de unicidad o estado, 422 regla académica violada).
 * - code: PREFIJO_EN_MAYUSCULAS estable; se importa de errors/codigos/<dominio>.js.
 * - message: en español; nombra la regla y el dato concreto.
 * - regla: nombre de la regla académica, o null si no es una regla.
 */
export class AppError extends Error {
  constructor(status, code, message, { regla = null, details } = {}) {
    if (!Number.isInteger(status) || status < 400 || status > 599) {
      throw new TypeError(`AppError: status inválido (${status}); debe ser un entero entre 400 y 599.`);
    }
    if (typeof code !== 'string' || !FORMATO_CODIGO.test(code)) {
      throw new TypeError(`AppError: el código "${code}" no cumple el contrato (PREFIJO_EN_MAYUSCULAS con prefijo ${PREFIJOS.join(', ')}).`);
    }
    if (typeof message !== 'string' || message.trim() === '') {
      throw new TypeError('AppError: el mensaje no puede estar vacío.');
    }

    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.regla = regla;
    this.details = details;
  }
}
