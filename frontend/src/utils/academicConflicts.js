function seSolapan(inicioA, terminoA, inicioB, terminoB) {
  return inicioA < terminoB && inicioB < terminoA
}

export function detectarConflictos(seccion, secciones) {
  if (!seccion.periodoId) return []

  const conflictos = []
  const seccionesDelPeriodo = secciones.filter((existente) =>
    existente.id !== seccion.id && existente.periodoId === seccion.periodoId
  )

  for (const bloque of seccion.bloques) {
    for (const existente of seccionesDelPeriodo) {
      for (const bloqueExistente of existente.bloques) {
        if (
          bloque.dia !== bloqueExistente.dia
          || !seSolapan(bloque.inicio, bloque.termino, bloqueExistente.inicio, bloqueExistente.termino)
        ) {
          continue
        }

        if (seccion.docente && seccion.docente === existente.docente) {
          conflictos.push({
            tipo: "docente",
            codigo: existente.codigo,
            dia: bloque.dia,
            inicio: bloqueExistente.inicio,
            termino: bloqueExistente.termino,
          })
        }

        const salaFisica = seccion.modalidad !== "Online"
          && existente.modalidad !== "Online"
          && seccion.sala
          && seccion.sala === existente.sala

        if (salaFisica) {
          conflictos.push({
            tipo: "sala",
            codigo: existente.codigo,
            sala: seccion.sala,
            dia: bloque.dia,
            inicio: bloqueExistente.inicio,
            termino: bloqueExistente.termino,
          })
        }
      }
    }
  }

  return conflictos
}
