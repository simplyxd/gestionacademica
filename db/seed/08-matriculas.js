import mongoose from 'mongoose';
import Matricula from '../../backend/src/models/matricula.model.js';
import { ALUMNOS_DEMO } from './lib/demo.js';

const coleccion = (nombre) => mongoose.connection.db.collection(nombre);

async function buscarId(consulta, filtros) {
  for (const filtro of filtros) {
    const doc = await consulta.findOne(filtro, { projection: { _id: 1 } });
    if (doc?._id) return doc._id;
  }
  return null;
}

async function resolverMatriculaDemo(alumno) {
  const usuarioId = await buscarId(coleccion('usuarios'), [{ email: alumno.email }, { rut: alumno.rut }]);
  if (!usuarioId) return null;

  const carreraId = await buscarId(coleccion('carreras'), [{ codigo: alumno.matricula.carrera }]);
  if (!carreraId) return null;

  const periodoId = await buscarId(coleccion('periodos'), [{ codigo: alumno.matricula.periodo }, { nombre: alumno.matricula.periodo }]);
  if (!periodoId) return null;

  const añoPlan = Number.parseInt(alumno.matricula.plan, 10);
  const planes = ['planesestudio', 'planesestudios', 'planes'];
  let planId = null;
  for (const nombre of planes) {
    planId = await buscarId(coleccion(nombre), [
      { carrera: carreraId, codigo: alumno.matricula.plan },
      { carreraId, codigo: alumno.matricula.plan },
      { carrera: carreraId, anio: añoPlan },
      { carreraId, anio: añoPlan },
      { carrera: carreraId, version: alumno.matricula.plan },
      { carreraId, version: alumno.matricula.plan },
    ]);
    if (planId) break;
  }
  if (!planId) return null;

  return { estudianteId: usuarioId, carreraId, planId, periodoId, estado: 'vigente' };
}

export default async function sembrarMatriculas({ upsertPorClave, log }) {
  if (!mongoose.connection.db) {
    log('08-matriculas: omitida (no hay conexión activa a MongoDB).');
    return;
  }

  const casos = ALUMNOS_DEMO.filter((a) => a.matricula);
  let creadas = 0;
  let omitidas = 0;

  for (const alumno of casos) {
    const datos = await resolverMatriculaDemo(alumno);
    if (!datos) {
      omitidas += 1;
      continue;
    }
    await upsertPorClave(Matricula, { estudianteId: datos.estudianteId, periodoId: datos.periodoId, estado: 'vigente' }, datos);
    creadas += 1;
  }

  if (omitidas > 0) {
    log(`08-matriculas: ${creadas} sembradas, ${omitidas} omitidas por dependencias externas (usuarios/carreras/planes/períodos).`);
    return;
  }
  log(`08-matriculas: ${creadas} matrículas demo vigentes listas.`);
}
