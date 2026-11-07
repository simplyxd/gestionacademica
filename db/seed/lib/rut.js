/** RUT chileno (módulo 11). Misma lógica que frontend/src/lib/rut.ts. */

function rutKey(rut) {
  return String(rut).replace(/[.\s-]/g, '').toUpperCase();
}

function digitoVerificador(cuerpo) {
  let suma = 0;
  let factor = 2;
  for (const digito of String(cuerpo).split('').reverse()) {
    suma += Number(digito) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

function isValidRut(rut) {
  const key = rutKey(rut);
  if (!/^[1-9]\d{0,7}[\dK]$/.test(key)) return false;
  return key.at(-1) === digitoVerificador(key.slice(0, -1));
}

/** `12345678` → `12.345.678-5`. */
function formatRut(cuerpo) {
  const miles = String(cuerpo).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${miles}-${digitoVerificador(cuerpo)}`;
}

module.exports = { rutKey, digitoVerificador, isValidRut, formatRut };
