export type EstadoBloque = 'inscrita' | 'propuesta' | 'conflicto' | 'docente-ocupado' | 'pasada';

export interface BloqueHorario {
  id: string;
  seccionId: string;
  codigoAsignatura: string;
  nombreAsignatura: string;
  seccion: string;
  sala?: string;
  /** 0 = Lunes … 5 = Sábado */
  dia: 0 | 1 | 2 | 3 | 4 | 5;
  /** Minutos desde 00:00 (p. ej. 8*60 = 08:00) */
  inicioMin: number;
  finMin: number;
  estado: EstadoBloque;
}

export interface ColumnaBloque {
  /** Columna que ocupa el bloque dentro de su grupo de solapamiento. */
  col: number;
  /** Cuántas columnas tiene ese grupo. */
  cols: number;
}

/**
 * Reparte en columnas los bloques de un mismo día para que dos que se solapan
 * queden uno al lado del otro en vez de taparse.
 */
export function repartirColumnas(bloquesDelDia: BloqueHorario[]): Map<string, ColumnaBloque> {
  const orden = [...bloquesDelDia].sort((a, b) => a.inicioMin - b.inicioMin);
  const reparto = new Map<string, ColumnaBloque>();
  let grupo: BloqueHorario[] = [];
  let finDelGrupo = -1;

  const cerrarGrupo = () => {
    grupo.forEach((b, i) => reparto.set(b.id, { col: i, cols: grupo.length }));
    grupo = [];
    finDelGrupo = -1;
  };

  for (const bloque of orden) {
    if (grupo.length > 0 && bloque.inicioMin >= finDelGrupo) {
      cerrarGrupo();
    }
    grupo.push(bloque);
    finDelGrupo = Math.max(finDelGrupo, bloque.finMin);
  }
  cerrarGrupo();

  return reparto;
}

/** Devuelve pares de ids que se solapan en el mismo día. */
export function detectarChoques(bloques: BloqueHorario[]): Array<[string, string]> {
  const choques: Array<[string, string]> = [];
  for (let i = 0; i < bloques.length; i++) {
    for (let j = i + 1; j < bloques.length; j++) {
      const a = bloques[i];
      const b = bloques[j];
      if (a.dia === b.dia && a.inicioMin < b.finMin && b.inicioMin < a.finMin) {
        choques.push([a.id, b.id]);
      }
    }
  }
  return choques;
}
