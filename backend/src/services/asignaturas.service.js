// Reglas de negocio del catálogo de asignaturas (LOR-3).
import { AppError } from '../errors/AppError.js';
import { ASG } from '../errors/codigos/asignaturas.js';
import { Asignatura } from '../models/asignatura.model.js';
import { Plan } from '../models/plan.model.js';
import { envolver } from '../utils/respuesta.js';
import { paginar } from '../utils/paginar.js';
import { aObjectId, conUnicidad, filtroBusqueda } from './estructura.comun.js';

const duplicada = (codigo) => () =>
  new AppError(409, ASG.CODIGO_DUPLICADO, `Ya existe una asignatura con el código ${String(codigo).trim().toUpperCase()}.`, {
    details: { campo: 'codigo' },
  });

const noEncontrada = () => new AppError(404, ASG.NO_ENCONTRADA, 'La asignatura no existe.');

export function listar(_usuario, query = {}) {
  const filtro = filtroBusqueda(query.q, ['codigo', 'nombre']);
  return paginar(Asignatura, filtro, query, { camposOrdenables: ['codigo', 'nombre', 'creditos'], ordenPorDefecto: 'codigo' });
}

export async function obtener(_usuario, id) {
  const asignatura = await Asignatura.findById(aObjectId(id));
  if (!asignatura) throw noEncontrada();
  return envolver(asignatura);
}

export async function crear(_usuario, { codigo, nombre, creditos }) {
  const asignatura = await conUnicidad(() => Asignatura.create({ codigo, nombre, creditos }), { codigo_unico: duplicada(codigo) });
  return envolver(asignatura);
}

/**
 * Edita código, nombre o créditos.
 * Decisión (Lorenzo, 2026-11-09): los créditos NO cambian si la asignatura está en algún plan (409),
 * para no alterar en silencio el historial de quienes ya la cursaron. El nombre sí se puede corregir.
 */
export async function actualizar(_usuario, id, { codigo, nombre, creditos }) {
  const asignatura = await Asignatura.findById(aObjectId(id));
  if (!asignatura) throw noEncontrada();

  if (creditos !== undefined && creditos !== asignatura.creditos) {
    const planes = await Plan.find({ 'asignaturas.asignaturaId': asignatura._id }).select('nombre').limit(3).lean();
    if (planes.length > 0) {
      throw new AppError(
        409,
        ASG.CREDITOS_BLOQUEADOS,
        `No se pueden cambiar los créditos de ${asignatura.codigo}: ya está en planes de estudio (${planes.map((p) => p.nombre).join(', ')}). Crea una asignatura nueva si cambió su carga.`,
        { regla: 'Créditos inmutables en asignaturas usadas', details: { planes: planes.map((p) => p._id.toString()) } },
      );
    }
  }

  const cambios = Object.fromEntries(Object.entries({ codigo, nombre, creditos }).filter(([, v]) => v !== undefined));
  asignatura.set(cambios);
  await conUnicidad(() => asignatura.save(), { codigo_unico: duplicada(asignatura.codigo) });
  return envolver(asignatura);
}
