import { describe, expect, it } from 'vitest';
import { PARAMETROS_DEFAULT } from '../../mocks/parametros';
import { aplicarParametrosRecibidos } from './ParametrosContext';

describe('aplicarParametrosRecibidos', () => {
  it('si el GET público no trae nombreCorto, conserva el corto y actualiza nombre y siglas', () => {
    const next = aplicarParametrosRecibidos(PARAMETROS_DEFAULT, {
      nombreInstitucion: 'Instituto Nuevo',
      siglasPortal: 'PORTAL',
      duracionSesionMinutos: 30,
    });

    expect(next.nombreInstitucion).toBe('Instituto Nuevo');
    expect(next.siglasPortal).toBe('PORTAL');
    expect(next.duracionSesionMinutos).toBe(30);
    expect(next.nombreCorto).toBe(PARAMETROS_DEFAULT.nombreCorto);
    expect(next.correoContacto).toBe(PARAMETROS_DEFAULT.correoContacto);
  });

  it('un documento completo reemplaza los campos institucionales', () => {
    const completo = { ...PARAMETROS_DEFAULT, nombreCorto: 'NUEVO', correoContacto: 'a@b.cl' };

    expect(aplicarParametrosRecibidos(PARAMETROS_DEFAULT, completo)).toEqual(completo);
  });
});
