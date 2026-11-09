import Seccion from '../../backend/src/models/seccion.model.js';
import Periodo from '../../backend/src/models/periodo.model.js';
import Asignatura from '../../backend/src/models/asignatura.model.js';
import Docente from '../../backend/src/models/docente.model.js';
import Sede from '../../backend/src/models/sede.model.js';
import { JORNADAS, MODALIDADES, ESTADOS_SECCION } from '../../backend/src/constants/enums.js';

export default async function seedSecciones({ upsertPorClave, resolver, log }) {
  log?.('Ejecutando seed de Secciones...');

  // Resolución de referencias utilizando el contrato correcto: resolver(Modelo, { clave: valor })
  const periodo1 = await resolver(Periodo, { codigo: '2026-1' });
  const periodo2 = await resolver(Periodo, { codigo: '2026-2' });
  const asignatura = await resolver(Asignatura, { codigo: 'INF-111' });
  const docente = await resolver(Docente, { email: 'docente.ejemplo@unab.cl' });
  const sede = await resolver(Sede, { codigo: 'SANTIAGO' });

  const secciones = [
    {
      asignaturaId: asignatura._id || asignatura,
      periodoId: periodo1._id || periodo1,
      docenteId: docente._id || docente,
      sedeId: sede._id || sede,
      jornada: JORNADAS.DIURNA,
      modalidad: MODALIDADES.PRESENCIAL,
      letra: 'A',
      sala: 'Lab-201',
      cupoMaximo: 35,
      inscritos: 35, // Sección llena para probar restricciones de cupo en el primer período
      estado: ESTADOS_SECCION.ABIERTA,
      bloques: [
        { dia: 0, inicioMin: 510, finMin: 640 } // Lunes 08:30 - 10:40
      ]
    },
    {
      asignaturaId: asignatura._id || asignatura,
      periodoId: periodo2._id || periodo2,
      docenteId: docente._id || docente,
      sedeId: sede._id || sede,
      jornada: JORNADAS.VESPERTINA,
      modalidad: MODALIDADES.ONLINE,
      letra: 'B',
      sala: 'Teams-Virtual',
      cupoMaximo: 45,
      inscritos: 15, // Sección con cupos disponibles en el segundo período
      estado: ESTADOS_SECCION.ABIERTA,
      bloques: [
        { dia: 3, inicioMin: 1110, finMin: 1240 } // Jueves 18:30 - 20:40
      ]
    }
  ];

  for (const seccionData of secciones) {
    await upsertPorClave(
      Seccion,
      {
        asignaturaId: seccionData.asignaturaId,
        periodoId: seccionData.periodoId,
        letra: seccionData.letra
      },
      seccionData
    );
  }

  log?.('Seed de Secciones finalizado exitosamente.');
}