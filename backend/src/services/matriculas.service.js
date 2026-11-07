const Matricula = require('../models/matricula.model');

const LIMIT_POR_DEFECTO = 20;
const LIMIT_MAXIMO = 100;

/**
 * Única fuente de las transiciones de estado (D-09). `egresada` y `retirada` son finales.
 * Cualquier cambio de estado debe pasar por aquí y aplicarse con un update condicionado al estado actual.
 */
const TRANSICIONES = Object.freeze({
  vigente: Object.freeze(['suspendida', 'egresada', 'retirada']),
  suspendida: Object.freeze(['retirada']),
  egresada: Object.freeze([]),
  retirada: Object.freeze([]),
});

function transicionesDe(estado) {
  return TRANSICIONES[estado] ?? [];
}

/** Matrícula vigente del estudiante en el período (con `carreraId` y `planId`), o `null`. Reglas 1 y 4 de inscripción. */
function matriculaVigente(estudianteId, periodoId) {
  return Matricula.findOne({ estudianteId, periodoId, estado: 'vigente' });
}

/** Matrículas de la carrera; sin `estado` cuenta todas (cualquier estado). */
function contarPorCarrera(carreraId, { estado } = {}) {
  const filtro = { carreraId };
  if (estado) filtro.estado = estado;
  return Matricula.countDocuments(filtro);
}

function entero(valor, porDefecto) {
  const n = Number.parseInt(valor, 10);
  return Number.isInteger(n) && n >= 1 ? n : porDefecto;
}

/** Lista paginada, más recientes primero. Pendiente: búsqueda `q` por estudiante y alcance por sedes del coordinador. */
async function listar({ periodoId, carreraId, estado, estudianteId, page, limit } = {}) {
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

module.exports = {
  TRANSICIONES,
  transicionesDe,
  matriculaVigente,
  contarPorCarrera,
  listar,
};
