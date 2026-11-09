export interface CambioClave {
  actual: string;
  nueva: string;
  confirmacion: string;
}

/**
 * Misma política que el servidor (mínimo 10, una letra y un número).
 * Si el servidor pide algo más, su mensaje se muestra tal cual.
 */
export function motivoClave(clave: string): string | null {
  const faltas: string[] = [];
  if (clave.length < 10) faltas.push('tener al menos 10 caracteres');
  if (!/\p{L}/u.test(clave)) faltas.push('incluir al menos una letra');
  if (!/\d/u.test(clave)) faltas.push('incluir al menos un número');
  if (faltas.length === 0) return null;
  if (faltas.length === 1) return `La clave debe ${faltas[0]}.`;
  return `La clave debe ${faltas.slice(0, -1).join(', ')} y ${faltas.at(-1)}.`;
}

export function validarCambioClave(valores: CambioClave): Partial<Record<keyof CambioClave, string>> {
  const errores: Partial<Record<keyof CambioClave, string>> = {};
  if (!valores.actual) errores.actual = 'Ingresa tu contraseña actual.';
  if (!valores.nueva) errores.nueva = 'Ingresa la contraseña nueva.';
  else {
    const motivo = motivoClave(valores.nueva);
    if (motivo) errores.nueva = motivo;
    else if (valores.actual && valores.nueva === valores.actual) errores.nueva = 'Elige una contraseña distinta a la actual.';
  }
  if (!valores.confirmacion) errores.confirmacion = 'Repite la contraseña nueva.';
  else if (valores.nueva && valores.confirmacion !== valores.nueva) errores.confirmacion = 'Las contraseñas no coinciden.';
  return errores;
}
