import { describe, it, expect } from 'vitest';
import { leerEntorno } from '../../src/config/env.js';

// Decisiones: D-04 (fail-fast, sin valores por defecto inseguros), D-05 (CORS_ORIGIN solo en producción)
// y largo mínimo de JWT_SECRET = 32 caracteres. Se prueba con un objeto, no con process.env.

const SECRETO_VALIDO = 'a'.repeat(32);
const entornoValido = {
  MONGO_URI: 'mongodb://localhost:27017/sga',
  JWT_SECRET: SECRETO_VALIDO,
};

/** Devuelve el error que lanza leerEntorno, o undefined si no lanza. */
function errorDe(entorno) {
  try {
    leerEntorno(entorno);
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('leerEntorno', () => {
  describe('con lo mínimo necesario', () => {
    it('devuelve la configuración con valores por defecto seguros', () => {
      expect(leerEntorno(entornoValido)).toEqual({
        nodeEnv: 'development',
        esProduccion: false,
        port: 3000,
        mongoUri: 'mongodb://localhost:27017/sga',
        jwtSecret: SECRETO_VALIDO,
        corsOrigins: [],
      });
    });

    it('convierte PORT en número', () => {
      expect(leerEntorno({ ...entornoValido, PORT: '8080' }).port).toBe(8080);
    });

    it('acepta una dirección de Atlas (mongodb+srv)', () => {
      const config = leerEntorno({ ...entornoValido, MONGO_URI: 'mongodb+srv://usuario:clave@cluster.mongodb.net/sga' });
      expect(config.mongoUri).toContain('mongodb+srv://');
    });
  });

  describe('variables obligatorias', () => {
    it.each(['MONGO_URI', 'JWT_SECRET'])('falla si falta %s y nombra la variable', (nombre) => {
      const entorno = { ...entornoValido };
      delete entorno[nombre];

      expect(() => leerEntorno(entorno)).toThrow(nombre);
    });

    it('trata un valor en blanco como si faltara', () => {
      expect(() => leerEntorno({ ...entornoValido, MONGO_URI: '   ' })).toThrow('MONGO_URI');
    });

    it('informa todos los problemas a la vez, no solo el primero', () => {
      const error = errorDe({});

      expect(error.message).toContain('MONGO_URI');
      expect(error.message).toContain('JWT_SECRET');
    });
  });

  describe('JWT_SECRET', () => {
    it('rechaza un secreto de 31 caracteres', () => {
      expect(() => leerEntorno({ ...entornoValido, JWT_SECRET: 'a'.repeat(31) })).toThrow('JWT_SECRET');
    });

    it('acepta un secreto de exactamente 32 caracteres', () => {
      expect(() => leerEntorno({ ...entornoValido, JWT_SECRET: 'a'.repeat(32) })).not.toThrow();
    });

    it('no revela el valor del secreto en el mensaje de error', () => {
      const error = errorDe({ ...entornoValido, JWT_SECRET: 'corto-pero-secreto' });

      expect(error).toBeDefined();
      expect(error.message).not.toContain('corto-pero-secreto');
    });
  });

  describe('MONGO_URI', () => {
    it('rechaza una dirección que no empieza con mongodb://', () => {
      expect(() => leerEntorno({ ...entornoValido, MONGO_URI: 'http://localhost:27017' })).toThrow('MONGO_URI');
    });
  });

  describe('PORT', () => {
    it.each(['abc', '0', '70000', '3000.5'])('rechaza PORT=%s', (valor) => {
      expect(() => leerEntorno({ ...entornoValido, PORT: valor })).toThrow('PORT');
    });
  });

  describe('CORS_ORIGIN', () => {
    it('es opcional en desarrollo: el proxy de Vite evita CORS', () => {
      expect(leerEntorno(entornoValido).corsOrigins).toEqual([]);
    });

    it('es obligatoria en producción', () => {
      expect(() => leerEntorno({ ...entornoValido, NODE_ENV: 'production' })).toThrow('CORS_ORIGIN');
    });

    it('acepta una lista separada por comas y la deja limpia', () => {
      const config = leerEntorno({
        ...entornoValido,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'http://a.com, https://b.com/',
      });

      expect(config.esProduccion).toBe(true);
      expect(config.corsOrigins).toEqual(['http://a.com', 'https://b.com']);
    });

    it('nunca permite "*"', () => {
      expect(() => leerEntorno({ ...entornoValido, CORS_ORIGIN: '*' })).toThrow('CORS_ORIGIN');
    });

    it('rechaza un valor que no es un origen válido', () => {
      expect(() => leerEntorno({ ...entornoValido, CORS_ORIGIN: 'sga sin protocolo' })).toThrow('CORS_ORIGIN');
    });
  });
});
