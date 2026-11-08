export function validarBloque(bloque) {
  if (!bloque || typeof bloque !== 'object') {
    throw new Error('El bloque debe ser un objeto válido');
  }
  if (!Number.isInteger(bloque.dia) || bloque.dia < 0 || bloque.dia > 5) {
    throw new Error('El día debe ser un número entero entre 0 y 5');
  }
  if (!Number.isInteger(bloque.inicioMin) || bloque.inicioMin < 0) {
    throw new Error('El minuto de inicio debe ser un entero mayor o igual a 0');
  }
  if (!Number.isInteger(bloque.finMin) || bloque.finMin > 1440) {
    throw new Error('El minuto de fin debe ser un entero menor o igual a 1440');
  }
  if (bloque.inicioMin >= bloque.finMin) {
    throw new Error('El minuto de inicio debe ser estrictamente menor que el minuto de fin');
  }
}

export function bloquesSeSolapan(bloqueA, bloqueB) {
  validarBloque(bloqueA);
  validarBloque(bloqueB);

  // Los bloques solo pueden solaparse si ocurren en el mismo día
  if (bloqueA.dia !== bloqueB.dia) {
    return false;
  }

  // Condición de solapamiento para intervalos semiabiertos [inicio, fin)
  return bloqueA.inicioMin < bloqueB.finMin && bloqueB.inicioMin < bloqueA.finMin;
}

export function buscarSolapes(listaA, listaB) {
  // Asegurar validación exhaustiva de ambas listas antes de procesar
  if (Array.isArray(listaA)) {
    listaA.forEach(validarBloque);
  }
  if (Array.isArray(listaB)) {
    listaB.forEach(validarBloque);
  }

  return listaA.filter(bloqueA => {
    return listaB.some(bloqueB => {
      return bloquesSeSolapan(bloqueA, bloqueB);
    });
  });
}