import { Asignatura } from '../../backend/src/models/asignatura.model.js';
import { Periodo } from '../../backend/src/models/periodo.model.js';
import Seccion from '../../backend/src/models/seccion.model.js';
import { Sede } from '../../backend/src/models/sede.model.js';
import { Usuario } from '../../backend/src/models/usuario.model.js';
import { ESTADOS_SECCION, JORNADAS, MODALIDADES } from '../../backend/src/constants/enums.js';
import { PERIODO_EN_CURSO, PERIODO_SIGUIENTE } from './06-periodos.js';

// Secciones de demo (dueño: Diego). Clave natural = (asignatura, período, letra).
// La docente de la semilla 01 (docente@iunf.cl) dicta varias, así su portal muestra datos; el resto se reparte
// entre los docentes generados por 07. Se siembran en el período en curso y en el siguiente (ver 06-periodos).
// Bloques: día 0 = lunes … 5 = sábado; minutos desde las 00:00.

const h = (hora, minuto = 0) => hora * 60 + minuto;
const DOCENTE_DEMO = 'docente@iunf.cl';

// [asignatura, letra, sede, jornada, modalidad, sala, cupo, inscritos, bloques, ¿docente demo?]
const SECCIONES = [
  ['INF-101', 'A', 'Sede Central', 'diurna', 'presencial', 'Lab-201', 35, 30, [[0, h(8, 30), h(10, 0)], [2, h(8, 30), h(10, 0)]], true],
  ['INF-101', 'B', 'Sede Norte', 'vespertina', 'presencial', 'Lab-105', 30, 12, [[1, h(19), h(20, 30)]], false],
  ['INF-201', 'A', 'Sede Central', 'diurna', 'presencial', 'Lab-202', 30, 30, [[1, h(10, 15), h(11, 45)], [3, h(10, 15), h(11, 45)]], true],
  ['INF-201', 'B', 'Sede Central', 'vespertina', 'online', 'Sala virtual', 45, 20, [[0, h(8, 30), h(10, 0)]], false],
  ['MAT-101', 'A', 'Sede Central', 'diurna', 'presencial', 'Sala 301', 40, 28, [[0, h(10, 15), h(11, 45)], [2, h(10, 15), h(11, 45)]], false],
  ['MAT-201', 'A', 'Sede Central', 'diurna', 'presencial', 'Sala 302', 40, 18, [[1, h(8, 30), h(10, 0)]], false],
  ['INF-105', 'A', 'Sede Central', 'diurna', 'semipresencial', 'Lab-203', 30, 15, [[4, h(8, 30), h(11, 45)]], true],
  ['ADM-110', 'A', 'Sede Central', 'vespertina', 'semipresencial', 'Sala 110', 45, 22, [[2, h(19), h(20, 30)]], false],
];

export default async function sembrarSecciones({ upsertPorClave, resolver, log }) {
  await Seccion.init();
  const periodos = [await resolver(Periodo, { codigo: PERIODO_EN_CURSO }), await resolver(Periodo, { codigo: PERIODO_SIGUIENTE })];

  const docenteDemo = await resolver(Usuario, { correo: DOCENTE_DEMO });
  const otros = await Usuario.find({ rol: 'docente', correo: { $ne: DOCENTE_DEMO } }).sort({ rut: 1 }).select('_id').lean();
  if (otros.length === 0) throw new Error('No hay docentes generados: 07-personas debe correr antes.');

  let total = 0;
  for (const periodoId of periodos) {
    for (const [i, [codigo, letra, sede, jornada, modalidad, sala, cupoMaximo, inscritos, bloques, esDemo]] of SECCIONES.entries()) {
      const asignaturaId = await resolver(Asignatura, { codigo });
      await upsertPorClave(Seccion, { asignaturaId, periodoId, letra }, {
        docenteId: esDemo ? docenteDemo : otros[i % otros.length]._id,
        sedeId: await resolver(Sede, { nombre: sede }),
        jornada: JORNADAS[jornada.toUpperCase()],
        modalidad: MODALIDADES[modalidad.toUpperCase()],
        sala,
        cupoMaximo,
        inscritos,
        estado: ESTADOS_SECCION.ABIERTA,
        bloques: bloques.map(([dia, inicioMin, finMin]) => ({ dia, inicioMin, finMin })),
      });
      total += 1;
    }
  }

  log(`09-secciones: ${total} secciones listas en ${periodos.length} períodos.`);
}
