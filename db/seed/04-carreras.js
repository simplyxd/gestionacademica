// Seed de carreras (dueño: Lorenzo). Idempotente: clave natural = código. Las sedes se resuelven por nombre.
import { Carrera } from '../../backend/src/models/carrera.model.js';
import { Sede } from '../../backend/src/models/sede.model.js';

export const CARRERAS = [
  { codigo: 'INF', nombre: 'Ingeniería en Informática', sedes: ['Sede Central', 'Sede Norte'], modalidad: 'presencial', jornada: 'diurna', duracionSemestres: 8 },
  { codigo: 'ADM', nombre: 'Administración de Empresas', sedes: ['Sede Central', 'Sede Sur'], modalidad: 'semipresencial', jornada: 'vespertina', duracionSemestres: 8 },
  { codigo: 'ENF', nombre: 'Técnico en Enfermería', sedes: ['Sede Sur'], modalidad: 'presencial', jornada: 'diurna', duracionSemestres: 5 },
  { codigo: 'CON', nombre: 'Contabilidad y Auditoría', sedes: ['Sede Central'], modalidad: 'online', jornada: 'vespertina', duracionSemestres: 6 },
];

export default async function sembrar({ upsertPorClave, resolver, log }) {
  await Carrera.init();
  for (const { codigo, sedes, ...datos } of CARRERAS) {
    const idsSedes = [];
    for (const nombre of sedes) idsSedes.push(await resolver(Sede, { nombre }));
    await upsertPorClave(Carrera, { codigo }, { ...datos, sedes: idsSedes, estado: 'activa' });
  }
  log(`${CARRERAS.length} carreras listas`);
}
