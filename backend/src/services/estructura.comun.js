// Utilidades compartidas por los servicios de estructura académica (sedes, asignaturas, carreras, planes, reportes).
import mongoose from 'mongoose';
import { ROLES } from '../constants/enums.js';
import { AppError } from '../errors/AppError.js';
import { GEN } from '../errors/codigos/general.js';

/** Escapa un texto para usarlo dentro de una RegExp (evita que ?q= cuele patrones). */
export const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Filtro de búsqueda libre sobre varios campos, o {} si q viene vacío. */
export function filtroBusqueda(q, campos) {
  if (typeof q !== 'string' || q.trim() === '') return {};
  const patron = new RegExp(escaparRegex(q.trim()), 'i');
  return { $or: campos.map((campo) => ({ [campo]: patron })) };
}

/** Convierte a ObjectId o lanza 400 nombrando el campo. */
export function aObjectId(valor, campo = 'id') {
  if (!mongoose.isValidObjectId(valor) || (typeof valor === 'string' && !/^[a-f0-9]{24}$/i.test(valor))) {
    throw new AppError(400, GEN.ID_INVALIDO, `El valor de «${campo}» no tiene un formato válido.`, { details: { campo } });
  }
  return new mongoose.Types.ObjectId(String(valor));
}

/** ¿El usuario solo ve/edita sus sedes? (coordinador). El admin ve todo. */
export const esCoordinador = (usuario) => usuario?.rol === ROLES.COORDINADOR;

/** Sedes del coordinador como strings. */
export const sedesDe = (usuario) => (usuario?.sedes ?? []).map(String);

/**
 * Ejecuta una escritura y traduce el E11000 a un 409 legible según el índice que chocó.
 * @param {() => Promise<T>} fn
 * @param {Record<string, () => AppError>} porIndice nombre del índice → error
 */
export async function conUnicidad(fn, porIndice) {
  try {
    return await fn();
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const indice = Object.keys(porIndice).find((nombre) => String(error.message).includes(nombre));
    if (indice) throw porIndice[indice]();
    throw error;
  }
}
