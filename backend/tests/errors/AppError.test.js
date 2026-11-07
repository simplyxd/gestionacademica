import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/errors/AppError.js';

// Contrato: AppError(status, code, message, { regla, details }).
// El code lleva un prefijo de dominio (GEN_, AUT_, INS_...) para que sea estable y nunca un string suelto.

const PREFIJOS_DEL_CONTRATO = [
  'GEN', 'AUT', 'USR', 'PAR', 'SED', 'ASG', 'CAR', 'PLN', 'PER', 'PRS', 'MTR', 'SEC', 'OFE', 'INS', 'DOC', 'REP',
];

describe('AppError', () => {
  it('guarda status, código y mensaje, con regla null y sin detalles por defecto', () => {
    const error = new AppError(404, 'SED_NO_ENCONTRADA', 'La sede no existe.');

    expect(error.status).toBe(404);
    expect(error.code).toBe('SED_NO_ENCONTRADA');
    expect(error.message).toBe('La sede no existe.');
    expect(error.regla).toBeNull();
    expect(error.details).toBeUndefined();
  });

  it('guarda la regla académica y los detalles cuando se entregan', () => {
    const error = new AppError(422, 'INS_SIN_CUPO', 'La sección MAT-101 A está llena (30/30).', {
      regla: 'Cupo disponible',
      details: { cupo: { inscritos: 30, maximo: 30 } },
    });

    expect(error.regla).toBe('Cupo disponible');
    expect(error.details).toEqual({ cupo: { inscritos: 30, maximo: 30 } });
  });

  it('es un Error normal y se identifica como AppError', () => {
    const error = new AppError(400, 'GEN_DATOS_INVALIDOS', 'Hay datos inválidos.');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
  });

  it.each([200, 399, 600, 404.5, '404', undefined])('rechaza el status %s: debe ser un entero entre 400 y 599', (status) => {
    expect(() => new AppError(status, 'GEN_ALGO', 'Mensaje.')).toThrow(TypeError);
  });

  it.each(['sin_cupo', 'SIN_CUPO', 'XYZ_ALGO', 'INS_', 'INS_con_minuscula', 'INS__DOBLE', ''])(
    'rechaza el código "%s": debe ser PREFIJO_EN_MAYUSCULAS con un prefijo del contrato',
    (code) => {
      expect(() => new AppError(422, code, 'Mensaje.')).toThrow(TypeError);
    },
  );

  it('acepta todos los prefijos del contrato', () => {
    for (const prefijo of PREFIJOS_DEL_CONTRATO) {
      expect(() => new AppError(400, `${prefijo}_ALGO`, 'Mensaje.')).not.toThrow();
    }
  });

  it.each(['', '   ', undefined])('rechaza un mensaje vacío (%j)', (mensaje) => {
    expect(() => new AppError(400, 'GEN_ALGO', mensaje)).toThrow(TypeError);
  });
});
