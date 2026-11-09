// Grafo de prerrequisitos de un plan (LOR-5). Funciones PURAS: no tocan la BD ni Mongoose,
// así se prueban solas y las usa tanto el servicio de planes como el test del seed.
//
// Un grafo es un objeto { [asignaturaId]: [prerrequisitoId, ...] } (ids como string).
// Una arista A → B significa «A exige B».

const BLANCO = 0; // no visitado
const GRIS = 1; //   en la pila actual del DFS
const NEGRO = 2; //  terminado: ningún ciclo pasa por él

/**
 * Busca un ciclo con DFS de tres colores. O(V + E).
 * @param {Record<string, string[]>} grafo
 * @returns {string[] | null} el camino del ciclo cerrado (["A", "B", "C", "A"]) o null si no hay.
 */
export function detectarCiclo(grafo) {
  const color = new Map();
  const pila = [];

  const visitar = (nodo) => {
    color.set(nodo, GRIS);
    pila.push(nodo);
    for (const siguiente of grafo[nodo] ?? []) {
      const c = color.get(siguiente) ?? BLANCO;
      if (c === GRIS) return [...pila.slice(pila.indexOf(siguiente)), siguiente];
      if (c === BLANCO) {
        const ciclo = visitar(siguiente);
        if (ciclo) return ciclo;
      }
    }
    pila.pop();
    color.set(nodo, NEGRO);
    return null;
  };

  for (const nodo of Object.keys(grafo)) {
    if ((color.get(nodo) ?? BLANCO) === BLANCO) {
      const ciclo = visitar(nodo);
      if (ciclo) return ciclo;
    }
  }
  return null;
}

/** Arma el grafo { asignaturaId: [prerrequisitos] } a partir de las asignaturas de un plan. */
export function construirGrafo(asignaturas) {
  return Object.fromEntries(asignaturas.map((a) => [String(a.asignaturaId), (a.prerrequisitos ?? []).map(String)]));
}

/**
 * Valida el conjunto COMPLETO de asignaturas de un plan antes de guardarlo (no arista por arista).
 * Reglas, en este orden:
 *   1. REPETIDA:  una asignatura aparece una sola vez en el plan.
 *   2. FUERA_DEL_PLAN: todo prerrequisito pertenece al mismo plan.
 *   3. CICLO:     no hay ciclos (incluye la autorreferencia A → A).
 *   4. SEMESTRE:  el prerrequisito está en un semestre ESTRICTAMENTE menor (decisión Lorenzo, 2026-11-09).
 *
 * @param {{ asignaturaId: string, semestre: number, prerrequisitos?: string[] }[]} asignaturas
 * @returns {null | { tipo: 'REPETIDA'|'FUERA_DEL_PLAN'|'CICLO'|'SEMESTRE', ... }} la primera violación o null.
 */
export function validarGrafoPlan(asignaturas) {
  const porId = new Map();
  for (const a of asignaturas) {
    const id = String(a.asignaturaId);
    if (porId.has(id)) return { tipo: 'REPETIDA', asignaturaId: id };
    porId.set(id, a);
  }

  for (const a of asignaturas) {
    for (const p of a.prerrequisitos ?? []) {
      if (!porId.has(String(p))) return { tipo: 'FUERA_DEL_PLAN', asignaturaId: String(a.asignaturaId), prerrequisitoId: String(p) };
    }
  }

  const ciclo = detectarCiclo(construirGrafo(asignaturas));
  if (ciclo) return { tipo: 'CICLO', ciclo };

  for (const a of asignaturas) {
    for (const p of a.prerrequisitos ?? []) {
      const requisito = porId.get(String(p));
      if (requisito.semestre >= a.semestre) {
        return {
          tipo: 'SEMESTRE',
          asignaturaId: String(a.asignaturaId),
          semestre: a.semestre,
          prerrequisitoId: String(p),
          semestrePrerrequisito: requisito.semestre,
        };
      }
    }
  }
  return null;
}

/** Profundidad máxima de la cadena de prerrequisitos (1 = sin prerrequisitos). Supone grafo acíclico. */
export function profundidadMaxima(grafo) {
  const memo = new Map();
  const prof = (n) => {
    if (!memo.has(n)) memo.set(n, 1 + Math.max(0, ...(grafo[n] ?? []).map(prof)));
    return memo.get(n);
  };
  return Math.max(0, ...Object.keys(grafo).map(prof));
}
