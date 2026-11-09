// Datos mínimos para los tests de servicios de estructura.
import { Asignatura } from '../../src/models/asignatura.model.js';
import { Carrera } from '../../src/models/carrera.model.js';
import { Plan } from '../../src/models/plan.model.js';
import { Sede } from '../../src/models/sede.model.js';

export const admin = { id: 'admin-1', rol: 'admin', sedes: [] };
export const coordinadorDe = (...sedes) => ({ id: 'coord-1', rol: 'coordinador', sedes: sedes.map((s) => s._id.toString()) });

export async function iniciarModelos() {
  await Promise.all([Sede.init(), Asignatura.init(), Carrera.init(), Plan.init()]);
}

export async function crearBase() {
  const [norte, sur] = await Sede.create([
    { nombre: 'Sede Norte', direccion: 'Calle 1', comuna: 'Antofagasta' },
    { nombre: 'Sede Sur', direccion: 'Calle 2', comuna: 'Concepción' },
  ]);
  const inf = await Carrera.create({ codigo: 'INF', nombre: 'Informática', sedes: [norte._id], modalidad: 'presencial', jornada: 'diurna', duracionSemestres: 4 });
  const adm = await Carrera.create({ codigo: 'ADM', nombre: 'Administración', sedes: [sur._id], modalidad: 'online', jornada: 'vespertina', duracionSemestres: 4 });
  const asignaturas = await Asignatura.create(
    ['A', 'B', 'C', 'D'].map((l, i) => ({ codigo: `TST-10${i}`, nombre: `Asignatura ${l}`, creditos: 5 })),
  );
  return { norte, sur, inf, adm, asignaturas };
}
