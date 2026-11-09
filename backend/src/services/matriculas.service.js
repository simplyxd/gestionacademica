import Matricula from '../models/matricula.model.js';
import { AppError } from '../errors/AppError.js';
import { MTR } from '../errors/codigos/matriculas.js';

const LIMIT_POR_DEFECTO = 20;
const LIMIT_MAXIMO = 100;

/**
 * Única fuente de las transiciones de estado (D-09). `egresada` y `retirada` son finales.
 * Cualquier cambio de estado debe pasar por aquí y aplicarse con un update condicionado al estado actual.
 */
export const TRANSICIONES = Object.freeze({
  vigente: Object.freeze(['suspendida', 'egresada', 'retirada']),
  suspendida: Object.freeze(['retirada']),
  egresada: Object.freeze([]),
  retirada: Object.freeze([]),
});

export function transicionesDe(estado) {
  return TRANSICIONES[estado] ?? [];
}

/** Matrícula vigente del estudiante en el período (con `carreraId` y `planId`), o `null`. Reglas 1 y 4 de inscripción. */
export function matriculaVigente(estudianteId, periodoId) {
  return Matricula.findOne({ estudianteId, periodoId, estado: 'vigente' });
}

/** Matrículas de la carrera; sin `estado` cuenta todas (cualquier estado). */
export function contarPorCarrera(carreraId, { estado } = {}) {
  const filtro = { carreraId };
  if (estado) filtro.estado = estado;
  return Matricula.countDocuments(filtro);
}

function entero(valor, porDefecto) {
  const n = Number.parseInt(valor, 10);
  return Number.isInteger(n) && n >= 1 ? n : porDefecto;
}

/** Lista paginada, más recientes primero. Pendiente: búsqueda `q` por estudiante y alcance por sedes del coordinador. */
export async function listar({ periodoId, carreraId, estado, estudianteId, page, limit } = {}) {
  const filtro = {};
  if (periodoId) filtro.periodoId = periodoId;
  if (carreraId) filtro.carreraId = carreraId;
  if (estado) filtro.estado = estado;
  if (estudianteId) filtro.estudianteId = estudianteId;

  const pagina = entero(page, 1);
  const porPagina = Math.min(entero(limit, LIMIT_POR_DEFECTO), LIMIT_MAXIMO);

  const [data, total] = await Promise.all([
    Matricula.find(filtro)
      .sort({ createdAt: -1, _id: -1 })
      .skip((pagina - 1) * porPagina)
      .limit(porPagina),
    Matricula.countDocuments(filtro),
  ]);

  return { data, meta: { page: pagina, limit: porPagina, total } };
}

/**
 * Cambia el estado de forma atómica: solo aplica si la matrícula sigue en el estado leído.
 * Si otra petición la cambió entre medio, se reevalúa con el estado nuevo.
 */
export async function cambiarEstado(id, siguienteEstado) {
  const actual = await Matricula.findById(id).select('estado');
  if (!actual) throw new AppError(404, MTR.NO_ENCONTRADA, 'No existe la matrícula indicada.');

  const permitidos = transicionesDe(actual.estado);
  if (!permitidos.includes(siguienteEstado)) {
    throw new AppError(
      409,
      MTR.TRANSICION_INVALIDA,
      `No se puede pasar de «${actual.estado}» a «${siguienteEstado}». Transiciones permitidas: ${permitidos.join(', ') || 'ninguna'}.`,
      { details: { actual: actual.estado, siguiente: siguienteEstado, permitidos } },
    );
  }

  const actualizada = await Matricula.findOneAndUpdate(
    { _id: id, estado: actual.estado },
    { estado: siguienteEstado },
    { returnDocument: 'after' },
  );

  if (actualizada) return actualizada;

  const recargada = await Matricula.findById(id).select('estado');
  if (!recargada) throw new AppError(404, MTR.NO_ENCONTRADA, 'No existe la matrícula indicada.');
  const permitidosRecargada = transicionesDe(recargada.estado);
  throw new AppError(
    409,
    MTR.TRANSICION_INVALIDA,
    `No se puede pasar de «${recargada.estado}» a «${siguienteEstado}». Transiciones permitidas: ${permitidosRecargada.join(', ') || 'ninguna'}.`,
    { details: { actual: recargada.estado, siguiente: siguienteEstado, permitidos: permitidosRecargada } },
  );
}

