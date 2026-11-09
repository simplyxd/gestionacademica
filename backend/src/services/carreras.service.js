// Reglas de negocio de carreras (LOR-4).
import { ESTADOS_CARRERA, ESTADOS_MATRICULA, ESTADOS_SEDE } from '../constants/enums.js';
import { AppError } from '../errors/AppError.js';
import { CAR } from '../errors/codigos/carreras.js';
import { Carrera } from '../models/carrera.model.js';
import { Sede } from '../models/sede.model.js';
import { envolver } from '../utils/respuesta.js';
import { paginar } from '../utils/paginar.js';
import { aObjectId, conUnicidad, esCoordinador, filtroBusqueda, sedesDe } from './estructura.comun.js';

/**
 * Dependencia de matrícula (Angel), inyectable. Contrato: matriculas.service exporta
 *   contarPorCarrera(carreraId, { estado }) => Promise<number>
 */
export const dependencias = {
  async contarMatriculas(carreraId, opciones) {
    const modulo = await import('./matriculas.service.js').catch(() => null);
    if (typeof modulo?.contarPorCarrera !== 'function') {
      throw new Error('matriculas.service.contarPorCarrera no está disponible (contrato con Angel, LOR-4).');
    }
    return modulo.contarPorCarrera(carreraId, opciones);
  },
};

const noEncontrada = () => new AppError(404, CAR.NO_ENCONTRADA, 'La carrera no existe o no se imparte en tus sedes.');
const unicidad = (datos) => ({
  codigo_unico: () => new AppError(409, CAR.CODIGO_DUPLICADO, `El código «${datos.codigo}» ya está en uso por otra carrera.`, { details: { campo: 'codigo' } }),
  nombre_unico: () => new AppError(409, CAR.NOMBRE_DUPLICADO, `Ya existe una carrera llamada «${datos.nombre}».`, { details: { campo: 'nombre' } }),
});

/** El coordinador ve las carreras que se imparten en al menos una de sus sedes. */
export const alcanceCarreras = (usuario) =>
  esCoordinador(usuario) ? { sedes: { $in: sedesDe(usuario).map((s) => aObjectId(s, 'sedes')) } } : {};

export async function buscarEnAlcance(usuario, id) {
  const carrera = await Carrera.findOne({ _id: aObjectId(id, 'carreraId'), ...alcanceCarreras(usuario) });
  if (!carrera) throw noEncontrada();
  return carrera;
}

/** Todas las sedes existen y están activas; el coordinador solo asigna las suyas. */
async function validarSedes(usuario, sedes) {
  const ids = [...new Set((sedes ?? []).map(String))].map((s) => aObjectId(s, 'sedes'));
  if (esCoordinador(usuario)) {
    const propias = new Set(sedesDe(usuario));
    const ajenas = ids.filter((s) => !propias.has(s.toString()));
    if (ajenas.length > 0) {
      throw new AppError(403, CAR.SEDE_FUERA_DE_ALCANCE, 'Solo puedes asignar carreras a tus propias sedes.', {
        details: { sedes: ajenas.map(String) },
      });
    }
  }
  const encontradas = await Sede.find({ _id: { $in: ids } }).select('nombre estado').lean();
  const activas = new Set(encontradas.filter((s) => s.estado === ESTADOS_SEDE.ACTIVA).map((s) => s._id.toString()));
  const malas = ids.filter((s) => !activas.has(s.toString()));
  if (malas.length > 0) {
    const nombres = encontradas.filter((s) => !activas.has(s._id.toString())).map((s) => `${s.nombre} (${s.estado})`);
    const inexistentes = malas.length - nombres.length;
    const texto = [...nombres, ...(inexistentes > 0 ? [`${inexistentes} sede(s) inexistente(s)`] : [])].join(', ');
    throw new AppError(422, CAR.SEDE_NO_DISPONIBLE, `La carrera solo puede impartirse en sedes activas: ${texto}.`, {
      regla: 'Sedes activas de la carrera',
      details: { sedes: malas.map(String) },
    });
  }
  return ids;
}

export function listar(usuario, query = {}) {
  const condiciones = [alcanceCarreras(usuario), filtroBusqueda(query.q, ['codigo', 'nombre'])];
  if (query.estado) condiciones.push({ estado: query.estado });
  if (query.sedeId) condiciones.push({ sedes: aObjectId(query.sedeId, 'sedeId') }); // se suma al alcance, no lo reemplaza
  const filtro = { $and: condiciones.filter((c) => Object.keys(c).length > 0) };
  if (filtro.$and.length === 0) delete filtro.$and;
  return paginar(Carrera, filtro, query, { camposOrdenables: ['codigo', 'nombre', 'estado', 'duracionSemestres'], ordenPorDefecto: 'codigo' });
}

export async function obtener(usuario, id) {
  return envolver(await buscarEnAlcance(usuario, id));
}

export async function crear(usuario, datos) {
  const sedes = await validarSedes(usuario, datos.sedes);
  const { codigo, nombre, modalidad, jornada, duracionSemestres } = datos;
  const carrera = await conUnicidad(
    () => Carrera.create({ codigo, nombre, modalidad, jornada, duracionSemestres, sedes, estado: ESTADOS_CARRERA.ACTIVA }),
    unicidad(datos),
  );
  return envolver(carrera);
}

export async function actualizar(usuario, id, datos) {
  const carrera = await buscarEnAlcance(usuario, id);
  const { codigo, nombre, modalidad, jornada, duracionSemestres } = datos;
  const cambios = Object.fromEntries(Object.entries({ codigo, nombre, modalidad, jornada, duracionSemestres }).filter(([, v]) => v !== undefined));
  if (datos.sedes !== undefined) cambios.sedes = await validarSedes(usuario, datos.sedes);
  carrera.set(cambios);
  await conUnicidad(() => carrera.save(), unicidad({ codigo: carrera.codigo, nombre: carrera.nombre }));
  return envolver(carrera);
}

/**
 * Una carrera no se elimina: se cierra a nuevo ingreso ("inactiva"). Sus matrículas vigentes siguen válidas
 * (bloquear las NUEVAS es regla de matrícula). La respuesta informa cuántas matrículas vigentes quedan.
 * Reabrir ("activa") exige que todas sus sedes sigan activas.
 */
export async function cambiarEstado(usuario, id, estado) {
  const carrera = await buscarEnAlcance(usuario, id);
  if (estado === ESTADOS_CARRERA.ACTIVA) await validarSedes({ rol: 'admin' }, carrera.sedes);
  carrera.estado = estado;
  await carrera.save();
  const matriculasVigentes = await dependencias.contarMatriculas(carrera._id, { estado: ESTADOS_MATRICULA.VIGENTE });
  return envolver({ ...carrera.toJSON(), matriculasVigentes });
}
