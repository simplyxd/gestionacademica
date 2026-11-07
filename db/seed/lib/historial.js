const PROBABILIDAD_APROBAR = 0.85;

/**
 * Historial de aprobadas coherente con el plan (D-11): recorre los semestres 1..nivel-1 y aprueba una
 * asignatura solo si sus prerrequisitos se aprobaron en semestres anteriores, con cierta probabilidad.
 * `plan`: `[{ codigo, semestre, prerrequisitos: [codigo] }]`. Devuelve `[{ codigo, semestre }]`.
 */
function generarHistorial(plan, nivel, azar, { probabilidad = PROBABILIDAD_APROBAR } = {}) {
  const aprobadas = new Set();
  const historial = [];

  for (let semestre = 1; semestre < nivel; semestre += 1) {
    const delSemestre = plan.filter((a) => a.semestre === semestre);
    const habilitadas = delSemestre.filter((a) => a.prerrequisitos.every((p) => aprobadas.has(p)));
    const aprobadasAhora = habilitadas.filter(() => azar.siguiente() < probabilidad);
    for (const { codigo } of aprobadasAhora) {
      aprobadas.add(codigo);
      historial.push({ codigo, semestre });
    }
  }

  return historial;
}

/**
 * Problemas de un historial respecto del plan; lista vacía = coherente.
 * `fuera_del_plan`: la asignatura no es del plan. `prerrequisito_faltante`: aprobó sin sus prerrequisitos.
 */
function verificarHistorial(codigosAprobados, plan) {
  const aprobados = new Set(codigosAprobados);
  const porCodigo = new Map(plan.map((a) => [a.codigo, a]));
  const problemas = [];

  for (const codigo of codigosAprobados) {
    const asignatura = porCodigo.get(codigo);
    if (!asignatura) {
      problemas.push({ codigo, motivo: 'fuera_del_plan' });
      continue;
    }
    const faltan = asignatura.prerrequisitos.filter((p) => !aprobados.has(p));
    if (faltan.length > 0) problemas.push({ codigo, motivo: 'prerrequisito_faltante', faltan });
  }

  return problemas;
}

module.exports = { generarHistorial, verificarHistorial, PROBABILIDAD_APROBAR };
