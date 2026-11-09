import { describe, expect, it } from 'vitest';
import { validarCambioClave } from './clave';

const vacio = { actual: '', nueva: '', confirmacion: '' };

describe('validarCambioClave', () => {
  it('pide los tres campos y que la nueva se repita igual', () => {
    expect(validarCambioClave(vacio).actual).toMatch(/actual/);
    expect(validarCambioClave({ ...vacio, actual: 'Clave-Vieja-1', nueva: 'corta', confirmacion: 'corta' }).nueva).toMatch(/10/);
    expect(validarCambioClave({ actual: 'Clave-Vieja-1', nueva: 'soloLetras', confirmacion: 'soloLetras' }).nueva).toMatch(/número/);
    expect(validarCambioClave({ actual: 'Clave-Vieja-1', nueva: 'Clave-Vieja-1', confirmacion: 'Clave-Vieja-1' }).nueva).toMatch(/distinta/);
    expect(validarCambioClave({ actual: 'Clave-Vieja-1', nueva: 'Clave-Nueva-2', confirmacion: 'otra' }).confirmacion).toMatch(/no coinciden/);
  });

  it('acepta una clave distinta, de 8 o más, bien repetida', () => {
    expect(validarCambioClave({ actual: 'Clave-Vieja-1', nueva: 'Clave-Nueva-2', confirmacion: 'Clave-Nueva-2' })).toEqual({});
  });
});
