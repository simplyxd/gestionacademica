import { ROLES } from '../constants/enums.js';
import { CLAVE_PARAMETROS, Parametros } from '../models/parametros.model.js';

const CAMPOS = [
  'nombreInstitucion',
  'nombreCorto',
  'siglasPortal',
  'correoContacto',
  'telefonoMesa',
  'zonaHoraria',
  'mensajeBienvenida',
  'duracionSesionMinutos',
  'permitirRecuperacionClave',
  'mostrarCodigoAsignaturaEnTablas',
];

const CAMPOS_DEL_DOCUMENTO = ['id', 'clave', ...CAMPOS, 'createdAt', 'updatedAt'];

function tomar(json, campos) {
  const salida = {};
  for (const campo of campos) {
    if (json[campo] !== undefined) salida[campo] = json[campo];
  }
  return salida;
}

/** Documento completo para el admin. Solo campos del modelo: nunca una clave ni un hash. */
export function documentoCompleto(documento) {
  return tomar(documento.toJSON(), CAMPOS_DEL_DOCUMENTO);
}

/** D-15: cualquier rol que no sea admin ve solo lo necesario para el encabezado y la sesión. */
export function documentoPublico(documento) {
  return tomar(documento.toJSON(), ['nombreInstitucion', 'siglasPortal', 'duracionSesionMinutos']);
}

export function vistaPara(documento, rol) {
  return rol === ROLES.ADMIN ? documentoCompleto(documento) : documentoPublico(documento);
}

export function obtenerParametros() {
  return Parametros.findOne({ clave: CLAVE_PARAMETROS });
}

/**
 * Un solo documento: el filtro y el $set usan la clave fija. El índice único de `clave` impide un segundo.
 * Los campos salen de la lista blanca; `clave` del body se ignora.
 */
export function guardarParametros(datos) {
  const $set = { clave: CLAVE_PARAMETROS };
  for (const campo of CAMPOS) {
    if (Object.prototype.hasOwnProperty.call(datos, campo)) $set[campo] = datos[campo];
  }

  return Parametros.findOneAndUpdate(
    { clave: CLAVE_PARAMETROS },
    { $set },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
  );
}
