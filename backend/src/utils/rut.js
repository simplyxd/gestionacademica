// RUT chileno en la forma canónica 12345678-5 (D-01).
// El servidor no confía en el cliente: normaliza al guardar y al buscar, y valida el dígito.

/** Quita puntos, espacios y guion, y deja el dígito verificador en mayúscula. */
function claveDeRut(valor) {
  return String(valor).replace(/[.\s-]/g, '').toUpperCase();
}

/**
 * Devuelve el RUT canónico (`12345678-5` o `16666666-K`) o `null` si el cuerpo o el dígito no calzan.
 * @param {unknown} valor
 * @returns {string | null}
 */
export function rutCanonico(valor) {
  if (typeof valor !== 'string' || valor.trim() === '') return null;

  const clave = claveDeRut(valor);
  if (!/^[1-9]\d{0,7}[\dK]$/.test(clave)) return null;

  const cuerpo = clave.slice(0, -1);
  const digito = clave.at(-1);
  let suma = 0;
  let factor = 2;
  for (const cifra of cuerpo.split('').reverse()) {
    suma += Number(cifra) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  if (digito !== esperado) return null;
  return `${cuerpo}-${digito}`;
}
