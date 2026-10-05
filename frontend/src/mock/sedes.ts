import type { Sede } from './types';

/** Tres sedes (system design §1.1). Una en mantenimiento para ver los tres estados. */
export const SEDES: Sede[] = [
  { id: 'sede-central', nombre: 'Sede Central', direccion: 'Av. Libertador 4500', comuna: 'Santiago', estado: 'activa' },
  { id: 'sede-norte', nombre: 'Sede Norte', direccion: 'Camino Costero 800', comuna: 'Antofagasta', estado: 'activa' },
  { id: 'sede-sur', nombre: 'Sede Sur', direccion: 'Calle Prat 215', comuna: 'Concepción', estado: 'en mantenimiento' },
];
