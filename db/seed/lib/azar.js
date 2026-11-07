/**
 * Generador pseudoaleatorio con semilla (mulberry32): la misma semilla produce siempre los mismos datos,
 * así el seed es reproducible y los alumnos de demo no cambian entre ejecuciones (D-11).
 */
function crearAzar(semilla) {
  let estado = semilla >>> 0;

  function siguiente() {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    siguiente,
    entero: (min, max) => min + Math.floor(siguiente() * (max - min + 1)),
    elegir: (lista) => lista[Math.floor(siguiente() * lista.length)],
  };
}

module.exports = { crearAzar };
