/** RUT chileno: normalización, validación (módulo 11) y formato. Compartido por Usuarios y Personas. */

export function rutKey(rut: string) {
  return rut.replace(/[.\s-]/g, '').toUpperCase();
}

export function isValidRut(rut: string) {
  const key = rutKey(rut);
  if (!/^[1-9]\d{0,7}[\dK]$/.test(key)) return false;
  let sum = 0;
  let factor = 2;
  for (const digit of key.slice(0, -1).split('').reverse()) {
    sum += Number(digit) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const check = 11 - (sum % 11);
  return key.at(-1) === (check === 11 ? '0' : check === 10 ? 'K' : String(check));
}

/** `123456785` → `12.345.678-5`. */
export function formatRut(rut: string) {
  const key = rutKey(rut);
  return `${key.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${key.at(-1)}`;
}
