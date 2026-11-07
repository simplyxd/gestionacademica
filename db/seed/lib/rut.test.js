const { digitoVerificador, formatRut, isValidRut, rutKey } = require('./rut');

describe('rut', () => {
  it.each([
    [12345678, '5'],
    [14567891, '9'],
    [12300000, '5'],
    [21111222, '0'],
  ])('dígito verificador de %i es %s', (cuerpo, dv) => {
    expect(digitoVerificador(cuerpo)).toBe(dv);
  });

  it('calcula K cuando corresponde', () => {
    expect(digitoVerificador(10000013)).toBe('K');
  });

  it('formatea con puntos y guion', () => {
    expect(formatRut(12345678)).toBe('12.345.678-5');
  });

  it('valida RUT bien formados y rechaza un dígito incorrecto', () => {
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('12.345.678-K')).toBe(false);
  });

  it('normaliza para comparar', () => {
    expect(rutKey('12.345.678-k')).toBe('12345678K');
  });
});
