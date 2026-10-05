/**
 * Una inscripción nunca se borra: al anularla queda con estado `anulada` y su
 * cupo vuelve a estar disponible.
 */
export type EstadoInscripcion = 'inscrita' | 'anulada';

export interface Inscripcion {
  id: string;
  seccionId: string;
  estado: EstadoInscripcion;
}
