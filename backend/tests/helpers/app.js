import { crearApp } from '../../src/app.js';

/** Secreto SOLO para tests (40 caracteres: cumple el mínimo de 32 del contrato). Nunca se usa fuera de los tests. */
export const SECRETO_DE_PRUEBA = 'secreto-solo-para-tests-0123456789abcdef';

/**
 * Crea la app lista para probar: igual que la real, pero con un secreto de prueba para los tokens.
 * Cualquier opción de crearApp se puede sobrescribir: crearAppDePrueba({ corsOrigins: ['https://sga.cl'] }).
 */
export function crearAppDePrueba(opciones = {}) {
  return crearApp({ jwtSecret: SECRETO_DE_PRUEBA, ...opciones });
}
