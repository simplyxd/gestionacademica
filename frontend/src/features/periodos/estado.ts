import dayjs from 'dayjs';
import type { EstadoPeriodo } from '@/mock/types';

/** Color semántico del estado del período (system design §2.1.5). */
export const ESTADO_PERIODO_COLOR: Record<EstadoPeriodo, string> = {
  planificación: 'sky',
  'inscripción abierta': 'teal',
  'en curso': 'orange',
  cerrado: 'slate',
};

/** `2026-08-03` → «03 ago 2026». */
export function formatearFecha(iso: string): string {
  return iso ? dayjs(iso).format('DD MMM YYYY') : 'Sin fecha';
}
