import type { Docente } from './types';

/** Docentes ficticios: los mismos que dictan las secciones del mock de oferta. */
export const DOCENTES: Docente[] = [
  { id: 'doc-fuentes', nombre: 'Rodrigo Fuentes' },
  { id: 'doc-riquelme', nombre: 'Carmen Riquelme' },
  { id: 'doc-ortiz', nombre: 'Marcela Ortiz' },
  { id: 'doc-araya', nombre: 'Diego Araya' },
  { id: 'doc-henriquez', nombre: 'Paula Henríquez' },
  { id: 'doc-vera', nombre: 'Esteban Vera' },
  { id: 'doc-pinto', nombre: 'Lorena Pinto' },
];

/** Salas físicas disponibles para programar secciones. */
export const SALAS = ['Sala 101', 'Sala 204', 'Sala 206', 'Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Auditorio Central'];
