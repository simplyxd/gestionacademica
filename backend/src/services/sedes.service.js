// Reglas de negocio de sedes (LOR-3). El controlador solo traduce HTTP; aquí viven las reglas.
// "usuario" es req.user = { id, rol, sedes } (sale del token, nunca del body).
import { ESTADOS_CARRERA, ESTADOS_SEDE } from '../constants/enums.js';
import { AppError } from '../errors/AppError.js';
import { SED } from '../errors/codigos/sedes.js';
import { Carrera } from '../models/carrera.model.js';
import { Sede } from '../models/sede.model.js';
import { envolver } from '../utils/respuesta.js';
import { paginar } from '../utils/paginar.js';
import { aObjectId, conUnicidad, esCoordinador, filtroBusqueda, sedesDe } from './estructura.comun.js';

/**
 * Dependencias de otros dominios, inyectables (en tests se reemplazan por dobles).
 * Contrato propuesto a Diego: secciones.service exporta
 *   contarAbiertasPorSede(sedeId: ObjectId) => Promise<number>   // secciones en estado "abierta"
 */
export const dependencias = {
  async contarSeccionesAbiertas(sedeId) {
    let modulo;
    try {
      modulo = await import('./secciones.service.js');
    } catch {
      modulo = null;
    }
    if (typeof modulo?.contarAbiertasPorSede !== 'function') {
      throw new Error('secciones.service.contarAbiertasPorSede no está disponible (contrato con Diego, LOR-3).');
    }
    return modulo.contarAbiertasPorSede(sedeId);
  },
};

const duplicada = (nombre) => () =>
  new AppError(409, SED.NOMBRE_DUPLICADO, `Ya existe una sede llamada «${nombre}». Usa otro nombre o edita la existente.`, {
    details: { campo: 'nombre' },
  });

const noEncontrada = () => new AppError(404, SED.NO_ENCONTRADA, 'La sede no existe o no pertenece a tus sedes.');

/** Filtro de alcance: el coordinador solo ve sus sedes. */
const alcance = (usuario) => (esCoordinador(usuario) ? { _id: { $in: sedesDe(usuario).map((s) => aObjectId(s, 'sedes')) } } : {});

async function buscarEnAlcance(usuario, id) {
  const sede = await Sede.findOne({ $and: [{ _id: aObjectId(id) }, alcance(usuario)] }); // $and: el alcance también filtra por _id
  if (!sede) throw noEncontrada();
  return sede;
}

export function listar(usuario, query = {}) {
  const filtro = { ...alcance(usuario), ...filtroBusqueda(query.q, ['nombre', 'comuna']) };
  if (query.estado) filtro.estado = query.estado;
  return paginar(Sede, filtro, query, { camposOrdenables: ['nombre', 'comuna', 'estado'], ordenPorDefecto: 'nombre' });
}

export async function obtener(usuario, id) {
  return envolver(await buscarEnAlcance(usuario, id));
}

export async function crear(_usuario, { nombre, direccion, comuna, estado }) {
  const sede = await conUnicidad(() => Sede.create({ nombre, direccion, comuna, estado }), { nombre_unico: duplicada(nombre) });
  return envolver(sede);
}

/** Edita datos descriptivos. El estado se cambia solo por cambiarEstado (tiene reglas propias). */
export async function actualizar(usuario, id, { nombre, direccion, comuna }) {
  const sede = await buscarEnAlcance(usuario, id);
  const cambios = Object.fromEntries(Object.entries({ nombre, direccion, comuna }).filter(([, v]) => v !== undefined));
  sede.set(cambios);
  await conUnicidad(() => sede.save(), { nombre_unico: duplicada(sede.nombre) });
  return envolver(sede);
}

/**
 * Baja lógica. Una sede con carreras activas o secciones abiertas NO pasa a "inactiva" (422).
 * "en_mantenimiento" no tiene restricción: la sede sigue existiendo.
 */
export async function cambiarEstado(usuario, id, estado) {
  const sede = await buscarEnAlcance(usuario, id);

  if (estado === ESTADOS_SEDE.INACTIVA && sede.estado !== ESTADOS_SEDE.INACTIVA) {
    const [carreras, secciones] = await Promise.all([
      Carrera.find({ sedes: sede._id, estado: ESTADOS_CARRERA.ACTIVA }).select('codigo').limit(5).lean(),
      dependencias.contarSeccionesAbiertas(sede._id),
    ]);
    if (carreras.length > 0 || secciones > 0) {
      const partes = [];
      if (carreras.length > 0) partes.push(`carreras activas (${carreras.map((c) => c.codigo).join(', ')})`);
      if (secciones > 0) partes.push(`${secciones} sección(es) abierta(s)`);
      throw new AppError(
        422,
        SED.CON_DEPENDENCIAS,
        `La sede «${sede.nombre}» no se puede inactivar: tiene ${partes.join(' y ')}. Cierra o traslada eso primero.`,
        { regla: 'Sede sin carreras ni secciones activas', details: { carreras: carreras.map((c) => c.codigo), secciones } },
      );
    }
  }

  sede.estado = estado;
  await sede.save();
  return envolver(sede);
}
