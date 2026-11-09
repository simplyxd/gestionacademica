// Política de clave en el servidor (D-07). No se guarda la clave ni se escribe en el registro.

const LARGO_MINIMO = 10;

function enumerar(faltas) {
  if (faltas.length === 1) return faltas[0];
  return `${faltas.slice(0, -1).join(', ')} y ${faltas.at(-1)}`;
}

/**
 * Devuelve null si la clave sirve, o un mensaje en español que dice qué le falta.
 * Mínimo 10 caracteres, al menos una letra y un número.
 */
export function validarPoliticaClave(clave) {
  if (typeof clave !== 'string') {
    return 'La clave debe ser un texto, tener al menos 10 caracteres, incluir al menos una letra y un número.';
  }

  const faltas = [];
  if (clave.length < LARGO_MINIMO) faltas.push('tener al menos 10 caracteres');
  if (!/\p{L}/u.test(clave)) faltas.push('incluir al menos una letra');
  if (!/\d/u.test(clave)) faltas.push('incluir al menos un número');
  if (faltas.length === 0) return null;
  return `La clave debe ${enumerar(faltas)}.`;
}
