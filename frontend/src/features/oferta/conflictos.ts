import { DIAS_LARGOS, fmt } from '@/lib/horas';
import type { DiaSemana, SeccionOfertada } from './types';

export interface Conflicto {
  tipo: 'docente' | 'sala';
  /** Sección ya existente con la que choca. */
  con: SeccionOfertada;
  dia: DiaSemana;
  inicioMin: number;
  finMin: number;
}

type Candidata = Pick<SeccionOfertada, 'id' | 'periodoId' | 'docente' | 'sala' | 'modalidad' | 'bloques'>;

const seSolapan = (aIni: number, aFin: number, bIni: number, bFin: number) => aIni < bFin && bIni < aFin;

/**
 * Choques de docente y de sala con las demás secciones del mismo período.
 * Una sección online no ocupa sala: solo choca por docente.
 */
export function detectarConflictos(candidata: Candidata, existentes: readonly SeccionOfertada[]): Conflicto[] {
  if (!candidata.periodoId) return [];
  const delPeriodo = existentes.filter((s) => s.id !== candidata.id && s.periodoId === candidata.periodoId);
  const conflictos: Conflicto[] = [];

  for (const bloque of candidata.bloques) {
    for (const otra of delPeriodo) {
      for (const bOtra of otra.bloques) {
        if (bloque.dia !== bOtra.dia || !seSolapan(bloque.inicioMin, bloque.finMin, bOtra.inicioMin, bOtra.finMin)) {
          continue;
        }
        const base = { con: otra, dia: bloque.dia, inicioMin: bOtra.inicioMin, finMin: bOtra.finMin };

        if (candidata.docente && candidata.docente === otra.docente) {
          conflictos.push({ tipo: 'docente', ...base });
        }
        const salaFisica =
          candidata.modalidad !== 'online' &&
          otra.modalidad !== 'online' &&
          candidata.sala &&
          candidata.sala === otra.sala;
        if (salaFisica) conflictos.push({ tipo: 'sala', ...base });
      }
    }
  }
  return conflictos;
}

/** Copy del choque: nombra la regla, el dato concreto y con qué sección choca (system design §6.4). */
export function mensajeConflicto(c: Conflicto, candidata: Pick<SeccionOfertada, 'docente' | 'sala'>): string {
  const cuando = `el ${DIAS_LARGOS[c.dia].toLowerCase()}, de ${fmt(c.inicioMin)} a ${fmt(c.finMin)}`;
  const otra = `${c.con.codigoAsignatura} sección ${c.con.seccion}`;
  return c.tipo === 'docente'
    ? `${candidata.docente} ya dicta ${otra} ${cuando}.`
    : `${candidata.sala} ya está ocupada por ${otra} ${cuando}.`;
}
