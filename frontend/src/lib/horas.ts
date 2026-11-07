import type { BloqueSeccion } from '@/features/oferta/types';

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S'];
export const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Minutos desde 00:00 a «HH:MM». */
export function fmt(min: number): string {
  const hh = String(Math.floor(min / 60)).padStart(2, '0');
  const mm = String(min % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** «HH:MM» a minutos desde 00:00. Devuelve 0 si el texto no es una hora válida. */
export function aMinutos(hhmm: string): number {
  const [hh, mm] = hhmm.split(':').map(Number);
  return Number.isFinite(hh) && Number.isFinite(mm) ? hh * 60 + mm : 0;
}

/** «Lun 10:00–11:30 · Mié 14:00–15:30» */
export function textoBloques(bloques: BloqueSeccion[]): string {
  return bloques
    .map((b) => `${DIAS[b.dia]} ${fmt(b.inicioMin)}–${fmt(b.finMin)}`)
    .join(' · ');
}
