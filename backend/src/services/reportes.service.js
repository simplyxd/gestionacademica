// Reportes de solo lectura (LOR-7, RF12/CU10). Solo admin y coordinador; el coordinador ve SOLO sus sedes.
//
// Cada reporte es UNA agregación en la BD ($match → $lookup → $facet para paginar); nada se filtra en JS.
// Se lee por nombre de colección para no importar modelos de otros dominios. Contrato de colecciones y campos:
//   matriculas    (Angel)  { estudianteId, carreraId, planId, periodoId, estado }
//   secciones     (Diego)  { asignaturaId, periodoId, docenteId, sedeId, letra, cupoMaximo, inscritos, estado, bloques[] }
//   inscripciones (Matias) { estudianteId, seccionId, periodoId, estado }
//   usuarios      (Endert) { rut, nombre, rol }
//
// Ocupación (decisión Lorenzo, 2026-11-09): la fuente de verdad es el CONTEO de inscripciones activas.
// También se entrega el contador atómico "inscritos" de Matias y la marca "desincronizado" si no coinciden.
import { ESTADOS_INSCRIPCION, ESTADOS_MATRICULA, ESTADOS_SECCION } from '../constants/enums.js';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';
import { REP } from '../errors/codigos/reportes.js';
import { Carrera } from '../models/carrera.model.js';
import { envolverLista } from '../utils/respuesta.js';
import { leerPaginacion } from '../utils/paginar.js';
import { aObjectId, esCoordinador, sedesDe } from './estructura.comun.js';

export const COLECCIONES = Object.freeze({
  matriculas: 'matriculas',
  secciones: 'secciones',
  inscripciones: 'inscripciones',
  usuarios: 'usuarios',
  asignaturas: 'asignaturas',
  carreras: Carrera.collection.collectionName,
  sedes: 'sedes',
});

const col = (nombre) => mongoose.connection.collection(COLECCIONES[nombre]);
const opcional = (valor, campo) => (valor === undefined || valor === '' ? undefined : aObjectId(valor, campo));

function validarEstado(estado, permitidos, campo) {
  if (estado === undefined || estado === '') return undefined;
  if (!permitidos.includes(estado)) {
    throw new AppError(400, REP.FILTRO_INVALIDO, `El filtro «${campo}» debe ser uno de: ${permitidos.join(', ')}.`, { details: { campo } });
  }
  return estado;
}

/** Etapa final común: pagina con $facet y devuelve { data, meta }. */
async function ejecutarPaginado(coleccion, pipeline, query, sort) {
  const { page, limit, skip } = leerPaginacion({ page: query.page, limit: query.limit });
  const [resultado] = await col(coleccion)
    .aggregate([...pipeline, { $sort: sort }, { $facet: { data: [{ $skip: skip }, { $limit: limit }], total: [{ $count: 'n' }] } }])
    .toArray();
  return envolverLista(resultado.data, { page, limit, total: resultado.total[0]?.n ?? 0 });
}

/** Sedes del coordinador como ObjectId, o null si es admin (sin restricción). */
const sedesAlcance = (usuario) => (esCoordinador(usuario) ? sedesDe(usuario).map((s) => aObjectId(s, 'sedes')) : null);

/** Etapas que unen la carrera de un documento (por carreraId) y aplican el alcance del coordinador. */
function etapasCarrera(usuario) {
  const sedes = sedesAlcance(usuario);
  return [
    { $lookup: { from: COLECCIONES.carreras, localField: 'carreraId', foreignField: '_id', as: 'carrera' } },
    { $unwind: '$carrera' },
    ...(sedes ? [{ $match: { 'carrera.sedes': { $in: sedes } } }] : []),
  ];
}

const etapasEstudiante = [
  { $lookup: { from: COLECCIONES.usuarios, localField: 'estudianteId', foreignField: '_id', as: 'estudiante' } },
  { $unwind: { path: '$estudiante', preserveNullAndEmptyArrays: true } },
];

/** GET /api/reportes/matriculas?periodoId=&carreraId=&estado= */
export async function matriculas(usuario, query = {}) {
  const match = {};
  const periodoId = opcional(query.periodoId, 'periodoId');
  const carreraId = opcional(query.carreraId, 'carreraId');
  const estado = validarEstado(query.estado, Object.values(ESTADOS_MATRICULA), 'estado');
  if (periodoId) match.periodoId = periodoId;
  if (carreraId) match.carreraId = carreraId;
  if (estado) match.estado = estado;

  return ejecutarPaginado(
    'matriculas',
    [
      { $match: match },
      ...etapasCarrera(usuario),
      ...etapasEstudiante,
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          estado: 1,
          periodoId: { $toString: '$periodoId' },
          carrera: { id: { $toString: '$carrera._id' }, codigo: '$carrera.codigo', nombre: '$carrera.nombre' },
          estudiante: { id: { $toString: '$estudianteId' }, rut: '$estudiante.rut', nombre: '$estudiante.nombre' },
        },
      },
    ],
    query,
    { 'carrera.codigo': 1, 'estudiante.nombre': 1, id: 1 },
  );
}

/** Etapas que unen la sección con asignatura y sede, aplicando el alcance por sedeId. */
function etapasSeccion(usuario) {
  const sedes = sedesAlcance(usuario);
  return [
    ...(sedes ? [{ $match: { sedeId: { $in: sedes } } }] : []),
    { $lookup: { from: COLECCIONES.asignaturas, localField: 'asignaturaId', foreignField: '_id', as: 'asignatura' } },
    { $unwind: { path: '$asignatura', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: COLECCIONES.sedes, localField: 'sedeId', foreignField: '_id', as: 'sede' } },
    { $unwind: { path: '$sede', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLECCIONES.inscripciones,
        let: { s: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$seccionId', '$$s'] }, estado: ESTADOS_INSCRIPCION.ACTIVA } }, { $count: 'n' }],
        as: 'conteo',
      },
    },
    { $set: { inscritosReales: { $ifNull: [{ $first: '$conteo.n' }, 0] } } },
  ];
}

const proyeccionSeccion = {
  _id: 0,
  seccionId: { $toString: '$_id' },
  letra: 1,
  estado: 1,
  asignatura: { codigo: '$asignatura.codigo', nombre: '$asignatura.nombre' },
  sede: { id: { $toString: '$sedeId' }, nombre: '$sede.nombre' },
  cupo: '$cupoMaximo',
  inscritos: '$inscritosReales',
};

/** GET /api/reportes/estudiantes?carreraId=&asignaturaId=&periodoId= */
export async function estudiantes(usuario, query = {}) {
  const carreraId = opcional(query.carreraId, 'carreraId');
  const asignaturaId = opcional(query.asignaturaId, 'asignaturaId');
  const periodoId = opcional(query.periodoId, 'periodoId');
  const orden = { 'estudiante.nombre': 1, 'estudiante.id': 1 };

  if (asignaturaId) {
    // Por asignatura: inscripciones activas en secciones de esa asignatura (y período), dentro de las sedes del coordinador.
    const sedes = sedesAlcance(usuario);
    return ejecutarPaginado(
      'inscripciones',
      [
        { $match: { estado: ESTADOS_INSCRIPCION.ACTIVA, ...(periodoId ? { periodoId } : {}) } },
        { $lookup: { from: COLECCIONES.secciones, localField: 'seccionId', foreignField: '_id', as: 'seccion' } },
        { $unwind: '$seccion' },
        { $match: { 'seccion.asignaturaId': asignaturaId, ...(sedes ? { 'seccion.sedeId': { $in: sedes } } : {}) } },
        ...etapasEstudiante,
        {
          $project: {
            _id: 0,
            estudiante: { id: { $toString: '$estudianteId' }, rut: '$estudiante.rut', nombre: '$estudiante.nombre' },
            seccion: { id: { $toString: '$seccion._id' }, letra: '$seccion.letra' },
          },
        },
      ],
      query,
      orden,
    );
  }

  // Por carrera: matrículas vigentes (de esa carrera, si se pidió).
  const match = { estado: ESTADOS_MATRICULA.VIGENTE, ...(carreraId ? { carreraId } : {}), ...(periodoId ? { periodoId } : {}) };
  return ejecutarPaginado(
    'matriculas',
    [
      { $match: match },
      ...etapasCarrera(usuario),
      ...etapasEstudiante,
      {
        $project: {
          _id: 0,
          estudiante: { id: { $toString: '$estudianteId' }, rut: '$estudiante.rut', nombre: '$estudiante.nombre' },
          carrera: { id: { $toString: '$carrera._id' }, codigo: '$carrera.codigo' },
        },
      },
    ],
    query,
    orden,
  );
}

/** GET /api/reportes/ocupacion?periodoId= : inscritos/cupo por sección, con chequeo de desincronización. */
export async function ocupacion(usuario, query = {}) {
  const periodoId = opcional(query.periodoId, 'periodoId');
  return ejecutarPaginado(
    'secciones',
    [
      { $match: periodoId ? { periodoId } : {} },
      ...etapasSeccion(usuario),
      {
        $project: {
          ...proyeccionSeccion,
          contador: { $ifNull: ['$inscritos', 0] },
          desincronizado: { $ne: [{ $ifNull: ['$inscritos', 0] }, '$inscritosReales'] },
          porcentaje: { $cond: [{ $gt: ['$cupoMaximo', 0] }, { $round: [{ $multiply: [{ $divide: ['$inscritosReales', '$cupoMaximo'] }, 100] }, 1] }, 0] },
        },
      },
    ],
    query,
    { 'asignatura.codigo': 1, letra: 1, seccionId: 1 },
  );
}

/** GET /api/reportes/cupos?periodoId= : cupos disponibles en secciones abiertas. */
export async function cupos(usuario, query = {}) {
  const periodoId = opcional(query.periodoId, 'periodoId');
  return ejecutarPaginado(
    'secciones',
    [
      { $match: { estado: ESTADOS_SECCION.ABIERTA, ...(periodoId ? { periodoId } : {}) } },
      ...etapasSeccion(usuario),
      { $project: { ...proyeccionSeccion, disponibles: { $max: [0, { $subtract: ['$cupoMaximo', '$inscritosReales'] }] } } },
    ],
    query,
    { disponibles: -1, 'asignatura.codigo': 1, seccionId: 1 },
  );
}

/** GET /api/reportes/carga-docente?periodoId= : secciones y horas semanales por docente (sin canceladas). */
export async function cargaDocente(usuario, query = {}) {
  const periodoId = opcional(query.periodoId, 'periodoId');
  const sedes = sedesAlcance(usuario);
  return ejecutarPaginado(
    'secciones',
    [
      { $match: { estado: { $ne: ESTADOS_SECCION.CANCELADA }, ...(periodoId ? { periodoId } : {}), ...(sedes ? { sedeId: { $in: sedes } } : {}) } },
      {
        $group: {
          _id: '$docenteId',
          secciones: { $sum: 1 },
          minutos: { $sum: { $sum: { $map: { input: { $ifNull: ['$bloques', []] }, in: { $subtract: ['$$this.finMin', '$$this.inicioMin'] } } } } },
        },
      },
      { $lookup: { from: COLECCIONES.usuarios, localField: '_id', foreignField: '_id', as: 'docente' } },
      { $unwind: { path: '$docente', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          docente: { id: { $toString: '$_id' }, nombre: '$docente.nombre', rut: '$docente.rut' },
          secciones: 1,
          horasSemanales: { $round: [{ $divide: ['$minutos', 60] }, 2] },
        },
      },
    ],
    query,
    { horasSemanales: -1, 'docente.id': 1 },
  );
}
