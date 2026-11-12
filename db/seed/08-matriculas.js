import { Asignatura } from '../../backend/src/models/asignatura.model.js';
import { Carrera } from '../../backend/src/models/carrera.model.js';
import Matricula from '../../backend/src/models/matricula.model.js';
import { Periodo } from '../../backend/src/models/periodo.model.js';
import { Plan } from '../../backend/src/models/plan.model.js';
import { Usuario } from '../../backend/src/models/usuario.model.js';
import { PERIODO_ANTERIOR, PERIODO_EN_CURSO } from './06-periodos.js';
import { ALUMNOS_DEMO } from './lib/demo.js';

// Matrículas e historial de los alumnos de demo (D-12). Todo se resuelve por clave natural:
// alumno por correo, carrera por código, plan por (carrera, «Plan AAAA»), período por código.
// Matrícula en el período en curso; historial de aprobadas en el anterior (ver 06-periodos).

export default async function sembrarMatriculas({ upsertPorClave, resolver, log }) {
  await Matricula.init();
  const periodoAnterior = await resolver(Periodo, { codigo: PERIODO_ANTERIOR });
  const periodoMatricula = await resolver(Periodo, { codigo: PERIODO_EN_CURSO });

  let creadas = 0;
  for (const alumno of ALUMNOS_DEMO) {
    const estudianteId = await resolver(Usuario, { correo: alumno.email });

    // El historial se guarda en el perfil: asignatura aprobada en el período anterior.
    const aprobadas = [];
    for (const codigo of alumno.aprobadas) {
      aprobadas.push({ asignaturaId: await resolver(Asignatura, { codigo }), periodoId: periodoAnterior });
    }
    await Usuario.updateOne({ _id: estudianteId }, { $set: { 'perfilEstudiante.aprobadas': aprobadas } }, { runValidators: true });

    if (!alumno.matricula) continue; // «sinmatricula» demuestra la regla 1: no tiene matrícula
    const carreraId = await resolver(Carrera, { codigo: alumno.matricula.carrera });
    const planId = await resolver(Plan, { carreraId, nombre: `Plan ${alumno.matricula.plan}` });

    await upsertPorClave(
      Matricula,
      { estudianteId, periodoId: periodoMatricula, estado: 'vigente' },
      { estudianteId, carreraId, planId, periodoId: periodoMatricula, estado: 'vigente' },
    );
    creadas += 1;
  }

  log(`08-matriculas: ${creadas} matrículas demo vigentes y el historial de ${ALUMNOS_DEMO.length} alumnos demo.`);
}
