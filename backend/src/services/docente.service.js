import '../config/mongoose.js';
import mongoose from 'mongoose';
import { ESTADOS_INSCRIPCION } from '../constants/enums.js';
import { AppError } from '../errors/AppError.js';
import { DOC } from '../errors/codigos/docente.js';
import { GEN } from '../errors/codigos/general.js';
import { Usuario } from '../models/usuario.model.js';

// Lectura mínima de las colecciones de Diego (secciones) y Matias (inscripciones).
// Si su modelo ya está registrado, se usa ese. Si no, se registra uno de solo lectura
// con otro nombre, para no ocupar "Seccion" ni "Inscripcion" cuando ellos los creen.
const bloqueSchema = new mongoose.Schema(
  {
    dia: { type: Number },
    inicioMin: { type: Number },
    finMin: { type: Number },
  },
  { _id: false },
);

const esquemaSeccion = new mongoose.Schema(
  {
    docenteId: { type: mongoose.Schema.Types.ObjectId },
    periodoId: { type: mongoose.Schema.Types.ObjectId },
    asignaturaId: { type: mongoose.Schema.Types.ObjectId },
    sedeId: { type: mongoose.Schema.Types.ObjectId },
    bloques: { type: [bloqueSchema], default: [] },
  },
  { collection: 'secciones', strict: false },
);

const esquemaInscripcion = new mongoose.Schema(
  {
    seccionId: { type: mongoose.Schema.Types.ObjectId },
    estudianteId: { type: mongoose.Schema.Types.ObjectId },
    estado: { type: String },
  },
  { collection: 'inscripciones', strict: false },
);

const Seccion = mongoose.models.Seccion || mongoose.model('SeccionLecturaDocente', esquemaSeccion);
const Inscripcion = mongoose.models.Inscripcion || mongoose.model('InscripcionLecturaDocente', esquemaInscripcion);

const MENSAJE_SECCION = 'No encontramos esa sección.';

function comoObjectId(valor, campo) {
  const texto = typeof valor === 'string' || valor instanceof mongoose.Types.ObjectId ? String(valor) : '';
  if (!/^[a-fA-F0-9]{24}$/.test(texto)) {
    throw new AppError(400, GEN.ID_INVALIDO, `El valor de «${campo}» no tiene un formato válido.`, {
      details: { campo },
    });
  }
  return new mongoose.Types.ObjectId(texto);
}

function nombreColeccion(modelo, porDefecto) {
  return mongoose.models[modelo]?.collection?.collectionName ?? porDefecto;
}

function textoONull(valor) {
  return valor === undefined || valor === null ? null : valor;
}

function bloquePublico(bloque) {
  return { dia: bloque.dia, inicioMin: bloque.inicioMin, finMin: bloque.finMin };
}

/** Arma la sección que ve el docente. No incluye docenteId: ya es el del token. */
function seccionPublica(doc) {
  const asignatura = doc.asignatura?.[0] ?? null;
  const sede = doc.sedeDoc?.[0] ?? null;

  return {
    id: String(doc._id),
    periodoId: String(doc.periodoId),
    asignaturaId: String(doc.asignaturaId),
    sedeId: String(doc.sedeId),
    codigoAsignatura: textoONull(asignatura?.codigo),
    nombreAsignatura: textoONull(asignatura?.nombre),
    sede: textoONull(sede?.nombre),
    letra: textoONull(doc.letra),
    sala: textoONull(doc.sala),
    modalidad: textoONull(doc.modalidad),
    jornada: textoONull(doc.jornada),
    cupoMaximo: doc.cupoMaximo === undefined || doc.cupoMaximo === null ? null : doc.cupoMaximo,
    estado: textoONull(doc.estado),
    inscritosActivos: doc.conteoInscripciones?.[0]?.total ?? 0,
    bloques: (doc.bloques ?? []).map(bloquePublico),
  };
}

/**
 * Una sola agregación para todas las secciones del docente en el período (D-19).
 * El conteo de inscritos activos y los nombres de asignatura y sede van en el mismo
 * pipeline: no hay una consulta por sección ni por alumno.
 */
async function consultarSecciones(docenteId, periodoId, { contarInscritos }) {
  const idDocente = comoObjectId(docenteId, 'docenteId');
  const idPeriodo = comoObjectId(periodoId, 'periodoId');
  const etapas = [{ $match: { docenteId: idDocente, periodoId: idPeriodo } }];

  if (contarInscritos) {
    etapas.push({
      $lookup: {
        from: Inscripcion.collection.collectionName,
        let: { seccionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$seccionId', '$$seccionId'] },
                  { $eq: ['$estado', ESTADOS_INSCRIPCION.ACTIVA] },
                ],
              },
            },
          },
          { $count: 'total' },
        ],
        as: 'conteoInscripciones',
      },
    });
  }

  etapas.push(
    {
      $lookup: {
        from: nombreColeccion('Asignatura', 'asignaturas'),
        let: { asignaturaId: '$asignaturaId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$asignaturaId'] } } },
          { $project: { _id: 0, codigo: 1, nombre: 1 } },
        ],
        as: 'asignatura',
      },
    },
    {
      $lookup: {
        from: nombreColeccion('Sede', 'sedes'),
        let: { sedeId: '$sedeId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$sedeId'] } } },
          { $project: { _id: 0, nombre: 1 } },
        ],
        as: 'sedeDoc',
      },
    },
  );

  const docs = await Seccion.aggregate(etapas);
  return docs
    .map(seccionPublica)
    .sort(
      (a, b) =>
        (a.codigoAsignatura ?? '').localeCompare(b.codigoAsignatura ?? '') ||
        (a.letra ?? '').localeCompare(b.letra ?? '') ||
        a.id.localeCompare(b.id),
    );
}

export function seccionesDelDocente(docenteId, periodoId) {
  return consultarSecciones(docenteId, periodoId, { contarInscritos: true });
}

export async function horarioDelDocente(docenteId, periodoId) {
  const secciones = await consultarSecciones(docenteId, periodoId, { contarInscritos: false });
  const bloques = secciones.flatMap((seccion) =>
    seccion.bloques.map((bloque, indice) => ({
      id: `${seccion.id}-${indice}`,
      seccionId: seccion.id,
      asignaturaId: seccion.asignaturaId,
      codigoAsignatura: seccion.codigoAsignatura,
      nombreAsignatura: seccion.nombreAsignatura,
      letra: seccion.letra,
      sala: seccion.sala,
      dia: bloque.dia,
      inicioMin: bloque.inicioMin,
      finMin: bloque.finMin,
    })),
  );

  bloques.sort((a, b) => a.dia - b.dia || a.inicioMin - b.inicioMin || a.id.localeCompare(b.id));
  return bloques;
}

/**
 * Nómina de una sección del docente, en una sola agregación (D-19).
 * Si la sección no existe o es de otro docente, el $match no devuelve nada y responde 404.
 * Cada inscrito sale solo con nombre, rut, codigoEstudiante y correo (D-18).
 */
export async function nominaDeSeccion(docenteId, seccionId) {
  const idDocente = comoObjectId(docenteId, 'docenteId');
  const idSeccion = comoObjectId(seccionId, 'id');

  const [seccion] = await Seccion.aggregate([
    { $match: { _id: idSeccion, docenteId: idDocente } },
    {
      $lookup: {
        from: Inscripcion.collection.collectionName,
        let: { seccionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$seccionId', '$$seccionId'] },
                  { $eq: ['$estado', ESTADOS_INSCRIPCION.ACTIVA] },
                ],
              },
            },
          },
          {
            $lookup: {
              from: Usuario.collection.collectionName,
              let: { estudianteId: '$estudianteId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$estudianteId'] } } },
                {
                  $project: {
                    _id: 0,
                    nombre: 1,
                    rut: 1,
                    correo: 1,
                    codigoEstudiante: { $ifNull: ['$perfilEstudiante.codigoEstudiante', null] },
                  },
                },
              ],
              as: 'estudiante',
            },
          },
          { $unwind: '$estudiante' },
          { $replaceRoot: { newRoot: '$estudiante' } },
          { $sort: { nombre: 1, rut: 1 } },
        ],
        as: 'nomina',
      },
    },
    { $project: { _id: 0, nomina: 1 } },
  ]);

  if (!seccion) {
    throw new AppError(404, DOC.SECCION_NO_ENCONTRADA, MENSAJE_SECCION);
  }

  return seccion.nomina;
}
